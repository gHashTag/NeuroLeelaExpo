import { EventEmitter } from "events";
import { createServer, IncomingMessage, ServerResponse } from "http";
import { spawn, ChildProcess } from "child_process";
import { NetworkInterfaceInfo } from "os";
import path from "path";
import net from "net";
import os from "os";

// Создаем глобальный эмиттер для логов
const logEmitter = new EventEmitter();
logEmitter.setMaxListeners(20);

// Храним активные соединения
const activeConnections = new Set<ServerResponse>();

// Функция для поиска свободного порта
async function findAvailablePort(startPort: number): Promise<number> {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();

    const tryPort = (port: number) => {
      server.once("error", (err: NodeJS.ErrnoException) => {
        if (err.code === "EADDRINUSE") {
          tryPort(port + 1);
        } else {
          reject(err);
        }
      });

      server.once("listening", () => {
        server.close(() => resolve(port));
      });

      server.listen(port);
    };

    tryPort(startPort);
  });
}

// Очищаем все соединения
function cleanupConnections() {
  console.log("🧹 Cleaning up all connections...");
  for (const res of activeConnections) {
    try {
      res.end();
    } catch (e) {
      // Игнорируем ошибки при закрытии
    }
  }
  activeConnections.clear();
  console.log("✨ All connections cleaned up");
}

// Функция для очистки процессов
async function cleanup() {
  try {
    console.log("🧹 Cleaning up processes...");

    // Убиваем все процессы expo и metro
    await new Promise<void>((resolve) => {
      const cleanup = spawn("pkill", ["-f", "expo|metro"], { shell: true });
      cleanup.on("close", () => resolve());
    });

    // Ждем немного, чтобы процессы точно завершились
    await new Promise((resolve) => setTimeout(resolve, 2000));

    console.log("✨ Cleanup completed");
  } catch (error) {
    console.error("❌ Error during cleanup:", error);
  }
}

async function main() {
  try {
    // Сначала очищаем все процессы
    await cleanup();

    console.log("🚀 Starting servers...");

    // Ищем свободные порты для обоих серверов
    const expoPort = await findAvailablePort(8081);
    const ssePort = await findAvailablePort(8383);

    console.log(`📡 Using ports: Expo=${expoPort}, SSE=${ssePort}`);

    // Запускаем Expo с найденным портом
    const expo = spawn("npx", ["expo", "start", "--port", expoPort.toString()], {
      shell: true,
      stdio: ["inherit", "pipe", "pipe"],
      env: {
        ...process.env,
        FORCE_COLOR: "1",
        PORT: expoPort.toString(),
      },
    });

    console.log("📱 Expo process started");

    // Увеличиваем лимит слушателей
    expo.stdout?.setMaxListeners(20);
    expo.stderr?.setMaxListeners(20);

    // Проверяем запуск Expo
    expo.on("error", (error: Error) => {
      console.error("❌ Failed to start Expo:", error);
      cleanupConnections();
      cleanup().then(() => process.exit(1));
    });

    expo.on("exit", (code: number | null) => {
      console.error(`❌ Expo process exited with code ${code}`);
      cleanupConnections();
      cleanup().then(() => process.exit(1));
    });

    // Перенаправляем вывод
    expo.stdout?.on("data", (data: Buffer) => {
      const message = data.toString();
      console.log("📱 Expo:", message);
      logEmitter.emit("log", message);
    });

    expo.stderr?.on("data", (data: Buffer) => {
      const message = data.toString();
      console.error("❌ Expo error:", message);
      logEmitter.emit("log", message);
    });

    // Создаем SSE сервер
    const server = createServer((req: IncomingMessage, res: ServerResponse) => {
      console.log("📡 Incoming request to:", req.url);

      if (req.url === "/sse") {
        const connectionId = Date.now();
        console.log("📡 New SSE connection attempt:", connectionId);

        res.writeHead(200, {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET",
          "Access-Control-Allow-Headers": "*",
          "Access-Control-Expose-Headers": "*",
        });

        console.log("📡 SSE headers sent for connection:", connectionId);

        // Отправляем начальное сообщение
        res.write(`data: {"type":"connection","status":"established","id":"${connectionId}"}\n\n`);

        const sendData = (data: string) => {
          if (!res.writableEnded) {
            try {
              res.write(
                `data: ${JSON.stringify({
                  type: "log",
                  data: data,
                  timestamp: new Date().toISOString(),
                  id: connectionId,
                })}\n\n`
              );
            } catch (error) {
              console.error("❌ Error sending SSE data:", error);
              cleanup();
            }
          }
        };

        const logHandler = (data: string) => {
          sendData(data);
        };

        logEmitter.on("log", logHandler);
        activeConnections.add(res);
        console.log("📡 SSE connection established:", connectionId);

        const cleanup = () => {
          if (!res.writableEnded) {
            console.log("📡 Cleaning up connection:", connectionId);
            logEmitter.removeListener("log", logHandler);
            activeConnections.delete(res);
            res.end();
            console.log("📡 Cleanup completed for:", connectionId);
          }
        };

        // Пинг каждые 30 секунд
        const pingInterval = setInterval(() => {
          if (!res.writableEnded) {
            try {
              res.write(
                `event: ping\ndata: {"timestamp":"${new Date().toISOString()}","id":"${connectionId}"}\n\n`
              );
            } catch (error) {
              console.error("❌ Error sending ping:", error);
              cleanup();
            }
          }
        }, 30000);

        req.on("close", () => {
          console.log("📡 Request closed by client:", connectionId);
          clearInterval(pingInterval);
          cleanup();
        });

        req.on("error", (error: Error) => {
          console.error("❌ Request error:", connectionId, error);
          clearInterval(pingInterval);
          cleanup();
        });

        res.on("error", (error: Error) => {
          console.error("❌ Response error:", connectionId, error);
          clearInterval(pingInterval);
          cleanup();
        });
      } else {
        res.writeHead(404);
        res.end("Not found");
      }
    });

    server.on("error", (error: Error) => {
      console.error("❌ Server error:", error);
      cleanupConnections();
      cleanup().then(() => {
        expo.kill();
        process.exit(1);
      });
    });

    console.log("📡 Starting SSE server on all interfaces...");
    server.listen(ssePort, "0.0.0.0", () => {
      const addresses = Object.values(os.networkInterfaces())
        .flat()
        .filter((iface): iface is NetworkInterfaceInfo => Boolean(iface))
        .map((iface) => iface.address)
        .filter(Boolean);

      console.log("✅ Servers started successfully");
      console.log("📡 SSE server listening on:");
      addresses.forEach((addr) => {
        console.log(`  - http://${addr}:${ssePort}/sse`);
      });
      console.log(`  - http://localhost:${ssePort}/sse`);
      console.log(`📱 Expo running on port ${expoPort}`);
    });

    process.on("SIGINT", () => {
      console.log("\n🛑 Stopping servers...");
      cleanupConnections();
      cleanup().then(() => {
        expo.kill();
        server.close();
        process.exit(0);
      });
    });
  } catch (error) {
    console.error("❌ Error starting servers:", error);
    cleanupConnections();
    cleanup().then(() => process.exit(1));
  }
}

main();

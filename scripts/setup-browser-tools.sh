#!/bin/bash

# 🕉️ Автоматизация запуска и диагностики BrowserTools MCP
# Убивает процессы, освобождает порт, запускает server и mcp, проверяет соединение
# Использование: bash scripts/setup-browser-tools.sh

PORT=3025
SERVER_CMD="npx @agentdeskai/browser-tools-server@1.2.0"
MCP_CMD="npx @agentdeskai/browser-tools-mcp@1.2.0"

# 1. Киллим все процессы на порту $PORT
function kill_port() {
  echo "🛑 Убиваю процессы на порту $PORT..."
  PIDS=$(lsof -ti :$PORT)
  if [ ! -z "$PIDS" ]; then
    kill -9 $PIDS
    echo "Процессы убиты: $PIDS"
  else
    echo "Порт $PORT свободен."
  fi
}

# 2. Проверяем, что порт свободен
function check_port() {
  lsof -i :$PORT | grep LISTEN
  return $?
}

# 3. Запускаем сервер в фоне
function start_server() {
  echo "🚀 Запускаю BrowserTools Server..."
  $SERVER_CMD &
  SERVER_PID=$!
  sleep 3
  echo "Server PID: $SERVER_PID"
}

# 4. Ждём, пока порт не откроется
function wait_for_port() {
  echo -n "⏳ Ожидание открытия порта $PORT..."
  for i in {1..10}; do
    if nc -z localhost $PORT; then
      echo " [OK]"
      return 0
    fi
    echo -n "."
    sleep 1
  done
  echo "\n❌ Порт $PORT не открылся."
  exit 1
}

# 5. Запускаем MCP в фоне
function start_mcp() {
  echo "🚀 Запускаю BrowserTools MCP..."
  $MCP_CMD &
  MCP_PID=$!
  sleep 3
  echo "MCP PID: $MCP_PID"
}

# 6. Проверяем соединение curl
function check_server() {
  echo "🔍 Проверяю доступность сервера..."
  curl -s http://localhost:$PORT > /dev/null
  if [ $? -eq 0 ]; then
    echo "✅ Сервер доступен на http://localhost:$PORT"
  else
    echo "❌ Сервер НЕ доступен на http://localhost:$PORT"
    exit 1
  fi
}

# Основной цикл
kill_port
check_port || true
start_server
wait_for_port
check_server
start_mcp

echo "\n🟢 Всё запущено! Проверь BrowserTools MCP в Cursor и DevTools."
echo "Для остановки: killall node (или вручную убей процессы по PID)" 
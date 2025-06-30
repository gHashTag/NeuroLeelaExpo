import express, { Request, Response } from 'express';
import cors from 'cors';
import { serve } from 'inngest/express';

// Импорт серверных функций без React Native зависимостей
import { serverFunctions as functions } from './server-functions';
import { Inngest } from 'inngest';

// Создаем клиент для сервера
const inngest = new Inngest({ 
  id: 'neuroleela-app',
  name: 'NeuroLeela Game'
});

const app = express();
const PORT = process.env.INNGEST_PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Создаем обработчик Inngest
const handler = serve({
  client: inngest,
  functions: functions,
});

// Регистрируем Inngest API endpoint
app.use('/api/inngest', handler);

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Inngest server running on http://localhost:${PORT}`);
  console.log(`📡 API endpoint: http://localhost:${PORT}/api/inngest`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Process terminated');
  });
});

export default app; 
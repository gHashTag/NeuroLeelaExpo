import { serve } from 'inngest/remix';
import { inngest } from '../../../inngest/client';
import { functions } from '../../../inngest/functions';

// Создание обработчика для Inngest с Expo Router
const handler = serve({
  client: inngest,
  functions: functions,
  streaming: 'force',
});

// Экспорт для Expo Router API routes
export const GET = handler;
export const POST = handler;
export const PUT = handler; 
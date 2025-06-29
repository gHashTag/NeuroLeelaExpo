import { serve } from 'inngest/next';
import { inngest } from '@/inngest/client';
import { functions } from '@/inngest/functions';

// Создание обработчика для Inngest
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: functions,
  streaming: 'force',
}); 
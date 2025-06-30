import { describe, it, expect } from 'vitest';
import { InngestTestEngine } from '@inngest/test';

// Создаем простую тестовую функцию без внешних зависимостей
import { inngest } from '../../inngest/client';

const testFunction = inngest.createFunction(
  { id: 'test-function', name: 'Test Function' },
  { event: 'test.event' },
  async ({ event, step }) => {
    const { userId, data } = event.data;
    
    const result = await step.run('process-data', async () => {
      return {
        userId,
        processedData: data,
        timestamp: Date.now()
      };
    });

    return {
      success: true,
      userId,
      result
    };
  }
);

describe('Inngest Test Engine Works', () => {
  it('should execute simple function', async () => {
    const testEngine = new InngestTestEngine({
      function: testFunction,
    });

    const { result } = await testEngine.execute({
      events: [{ name: 'test.event', data: { userId: 'test', data: 'data' } }],
      steps: [
        {
          id: 'process-data',
          handler: () => ({ userId: 'test', processedData: 'data', timestamp: 123 })
        }
      ]
    });

    expect((result as any).success).toBe(true);
  });
}); 
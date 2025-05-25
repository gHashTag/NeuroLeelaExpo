import { createOpenAI } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

// Конфигурация для OpenRouter
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
});

// Данные о планах игры Лила
const plansData: Record<number, { name: string; description: string; element: string; color: string }> = {
  1: { name: "Рождение", description: "Начало духовного пути", element: "🌱", color: "green" },
  10: { name: "Майя (Иллюзия)", description: "Понимание природы реальности", element: "🎭", color: "purple" },
  23: { name: "Небеса", description: "Состояние блаженства", element: "☁️", color: "blue" },
  41: { name: "Добрые дела", description: "Карма служения", element: "🤝", color: "gold" },
  68: { name: "Космическое сознание", description: "Высшее просветление", element: "🕉️", color: "violet" }
  // Можно добавить больше планов
};

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: openrouter('meta-llama/llama-3.1-8b-instruct:free'),
      messages,
      system: `Ты - Лила, богиня игры самопознания. Ты мудрая наставница, которая помогает игрокам понять глубокий смысл их путешествия по игровому полю. 

Твоя роль:
- Объяснять значение позиций на игровом поле (планы 1-72)
- Давать духовные советы и наставления
- Помогать игрокам понять уроки, которые несет каждый ход
- Отвечать с мудростью древних ведических текстов
- Быть сострадательной и понимающей

Отвечай кратко, но глубоко. Используй эмодзи для выражения эмоций. Всегда помни, что игра Лила - это путь к самопознанию и космическому сознанию.

Когда игрок спрашивает о конкретном плане или позиции, используй инструмент createPlanCard для создания красивой карточки.`,
      tools: {
        createPlanCard: tool({
          description: 'Создать красивую карточку для плана игры Лила',
          parameters: z.object({
            planNumber: z.number().describe('Номер плана (1-72)'),
            playerPosition: z.number().optional().describe('Текущая позиция игрока'),
          }),
          execute: async ({ planNumber, playerPosition }) => {
            const planInfo = plansData[planNumber] || {
              name: `План ${planNumber}`,
              description: "Особый этап духовного развития",
              element: "✨",
              color: "blue"
            };

            return {
              type: 'plan-card',
              planNumber,
              planInfo,
              isCurrentPosition: playerPosition === planNumber,
              timestamp: new Date().toISOString()
            };
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Ошибка в API чата:', error);
    return new Response('Ошибка сервера', { status: 500 });
  }
} 
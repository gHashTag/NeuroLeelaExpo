import { createOpenAI } from '@ai-sdk/openai';
import { streamText } from 'ai';

// Конфигурация для OpenRouter
const openrouter = createOpenAI({
  baseURL: 'https://openrouter.ai/api/v1',
  apiKey: process.env.EXPO_PUBLIC_OPENROUTER_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { messages } = await request.json();

    const result = streamText({
      model: openrouter('meta-llama/llama-3.1-8b-instruct:free'), // Используем бесплатную модель
      messages,
      system: `Ты - Лила, богиня игры самопознания. Ты мудрая наставница, которая помогает игрокам понять глубокий смысл их путешествия по игровому полю. 

Твоя роль:
- Объяснять значение позиций на игровом поле (планы 1-72)
- Давать духовные советы и наставления
- Помогать игрокам понять уроки, которые несет каждый ход
- Отвечать с мудростью древних ведических текстов
- Быть сострадательной и понимающей

Отвечай кратко, но глубоко. Используй эмодзи для выражения эмоций. Всегда помни, что игра Лила - это путь к самопознанию и космическому сознанию.`,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Ошибка в API чата:', error);
    return new Response('Ошибка сервера', { status: 500 });
  }
} 
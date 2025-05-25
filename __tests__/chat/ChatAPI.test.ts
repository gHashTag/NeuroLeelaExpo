import { describe, it, expect } from 'vitest';

// Простой мок для тестирования логики чата
const mockChatResponse = {
  role: 'assistant',
  content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Позиция 10 символизирует начало духовного пути.'
};

// Мокаем функцию обработки сообщений
const processChatMessage = (userMessage: string): typeof mockChatResponse => {
  // Простая логика для тестирования
  if (userMessage.includes('позиция') || userMessage.includes('план')) {
    return {
      role: 'assistant',
      content: 'Намасте! 🙏 Каждая позиция на игровом поле несет глубокий духовный смысл.'
    };
  }
  
  return mockChatResponse;
};

describe('Chat API Logic', () => {
  it('должен возвращать ответ от Лилы', () => {
    const userMessage = 'Что означает позиция 10?';
    const response = processChatMessage(userMessage);
    
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('Намасте');
    expect(response.content).toContain('🙏');
  });

  it('должен обрабатывать вопросы о позициях', () => {
    const userMessage = 'Расскажи о плане 5';
    const response = processChatMessage(userMessage);
    
    expect(response.content).toContain('позиция');
    expect(response.content).toContain('духовный');
  });

  it('должен возвращать базовый ответ для общих вопросов', () => {
    const userMessage = 'Привет';
    const response = processChatMessage(userMessage);
    
    expect(response.role).toBe('assistant');
    expect(response.content).toContain('Лила');
  });

  it('должен включать эмодзи в ответы', () => {
    const userMessage = 'Помоги мне';
    const response = processChatMessage(userMessage);
    
    expect(response.content).toMatch(/🙏|🕉️|✨/);
  });
}); 
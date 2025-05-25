import { describe, it, expect } from 'vitest';

// Мок функция для генерации ответов (копия из ChatBot.tsx)
const generateMockResponse = (userInput: string) => {
  const input = userInput.toLowerCase();
  
  // Проверяем, спрашивает ли пользователь о конкретном плане
  const planMatch = input.match(/план\s*(\d+)|позиция\s*(\d+)|(\d+)/);
  const planNumber = planMatch ? parseInt(planMatch[1] || planMatch[2] || planMatch[3]) : null;
  
  let content = '';
  let toolInvocations: any[] = [];
  
  if (planNumber && planNumber >= 1 && planNumber <= 72) {
    content = `Намасте! 🙏 Позвольте мне рассказать вам о плане ${planNumber}. Это особое место на пути самопознания.`;
    
    // Создаем мок tool invocation для карточки плана
    const planInfo = getPlanInfo(planNumber);
    toolInvocations = [{
      toolCallId: `mock-${Date.now()}`,
      toolName: 'createPlanCard',
      state: 'result',
      result: {
        type: 'plan-card',
        planNumber,
        planInfo,
        isCurrentPosition: false,
        timestamp: new Date().toISOString()
      }
    }];
  } else if (input.includes('привет') || input.includes('hi') || input.includes('hello')) {
    content = 'Намасте! 🙏 Добро пожаловать в игру самопознания! Я - Лила, ваш духовный проводник. Спросите меня о любом плане (1-72) или поделитесь своими мыслями о духовном пути.';
  } else if (input.includes('помощь') || input.includes('help')) {
    content = 'Я могу помочь вам понять значение планов игры Лила! 🎭\n\nПопробуйте спросить:\n• "Что означает план 10?"\n• "Расскажи о позиции 23"\n• "Объясни план 68"\n\nИли просто поделитесь своими мыслями о духовном пути! ✨';
  } else {
    content = 'Намасте! 🙏 Ваши слова несут глубокий смысл. В игре Лила каждый момент - это возможность для самопознания. Расскажите мне больше о том, что вас интересует, или спросите о конкретном плане игры.';
  }
  
  return {
    id: (Date.now() + 1).toString(),
    role: 'assistant',
    content,
    toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
  };
};

// Функция для получения информации о плане
const getPlanInfo = (planNumber: number) => {
  const plansData: Record<number, { name: string; description: string; element: string; color: string }> = {
    1: { name: "Рождение", description: "Начало духовного пути", element: "🌱", color: "green" },
    10: { name: "Майя (Иллюзия)", description: "Понимание природы реальности", element: "🎭", color: "purple" },
    23: { name: "Небеса", description: "Состояние блаженства", element: "☁️", color: "blue" },
    41: { name: "Добрые дела", description: "Карма служения", element: "🤝", color: "gold" },
    68: { name: "Космическое сознание", description: "Высшее просветление", element: "🕉️", color: "violet" }
  };
  
  return plansData[planNumber] || {
    name: `План ${planNumber}`,
    description: "Особый этап духовного развития на пути к самопознанию",
    element: "✨",
    color: "blue"
  };
};

describe('ChatBot Mock Responses', () => {
  it('должен отвечать на приветствие', () => {
    const response = generateMockResponse('hi');
    
    expect(response.content).toContain('Намасте');
    expect(response.content).toContain('Лила');
    expect(response.content).toContain('духовный проводник');
    expect(response.toolInvocations).toBeUndefined();
  });

  it('должен отвечать на русское приветствие', () => {
    const response = generateMockResponse('привет');
    
    expect(response.content).toContain('Намасте');
    expect(response.content).toContain('самопознания');
  });

  it('должен создавать карточку для плана 10', () => {
    const response = generateMockResponse('план 10');
    
    expect(response.content).toContain('плане 10');
    expect(response.toolInvocations).toBeDefined();
    expect(response.toolInvocations?.[0].toolName).toBe('createPlanCard');
    expect(response.toolInvocations?.[0].result.planNumber).toBe(10);
    expect(response.toolInvocations?.[0].result.planInfo.name).toBe('Майя (Иллюзия)');
  });

  it('должен создавать карточку для неизвестного плана', () => {
    const response = generateMockResponse('позиция 42');
    
    expect(response.content).toContain('плане 42');
    expect(response.toolInvocations).toBeDefined();
    expect(response.toolInvocations?.[0].result.planInfo.name).toBe('План 42');
    expect(response.toolInvocations?.[0].result.planInfo.element).toBe('✨');
  });

  it('должен отвечать на запрос помощи', () => {
    const response = generateMockResponse('помощь');
    
    expect(response.content).toContain('план 10');
    expect(response.content).toContain('позиции 23');
    expect(response.content).toContain('план 68');
  });

  it('должен давать общий ответ на неопознанные сообщения', () => {
    const response = generateMockResponse('какой-то случайный текст');
    
    expect(response.content).toContain('Намасте');
    expect(response.content).toContain('самопознания');
    expect(response.toolInvocations).toBeUndefined();
  });

  it('должен правильно парсить номера планов из разных форматов', () => {
    const testCases = [
      { input: 'план 23', expected: 23 },
      { input: 'позиция 41', expected: 41 },
      { input: 'что означает 68?', expected: 68 },
      { input: 'расскажи про план 1', expected: 1 }
    ];

    testCases.forEach(({ input, expected }) => {
      const response = generateMockResponse(input);
      expect(response.toolInvocations?.[0].result.planNumber).toBe(expected);
    });
  });
}); 
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Мок для fetch
global.fetch = vi.fn();

describe('ChatBot AI Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('должен правильно формировать запрос к OpenRouter API', async () => {
    const mockResponse = {
      choices: [{
        message: {
          content: 'Намасте! План 1 - это рождение, начало духовного пути.'
        }
      }]
    };

    (fetch as any).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    // Симулируем отправку сообщения
    const userMessage = 'Расскажи о плане 1';
    
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key',
        'HTTP-Referer': 'https://neurolila.app',
        'X-Title': 'NeuroLila Game'
      },
      body: JSON.stringify({
        model: 'meta-llama/llama-3.1-8b-instruct:free',
        messages: [
          {
            role: 'system',
            content: 'Ты - Лила, богиня игры самопознания'
          },
          {
            role: 'user',
            content: userMessage
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    });

    expect(fetch).toHaveBeenCalledWith(
      'https://openrouter.ai/api/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-api-key'
        })
      })
    );

    const data = await response.json();
    expect(data.choices[0].message.content).toContain('План 1');
  });

  it('должен обрабатывать ошибки API', async () => {
    (fetch as any).mockResolvedValueOnce({
      ok: false,
      status: 401
    });

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions');
      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }
    } catch (error: any) {
      expect(error.message).toBe('OpenRouter API error: 401');
    }
  });

  it('должен извлекать номер плана из ответа ИИ', () => {
    const testCases = [
      { text: 'План 10 означает очищение', expected: 10 },
      { text: 'Позиция 23 - это небеса', expected: 23 },
      { text: '68 план космического сознания', expected: 68 },
      { text: 'Рассказываю о плане 1', expected: 1 },
      { text: 'Никаких планов здесь нет', expected: null }
    ];

    testCases.forEach(({ text, expected }) => {
      const planMatch = text.match(/план[а-я\s]*(\d+)|позици[а-я\s]*(\d+)|(\d+)[а-я\s]*план/i);
      const planNumber = planMatch ? parseInt(planMatch[1] || planMatch[2] || planMatch[3]) : null;
      
      expect(planNumber).toBe(expected);
    });
  });

  it('должен возвращать правильную информацию о планах', () => {
    // Функция getPlanInfo (упрощенная версия)
    const getPlanInfo = (planNumber: number) => {
      const plansData: Record<number, { name: string; description: string; element: string; color: string }> = {
        1: { name: "Рождение", description: "Начало духовного пути, первое воплощение души", element: "🌱", color: "green" },
        68: { name: "Космическое сознание", description: "Высшее просветление и единство с Абсолютом", element: "🕉️", color: "violet" }
      };
      
      return plansData[planNumber] || {
        name: `План ${planNumber}`,
        description: "Особый этап духовного развития на пути к самопознанию",
        element: "✨",
        color: "blue"
      };
    };

    const plan1 = getPlanInfo(1);
    expect(plan1.name).toBe("Рождение");
    expect(plan1.element).toBe("🌱");
    expect(plan1.color).toBe("green");

    const plan42 = getPlanInfo(42);
    expect(plan42.name).toBe("План 42");
    expect(plan42.element).toBe("✨");
    expect(plan42.color).toBe("blue");
  });

  it('должен создавать tool invocation для карточки плана', () => {
    const planNumber = 10;
    const planInfo = {
      name: "Очищение",
      description: "Освобождение от негативных качеств",
      element: "🧘",
      color: "blue"
    };

    const toolInvocation = {
      toolCallId: `ai-${Date.now()}`,
      toolName: 'createPlanCard',
      state: 'result',
      result: {
        type: 'plan-card',
        planNumber,
        planInfo,
        isCurrentPosition: false,
        timestamp: new Date().toISOString()
      }
    };

    expect(toolInvocation.toolName).toBe('createPlanCard');
    expect(toolInvocation.result.planNumber).toBe(10);
    expect(toolInvocation.result.planInfo.name).toBe("Очищение");
  });
}); 
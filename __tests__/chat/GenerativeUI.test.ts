import { describe, it, expect } from 'vitest';

// Мок данных для тестирования Generative UI
const mockPlanCardData = {
  type: 'plan-card',
  planNumber: 10,
  planInfo: {
    name: "Майя (Иллюзия)",
    description: "Понимание природы реальности",
    element: "🎭",
    color: "purple"
  },
  isCurrentPosition: true,
  timestamp: new Date().toISOString()
};

// Функция для обработки tool invocations
const processToolInvocation = (toolName: string, args: any) => {
  if (toolName === 'createPlanCard') {
    const { planNumber, playerPosition } = args;
    
    // Простая логика для тестирования
    const planInfo = {
      name: planNumber === 10 ? "Майя (Иллюзия)" : `План ${planNumber}`,
      description: planNumber === 10 ? "Понимание природы реальности" : "Особый этап духовного развития",
      element: planNumber === 10 ? "🎭" : "✨",
      color: planNumber === 10 ? "purple" : "blue"
    };

    return {
      type: 'plan-card',
      planNumber,
      planInfo,
      isCurrentPosition: playerPosition === planNumber,
      timestamp: new Date().toISOString()
    };
  }
  
  return null;
};

describe('Generative UI для игры Лила', () => {
  it('должен создавать карточку плана с правильными данными', () => {
    const result = processToolInvocation('createPlanCard', { 
      planNumber: 10, 
      playerPosition: 10 
    });
    
    expect(result).toBeTruthy();
    expect(result?.type).toBe('plan-card');
    expect(result?.planNumber).toBe(10);
    expect(result?.planInfo.name).toBe("Майя (Иллюзия)");
    expect(result?.planInfo.element).toBe("🎭");
    expect(result?.isCurrentPosition).toBe(true);
  });

  it('должен создавать карточку для неизвестного плана', () => {
    const result = processToolInvocation('createPlanCard', { 
      planNumber: 42, 
      playerPosition: 10 
    });
    
    expect(result).toBeTruthy();
    expect(result?.planNumber).toBe(42);
    expect(result?.planInfo.name).toBe("План 42");
    expect(result?.planInfo.description).toBe("Особый этап духовного развития");
    expect(result?.isCurrentPosition).toBe(false);
  });

  it('должен правильно определять текущую позицию игрока', () => {
    const result = processToolInvocation('createPlanCard', { 
      planNumber: 23, 
      playerPosition: 23 
    });
    
    expect(result?.isCurrentPosition).toBe(true);
    
    const result2 = processToolInvocation('createPlanCard', { 
      planNumber: 23, 
      playerPosition: 10 
    });
    
    expect(result2?.isCurrentPosition).toBe(false);
  });

  it('должен возвращать null для неизвестных инструментов', () => {
    const result = processToolInvocation('unknownTool', { test: 'data' });
    
    expect(result).toBeNull();
  });

  it('должен включать timestamp в результат', () => {
    const result = processToolInvocation('createPlanCard', { 
      planNumber: 1, 
      playerPosition: 1 
    });
    
    expect(result?.timestamp).toBeTruthy();
    expect(typeof result?.timestamp).toBe('string');
  });
}); 
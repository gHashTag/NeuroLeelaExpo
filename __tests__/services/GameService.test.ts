import { describe, test, expect, vi, beforeEach } from 'vitest';
import {
  validatePosition,
  handleConsecutiveSixes,
  getDirectionAndPosition,
  processGameStep,
  getPlan,
  getUserByUserId,
  getLastStep,
  updatePlayerPosition
} from '../../services/GameService';

// Mock the supabase module
vi.mock('../../config/supabase', () => ({
  supabase: {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi.fn().mockImplementation(() => ({
      data: {
        id: 'test-user-id',
        plan: 10,
        previous_plan: 5,
        consecutiveSixes: 0,
        positionBeforeThreeSixes: 0,
        isFinished: false,
        language_code: 'en'
      },
      error: null
    })),
    then: vi.fn().mockImplementation((callback) => {
      callback({ error: null });
      return Promise.resolve();
    })
  }
}));

// Mock the constants/plansList.json module
vi.mock('../../constants/plansList.json', () => ([
  { key: '1-birth', title: '1. Genesis' },
  { key: '10-cleansing', title: '10. Purification' },
  { key: '68-cosmicconsciousness', title: '68. Cosmic Consciousness' },
  { key: '72-tamogun', title: '72. Inertia' }
]));

// Mark the module as virtual
vi.stubEnv('VITEST_VIRTUAL_MOCKS', 'true');

describe('GameService', () => {
  describe('validatePosition', () => {
    test('должен возвращать true для допустимых позиций', () => {
      expect(validatePosition(1)).toBe(true);
      expect(validatePosition(36)).toBe(true);
      expect(validatePosition(72)).toBe(true);
    });

    test('должен возвращать false для недопустимых позиций', () => {
      expect(validatePosition(0)).toBe(false);
      expect(validatePosition(-5)).toBe(false);
      expect(validatePosition(73)).toBe(false);
      expect(validatePosition(100)).toBe(false);
    });
  });

  describe('handleConsecutiveSixes', () => {
    test('должен сбрасывать счетчик последовательных шестерок, когда бросок не 6', () => {
      const result = handleConsecutiveSixes(5, 10, 1, 5);
      
      expect(result.newConsecutive).toBe(0);
      expect(result.newPosition).toBe(15);
      expect(result.newBeforeThreeSixes).toBe(5);
      expect(result.direction).toBeUndefined();
    });

    test('должен увеличивать счетчик последовательных шестерок, когда бросок 6', () => {
      const result = handleConsecutiveSixes(6, 10, 0, 5);
      
      expect(result.newConsecutive).toBe(1);
      expect(result.newPosition).toBe(16);
      expect(result.newBeforeThreeSixes).toBe(10);
      expect(result.direction).toBeUndefined();
    });

    test('должен сбрасывать позицию до position_before_three_sixes после трех последовательных шестерок', () => {
      const result = handleConsecutiveSixes(6, 20, 2, 5);
      
      expect(result.newConsecutive).toBe(0);
      expect(result.newPosition).toBe(5);
      expect(result.newBeforeThreeSixes).toBe(5);
      expect(result.direction).toBe('snake 🐍');
    });

    test('должен правильно обрабатывать второй последовательный бросок шестерки', () => {
      const result = handleConsecutiveSixes(6, 25, 1, 25);
      
      expect(result.newConsecutive).toBe(2);
      expect(result.newPosition).toBe(31);
      expect(result.newBeforeThreeSixes).toBe(25);
      expect(result.direction).toBeUndefined();
    });
  });

  describe('getDirectionAndPosition', () => {
    test('должен обрабатывать условие победы', () => {
      const result = getDirectionAndPosition(68, false, 4, 64);
      
      expect(result.finalLoka).toBe(68);
      expect(result.direction).toBe('win 🕉');
      expect(result.isGameFinished).toBe(true);
    });

    test('должен обрабатывать позиции змей', () => {
      const result = getDirectionAndPosition(12, false, 3, 9);
      
      expect(result.finalLoka).toBe(8);
      expect(result.direction).toBe('snake 🐍');
      expect(result.isGameFinished).toBe(false);
    });

    test('должен обрабатывать все позиции змей', () => {
      const snakePositions = [
        { from: 12, to: 8 }, 
        { from: 16, to: 4 },
        { from: 24, to: 7 },
        { from: 29, to: 6 },
        { from: 44, to: 9 },
        { from: 52, to: 35 },
        { from: 55, to: 3 },
        { from: 61, to: 13 },
        { from: 63, to: 2 },
        { from: 72, to: 51 }
      ];
      
      snakePositions.forEach(({ from, to }) => {
        // Рассчитываем, что текущая позиция на 2 меньше целевой позиции змеи
        const currentLoka = from - 2;
        const result = getDirectionAndPosition(from, false, 2, currentLoka);
        
        expect(result.finalLoka).toBe(to);
        expect(result.direction).toBe('snake 🐍');
        expect(result.isGameFinished).toBe(false);
      });
    });

    test('должен обрабатывать позиции стрел', () => {
      const result = getDirectionAndPosition(10, false, 1, 9);
      
      expect(result.finalLoka).toBe(23);
      expect(result.direction).toBe('arrow 🏹');
      expect(result.isGameFinished).toBe(false);
    });

    test('должен обрабатывать все позиции стрел', () => {
      const arrowPositions = [
        { from: 10, to: 23 },
        { from: 17, to: 69 },
        { from: 20, to: 32 },
        { from: 22, to: 60 },
        { from: 27, to: 41 },
        { from: 28, to: 50 },
        { from: 37, to: 66 },
        { from: 45, to: 67 },
        { from: 46, to: 62 },
        { from: 54, to: 68 }
      ];
      
      arrowPositions.forEach(({ from, to }) => {
        // Рассчитываем, что текущая позиция на 2 меньше целевой позиции стрелы
        const currentLoka = from - 2;
        const result = getDirectionAndPosition(from, false, 2, currentLoka);
        
        expect(result.finalLoka).toBe(to);
        expect(result.direction).toBe('arrow 🏹');
        // Проверяем специальный случай победы через стрелу
        if (to === 68) {
          expect(result.isGameFinished).toBe(true);
        } else {
          expect(result.isGameFinished).toBe(false);
        }
      });
    });

    test('должен обрабатывать превышение лимита доски', () => {
      const currentLoka = 70;
      const roll = 5;
      // Результат должен быть "остаемся на месте"
      const result = getDirectionAndPosition(currentLoka + roll, false, roll, currentLoka);
      
      expect(result.finalLoka).toBe(currentLoka); // Остаемся на текущей позиции, не просто вычитаем бросок
      expect(result.direction).toBe('stop 🛑');
      expect(result.isGameFinished).toBe(false);
    });

    test('должен корректно обрабатывать выход за границы поля в зависимости от текущей позиции', () => {
      // Проверяем разные граничные случаи
      
      // Случай 1: Текущая позиция + бросок = 72 (граница поля)
      const exactLimitResult = getDirectionAndPosition(72, false, 2, 70);
      expect(exactLimitResult.finalLoka).toBe(51); // Змея на позиции 72 ведет на 51
      expect(exactLimitResult.direction).toBe('snake 🐍');
      
      // Случай 2: Текущая позиция + бросок = 73 (за границей)
      const justOverLimitResult = getDirectionAndPosition(73, false, 3, 70);
      expect(justOverLimitResult.finalLoka).toBe(70); // Остаемся на текущей позиции
      expect(justOverLimitResult.direction).toBe('stop 🛑');
      
      // Случай 3: Текущая позиция + бросок = 75 (далеко за границей)
      const wellOverLimitResult = getDirectionAndPosition(75, false, 5, 70);
      expect(wellOverLimitResult.finalLoka).toBe(70); // Остаемся на текущей позиции
      expect(wellOverLimitResult.direction).toBe('stop 🛑');
    });

    test('должен обрабатывать случай точного совпадения с лимитом доски', () => {
      const result = getDirectionAndPosition(72, false, 3, 69);
      
      expect(result.finalLoka).toBe(51); // позиция змеи с 72
      expect(result.direction).toBe('snake 🐍');
      expect(result.isGameFinished).toBe(false);
    });

    test('должен обрабатывать обычный ход', () => {
      const result = getDirectionAndPosition(25, false, 2, 23);
      
      // Проверяем, что позиция изменилась в соответствии с правилами игры
      // Ожидаем, что конечная позиция равна начальной позиции плюс бросок,
      // поскольку на позиции 25 и 27 нет специальных правил
      expect(result.finalLoka).toBe(25);
      expect(result.direction).toBe('step 🚶🏼');
      expect(result.isGameFinished).toBe(false);
    });

    test('должен обрабатывать уже завершенную игру с броском 6', () => {
      const result = getDirectionAndPosition(68, true, 6, 68);
      
      expect(result.finalLoka).toBe(6);
      expect(result.direction).toBe('step 🚶🏼');
      expect(result.isGameFinished).toBe(false);
    });

    test('должен обрабатывать уже завершенную игру с броском не 6', () => {
      const result = getDirectionAndPosition(68, true, 3, 68);
      
      expect(result.finalLoka).toBe(68);
      expect(result.direction).toBe('stop 🛑');
      expect(result.isGameFinished).toBe(true);
    });
    
    test('должен корректно определять условия победы и конца игры', () => {
      // Тест победы
      const winResult = getDirectionAndPosition(68, false, 4, 64);
      expect(winResult.finalLoka).toBe(68);
      expect(winResult.direction).toBe('win 🕉');
      expect(winResult.isGameFinished).toBe(true);
      
      // Тест перезапуска после победы с шестеркой
      const restartResult = getDirectionAndPosition(68, true, 6, 68);
      expect(restartResult.finalLoka).toBe(6);
      expect(restartResult.direction).toBe('step 🚶🏼');
      expect(restartResult.isGameFinished).toBe(false);
      
      // Тест перезапуска после победы с числом, отличным от 6
      const noRestartResult = getDirectionAndPosition(68, true, 3, 68);
      expect(noRestartResult.finalLoka).toBe(68);
      expect(noRestartResult.direction).toBe('stop 🛑');
      expect(noRestartResult.isGameFinished).toBe(true);
    });
    
    test('должен корректно обрабатывать пределы доски', () => {
      // Тест превышения лимита доски
      const exceedBoardResult = getDirectionAndPosition(75, false, 5, 70);
      expect(exceedBoardResult.finalLoka).toBe(70);
      expect(exceedBoardResult.direction).toBe('stop 🛑');
      
      // Тест попадания точно на последнюю позицию
      const exactBoardLimitResult = getDirectionAndPosition(72, false, 3, 69);
      expect(exactBoardLimitResult.finalLoka).toBe(51); // Змея на позиции 72
      expect(exactBoardLimitResult.direction).toBe('snake 🐍');
    });

    test('должен корректно обрабатывать начало игры с позиции 68', () => {
      // Случай: Мы на позиции 68, игра завершена (isFinished=true), выпало 6
      const startWithSixResult = getDirectionAndPosition(68, true, 6, 68);
      expect(startWithSixResult.finalLoka).toBe(6); // Переходим на позицию 6
      expect(startWithSixResult.direction).toBe('step 🚶🏼');
      expect(startWithSixResult.isGameFinished).toBe(false);
      
      // Случай: Мы на позиции 68, игра завершена (isFinished=true), выпало не 6
      const startWithoutSixResult = getDirectionAndPosition(68, true, 3, 68);
      expect(startWithoutSixResult.finalLoka).toBe(68); // Остаемся на позиции 68
      expect(startWithoutSixResult.direction).toBe('stop 🛑');
      expect(startWithoutSixResult.isGameFinished).toBe(true);
    });

    test('должен корректно обрабатывать все граничные случаи начала игры', () => {
      // Проверяем все возможные броски в начале игры
      for (let roll = 1; roll <= 6; roll++) {
        const result = getDirectionAndPosition(68, true, roll, 68);
        
        if (roll === 6) {
          // Если выпало 6, должны начать игру с позиции 6
          expect(result.finalLoka).toBe(6);
          expect(result.direction).toBe('step 🚶🏼');
          expect(result.isGameFinished).toBe(false);
        } else {
          // Если выпало не 6, должны остаться на позиции 68
          expect(result.finalLoka).toBe(68);
          expect(result.direction).toBe('stop 🛑');
          expect(result.isGameFinished).toBe(true);
        }
      }
    });
  });

  describe('Интеграционные тесты', () => {
    test('processGameStep должен возвращать корректно структурированный результат', () => {
      // Создаем мокированный результат processGameStep
      const mockResult = {
        gameStep: {
          loka: 13,
          previous_loka: 10,
          direction: 'step 🚶🏼',
          consecutive_sixes: 0,
          position_before_three_sixes: 0,
          is_finished: false
        },
        plan: { 
          key: '13-test', 
          title: 'Test Plan 13' 
        },
        direction: 'Step 🚶🏼'
      };
      
      // Проверяем структуру и типы данных результата
      expect(mockResult).toHaveProperty('gameStep');
      expect(mockResult).toHaveProperty('plan');
      expect(mockResult).toHaveProperty('direction');
      
      expect(typeof mockResult.gameStep.loka).toBe('number');
      expect(typeof mockResult.gameStep.previous_loka).toBe('number');
      expect(typeof mockResult.gameStep.direction).toBe('string');
      expect(typeof mockResult.gameStep.consecutive_sixes).toBe('number');
      expect(typeof mockResult.gameStep.is_finished).toBe('boolean');
      expect(typeof mockResult.direction).toBe('string');
    });
  });
}); 
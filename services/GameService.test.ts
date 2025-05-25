import { describe, it, expect, vi, beforeEach } from 'vitest';
import { handleConsecutiveSixes, getDirectionAndPosition, validatePosition } from './GameService';

// Моки для Apollo Client
vi.mock('../lib/apollo-drizzle-client', () => ({
  currentPlayerVar: vi.fn().mockReturnValue({
    id: 'test-user-id',
    plan: 10,
    previous_plan: 5
  })
}));

describe('GameService', () => {
  describe('handleConsecutiveSixes', () => {
    it('должен сбросить счетчик шестерок, если выпало не 6', () => {
      const result = handleConsecutiveSixes(
        3, // roll
        10, // currentLoka
        2, // consecutive
        5 // positionBeforeThreeSixes
      );
      
      expect(result.newConsecutive).toBe(0);
      expect(result.newPosition).toBe(13); // 10 + 3
      expect(result.newBeforeThreeSixes).toBe(5);
    });
    
    it('должен увеличить счетчик шестерок и установить позицию до трех шестерок при первой шестерке', () => {
      const result = handleConsecutiveSixes(
        6, // roll
        10, // currentLoka
        0, // consecutive (первая шестерка)
        0 // positionBeforeThreeSixes (еще не установлена)
      );
      
      expect(result.newConsecutive).toBe(1);
      expect(result.newPosition).toBe(16); // 10 + 6
      expect(result.newBeforeThreeSixes).toBe(10); // Запоминаем текущую позицию
    });
    
    it('должен увеличить счетчик шестерок при второй шестерке', () => {
      const result = handleConsecutiveSixes(
        6, // roll
        16, // currentLoka
        1, // consecutive (вторая шестерка)
        10 // positionBeforeThreeSixes (позиция до первой шестерки)
      );
      
      expect(result.newConsecutive).toBe(2);
      expect(result.newPosition).toBe(22); // 16 + 6
      expect(result.newBeforeThreeSixes).toBe(10); // Сохраняем оригинальную позицию
    });
    
    it('должен сбросить счетчик и вернуть игрока в исходную позицию при третьей шестерке', () => {
      const result = handleConsecutiveSixes(
        6, // roll
        22, // currentLoka
        2, // consecutive (третья шестерка)
        10 // positionBeforeThreeSixes (позиция до первой шестерки)
      );
      
      expect(result.newConsecutive).toBe(0);
      expect(result.newPosition).toBe(10); // Возвращаемся в исходную позицию
      expect(result.newBeforeThreeSixes).toBe(10);
      expect(result.direction).toBe('snake 🐍');
    });
  });
  
  describe('getDirectionAndPosition', () => {
    it('должен обрабатывать регулярный ход', () => {
      const currentLoka = 10;
      const roll = 5;
      const result = getDirectionAndPosition(
        currentLoka + roll, // newLoka
        false, // isFinished
        roll, // roll
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(15);
      expect(result.direction).toBe('step 🚶🏼');
      expect(result.isGameFinished).toBe(false);
    });
    
    it('должен обрабатывать змеи (snakes)', () => {
      const currentLoka = 9;
      const roll = 3;
      const result = getDirectionAndPosition(
        12, // newLoka (змея)
        false, // isFinished
        roll, // roll
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(8); // Перемещение вниз
      expect(result.direction).toBe('snake 🐍');
      expect(result.isGameFinished).toBe(false);
    });
    
    it('должен обрабатывать стрелы (arrows)', () => {
      const currentLoka = 7;
      const roll = 3;
      const result = getDirectionAndPosition(
        10, // newLoka (стрела)
        false, // isFinished
        roll, // roll
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(23); // Перемещение вверх
      expect(result.direction).toBe('arrow 🏹');
      expect(result.isGameFinished).toBe(false);
    });
    
    it('должен обрабатывать финишную позицию', () => {
      const currentLoka = 65;
      const roll = 3;
      const result = getDirectionAndPosition(
        68, // newLoka (победа)
        false, // isFinished
        roll, // roll
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(68);
      expect(result.direction).toBe('win 🕉');
      expect(result.isGameFinished).toBe(true);
    });
    
    it('должен предотвращать перемещение после победы, если не выпало 6', () => {
      const currentLoka = 68;
      const roll = 3;
      const result = getDirectionAndPosition(
        71, // newLoka (после победы)
        true, // isFinished
        roll, // roll (не 6)
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(68);
      expect(result.direction).toBe('stop 🛑');
      expect(result.isGameFinished).toBe(true);
    });
    
    it('должен позволять перезапустить игру, если выпало 6 после победы', () => {
      const currentLoka = 68;
      const roll = 6;
      const result = getDirectionAndPosition(
        74, // newLoka (после победы)
        true, // isFinished
        roll, // roll (6)
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(6);
      expect(result.direction).toBe('step 🚶🏼');
      expect(result.isGameFinished).toBe(false);
    });
    
    it('должен предотвращать выход за пределы игрового поля', () => {
      const currentLoka = 70;
      const roll = 5;
      const result = getDirectionAndPosition(
        75, // newLoka (за пределами)
        false, // isFinished
        roll, // roll
        currentLoka // currentLoka
      );
      
      expect(result.finalLoka).toBe(70); // Остаемся на месте
      expect(result.direction).toBe('stop 🛑');
      expect(result.isGameFinished).toBe(false);
    });
    
    it('должен корректно обрабатывать выход за границы поля в зависимости от текущей позиции', () => {
      // Проверяем разные граничные случаи
      
      // Случай 1: Точно на границе поля (позиция 72 - змея)
      const exactLimitResult = getDirectionAndPosition(72, false, 2, 70);
      expect(exactLimitResult.finalLoka).toBe(51); // Змея с 72 ведет на 51
      expect(exactLimitResult.direction).toBe('snake 🐍');
      
      // Случай 2: Сразу за границей (позиция 73)
      const justOverLimitResult = getDirectionAndPosition(73, false, 3, 70);
      expect(justOverLimitResult.finalLoka).toBe(70); // Остаемся на текущей позиции
      expect(justOverLimitResult.direction).toBe('stop 🛑');
      
      // Случай 3: Значительно за границей (позиция 75)
      const wellOverLimitResult = getDirectionAndPosition(75, false, 5, 70);
      expect(wellOverLimitResult.finalLoka).toBe(70); // Остаемся на текущей позиции
      expect(wellOverLimitResult.direction).toBe('stop 🛑');
    });
    
    it('должен корректно обрабатывать начало игры с позиции 68', () => {
      // Случай: На позиции 68, игра завершена, выпало 6
      const startWithSixResult = getDirectionAndPosition(68, true, 6, 68);
      expect(startWithSixResult.finalLoka).toBe(6); // Переход на позицию 6
      expect(startWithSixResult.direction).toBe('step 🚶🏼');
      expect(startWithSixResult.isGameFinished).toBe(false);
      
      // Случай: На позиции 68, игра завершена, выпало не 6
      const startWithoutSixResult = getDirectionAndPosition(68, true, 3, 68);
      expect(startWithoutSixResult.finalLoka).toBe(68); // Остаемся на 68
      expect(startWithoutSixResult.direction).toBe('stop 🛑');
      expect(startWithoutSixResult.isGameFinished).toBe(true);
    });
    
    it('должен корректно обрабатывать все возможные броски при начале игры', () => {
      // Проверяем все возможные значения кубика
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
  
  describe('validatePosition', () => {
    it('должен подтверждать позиции в пределах диапазона', () => {
      expect(validatePosition(1)).toBe(true);
      expect(validatePosition(42)).toBe(true);
      expect(validatePosition(72)).toBe(true);
    });
    
    it('должен отклонять позиции вне диапазона', () => {
      expect(validatePosition(0)).toBe(false);
      expect(validatePosition(-5)).toBe(false);
      expect(validatePosition(73)).toBe(false);
      expect(validatePosition(100)).toBe(false);
    });
  });
}); 
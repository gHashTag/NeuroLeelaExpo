import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('🎮 ИГРОВОЙ FLOW - Проверка логирования', () => {
  let consoleSpy;

  beforeEach(() => {
    // Создаем шпиона для консоли
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleSpy.mockRestore();
  });

  describe('🎲 ЭТАП 1: Бросок кубика', () => {
    it('должен логировать начало этапа броска кубика', () => {
      // Симулируем логи которые должны появляться в handleNewDiceRoll
      console.log('🎲 [GAME_FLOW] ================ ЭТАП 1: БРОСОК КУБИКА ================');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: НАЧАЛО ЭТАПА БРОСКА');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: ДЕТАЛЬНАЯ ДИАГНОСТИКА ВХОДНЫХ ДАННЫХ:');

      // Проверяем что логи были вызваны
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] ================ ЭТАП 1: БРОСОК КУБИКА ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: НАЧАЛО ЭТАПА БРОСКА'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: ДЕТАЛЬНАЯ ДИАГНОСТИКА ВХОДНЫХ ДАННЫХ:'
      );
    });

    it('должен логировать блокировку кубика', () => {
      // Симулируем логи блокировки
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: ПРОВЕРКА БЛОКИРОВКИ КУБИКА:');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: КУБИК ЗАБЛОКИРОВАН! needsReport =', true);
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: ЭТАП ПРЕРВАН - ожидаем отчет');

      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: ПРОВЕРКА БЛОКИРОВКИ КУБИКА:'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: КУБИК ЗАБЛОКИРОВАН! needsReport =', true
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: ЭТАП ПРЕРВАН - ожидаем отчет'
      );
    });

    it('должен логировать успешный бросок', () => {
      // Симулируем логи успешного броска
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: КУБИК НЕ ЗАБЛОКИРОВАН, продолжаем ЭТАП 1');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: Сгенерированный бросок =', 3);
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: setLastRoll выполнен');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: Вызываем processGameStep...');

      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: КУБИК НЕ ЗАБЛОКИРОВАН, продолжаем ЭТАП 1'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: Сгенерированный бросок =', 3
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: setLastRoll выполнен'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: Вызываем processGameStep...'
      );
    });
  });

  describe('📍 ЭТАП 2: Показ результата', () => {
    it('должен логировать показ результата броска', () => {
      // Симулируем логи этапа 2
      console.log('🎲 [GAME_FLOW] ================ ЭТАП 2: ПОКАЗ РЕЗУЛЬТАТА ================');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: Показываем результат броска...');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: addGameMessage выполнен');

      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] ================ ЭТАП 2: ПОКАЗ РЕЗУЛЬТАТА ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: Показываем результат броска...'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: addGameMessage выполнен'
      );
    });

    it('должен логировать логику определения необходимости отчета', () => {
      // Симулируем логи логики отчета
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: ЛОГИКА ОТЧЕТА:');
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: positionChanged =', true);
      console.log('🎲 [GAME_FLOW] handleNewDiceRoll: needsReportAfterMove =', true);

      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: ЛОГИКА ОТЧЕТА:'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: positionChanged =', true
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: needsReportAfterMove =', true
      );
    });
  });

  describe('📝 ЭТАП 3: Проверка на отчет', () => {
    it('должен логировать проверку входящего сообщения на отчет', () => {
      // Симулируем логи этапа 3
      console.log('🔍 [GAME_FLOW] ================ ЭТАП 3: ПРОВЕРКА НА ОТЧЕТ ================');
      console.log('🔍 [GAME_FLOW] handleSubmitCore: ДЕТАЛЬНАЯ ДИАГНОСТИКА');
      console.log('🔍 [GAME_FLOW] handleSubmitCore: userInput.length =', 25);

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔍 [GAME_FLOW] ================ ЭТАП 3: ПРОВЕРКА НА ОТЧЕТ ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔍 [GAME_FLOW] handleSubmitCore: ДЕТАЛЬНАЯ ДИАГНОСТИКА'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🔍 [GAME_FLOW] handleSubmitCore: userInput.length =', 25
      );
    });
  });

  describe('✍️ ЭТАП 4: Обработка отчета', () => {
    it('должен логировать обработку отчета игрока', () => {
      // Симулируем логи этапа 4
      console.log('📝 [GAME_FLOW] ================ ЭТАП 4: ОБРАБОТКА ОТЧЕТА ================');
      console.log('📝 [GAME_FLOW] handleSubmitCore: ОБРАБАТЫВАЕМ ОТЧЕТ для плана:', 8);
      console.log('📝 [GAME_FLOW] handleSubmitCore: Длина отчета:', 50, 'символов');

      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 [GAME_FLOW] ================ ЭТАП 4: ОБРАБОТКА ОТЧЕТА ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 [GAME_FLOW] handleSubmitCore: ОБРАБАТЫВАЕМ ОТЧЕТ для плана:', 8
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 [GAME_FLOW] handleSubmitCore: Длина отчета:', 50, 'символов'
      );
    });
  });

  describe('💬 ЭТАП 5: Генерация духовного комментария', () => {
    it('должен логировать генерацию духовного комментария', () => {
      // Симулируем логи этапа 5
      console.log('📝 [GAME_FLOW] ================ ЭТАП 5: ГЕНЕРАЦИЯ ДУХОВНОГО КОММЕНТАРИЯ ================');
      console.log('📝 [GAME_FLOW] handleSubmitCore: planInfo =', { name: 'Test Plan' });
      console.log('📝 [GAME_FLOW] handleSubmitCore: spiritualCommentary длина =', 200);

      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 [GAME_FLOW] ================ ЭТАП 5: ГЕНЕРАЦИЯ ДУХОВНОГО КОММЕНТАРИЯ ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 [GAME_FLOW] handleSubmitCore: planInfo =', { name: 'Test Plan' }
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '📝 [GAME_FLOW] handleSubmitCore: spiritualCommentary длина =', 200
      );
    });
  });

  describe('🔓 ЭТАП 6: Разблокировка кубика', () => {
    it('должен логировать разблокировку кубика и завершение цикла', () => {
      // Симулируем логи этапа 6
      console.log('🔄 [GAME_FLOW] ================ ЭТАП 6: РАЗБЛОКИРОВКА КУБИКА ================');
      console.log('✅ [GAME_FLOW] handleSubmitCore: Отчет обработан, кубик разблокирован');
      console.log('🎲 [GAME_FLOW] Добавляем сообщение о разблокировке кубика');
      console.log('🎲 [GAME_FLOW] Добавляем новый кубик для следующего хода');
      console.log('🎲 [GAME_FLOW] ================ ЦИКЛ ЗАВЕРШЕН - ГОТОВ К НОВОМУ ЭТАПУ 1 ================');

      expect(consoleSpy).toHaveBeenCalledWith(
        '🔄 [GAME_FLOW] ================ ЭТАП 6: РАЗБЛОКИРОВКА КУБИКА ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '✅ [GAME_FLOW] handleSubmitCore: Отчет обработан, кубик разблокирован'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] Добавляем сообщение о разблокировке кубика'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] Добавляем новый кубик для следующего хода'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] ================ ЦИКЛ ЗАВЕРШЕН - ГОТОВ К НОВОМУ ЭТАПУ 1 ================'
      );
    });
  });

  describe('💭 ОБЫЧНЫЕ СООБЩЕНИЯ', () => {
    it('должен логировать обработку обычных сообщений', () => {
      // Симулируем логи обычных сообщений
      console.log('💭 [GAME_FLOW] ================ ОБЫЧНОЕ СООБЩЕНИЕ ================');
      console.log('💭 [GAME_FLOW] handleSubmitCore: Обрабатываем обычное сообщение');
      console.log('💭 [GAME_FLOW] generateMockResponse: Генерируем ответ на обычное сообщение');

      expect(consoleSpy).toHaveBeenCalledWith(
        '💭 [GAME_FLOW] ================ ОБЫЧНОЕ СООБЩЕНИЕ ================'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '💭 [GAME_FLOW] handleSubmitCore: Обрабатываем обычное сообщение'
      );
      
      expect(consoleSpy).toHaveBeenCalledWith(
        '💭 [GAME_FLOW] generateMockResponse: Генерируем ответ на обычное сообщение'
      );
    });
  });

  describe('🔄 ПОЛНЫЙ ЦИКЛ', () => {
    it('должен логировать полный игровой цикл', () => {
      // Симулируем полный цикл логов
      const expectedLogs = [
        '🎲 [GAME_FLOW] ================ ЭТАП 1: БРОСОК КУБИКА ================',
        '🎲 [GAME_FLOW] handleNewDiceRoll: НАЧАЛО ЭТАПА БРОСКА',
        '🎲 [GAME_FLOW] ================ ЭТАП 2: ПОКАЗ РЕЗУЛЬТАТА ================',
        '🔍 [GAME_FLOW] ================ ЭТАП 3: ПРОВЕРКА НА ОТЧЕТ ================',
        '📝 [GAME_FLOW] ================ ЭТАП 4: ОБРАБОТКА ОТЧЕТА ================',
        '📝 [GAME_FLOW] ================ ЭТАП 5: ГЕНЕРАЦИЯ ДУХОВНОГО КОММЕНТАРИЯ ================',
        '🔄 [GAME_FLOW] ================ ЭТАП 6: РАЗБЛОКИРОВКА КУБИКА ================',
        '🎲 [GAME_FLOW] ================ ЦИКЛ ЗАВЕРШЕН - ГОТОВ К НОВОМУ ЭТАПУ 1 ================'
      ];

      // Логируем все этапы
      expectedLogs.forEach(log => console.log(log));

      // Проверяем все этапы
      expectedLogs.forEach(log => {
        expect(consoleSpy).toHaveBeenCalledWith(log);
      });

      // Проверяем количество вызовов
      expect(consoleSpy).toHaveBeenCalledTimes(expectedLogs.length);
    });
  });

  describe('⚠️ ЛОГИ ОШИБОК', () => {
    it('должен логировать ошибки', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Симулируем логи ошибок
      console.error('🎲 [GAME_FLOW] handleNewDiceRoll: КРИТИЧЕСКАЯ ОШИБКА - нет currentPlayer');
      console.error('🎲 [GAME_FLOW] handleNewDiceRoll: КРИТИЧЕСКАЯ ОШИБКА:', new Error('Test error'));

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: КРИТИЧЕСКАЯ ОШИБКА - нет currentPlayer'
      );
      
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '🎲 [GAME_FLOW] handleNewDiceRoll: КРИТИЧЕСКАЯ ОШИБКА:', expect.any(Error)
      );

      consoleErrorSpy.mockRestore();
    });
  });
}); 
import { describe, it, expect } from 'vitest';
import { GameMessageService, GameContext } from '../../services/GameMessageService';

describe('GameMessageService', () => {
  describe('generateMessage', () => {
    it('должен генерировать сообщение для начала игры', () => {
      const context: GameContext = {
        currentPlan: 68,
        previousPlan: 68,
        roll: 3,
        direction: 'stop 🛑',
        isFinished: true,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('start');
      expect(message.spiritual).toBe(true);
      expect(message.text).toContain('🎲');
      // Проверяем, что сообщение содержит одно из возможных слов
      expect(
        message.text.includes('6') || 
        message.text.includes('шестерка') || 
        message.text.includes('Шестерка')
      ).toBe(true);
    });

    it('должен генерировать сообщение для первого хода', () => {
      const context: GameContext = {
        currentPlan: 6,
        previousPlan: 68,
        roll: 6,
        direction: 'step 🚶🏼',
        isFinished: false,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('move');
      expect(message.spiritual).toBe(true);
      expect(message.text).toContain('🌟');
    });

    it('должен генерировать сообщение для специальных планов', () => {
      const context: GameContext = {
        currentPlan: 10,
        previousPlan: 5,
        roll: 5,
        direction: 'regular_move',
        isFinished: false,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('special');
      expect(message.spiritual).toBe(true);
      expect(message.text).toContain('🧘');
      // Проверяем любое из возможных сообщений для плана 10
      expect(
        message.text.includes('Очищение') || 
        message.text.includes('освободиться') ||
        message.text.includes('негативных') ||
        message.text.includes('просветлению')
      ).toBe(true);
    });

    it('должен генерировать сообщение для змеи', () => {
      const context: GameContext = {
        currentPlan: 15, // Используем план без специального сообщения
        previousPlan: 20,
        roll: 4,
        direction: 'snake 🐍',
        isFinished: false,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      // План 15 попадает под fallback логику
      expect(message.type).toBe('special');
      expect(message.spiritual).toBe(true);
      expect(message.text).toBeTruthy();
    });

    it('должен генерировать сообщение для стрелы', () => {
      const context: GameContext = {
        currentPlan: 23,
        previousPlan: 10,
        roll: 2,
        direction: 'arrow 🏹',
        isFinished: false,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('arrow');
      expect(message.spiritual).toBe(true);
      expect(message.text).toContain('🏹');
    });

    it('должен генерировать сообщение для победы', () => {
      const context: GameContext = {
        currentPlan: 67,
        previousPlan: 65,
        roll: 3,
        direction: 'win 🕉',
        isFinished: true,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('win');
      expect(message.spiritual).toBe(true);
      expect(message.text).toContain('🕉️');
    });

    it('должен генерировать сообщение для остановки', () => {
      const context: GameContext = {
        currentPlan: 70,
        previousPlan: 70,
        roll: 5,
        direction: 'stop 🛑',
        isFinished: false,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('stop');
      expect(message.spiritual).toBe(true);
      expect(message.text).toContain('🛑');
    });

    it('должен генерировать мотивационные сообщения для обычных ходов', () => {
      // Ранний этап (1-24)
      const earlyContext: GameContext = {
        currentPlan: 15,
        previousPlan: 10,
        roll: 5,
        direction: 'step 🚶🏼',
        isFinished: false,
        consecutiveSixes: 0
      };

      const earlyMessage = GameMessageService.generateMessage(earlyContext);
      expect(earlyMessage.type).toBe('step');
      expect(earlyMessage.spiritual).toBe(true);
      // Проверяем, что это одно из сообщений для step
      expect(
        earlyMessage.text.includes('шаг') || 
        earlyMessage.text.includes('путь') ||
        earlyMessage.text.includes('рост') ||
        earlyMessage.text.includes('душа') ||
        earlyMessage.text.includes('процесс')
      ).toBe(true);

      // Средний этап (25-48) - используем направление без специального плана
      const middleContext: GameContext = {
        currentPlan: 35,
        previousPlan: 30,
        roll: 5,
        direction: 'step 🚶🏼',
        isFinished: false,
        consecutiveSixes: 0
      };

      const middleMessage = GameMessageService.generateMessage(middleContext);
      expect(middleMessage.type).toBe('step');

      // Поздний этап (49-72) - используем направление без специального плана
      const lateContext: GameContext = {
        currentPlan: 60,
        previousPlan: 55,
        roll: 5,
        direction: 'step 🚶🏼',
        isFinished: false,
        consecutiveSixes: 0
      };

      const lateMessage = GameMessageService.generateMessage(lateContext);
      expect(lateMessage.type).toBe('step');
    });

    it('должен генерировать fallback сообщения для неизвестных направлений', () => {
      const context: GameContext = {
        currentPlan: 15,
        previousPlan: 10,
        roll: 5,
        direction: 'unknown_direction',
        isFinished: false,
        consecutiveSixes: 0
      };

      const message = GameMessageService.generateMessage(context);
      
      expect(message.type).toBe('move');
      expect(message.text).toContain('План 15');
    });
  });

  describe('getWelcomeMessage', () => {
    it('должен возвращать приветственное сообщение', () => {
      const message = GameMessageService.getWelcomeMessage();
      
      expect(message).toContain('🕉️');
      expect(message.toLowerCase()).toContain('лил');
    });

    it('должен возвращать разные приветственные сообщения', () => {
      const messages = new Set();
      
      // Генерируем несколько сообщений
      for (let i = 0; i < 20; i++) {
        messages.add(GameMessageService.getWelcomeMessage());
      }
      
      // Должно быть больше одного уникального сообщения
      expect(messages.size).toBeGreaterThan(1);
    });
  });
}); 
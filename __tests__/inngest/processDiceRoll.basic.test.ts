import { describe, it, expect, vi, beforeEach } from 'vitest';
import { InngestTestEngine } from '@inngest/test';
import { processDiceRoll } from '../../inngest/functions/processDiceRoll';
import './setup';

describe('processDiceRoll - Basic Tests', () => {
  let testEngine: InngestTestEngine;

  beforeEach(() => {
    testEngine = new InngestTestEngine({
      function: processDiceRoll,
    });
    vi.clearAllMocks();
  });

  it('should process dice roll and return success result', async () => {
    const mockEvent = {
      name: 'game.dice.roll',
      data: {
        userId: 'test-user-1',
        roll: 6
      }
    };

    // Простой тест с мокированием шагов
    const { result } = await testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'get-player-state',
          handler: () => ({
            id: 'test-user-1',
            plan: 68,
            previous_plan: 0,
            isFinished: true,
            consecutiveSixes: 0,
            positionBeforeThreeSixes: 0,
            needsReport: false
          })
        },
        {
          id: 'process-game-logic', 
          handler: () => ({
            gameStep: {
              loka: 6,
              previous_loka: 68,
              direction: 'step 🚶🏼',
              consecutive_sixes: 0,
              position_before_three_sixes: 0,
              is_finished: false
            },
            plan: {
              short_desc: 'Описание плана 6',
              image: '',
              name: 'План 6'
            },
            direction: 'Игра началась! 🎮',
            message: 'Добро пожаловать в игру!'
          })
        },
        {
          id: 'save-to-database',
          handler: () => ({
            plan: 6,
            previous_plan: 68,
            isFinished: false,
            needsReport: false
          })
        }
      ]
    });

    // Проверяем основные поля результата
    expect(result).toBeDefined();
    expect((result as any).success).toBe(true);
    expect((result as any).userId).toBe('test-user-1');
    expect((result as any).roll).toBe(6);
    expect((result as any).gameResult).toBeDefined();
  });

  it('should handle player not starting game without rolling 6', async () => {
    const mockEvent = {
      name: 'game.dice.roll',
      data: {
        userId: 'test-user-2',
        roll: 3
      }
    };

    const { result } = await testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'get-player-state',
          handler: () => ({
            id: 'test-user-2',
            plan: 68,
            isFinished: true,
            consecutiveSixes: 0,
            positionBeforeThreeSixes: 0
          })
        },
        {
          id: 'process-game-logic',
          handler: () => ({
            gameStep: {
              loka: 68,
              direction: 'stop 🛑',
              is_finished: true
            },
            direction: 'Для начала игры нужно выбросить 6! 🎲',
            message: 'Попробуйте еще раз!'
          })
        },
        {
          id: 'save-to-database',
          handler: () => ({ success: true })
        }
      ]
    });

    expect(result).toBeDefined();
    expect((result as any).success).toBe(true);
    expect((result as any).userId).toBe('test-user-2');
    expect((result as any).roll).toBe(3);
  });

  it('should verify all steps are called correctly', async () => {
    const mockEvent = {
      name: 'game.dice.roll',
      data: {
        userId: 'test-user-3',
        roll: 4
      }
    };

    const { ctx, state } = await testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'get-player-state',
          handler: () => ({ plan: 10, isFinished: false })
        },
        {
          id: 'process-game-logic',
          handler: () => ({
            gameStep: { loka: 14, previous_loka: 10, is_finished: false },
            message: 'Moved forward!'
          })
        },
        {
          id: 'save-to-database',
          handler: () => ({ success: true })
        }
      ]
    });

    // Проверяем, что шаги выполнились
    await expect(state['get-player-state']).resolves.toBeDefined();
    await expect(state['process-game-logic']).resolves.toBeDefined();
    await expect(state['save-to-database']).resolves.toBeDefined();

    // Проверяем, что sendEvent был вызван для обновления состояния
    expect(ctx.step.sendEvent).toHaveBeenCalledWith(
      'send-state-update',
      expect.objectContaining({
        name: 'game.player.state.update',
        data: expect.objectContaining({
          userId: 'test-user-3'
        })
      })
    );
  });

  it('should handle step errors correctly', async () => {
    const mockEvent = {
      name: 'game.dice.roll',
      data: {
        userId: 'error-user',
        roll: 2
      }
    };

    await expect(testEngine.execute({
      events: [mockEvent],
      steps: [
        {
          id: 'get-player-state',
          handler: () => ({ plan: 5, isFinished: false })
        },
        {
          id: 'process-game-logic',
          handler: () => ({ gameStep: { loka: 7 } })
        },
        {
          id: 'save-to-database',
          handler: () => {
            throw new Error('Database save failed');
          }
        }
      ]
    })).rejects.toThrow('Database save failed');
  });
}); 
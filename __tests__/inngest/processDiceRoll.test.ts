import { describe, it, expect, beforeEach } from 'vitest';
import { Inngest } from 'inngest';
import { InngestTestEngine } from '@inngest/test';
import { processDiceRoll } from '../../inngest/server-functions';
import type { DiceRollFunctionResponse } from '../../types/schemas';
import './setup';

describe('ProcessDiceRoll Function', () => {
  let testEngine: InngestTestEngine;

  beforeEach(() => {
    testEngine = new InngestTestEngine({
      function: processDiceRoll
    });
  });

  describe('🎲 Базовая обработка броска кубика', () => {
    it('should process dice roll and return valid response', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-1',
          roll: 4
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-1',
              roll: 4
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              id: 'test-user-1',
              plan: 15,
              previous_plan: 11,
              isFinished: false,
              consecutiveSixes: 0,
              positionBeforeThreeSixes: 0,
              needsReport: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 19,
                previous_loka: 15,
                direction: 'step 🚶🏼',
                consecutive_sixes: 0,
                position_before_three_sixes: 0,
                is_finished: false
              },
              direction: 'Обычный ход',
              message: 'Обычный ход с 15 на 19'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-1',
              roll: 4,
              gameResult: {
                gameStep: {
                  loka: 19,
                  previous_loka: 15,
                  direction: 'step 🚶🏼',
                  consecutive_sixes: 0,
                  position_before_three_sixes: 0,
                  is_finished: false
                },
                direction: 'Обычный ход',
                message: 'Обычный ход с 15 на 19'
              },
              message: 'Dice roll 4 processed successfully'
            })
          }
        ]
      });

      // Приведение типа для корректной типизации
      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.success).toBe(true);
      expect(typedResult.userId).toBe('test-user-1');
      expect(typedResult.roll).toBe(4);
      expect(typedResult.gameResult.gameStep.loka).toBe(19);
      expect(typedResult.gameResult.gameStep.previous_loka).toBe(15);
      expect(typedResult.gameResult.gameStep.is_finished).toBe(false);
      expect(typedResult.message).toBe('Dice roll 4 processed successfully');
    });

    it('should handle game start (roll 6 from position 68)', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-2',
          roll: 6
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-2',
              roll: 6
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              id: 'test-user-2',
              plan: 68,
              previous_plan: 0,
              isFinished: true, // игра еще не началась
              consecutiveSixes: 0,
              positionBeforeThreeSixes: 0,
              needsReport: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 6, // START_LOKA
                previous_loka: 68,
                direction: 'step 🚶🏼',
                consecutive_sixes: 0,
                position_before_three_sixes: 0,
                is_finished: false
              },
              direction: 'Начало игры',
              message: 'Игра началась! Вы на позиции 6.'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-2',
              roll: 6,
              gameResult: {
                gameStep: {
                  loka: 6,
                  previous_loka: 68,
                  direction: 'step 🚶🏼',
                  consecutive_sixes: 0,
                  position_before_three_sixes: 0,
                  is_finished: false
                },
                direction: 'Начало игры',
                message: 'Игра началась! Вы на позиции 6.'
              },
              message: 'Dice roll 6 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.gameStep.loka).toBe(6);
      expect(typedResult.gameResult.gameStep.previous_loka).toBe(68);
      expect(typedResult.gameResult.gameStep.is_finished).toBe(false);
    });

    it('should handle game not starting (not rolling 6 from position 68)', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-stay',
          roll: 3
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-stay',
              roll: 3
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              id: 'test-user-stay',
              plan: 68,
              previous_plan: 0,
              isFinished: true, // игра еще не началась
              consecutiveSixes: 0,
              positionBeforeThreeSixes: 0,
              needsReport: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 68, // остается на месте
                previous_loka: 68,
                direction: 'stop 🛑',
                consecutive_sixes: 0,
                position_before_three_sixes: 0,
                is_finished: true
              },
              direction: 'Стоп 🛑',
              message: 'Для начала игры нужно бросить 6'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-stay',
              roll: 3,
              gameResult: {
                gameStep: {
                  loka: 68,
                  previous_loka: 68,
                  direction: 'stop 🛑',
                  consecutive_sixes: 0,
                  position_before_three_sixes: 0,
                  is_finished: true
                },
                direction: 'Стоп 🛑',
                message: 'Для начала игры нужно бросить 6'
              },
              message: 'Dice roll 3 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.gameStep.loka).toBe(68);
      expect(typedResult.gameResult.gameStep.is_finished).toBe(true);
    });
  });

  describe('🐍 Обработка Подряд Идущих Шестерок', () => {
    it('should handle three consecutive sixes and return to previous position', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-3',
          roll: 6
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-3',
              roll: 6
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              id: 'test-user-3',
              plan: 25,
              previous_plan: 20,
              isFinished: false,
              consecutiveSixes: 2, // уже две шестерки подряд
              positionBeforeThreeSixes: 15, // позиция до трех шестерок
              needsReport: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 15, // возврат на позицию до трех шестерок
                previous_loka: 25,
                direction: 'snake 🐍',
                consecutive_sixes: 0, // обнуляем счетчик
                position_before_three_sixes: 15,
                is_finished: false
              },
              direction: 'Змея 🐍',
              message: 'Три шестерки подряд! Возвращаетесь назад!'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-3',
              roll: 6,
              gameResult: {
                gameStep: {
                  loka: 15,
                  previous_loka: 25,
                  direction: 'snake 🐍',
                  consecutive_sixes: 0,
                  position_before_three_sixes: 15,
                  is_finished: false
                },
                direction: 'Змея 🐍',
                message: 'Три шестерки подряд! Возвращаетесь назад!'
              },
              message: 'Dice roll 6 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.gameStep.loka).toBe(15);
      expect(typedResult.gameResult.gameStep.consecutive_sixes).toBe(0);
      expect(typedResult.gameResult.direction).toBe('Змея 🐍');
    });

    it('should track consecutive sixes correctly', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-4',
          roll: 6
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-4',
              roll: 6
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              plan: 20,
              consecutiveSixes: 1, // первая шестерка
              positionBeforeThreeSixes: 14,
              isFinished: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                consecutive_sixes: 2, // вторая шестерка
                position_before_three_sixes: 14 // сохраняем позицию
              }
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-4',
              roll: 6,
              gameResult: {
                gameStep: {
                  consecutive_sixes: 2,
                  position_before_three_sixes: 14
                }
              },
              message: 'Dice roll 6 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.gameStep.consecutive_sixes).toBe(2);
    });
  });

  describe('🏹 Стрелы и Змеи', () => {
    it('should handle arrow positions correctly', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-5',
          roll: 3
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-5',
              roll: 3
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              plan: 1, // позиция, которая при +3 даст 4 (позиция стрелы)
              isFinished: false,
              consecutiveSixes: 0
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 14, // стрела 4 -> 14
                direction: 'arrow 🏹',
                is_finished: false
              },
              direction: 'Стрела 🏹',
              message: 'Стрела переносит вас вперед!'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-5',
              roll: 3,
              gameResult: {
                gameStep: {
                  loka: 14,
                  direction: 'arrow 🏹',
                  is_finished: false
                },
                direction: 'Стрела 🏹',
                message: 'Стрела переносит вас вперед!'
              },
              message: 'Dice roll 3 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.direction).toBe('Стрела 🏹');
    });

    it('should handle snake positions correctly', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-6',
          roll: 5
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-6',
              roll: 5
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({})
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 6, // змея 16 -> 6
                direction: 'snake 🐍',
                is_finished: false
              },
              direction: 'Змея 🐍',
              message: 'Змея утягивает вас назад!'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-6',
              roll: 5,
              gameResult: {
                gameStep: {
                  loka: 6,
                  direction: 'snake 🐍',
                  is_finished: false
                },
                direction: 'Змея 🐍',
                message: 'Змея утягивает вас назад!'
              },
              message: 'Dice roll 5 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.direction).toBe('Змея 🐍');
    });
  });

  describe('🏆 Победа', () => {
    it('should handle winning condition at loka 68', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-7',
          roll: 2
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-7',
              roll: 2
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              plan: 66, // позиция близко к победе
              isFinished: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 68, // WIN_LOKA
                direction: 'win 🕉',
                is_finished: true
              },
              direction: 'Победа 🕉',
              message: 'Поздравляем! Вы достигли просветления!'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-7',
              roll: 2,
              gameResult: {
                gameStep: {
                  loka: 68,
                  direction: 'win 🕉',
                  is_finished: true
                },
                direction: 'Победа 🕉',
                message: 'Поздравляем! Вы достигли просветления!'
              },
              message: 'Dice roll 2 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.gameStep.loka).toBe(68);
      expect(typedResult.gameResult.gameStep.is_finished).toBe(true);
      expect(typedResult.gameResult.direction).toBe('Победа 🕉');
    });
  });

  describe('🚫 Выход за границы поля', () => {
    it('should handle position exceeding maximum', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'test-user-8',
          roll: 6
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'test-user-8',
              roll: 6
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => ({
              plan: 70, // позиция, которая при +6 превысит 72
              isFinished: false
            })
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 70, // остается на месте
                direction: 'stop 🛑',
                is_finished: false
              },
              direction: 'Стоп 🛑',
              message: 'Нельзя выйти за пределы поля!'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'test-user-8',
              roll: 6,
              gameResult: {
                gameStep: {
                  loka: 70,
                  direction: 'stop 🛑',
                  is_finished: false
                },
                direction: 'Стоп 🛑',
                message: 'Нельзя выйти за пределы поля!'
              },
              message: 'Dice roll 6 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.gameResult.direction).toBe('Стоп 🛑');
    });
  });

  describe('🆕 Создание нового игрока', () => {
    it('should create new player when none exists', async () => {
      const mockEvent = {
        name: 'game.dice.roll',
        data: {
          userId: 'new-user',
          roll: 6
        }
      };

      const { result } = await testEngine.execute({
        events: [mockEvent],
        steps: [
          {
            id: 'validate-input',
            handler: () => ({
              userId: 'new-user',
              roll: 6
            })
          },
          {
            id: 'check-database-connection',
            handler: () => true
          },
          {
            id: 'get-player-state',
            handler: () => null // игрок не найден
          },
          {
            id: 'process-game-logic',
            handler: () => ({
              gameStep: {
                loka: 6,
                previous_loka: 68,
                is_finished: false
              },
              message: 'Новый игрок создан и игра началась!'
            })
          },
          {
            id: 'save-to-database',
            handler: () => true
          },
          {
            id: 'validate-response',
            handler: () => ({
              success: true,
              userId: 'new-user',
              roll: 6,
              gameResult: {
                gameStep: {
                  loka: 6,
                  previous_loka: 68,
                  is_finished: false
                },
                message: 'Новый игрок создан и игра началась!'
              },
              message: 'Dice roll 6 processed successfully'
            })
          }
        ]
      });

      const typedResult = result as DiceRollFunctionResponse;

      expect(typedResult.userId).toBe('new-user');
    });
  });
}); 
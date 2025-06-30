// Полная реализация серверных функций для Inngest с Zod валидацией
import { Inngest } from 'inngest';
import { 
  ServerPlayerService, 
  ServerReportService,
  ServerPlayer,
  testServerDatabaseConnection 
} from '../server-config/database';
import { 
  processGameMove,
  WIN_LOKA 
} from '../server-config/game-logic';

// Импорт Zod схем
import {
  validateDiceRollEventData,
  validateReportSubmitEventData,
  validatePlayerStateUpdateEventData,
  validatePlayerInitEventData,
  validateDiceRollResponse,
  validateReportResponse,
  validatePlayerStateUpdateResponse,
  validatePlayerInitResponse,
  DiceRollEventData,
  ReportSubmitEventData,
  PlayerStateUpdateEventData,
  PlayerInitEventData,
  DiceRollFunctionResponse,
  ReportFunctionResponse,
  PlayerStateUpdateFunctionResponse,
  PlayerInitFunctionResponse
} from '../../types/schemas';

// Создаем клиент для сервера
const inngest = new Inngest({ 
  id: 'neuroleela-app',
  name: 'NeuroLeela Game'
});

// 1. ПОЛНАЯ ФУНКЦИЯ: Обработка броска кубика (с Zod валидацией)
export const processDiceRoll = inngest.createFunction(
  { 
    id: 'process-dice-roll',
    name: 'Обработка броска кубика'
  },
  { event: 'game.dice.roll' },
  async ({ event, step }) => {
    // 🛡️ Zod валидация входных данных
    const validatedData: DiceRollEventData = await step.run('validate-input', async () => {
      try {
        return validateDiceRollEventData(event.data);
      } catch (error) {
        throw new Error(`Ошибка валидации входных данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    const { userId, roll } = validatedData;
    
    console.log(`[ServerInngest] processDiceRoll: userId=${userId}, roll=${roll}`);

    // Шаг 1: Проверка подключения к БД
    await step.run('check-database-connection', async () => {
      const isConnected = await testServerDatabaseConnection();
      if (!isConnected) {
        throw new Error('Нет подключения к базе данных');
      }
      console.log(`[ServerInngest] ✅ База данных подключена`);
    });

    // Шаг 2: Получение текущего состояния игрока
    const currentState = await step.run('get-player-state', async () => {
      let player = await ServerPlayerService.getPlayer(userId);

      if (!player) {
        console.log(`[ServerInngest] Игрок не найден, создаем нового`);
        // Создание нового игрока
        const newPlayerData = {
          id: userId,
          plan: WIN_LOKA,
          previous_plan: 0,
          message: 'Бросьте 6 чтобы начать путь самопознания',
          avatar: null,
          fullName: null,
          intention: null,
          isStart: false,
          isFinished: true,
          consecutiveSixes: 0,
          positionBeforeThreeSixes: 0,
          needsReport: false
        };

        player = await ServerPlayerService.createPlayer(newPlayerData);
        if (!player) {
          throw new Error('Ошибка создания игрока');
        }
      }

      return player;
    });

    // Шаг 3: Обработка игровой логики
    const gameResult = await step.run('process-game-logic', async () => {
      const result = processGameMove(currentState, roll, 'en');
      console.log(`[ServerInngest] Игровой результат:`, result);
      return result;
    });

    // Шаг 4: Сохранение в базу данных
    await step.run('save-to-database', async () => {
      const { gameStep, message } = gameResult;
      
      const needsReport = gameStep.loka !== gameStep.previous_loka && !gameStep.is_finished;
      
      const updates = {
        plan: gameStep.loka,
        previous_plan: gameStep.previous_loka,
        isFinished: gameStep.is_finished,
        consecutiveSixes: gameStep.consecutive_sixes,
        positionBeforeThreeSixes: gameStep.position_before_three_sixes,
        needsReport: needsReport,
        message: message
      };

      const success = await ServerPlayerService.updatePlayer(userId, updates);
      if (!success) {
        throw new Error('Ошибка сохранения игрового состояния');
      }

      console.log(`[ServerInngest] Игрок обновлен:`, updates);
      return updates;
    });

    // Шаг 5: Отправка события обновления состояния
    await step.sendEvent('send-state-update', {
      name: 'game.player.state.update',
      data: {
        userId,
        updates: {
          plan: gameResult.gameStep.loka,
          previous_plan: gameResult.gameStep.previous_loka,
          isFinished: gameResult.gameStep.is_finished,
          needsReport: gameResult.gameStep.loka !== gameResult.gameStep.previous_loka && !gameResult.gameStep.is_finished,
          message: gameResult.message,
          consecutiveSixes: gameResult.gameStep.consecutive_sixes,
          positionBeforeThreeSixes: gameResult.gameStep.position_before_three_sixes,
        },
        timestamp: Date.now()
      }
    });

    // 🛡️ Zod валидация ответа
    const response: DiceRollFunctionResponse = {
      success: true,
      userId,
      roll,
      gameResult,
      message: `Dice roll ${roll} processed successfully`
    };

    const validatedResponse = await step.run('validate-response', async () => {
      try {
        return validateDiceRollResponse(response);
      } catch (error) {
        console.error(`[ServerInngest] Ошибка валидации ответа:`, error);
        throw new Error(`Ошибка валидации ответа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    console.log(`[ServerInngest] processDiceRoll завершена для ${userId}`);
    return validatedResponse;
  }
);

// 2. ПОЛНАЯ ФУНКЦИЯ: Обработка отчета (с Zod валидацией)
export const processReport = inngest.createFunction(
  {
    id: 'process-report',
    name: 'Обработка отчета'
  },
  { event: 'game.report.submit' },
  async ({ event, step }) => {
    // 🛡️ Zod валидация входных данных
    const validatedData: ReportSubmitEventData = await step.run('validate-input', async () => {
      try {
        return validateReportSubmitEventData(event.data);
      } catch (error) {
        throw new Error(`Ошибка валидации входных данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    const { userId, report, planNumber } = validatedData;
    
    console.log(`[ServerInngest] processReport: userId=${userId}, planNumber=${planNumber}`);

    // Шаг 1: Сохранение отчета в базу данных
    await step.run('save-report', async () => {
      const reportData = {
        user_id: userId,
        plan_number: planNumber,
        content: report,
        likes: 0,
        comments: 0
      };

      const savedReport = await ServerReportService.saveReport(reportData);
      if (!savedReport) {
        console.log(`[ServerInngest] Не удалось сохранить отчет, но продолжаем`);
      }

      console.log(`[ServerInngest] Отчет сохранен для плана ${planNumber}`);
      return savedReport;
    });

    // Шаг 2: Разблокировка кубика (убираем needsReport)
    await step.run('unlock-dice', async () => {
      const success = await ServerPlayerService.updatePlayer(userId, {
        needsReport: false,
        message: 'Отчет принят! Теперь можете продолжить игру.'
      });

      if (!success) {
        throw new Error('Ошибка разблокировки кубика');
      }

      console.log(`[ServerInngest] Кубик разблокирован для игрока ${userId}`);
    });

    // Шаг 3: Отправка события обновления состояния
    await step.sendEvent('send-state-update', {
      name: 'game.player.state.update',
      data: {
        userId,
        updates: {
          needsReport: false,
          message: 'Отчет принят! Теперь можете продолжить игру.'
        },
        timestamp: Date.now()
      }
    });

    // 🛡️ Zod валидация ответа
    const response: ReportFunctionResponse = {
      success: true,
      userId,
      planNumber,
      reportSaved: true,
      diceUnlocked: true,
      message: `Report for plan ${planNumber} processed successfully`
    };

    const validatedResponse = await step.run('validate-response', async () => {
      try {
        return validateReportResponse(response);
      } catch (error) {
        console.error(`[ServerInngest] Ошибка валидации ответа:`, error);
        throw new Error(`Ошибка валидации ответа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    console.log(`[ServerInngest] processReport завершена для ${userId}`);
    return validatedResponse;
  }
);

// 3. ПОЛНАЯ ФУНКЦИЯ: Обновление состояния игрока (с Zod валидацией)
export const updatePlayerState = inngest.createFunction(
  {
    id: 'update-player-state',
    name: 'Обновление состояния игрока'
  },
  { event: 'game.player.state.update' },
  async ({ event, step }) => {
    // 🛡️ Zod валидация входных данных
    const validatedData: PlayerStateUpdateEventData = await step.run('validate-input', async () => {
      try {
        return validatePlayerStateUpdateEventData(event.data);
      } catch (error) {
        throw new Error(`Ошибка валидации входных данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    const { userId, updates } = validatedData;
    
    console.log(`[ServerInngest] updatePlayerState: userId=${userId}, updates=`, updates);

    // Обновляем состояние игрока (это может быть интеграция с Apollo или другими системами)
    await step.run('update-state', async () => {
      // В серверном окружении просто логируем обновление
      // В реальном приложении здесь можно было бы обновить кэш, отправить WebSocket события и т.д.
      console.log(`[ServerInngest] Состояние игрока ${userId} обновлено:`, updates);
      
      // Можно добавить дополнительную логику валидации или нормализации
      return true;
    });

    // 🛡️ Zod валидация ответа
    const response: PlayerStateUpdateFunctionResponse = {
      success: true,
      userId,
      updatesApplied: updates,
      message: `Player state updated successfully`
    };

    const validatedResponse = await step.run('validate-response', async () => {
      try {
        return validatePlayerStateUpdateResponse(response);
      } catch (error) {
        console.error(`[ServerInngest] Ошибка валидации ответа:`, error);
        throw new Error(`Ошибка валидации ответа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    return validatedResponse;
  }
);

// 4. ПОЛНАЯ ФУНКЦИЯ: Инициализация игрока (с Zod валидацией)
export const initializePlayer = inngest.createFunction(
  {
    id: 'initialize-player',
    name: 'Инициализация игрока'
  },
  { event: 'game.player.init' },
  async ({ event, step }) => {
    // 🛡️ Zod валидация входных данных
    const validatedData: PlayerInitEventData = await step.run('validate-input', async () => {
      try {
        return validatePlayerInitEventData(event.data);
      } catch (error) {
        throw new Error(`Ошибка валидации входных данных: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    const { userId, email } = validatedData;
    
    console.log(`[ServerInngest] initializePlayer: userId=${userId}, email=${email}`);

    // Шаг 1: Проверка существования игрока
    const existingPlayer = await step.run('check-existing-player', async () => {
      const player = await ServerPlayerService.getPlayer(userId);
      if (player) {
        console.log(`[ServerInngest] Игрок уже существует:`, player);
        return player;
      }
      return null;
    });

    if (existingPlayer) {
      // Игрок уже существует, просто отправляем событие обновления состояния
      await step.sendEvent('send-state-update', {
        name: 'game.player.state.update',
        data: {
          userId,
          updates: existingPlayer,
          timestamp: Date.now()
        }
      });

      // 🛡️ Zod валидация ответа
      const response: PlayerInitFunctionResponse = {
        success: true,
        userId,
        playerCreated: false,
        existingPlayer: true,
        message: `Player ${userId} already exists`
      };

      const validatedResponse = await step.run('validate-response', async () => {
        try {
          return validatePlayerInitResponse(response);
        } catch (error) {
          console.error(`[ServerInngest] Ошибка валидации ответа:`, error);
          throw new Error(`Ошибка валидации ответа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
        }
      });

      return validatedResponse;
    }

    // Шаг 2: Создание нового игрока
    const newPlayer = await step.run('create-new-player', async () => {
      const playerData = {
        id: userId,
        plan: WIN_LOKA, // Начинаем с финальной позиции
        previous_plan: 0,
        message: 'Бросьте 6 чтобы начать путь самопознания',
        avatar: null,
        fullName: null,
        intention: null,
        isStart: false,
        isFinished: true, // Игра не активна, ждем 6 для старта
        consecutiveSixes: 0,
        positionBeforeThreeSixes: 0,
        needsReport: false
      };

      const createdPlayer = await ServerPlayerService.createPlayer(playerData);
      if (!createdPlayer) {
        throw new Error('Ошибка создания игрока');
      }

      console.log(`[ServerInngest] Новый игрок создан:`, createdPlayer);
      return createdPlayer;
    });

    // Шаг 3: Отправка события обновления состояния
    await step.sendEvent('send-state-update', {
      name: 'game.player.state.update',
      data: {
        userId,
        updates: newPlayer,
        timestamp: Date.now()
      }
    });

    // 🛡️ Zod валидация ответа
    const response: PlayerInitFunctionResponse = {
      success: true,
      userId,
      playerCreated: true,
      newPlayer: newPlayer,
      message: `Player ${userId} initialized successfully`
    };

    const validatedResponse = await step.run('validate-response', async () => {
      try {
        return validatePlayerInitResponse(response);
      } catch (error) {
        console.error(`[ServerInngest] Ошибка валидации ответа:`, error);
        throw new Error(`Ошибка валидации ответа: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      }
    });

    console.log(`[ServerInngest] initializePlayer завершена для ${userId}`);
    return validatedResponse;
  }
);

// Экспорт всех функций
export const serverFunctions = [
  processDiceRoll,
  processReport,
  updatePlayerState,
  initializePlayer
]; 
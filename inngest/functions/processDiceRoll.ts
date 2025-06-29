import { inngest } from '../client';
import { supabase } from '@/config/supabase';
import { currentPlayerVar } from '@/lib/apollo-drizzle-client';
import { GameMessageService, GameContext } from '@/services/GameMessageService';

// Константы игры
const TOTAL_PLANS = 72;
const WIN_LOKA = 68;
const MAX_ROLL = 6;
const START_LOKA = 6;

// Типы для игровой логики
interface GameStep {
  loka: number;
  previous_loka: number;
  direction: string;
  consecutive_sixes: number;
  position_before_three_sixes: number;
  is_finished: boolean;
}

interface Plan {
  short_desc: string;
  image: string;
  name: string;
}

// Карта направлений
const directionMap: { [key: string]: { ru: string; en: string } } = {
  'stop 🛑': { ru: 'Стоп 🛑', en: 'Stop 🛑' },
  'arrow 🏹': { ru: 'Стрела 🏹', en: 'Arrow 🏹' },
  'snake 🐍': { ru: 'Змея 🐍', en: 'Snake 🐍' },
  'win 🕉': { ru: 'Победа 🕉', en: 'Win 🕉' },
  'step 🚶🏼': { ru: 'Шаг 🚶🏼', en: 'Step 🚶🏼' },
};

// Функция для получения информации о плане
const getPlan = (planNumber: number, languageCode: string): Plan => {
  // Заглушка для плана - в будущем можно подключить к API или базе данных
  return {
    short_desc: `Описание плана ${planNumber}`,
    image: '',
    name: `План ${planNumber}`
  };
};

// Обработка подряд идущих шестерок
const handleConsecutiveSixes = (
  roll: number, 
  currentLoka: number,
  consecutive: number, 
  positionBeforeThreeSixes: number
) => {
  console.log(`[Inngest] handleConsecutiveSixes: roll=${roll}, currentLoka=${currentLoka}, consecutive=${consecutive}`);
  
  if (roll !== MAX_ROLL) {
    return { 
      newConsecutive: 0, 
      newPosition: currentLoka + roll,
      newBeforeThreeSixes: positionBeforeThreeSixes 
    };
  }

  const newConsecutive = consecutive + 1;
  
  if (newConsecutive === 3) {
    console.log(`[Inngest] ТРЕТЬЯ ШЕСТЕРКА! Возврат на позицию ${positionBeforeThreeSixes}`);
    return { 
      newConsecutive: 0, 
      newPosition: positionBeforeThreeSixes,
      newBeforeThreeSixes: positionBeforeThreeSixes,
      direction: 'snake 🐍' 
    };
  }
  
  const newPosition = currentLoka + roll;
  const newBeforeThreeSixes = consecutive === 0 ? currentLoka : positionBeforeThreeSixes;
  
  return { 
    newConsecutive, 
    newPosition: newPosition,
    newBeforeThreeSixes: newBeforeThreeSixes 
  };
};

// Получение направления и финальной позиции
const getDirectionAndPosition = (
  newLoka: number, 
  isFinished: boolean,
  roll: number,
  currentLoka: number
) => {
  console.log(`[Inngest] getDirectionAndPosition: newLoka=${newLoka}, isFinished=${isFinished}, roll=${roll}`);
  
  // Начало игры
  if (currentLoka === WIN_LOKA && isFinished) {
    if (roll === MAX_ROLL) {
      console.log(`[Inngest] Начало игры! Перемещение на ${START_LOKA}`);
      return { 
        finalLoka: START_LOKA,
        direction: 'step 🚶🏼', 
        isGameFinished: false 
      };
    }
    return { 
      finalLoka: WIN_LOKA, 
      direction: 'stop 🛑', 
      isGameFinished: true
    };
  }

  // Проверка победы
  if (newLoka === WIN_LOKA) {
    console.log(`[Inngest] ПОБЕДА! Позиция ${WIN_LOKA}`);
    return { 
      finalLoka: newLoka, 
      direction: 'win 🕉', 
      isGameFinished: true 
    };
  }

  // Выход за границы поля
  if (newLoka > TOTAL_PLANS) {
    console.log(`[Inngest] Выход за границы: ${newLoka} > ${TOTAL_PLANS}`);
    return { 
      finalLoka: currentLoka, 
      direction: 'stop 🛑', 
      isGameFinished: false 
    };
  }

  // Проверка стрел (примеры позиций со стрелами)
  const arrowPositions: { [key: number]: number } = {
    4: 14, 9: 31, 17: 7, 20: 38, 28: 84, 40: 59,
    51: 67, 54: 34, 62: 19, 63: 81, 64: 60, 71: 91
  };

  if (arrowPositions[newLoka]) {
    const arrowTarget = arrowPositions[newLoka];
    console.log(`[Inngest] Стрела! ${newLoka} -> ${arrowTarget}`);
    return { 
      finalLoka: Math.min(arrowTarget, TOTAL_PLANS), 
      direction: 'arrow 🏹', 
      isGameFinished: arrowTarget === WIN_LOKA 
    };
  }

  // Проверка змей (примеры позиций со змеями)
  const snakePositions: { [key: number]: number } = {
    16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 87: 24, 93: 73, 95: 75, 98: 78
  };

  if (snakePositions[newLoka]) {
    const snakeTarget = snakePositions[newLoka];
    console.log(`[Inngest] Змея! ${newLoka} -> ${snakeTarget}`);
    return { 
      finalLoka: snakeTarget, 
      direction: 'snake 🐍', 
      isGameFinished: false 
    };
  }

  // Обычный ход
  return { 
    finalLoka: newLoka, 
    direction: 'step 🚶🏼', 
    isGameFinished: false 
  };
};

// Основная Inngest функция для обработки броска кубика
export const processDiceRoll = inngest.createFunction(
  { 
    id: 'process-dice-roll',
    name: 'Обработка броска кубика'
  },
  { event: 'game.dice.roll' },
  async ({ event, step }) => {
    const { userId, roll } = event.data;
    
    console.log(`[Inngest] processDiceRoll: userId=${userId}, roll=${roll}`);

    // Шаг 1: Получение текущего состояния игрока
    const currentState = await step.run('get-player-state', async () => {
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();

      if (error || !player) {
        console.log(`[Inngest] Игрок не найден, создаем нового`);
        // Создание нового игрока
        const newPlayer = {
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

        const { data: createdPlayer } = await supabase
          .from('players')
          .insert([newPlayer])
          .select()
          .single();

        return createdPlayer || newPlayer;
      }

      return player;
    });

    // Шаг 2: Обработка игровой логики
    const gameResult = await step.run('process-game-logic', async () => {
      const languageCode = 'en';
      
      // Специальная обработка начала игры
      if (currentState.plan === WIN_LOKA && currentState.isFinished === true && roll === MAX_ROLL) {
        const gameStep: GameStep = {
          loka: START_LOKA,
          previous_loka: WIN_LOKA,
          direction: 'step 🚶🏼',
          consecutive_sixes: 0,
          position_before_three_sixes: 0,
          is_finished: false,
        };

        const newPlan = getPlan(START_LOKA, languageCode);
        const messageContext: GameContext = {
          currentPlan: START_LOKA,
          previousPlan: WIN_LOKA,
          roll,
          direction: 'step 🚶🏼',
          isFinished: false,
          consecutiveSixes: 0
        };
        const gameMessage = GameMessageService.generateMessage(messageContext);

        return {
          gameStep,
          plan: newPlan,
          direction: 'Игра началась! 🎮',
          message: gameMessage.text,
        };
      }

      // Ожидание шестерки для начала
      if (currentState.plan === WIN_LOKA && currentState.isFinished === true && roll !== MAX_ROLL) {
        const gameStep: GameStep = {
          loka: WIN_LOKA,
          previous_loka: currentState.previous_plan,
          direction: 'stop 🛑',
          consecutive_sixes: 0,
          position_before_three_sixes: 0,
          is_finished: true,
        };

        const newPlan = getPlan(WIN_LOKA, languageCode);
        const messageContext: GameContext = {
          currentPlan: WIN_LOKA,
          previousPlan: currentState.previous_plan,
          roll,
          direction: 'stop 🛑',
          isFinished: true,
          consecutiveSixes: 0
        };
        const gameMessage = GameMessageService.generateMessage(messageContext);

        return {
          gameStep,
          plan: newPlan,
          direction: 'Для начала игры нужно выбросить 6! 🎲',
          message: gameMessage.text,
        };
      }

      // Стандартная обработка
      const { 
        newConsecutive, 
        newPosition, 
        newBeforeThreeSixes, 
        direction: sixesDirection 
      } = handleConsecutiveSixes(
        roll, 
        currentState.plan, 
        currentState.consecutiveSixes, 
        currentState.positionBeforeThreeSixes
      );

      const { 
        finalLoka, 
        direction: finalDirection, 
        isGameFinished 
      } = getDirectionAndPosition(
        newPosition, 
        currentState.isFinished, 
        roll,
        currentState.plan
      );

      const direction = sixesDirection || finalDirection;

      const gameStep: GameStep = {
        loka: finalLoka,
        previous_loka: currentState.plan,
        direction,
        consecutive_sixes: newConsecutive,
        position_before_three_sixes: newBeforeThreeSixes,
        is_finished: isGameFinished,
      };

      const newPlan = getPlan(finalLoka, languageCode);
      const localizedDirection = 
        directionMap[direction]?.[languageCode as 'en' | 'ru'] || 
        directionMap[direction]?.['en'] || 
        direction;

      const messageContext: GameContext = {
        currentPlan: finalLoka,
        previousPlan: currentState.plan,
        roll,
        direction,
        isFinished: isGameFinished,
        consecutiveSixes: newConsecutive
      };
      const gameMessage = GameMessageService.generateMessage(messageContext);

      return {
        gameStep,
        plan: newPlan,
        direction: localizedDirection,
        message: gameMessage.text,
      };
    });

    // Шаг 3: Сохранение в базу данных
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

      const { error } = await supabase
        .from('players')
        .update(updates)
        .eq('id', userId);

      if (error) {
        console.error(`[Inngest] Ошибка сохранения:`, error);
        throw new Error(`Ошибка сохранения: ${error.message}`);
      }

      console.log(`[Inngest] Игрок обновлен:`, updates);
      return updates;
    });

    // Шаг 4: Отправка события обновления состояния
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

    console.log(`[Inngest] processDiceRoll завершена для ${userId}, результат:`, gameResult);
    
    return {
      success: true,
      userId,
      roll,
      gameResult
    };
  }
); 
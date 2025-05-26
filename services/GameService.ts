import { GameStep, Plan } from '../types';
import { supabase } from '../config/supabase';
import { currentPlayerVar } from '../lib/apollo-drizzle-client';
import { GameMessageService, GameContext } from './GameMessageService';

const directionMap: { [key: string]: { ru: string; en: string } } = {
  'stop 🛑': { ru: 'Стоп 🛑', en: 'Stop 🛑' },
  'стоп 🛑': { ru: 'Стоп 🛑', en: 'Stop 🛑' },
  'arrow 🏹': { ru: 'Стрела 🏹', en: 'Arrow 🏹' },
  'стрела 🏹': { ru: 'Стрела 🏹', en: 'Arrow 🏹' },
  'snake 🐍': { ru: 'Змея 🐍', en: 'Snake 🐍' },
  'змея 🐍': { ru: 'Змея 🐍', en: 'Snake 🐍' },
  'win 🕉': { ru: 'Победа 🕉', en: 'Win 🕉' },
  'победа 🕉': { ru: 'Победа 🕉', en: 'Win 🕉' },
  'step 🚶🏼': { ru: 'Шаг 🚶🏼', en: 'Step 🚶🏼' },
  'шаг 🚶🏼': { ru: 'Шаг 🚶🏼', en: 'Step 🚶🏼' },
};

// Constants
const TOTAL_PLANS = 72;
const WIN_LOKA = 68;
const MAX_ROLL = 6;
const START_LOKA = 6; // Начальная позиция, куда попадает игрок после выбрасывания 6

// Helper function to get user by user ID
export const getUserByUserId = async (userId: string) => {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('Error getting user:', error);
    throw new Error('Failed to get user info');
  }

  return data;
};

// Helper function to get the last game step from local state
export const getLastStep = (): GameStep => {
  const currentPlayer = currentPlayerVar();
  
  console.log(`[GameService] getLastStep вызвана, currentPlayer:`, currentPlayer);
  
  if (!currentPlayer) {
    console.log(`[GameService] currentPlayer не найден, возвращаем начальное состояние`);
    // Возвращаем начальное состояние, если игрок не найден
    return {
      loka: 1,
      previous_loka: 0,
      direction: '',
      consecutive_sixes: 0,
      position_before_three_sixes: 0,
      is_finished: false,
    };
  }
  
  // Convert player data to gameStep format
  const gameStep = {
    loka: currentPlayer.plan || 1,
    previous_loka: currentPlayer.previous_plan || 0,
    direction: '',
    consecutive_sixes: currentPlayer.consecutiveSixes || 0,
    position_before_three_sixes: currentPlayer.positionBeforeThreeSixes || 0,
    is_finished: currentPlayer.isFinished || false,
  };
  
  console.log(`[GameService] getLastStep возвращает gameStep:`, gameStep);
  return gameStep;
};

// Helper function to get plan information
export const getPlan = (lokaNumber: number, languageCode = 'en'): Plan => {
  try {
    // Этот запрос заменен на локальные данные для демонстрации
    return {
      key: `${lokaNumber}-plan`, 
      title: `План ${lokaNumber}`,
    };
  } catch (error) {
    console.error('Error getting plan:', error);
    return {
      key: `${lokaNumber}-unknown`,
      title: `Неизвестный план ${lokaNumber}`,
    };
  }
};

// Helper function to update player position
export const updatePlayerPosition = async (userId: string, gameStep: GameStep, message?: string): Promise<void> => {
  console.log(`[GameService] updatePlayerPosition вызвана с userId=${userId}, gameStep:`, gameStep, `message=${message}`);
  
  try {
    // Определяем, нужен ли отчет - если позиция изменилась и игра активна
    const needsReport = gameStep.loka !== gameStep.previous_loka && !gameStep.is_finished;
    
    const { error } = await supabase
      .from('players')
      .update({
        plan: gameStep.loka,
        previous_plan: gameStep.previous_loka,
        consecutiveSixes: gameStep.consecutive_sixes,
        positionBeforeThreeSixes: gameStep.position_before_three_sixes,
        isFinished: gameStep.is_finished,
        needsReport: needsReport, // Устанавливаем флаг необходимости отчета
        message: message || `Last move: ${gameStep.direction}`,
      })
      .eq('id', userId);

    if (error) {
      console.error('[GameService] Error updating player position:', error);
      throw new Error('Failed to update player position');
    } else {
      console.log(`[GameService] updatePlayerPosition успешно обновила позицию в Supabase, needsReport=${needsReport}`);
    }
  } catch (error) {
    console.error('[GameService] Критическая ошибка при обновлении Supabase:', error);
    // В случае ошибки Supabase, продолжаем работу (не блокируем игру)
    console.log('[GameService] Продолжаем работу без сохранения в Supabase');
  }
};

// Helper function to handle consecutive sixes
export const handleConsecutiveSixes = (
  roll: number, 
  currentLoka: number,
  consecutive: number, 
  positionBeforeThreeSixes: number
): { 
  newConsecutive: number; 
  newPosition: number; 
  newBeforeThreeSixes: number;
  direction?: string;
} => {
  console.log(`[GameService] handleConsecutiveSixes: ВХОД - roll=${roll}, currentLoka=${currentLoka}, consecutive=${consecutive}, positionBeforeThreeSixes=${positionBeforeThreeSixes}`);
  
  if (roll !== MAX_ROLL) {
    console.log(`[GameService] Не шестерка (${roll}), сбрасываем счетчик и двигаемся на ${currentLoka + roll}`);
    return { 
      newConsecutive: 0, 
      newPosition: currentLoka + roll,
      newBeforeThreeSixes: positionBeforeThreeSixes 
    };
  }

  const newConsecutive = consecutive + 1;
  console.log(`[GameService] Шестерка! Новый счетчик: ${newConsecutive}`);
  
  // If this is the third consecutive six
  if (newConsecutive === 3) {
    console.log(`[GameService] ТРЕТЬЯ ШЕСТЕРКА ПОДРЯД! Возвращаемся на позицию ${positionBeforeThreeSixes}`);
    return { 
      newConsecutive: 0, 
      newPosition: positionBeforeThreeSixes,
      newBeforeThreeSixes: positionBeforeThreeSixes,
      direction: 'snake 🐍' 
    };
  }
  
  // First or second six
  const newPosition = currentLoka + roll;
  const newBeforeThreeSixes = consecutive === 0 ? currentLoka : positionBeforeThreeSixes;
  console.log(`[GameService] ${newConsecutive === 1 ? 'Первая' : 'Вторая'} шестерка: ${currentLoka} -> ${newPosition}, запоминаем позицию ${newBeforeThreeSixes}`);
  
  return { 
    newConsecutive, 
    newPosition: newPosition,
    newBeforeThreeSixes: newBeforeThreeSixes 
  };
};

// Helper function to get direction and new position based on game rules
export const getDirectionAndPosition = (
  newLoka: number, 
  isFinished: boolean,
  roll: number,
  currentLoka: number
): { 
  finalLoka: number; 
  direction: string; 
  isGameFinished: boolean; 
} => {
  console.log(`[GameService] getDirectionAndPosition: ВХОД - newLoka=${newLoka}, isFinished=${isFinished}, roll=${roll}, currentLoka=${currentLoka}`);
  
  // Правило начала игры: игрок находится на позиции 68 (WIN_LOKA) и игра завершена
  if (currentLoka === WIN_LOKA && isFinished) {
    // Если выпало 6, переносим игрока на позицию START_LOKA (6)
    if (roll === MAX_ROLL) {
      console.log(`[GameService] Начало игры! Выпало 6 при позиции ${WIN_LOKA}, перемещаемся на позицию ${START_LOKA}!`);
      return { 
        finalLoka: START_LOKA,
        direction: 'step 🚶🏼', 
        isGameFinished: false 
      };
    }
    // Если не выпало 6, остаемся на месте и ждем 6
    console.log(`[GameService] Для начала игры нужно выбросить 6. Выпало: ${roll}`);
    return { 
      finalLoka: WIN_LOKA, 
      direction: 'stop 🛑', 
      isGameFinished: true
    };
  }

  // Для общего случая, когда игра активна (isFinished = false)
  console.log(`[GameService] Обычная игра: проверяем позицию ${newLoka}`);
  
  // Win condition
  if (newLoka === WIN_LOKA) {
    console.log(`[GameService] ПОБЕДА! Достигнута позиция ${WIN_LOKA}`);
    return { 
      finalLoka: newLoka, 
      direction: 'win 🕉', 
      isGameFinished: true 
    };
  }

  // Exceeding the board limit - строгая проверка!
  if (newLoka > TOTAL_PLANS) {
    console.log(`[GameService] Предотвращен выход за пределы поля: ${newLoka} > ${TOTAL_PLANS}, остаемся на ${currentLoka}`);
    return { 
      finalLoka: currentLoka, 
      direction: 'stop 🛑', 
      isGameFinished: false 
    };
  }

  // Snake positions
  const snakePositions: Record<number, number> = {
    12: 8,
    16: 4,
    24: 7,
    29: 6,
    44: 9,
    52: 35,
    55: 3,
    61: 13,
    63: 2,
    72: 51
  };

  if (snakePositions[newLoka]) {
    console.log(`[GameService] ЗМЕЯ! Позиция ${newLoka} -> ${snakePositions[newLoka]}`);
    return { 
      finalLoka: snakePositions[newLoka], 
      direction: 'snake 🐍', 
      isGameFinished: false 
    };
  }

  // Arrow positions
  const arrowPositions: Record<number, number> = {
    10: 23,
    17: 69,
    20: 32,
    22: 60,
    27: 41,
    28: 50,
    37: 66,
    45: 67,
    46: 62,
    54: 68
  };

  if (arrowPositions[newLoka]) {
    console.log(`[GameService] СТРЕЛА! Позиция ${newLoka} -> ${arrowPositions[newLoka]}`);
    // Special case - if arrow leads to win position
    if (arrowPositions[newLoka] === WIN_LOKA) {
      console.log(`[GameService] Стрела ведет к победе!`);
      return { 
        finalLoka: arrowPositions[newLoka], 
        direction: 'arrow 🏹', 
        isGameFinished: true 
      };
    }
    return { 
      finalLoka: arrowPositions[newLoka], 
      direction: 'arrow 🏹', 
      isGameFinished: false 
    };
  }

  // Regular move
  console.log(`[GameService] Обычный ход: ${currentLoka} -> ${newLoka}`);
  
  // Специальная диагностика для позиции 51
  if (currentLoka === 51 || newLoka === 51) {
    console.log(`[GameService] ДИАГНОСТИКА ПОЗИЦИИ 51: currentLoka=${currentLoka}, newLoka=${newLoka}, roll=${roll}`);
    console.log(`[GameService] Проверяем змей и стрел для позиции ${newLoka}:`);
    console.log(`[GameService] - Змеи:`, snakePositions);
    console.log(`[GameService] - Стрелы:`, arrowPositions);
  }
  
  return { 
    finalLoka: newLoka, 
    direction: 'step 🚶🏼', 
    isGameFinished: false 
  };
};

// Main function to process a game step
export const processGameStep = async (
  roll: number,
  userId: string
): Promise<{ 
  gameStep: GameStep; 
  plan: Plan; 
  direction: string;
  message: string;
}> => {
  console.log(`[GameService] processGameStep начало с roll=${roll}, userId=${userId}`);
  // Получаем текущее состояние игры из локального состояния Apollo
  const currentState = getLastStep();
  console.log(`[GameService] Текущее состояние:`, currentState);
  const languageCode = 'en'; // Используем английский по умолчанию
  
  // Специальная обработка для начального состояния (позиция 68, игра завершена)
  if (currentState.loka === WIN_LOKA && currentState.is_finished === true && roll === MAX_ROLL) {
    console.log(`[GameService] Специальное условие: Начало игры с позиции ${WIN_LOKA}, выпало ${MAX_ROLL}!`);
    
    // Создаем игровой шаг для перемещения на стартовую позицию
    const gameStep: GameStep = {
      loka: START_LOKA, // Перемещаемся на стартовую позицию
      previous_loka: WIN_LOKA, // Мы пришли с позиции WIN_LOKA
      direction: 'step 🚶🏼',
      consecutive_sixes: 0,
      position_before_three_sixes: 0,
      is_finished: false, // Игра теперь в активном состоянии
    };

    // Get the plan information for the new loka
    const newPlan = getPlan(START_LOKA, languageCode);

    // Генерируем динамическое сообщение
    const messageContext: GameContext = {
      currentPlan: START_LOKA,
      previousPlan: WIN_LOKA,
      roll,
      direction: 'step 🚶🏼',
      isFinished: false,
      consecutiveSixes: 0
    };
    const gameMessage = GameMessageService.generateMessage(messageContext);

    // Сохраняем изменения в базе данных
    await updatePlayerPosition(userId, gameStep, gameMessage.text);

    console.log(`[GameService] Игра началась! Перемещаемся на позицию ${START_LOKA}`);
    return {
      gameStep,
      plan: newPlan,
      direction: 'Игра началась! 🎮',
      message: gameMessage.text,
    };
  }
  
  // Если игра не начата (мы на позиции 68 и isFinished=true), 
  // но выпало НЕ 6, то оставляем игрока на месте
  if (currentState.loka === WIN_LOKA && currentState.is_finished === true && roll !== MAX_ROLL) {
    console.log(`[GameService] Для начала игры нужно выбросить 6. Выпало: ${roll}`);
    
    const gameStep: GameStep = {
      loka: WIN_LOKA, // Остаемся на той же позиции
      previous_loka: currentState.previous_loka,
      direction: 'stop 🛑',
      consecutive_sixes: 0,
      position_before_three_sixes: 0,
      is_finished: true, // Сохраняем статус "завершено"
    };

    const newPlan = getPlan(WIN_LOKA, languageCode);
    
    // Генерируем сообщение для ожидания шестерки
    const messageContext: GameContext = {
      currentPlan: WIN_LOKA,
      previousPlan: currentState.previous_loka,
      roll,
      direction: 'stop 🛑',
      isFinished: true,
      consecutiveSixes: 0
    };
    const gameMessage = GameMessageService.generateMessage(messageContext);
    
    // Сохраняем изменения в базе данных
    await updatePlayerPosition(userId, gameStep, gameMessage.text);
    
    return {
      gameStep,
      plan: newPlan,
      direction: 'Для начала игры нужно выбросить 6! 🎲',
      message: gameMessage.text,
    };
  }
  
  // Стандартная обработка для активной игры
  // Calculate new position with consecutive sixes handling
  const { 
    newConsecutive, 
    newPosition, 
    newBeforeThreeSixes, 
    direction: sixesDirection 
  } = handleConsecutiveSixes(
    roll, 
    currentState.loka, 
    currentState.consecutive_sixes, 
    currentState.position_before_three_sixes
  );
  
  // Get final position and direction based on game rules
  const { 
    finalLoka, 
    direction: finalDirection, 
    isGameFinished 
  } = getDirectionAndPosition(
    newPosition, 
    currentState.is_finished, 
    roll,
    currentState.loka // передаем текущую позицию для дополнительных проверок
  );
  
  // Use direction from consecutive sixes handler if it exists
  const direction = sixesDirection || finalDirection;
  
  // Construct game step object
  const gameStep: GameStep = {
    loka: finalLoka,
    previous_loka: currentState.loka,
    direction,
    consecutive_sixes: newConsecutive,
    position_before_three_sixes: newBeforeThreeSixes,
    is_finished: isGameFinished,
  };

  // Get the plan information for the new loka
  const newPlan = getPlan(finalLoka, languageCode);

  // Map direction to localized text
  const localizedDirection = 
    directionMap[direction]?.[languageCode as 'en' | 'ru'] || 
    directionMap[direction]?.['en'] || 
    direction;

  // Генерируем динамическое сообщение для хода
  const messageContext: GameContext = {
    currentPlan: finalLoka,
    previousPlan: currentState.loka,
    roll,
    direction,
    isFinished: isGameFinished,
    consecutiveSixes: newConsecutive
  };
  const gameMessage = GameMessageService.generateMessage(messageContext);

  // Сохраняем изменения в базе данных
  await updatePlayerPosition(userId, gameStep, gameMessage.text);

  console.log(`[GameService] processGameStep завершение:`, { gameStep, plan: newPlan, direction: localizedDirection, message: gameMessage.text });
  // Return the result
  return {
    gameStep,
    plan: newPlan,
    direction: localizedDirection,
    message: gameMessage.text,
  };
};

// Utility function to validate position (useful for testing)
export const validatePosition = (position: number): boolean => {
  return position >= 1 && position <= TOTAL_PLANS;
}; 
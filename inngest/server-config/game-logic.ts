// Серверная игровая логика для NeuroLeela без React Native зависимостей

// Константы игры
export const TOTAL_PLANS = 72;
export const WIN_LOKA = 68;
export const MAX_ROLL = 6;
export const START_LOKA = 6;

// Типы для игровой логики
export interface GameStep {
  loka: number;
  previous_loka: number;
  direction: string;
  consecutive_sixes: number;
  position_before_three_sixes: number;
  is_finished: boolean;
}

export interface Plan {
  short_desc: string;
  image: string;
  name: string;
}

export interface GameContext {
  currentPlan: number;
  previousPlan: number;
  roll: number;
  direction: string;
  isFinished: boolean;
  consecutiveSixes: number;
}

// Карта направлений
const directionMap: { [key: string]: { ru: string; en: string } } = {
  'stop 🛑': { ru: 'Стоп 🛑', en: 'Stop 🛑' },
  'arrow 🏹': { ru: 'Стрела 🏹', en: 'Arrow 🏹' },
  'snake 🐍': { ru: 'Змея 🐍', en: 'Snake 🐍' },
  'win 🕉': { ru: 'Победа 🕉', en: 'Win 🕉' },
  'step 🚶🏼': { ru: 'Шаг 🚶🏼', en: 'Step 🚶🏼' },
};

// Позиции стрел (ускорение)
const arrowPositions: { [key: number]: number } = {
  4: 14, 9: 31, 17: 7, 20: 38, 28: 84, 40: 59,
  51: 67, 54: 34, 62: 19, 63: 81, 64: 60, 71: 91
};

// Позиции змей (возврат назад)
const snakePositions: { [key: number]: number } = {
  16: 6, 47: 26, 49: 11, 56: 53, 62: 19, 64: 60, 
  87: 24, 93: 73, 95: 75, 98: 78
};

// Функция для получения информации о плане
export const getPlan = (planNumber: number, languageCode: string = 'en'): Plan => {
  return {
    short_desc: `Описание плана ${planNumber}`,
    image: '',
    name: `План ${planNumber}`
  };
};

// Генерация игрового сообщения
export class ServerGameMessageService {
  static generateMessage(context: GameContext): { text: string } {
    const { currentPlan, previousPlan, roll, direction, isFinished, consecutiveSixes } = context;
    
    // Начало игры
    if (previousPlan === WIN_LOKA && currentPlan === START_LOKA) {
      return { text: `🎮 Игра началась! Вы бросили ${roll} и начинаете путь с плана ${START_LOKA}. Удачи в самопознании!` };
    }
    
    // Ожидание начала
    if (currentPlan === WIN_LOKA && isFinished) {
      if (roll === MAX_ROLL) {
        return { text: `🎉 ОТЛИЧНО! Выпала шестерка! Игра началась - движемся на план ${START_LOKA}!` };
      } else {
        return { text: `😔 Выпало ${roll}, а для начала игры нужна шестерка (6). Попробуйте еще раз!` };
      }
    }
    
    // Победа
    if (direction === 'win 🕉') {
      return { text: `🕉️ Поздравляем! Вы достигли просветления на плане ${WIN_LOKA}! Путь самопознания завершен.` };
    }
    
    // Змея
    if (direction === 'snake 🐍') {
      return { text: `🐍 Змея! Вы переместились с плана ${previousPlan} на план ${currentPlan}. Это урок смирения.` };
    }
    
    // Стрела
    if (direction === 'arrow 🏹') {
      return { text: `🏹 Стрела! Ускорение с плана ${previousPlan} на план ${currentPlan}. Вы на правильном пути!` };
    }
    
    // Три шестерки подряд
    if (consecutiveSixes === 0 && previousPlan > currentPlan && roll === MAX_ROLL) {
      return { text: `🐍 Три шестерки подряд! Возврат на прежнюю позицию ${currentPlan}. Гордыня наказана.` };
    }
    
    // Стоп (выход за границы)
    if (direction === 'stop 🛑') {
      return { text: `🛑 Остановка на плане ${currentPlan}. Терпение - ключ к мудрости.` };
    }
    
    // Обычный ход
    return { text: `🚶🏼 Обычный ход с плана ${previousPlan} на план ${currentPlan}. Вы бросили ${roll}.` };
  }
}

// Обработка подряд идущих шестерок
export const handleConsecutiveSixes = (
  roll: number, 
  currentLoka: number,
  consecutive: number, 
  positionBeforeThreeSixes: number
) => {
  console.log(`[GameLogic] handleConsecutiveSixes: roll=${roll}, currentLoka=${currentLoka}, consecutive=${consecutive}`);
  
  if (roll !== MAX_ROLL) {
    return { 
      newConsecutive: 0, 
      newPosition: currentLoka + roll,
      newBeforeThreeSixes: positionBeforeThreeSixes 
    };
  }

  const newConsecutive = consecutive + 1;
  
  if (newConsecutive === 3) {
    console.log(`[GameLogic] ТРЕТЬЯ ШЕСТЕРКА! Возврат на позицию ${positionBeforeThreeSixes}`);
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
export const getDirectionAndPosition = (
  newLoka: number, 
  isFinished: boolean,
  roll: number,
  currentLoka: number
) => {
  console.log(`[GameLogic] getDirectionAndPosition: newLoka=${newLoka}, isFinished=${isFinished}, roll=${roll}`);
  
  // Начало игры
  if (currentLoka === WIN_LOKA && isFinished) {
    if (roll === MAX_ROLL) {
      console.log(`[GameLogic] Начало игры! Перемещение на ${START_LOKA}`);
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
    console.log(`[GameLogic] ПОБЕДА! Позиция ${WIN_LOKA}`);
    return { 
      finalLoka: newLoka, 
      direction: 'win 🕉', 
      isGameFinished: true 
    };
  }

  // Выход за границы поля
  if (newLoka > TOTAL_PLANS) {
    console.log(`[GameLogic] Выход за границы: ${newLoka} > ${TOTAL_PLANS}`);
    return { 
      finalLoka: currentLoka, 
      direction: 'stop 🛑', 
      isGameFinished: false 
    };
  }

  // Проверка стрел
  if (arrowPositions[newLoka]) {
    const arrowTarget = arrowPositions[newLoka];
    console.log(`[GameLogic] Стрела! ${newLoka} -> ${arrowTarget}`);
    return { 
      finalLoka: Math.min(arrowTarget, TOTAL_PLANS), 
      direction: 'arrow 🏹', 
      isGameFinished: arrowTarget === WIN_LOKA 
    };
  }

  // Проверка змей
  if (snakePositions[newLoka]) {
    const snakeTarget = snakePositions[newLoka];
    console.log(`[GameLogic] Змея! ${newLoka} -> ${snakeTarget}`);
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

// Основная функция обработки игрового хода
export const processGameMove = (
  currentPlayer: {
    id: string;
    plan: number;
    previous_plan: number | null;
    message: string | null;
    avatar: string | null;
    fullName: string | null;
    intention: string | null;
    isStart: boolean | null;
    isFinished: boolean | null;
    consecutiveSixes: number | null;
    positionBeforeThreeSixes: number | null;
    needsReport: boolean | null;
  },
  roll: number,
  languageCode: string = 'en'
): {
  gameStep: GameStep;
  plan: Plan;
  direction: string;
  message: string;
} => {
  console.log(`[GameLogic] processGameMove: player=${currentPlayer.id}, roll=${roll}, plan=${currentPlayer.plan}`);

  // Специальная обработка начала игры
  if (currentPlayer.plan === WIN_LOKA && currentPlayer.isFinished === true && roll === MAX_ROLL) {
    const gameStep: GameStep = {
      loka: START_LOKA,
      previous_loka: currentPlayer.previous_plan || WIN_LOKA,
      direction: 'step 🚶🏼',
      consecutive_sixes: 0,
      position_before_three_sixes: 0,
      is_finished: false,
    };

    const newPlan = getPlan(START_LOKA, languageCode);
    const messageContext: GameContext = {
      currentPlan: START_LOKA,
      previousPlan: currentPlayer.previous_plan || WIN_LOKA,
      roll,
      direction: 'step 🚶🏼',
      isFinished: false,
      consecutiveSixes: 0
    };
    const gameMessage = ServerGameMessageService.generateMessage(messageContext);

    return {
      gameStep,
      plan: newPlan,
      direction: 'Игра началась! 🎮',
      message: gameMessage.text,
    };
  }

  // Ожидание шестерки для начала
  if (currentPlayer.plan === WIN_LOKA && currentPlayer.isFinished === true && roll !== MAX_ROLL) {
    const gameStep: GameStep = {
      loka: WIN_LOKA,
      previous_loka: currentPlayer.previous_plan || 0,
      direction: 'stop 🛑',
      consecutive_sixes: 0,
      position_before_three_sixes: 0,
      is_finished: true,
    };

    const newPlan = getPlan(WIN_LOKA, languageCode);
    const messageContext: GameContext = {
      currentPlan: WIN_LOKA,
      previousPlan: currentPlayer.previous_plan || 0,
      roll,
      direction: 'stop 🛑',
      isFinished: true,
      consecutiveSixes: 0
    };
    const gameMessage = ServerGameMessageService.generateMessage(messageContext);

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
    currentPlayer.plan, 
    currentPlayer.consecutiveSixes || 0, 
    currentPlayer.positionBeforeThreeSixes || 0
  );

  const { 
    finalLoka, 
    direction: finalDirection, 
    isGameFinished 
  } = getDirectionAndPosition(
    newPosition, 
    currentPlayer.isFinished || false, 
    roll,
    currentPlayer.plan
  );

  const direction = sixesDirection || finalDirection;

  const gameStep: GameStep = {
    loka: finalLoka,
    previous_loka: currentPlayer.plan,
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
    previousPlan: currentPlayer.plan,
    roll,
    direction,
    isFinished: isGameFinished,
    consecutiveSixes: newConsecutive
  };
  const gameMessage = ServerGameMessageService.generateMessage(messageContext);

  return {
    gameStep,
    plan: newPlan,
    direction: localizedDirection,
    message: gameMessage.text,
  };
}; 
interface GameMessage {
  text: string;
  type: 'start' | 'move' | 'snake' | 'arrow' | 'win' | 'stop' | 'special';
  spiritual?: boolean;
}

interface GameContext {
  currentPlan: number;
  previousPlan: number;
  roll: number;
  direction: string;
  isFinished: boolean;
  consecutiveSixes: number;
}

// Духовные сообщения для разных планов
const planMessages: Record<number, string[]> = {
  1: [
    "🌱 Рождение души в материальном мире. Начинается ваш путь к просветлению.",
    "🌱 Первые шаги на пути самопознания. Каждый шаг - это урок.",
    "🌱 Душа воплощается, чтобы учиться. Примите этот дар с благодарностью."
  ],
  6: [
    "🚀 Начало духовного путешествия! Вы готовы к великим открытиям.",
    "🚀 Первый шаг сделан! Впереди 72 урока мудрости.",
    "🚀 Путь самопознания открыт. Доверьтесь процессу."
  ],
  10: [
    "🧘 Очищение начинается. Отпустите то, что больше не служит вам.",
    "🧘 Время освободиться от негативных паттернов.",
    "🧘 Очищение души - первый шаг к просветлению."
  ],
  23: [
    "☁️ Небесный план достигнут! Вы поднимаетесь над мирскими заботами.",
    "☁️ Блаженство и покой наполняют ваше сердце.",
    "☁️ Высшие сферы сознания открываются перед вами."
  ],
  68: [
    "🕉️ Космическое сознание! Вы достигли единства с Абсолютом!",
    "🕉️ Просветление достигнуто! Теперь вы можете начать новый цикл.",
    "🕉️ Высшая цель достигнута. Вы стали едины с Божественным."
  ]
};

// Сообщения для разных типов ходов
const directionMessages: Record<string, string[]> = {
  'step': [
    "Каждый шаг - это урок. Идите с осознанностью.",
    "Путь самопознания продолжается. Будьте внимательны к знакам.",
    "Движение вперед - это рост. Принимайте каждый опыт.",
    "Ваша душа развивается с каждым шагом.",
    "Доверьтесь процессу. Вселенная ведет вас правильным путем."
  ],
  'snake': [
    "🐍 Змея учит смирению. Иногда нужно отступить, чтобы понять урок.",
    "🐍 Падение - это не неудача, а возможность переосмыслить путь.",
    "🐍 Кундалини направляет вас к более глубокому пониманию.",
    "🐍 Урок смирения получен. Используйте эту мудрость.",
    "🐍 Змея показывает: не все потери являются поражениями."
  ],
  'arrow': [
    "🏹 Стрела духовного подъема! Ваши усилия вознаграждены.",
    "🏹 Быстрый рост сознания! Вы готовы к высшим истинам.",
    "🏹 Божественная милость поднимает вас выше.",
    "🏹 Стрела мудрости пронзила завесу иллюзий.",
    "🏹 Духовный скачок! Ваша преданность приносит плоды."
  ],
  'win': [
    "🕉️ Победа! Космическое сознание достигнуто!",
    "🕉️ Просветление! Вы стали едины с Абсолютом!",
    "🕉️ Высшая цель достигнута! Теперь вы можете помочь другим.",
    "🕉️ Мокша! Освобождение от цикла перерождений!"
  ],
  'stop': [
    "🛑 Время для размышлений. Не все движения ведут вперед.",
    "🛑 Пауза дает возможность осознать пройденный путь.",
    "🛑 Терпение - добродетель. Ждите подходящего момента.",
    "🛑 Остановка учит принятию. Не все в ваших руках."
  ]
};

// Специальные сообщения для особых ситуаций
const specialMessages = {
  needSixToStart: [
    "🎲 Бросьте 6, чтобы начать путь самопознания!",
    "🎲 Для начала духовного путешествия нужна шестерка!",
    "🎲 Космос ждет, когда вы будете готовы. Бросьте 6!",
    "🎲 Шестерка откроет врата к самопознанию!"
  ],
  consecutiveSixes: [
    "⚡ Три шестерки подряд! Вселенная учит вас смирению.",
    "⚡ Слишком быстрый рост может быть опасен. Возвращайтесь к основам.",
    "⚡ Урок терпения: не все можно получить силой.",
    "⚡ Баланс восстановлен. Гордыня наказана."
  ],
  firstMove: [
    "🌟 Первый ход сделан! Путь к просветлению начался.",
    "🌟 Добро пожаловать в игру Лила! Каждый ход - это урок.",
    "🌟 Духовное путешествие началось. Будьте открыты к мудрости.",
    "🌟 Первый шаг к космическому сознанию сделан!"
  ]
};

// Мотивационные сообщения в зависимости от прогресса
const progressMessages = {
  early: [
    "🌱 Начало пути всегда самое важное. Продолжайте с верой.",
    "🌱 Каждый великий путь начинается с первого шага.",
    "🌱 Вы на правильном пути. Доверьтесь процессу."
  ],
  middle: [
    "🔥 Середина пути - время испытаний. Не сдавайтесь!",
    "🔥 Ваша решимость проверяется. Оставайтесь сильными.",
    "🔥 Трудности закаляют дух. Продолжайте идти."
  ],
  advanced: [
    "💎 Вы близки к цели! Последние шаги самые важные.",
    "💎 Мудрость приходит к тем, кто не останавливается.",
    "💎 Финальный рывок к просветлению!"
  ]
};

export class GameMessageService {
  private static getRandomMessage(messages: string[]): string {
    return messages[Math.floor(Math.random() * messages.length)];
  }

  private static getProgressLevel(plan: number): 'early' | 'middle' | 'advanced' {
    if (plan <= 24) return 'early';
    if (plan <= 48) return 'middle';
    return 'advanced';
  }

  static generateMessage(context: GameContext): GameMessage {
    const { currentPlan, previousPlan, roll, direction, isFinished, consecutiveSixes } = context;

    // Специальные случаи
    if (currentPlan === 68 && isFinished) {
      return {
        text: this.getRandomMessage(specialMessages.needSixToStart),
        type: 'start',
        spiritual: true
      };
    }

    // Первый ход в игре
    if (previousPlan === 68 && currentPlan === 6) {
      return {
        text: this.getRandomMessage(specialMessages.firstMove),
        type: 'move',
        spiritual: true
      };
    }

    // Специальный случай для трех шестерок подряд
    if (direction.includes('snake') && consecutiveSixes === 0 && previousPlan > currentPlan) {
      return {
        text: this.getRandomMessage(specialMessages.consecutiveSixes),
        type: 'special',
        spiritual: true
      };
    }

    // Сообщения по типу хода (приоритет выше чем планы)
    const directionKey = direction.split(' ')[0].toLowerCase();
    if (directionMessages[directionKey]) {
      return {
        text: this.getRandomMessage(directionMessages[directionKey]),
        type: directionKey as any,
        spiritual: true
      };
    }

    // Сообщения для конкретных планов
    if (planMessages[currentPlan]) {
      return {
        text: this.getRandomMessage(planMessages[currentPlan]),
        type: 'special',
        spiritual: true
      };
    }

    // Мотивационные сообщения по прогрессу
    const progressLevel = this.getProgressLevel(currentPlan);
    const progressText = this.getRandomMessage(progressMessages[progressLevel]);

    return {
      text: `${progressText} (План ${currentPlan})`,
      type: 'move',
      spiritual: true
    };
  }

  static getWelcomeMessage(): string {
    const welcomeMessages = [
      "🕉️ Добро пожаловать в игру Лила - древний путь самопознания!",
      "🕉️ Игра Лила ведет к космическому сознанию через 72 плана мудрости.",
      "🕉️ Каждый ход в Лиле - это урок на пути к просветлению.",
      "🕉️ Лила - это зеркало души. Готовы увидеть себя?"
    ];
    return this.getRandomMessage(welcomeMessages);
  }
}

export type { GameMessage, GameContext }; 
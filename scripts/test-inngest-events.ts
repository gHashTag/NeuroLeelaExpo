#!/usr/bin/env bun

/**
 * 🕉️ NeuroLeela Inngest Functions Test Objects
 * Готовые объекты для тестирования всех server functions
 */

import { 
  DiceRollEventData,
  ReportSubmitEventData, 
  PlayerStateUpdateEventData,
  PlayerInitEventData 
} from '../types/schemas';

// 🎯 Цвета для консоли
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m',
  blue: '\x1b[34m'
};

console.log(`
╔══════════════════════════════════════════════════════════════╗
║               🕉️ NEUROLEELA INNGEST TEST OBJECTS           ║
║                   Ready-to-use Test Data                    ║
╚══════════════════════════════════════════════════════════════╝
`);

// 🎮 TEST USER DATA
export const TEST_USERS = {
  newPlayer: {
    userId: 'test-new-player-' + Date.now(),
    email: 'newplayer@neuroleela.com'
  },
  existingPlayer: {
    userId: 'test-existing-player-' + Date.now(), 
    email: 'existing@neuroleela.com'
  },
  premiumPlayer: {
    userId: 'test-premium-player-' + Date.now(),
    email: 'premium@neuroleela.com'
  }
};

// 1️⃣ PLAYER INITIALIZATION TEST OBJECTS
export const PLAYER_INIT_TESTS: { [key: string]: PlayerInitEventData } = {
  validNewPlayer: {
    userId: TEST_USERS.newPlayer.userId,
    email: TEST_USERS.newPlayer.email
  },
  
  validExistingPlayer: {
    userId: TEST_USERS.existingPlayer.userId, 
    email: TEST_USERS.existingPlayer.email
  },
  
  validPremiumPlayer: {
    userId: TEST_USERS.premiumPlayer.userId,
    email: TEST_USERS.premiumPlayer.email
  }
};

// 2️⃣ DICE ROLL TEST OBJECTS  
export const DICE_ROLL_TESTS: { [key: string]: DiceRollEventData } = {
  startGameRoll: {
    userId: TEST_USERS.newPlayer.userId,
    roll: 6 // Начальная шестерка для старта игры
  },
  
  normalRoll: {
    userId: TEST_USERS.existingPlayer.userId,
    roll: 4 // Обычный ход
  },
  
  consecutiveSix1: {
    userId: TEST_USERS.existingPlayer.userId, 
    roll: 6 // Первая шестерка подряд
  },
  
  consecutiveSix2: {
    userId: TEST_USERS.existingPlayer.userId,
    roll: 6 // Вторая шестерка подряд  
  },
  
  consecutiveSix3: {
    userId: TEST_USERS.existingPlayer.userId,
    roll: 6 // Третья шестерка - триггер возврата
  },
  
  edgeCaseMin: {
    userId: TEST_USERS.newPlayer.userId,
    roll: 1 // Минимальное значение
  },
  
  edgeCaseMax: {
    userId: TEST_USERS.newPlayer.userId, 
    roll: 6 // Максимальное значение
  }
};

// 3️⃣ REPORT SUBMIT TEST OBJECTS
export const REPORT_SUBMIT_TESTS: { [key: string]: ReportSubmitEventData } = {
  shortReport: {
    userId: TEST_USERS.existingPlayer.userId,
    report: 'Краткий отчет о состоянии',
    planNumber: 10
  },
  
  detailedReport: {
    userId: TEST_USERS.existingPlayer.userId,
    report: `Подробный отчет о своем духовном состоянии на плане 15.
    
    Сегодня я осознал важность принятия себя таким, какой я есть. 
    Этот план научил меня тому, что истинная сила приходит изнутри,
    когда мы перестаем сопротивляться жизни и начинаем течь вместе с ней.
    
    Практика медитации помогла мне увидеть, что все мои страхи - 
    это лишь иллюзии ума. Я готов двигаться дальше по пути самопознания.`,
    planNumber: 15
  },
  
  reflectiveReport: {
    userId: TEST_USERS.premiumPlayer.userId,
    report: `План 32 принес глубокие инсайты.
    
    Понял, что мои привязанности к результатам создают страдания.
    Практикую отпускание и доверие вселенной. Чувствую большую легкость.`,
    planNumber: 32
  },
  
  challengingReport: {
    userId: TEST_USERS.existingPlayer.userId,
    report: `Сложный план 45. Столкнулся с внутренними демонами.
    
    Этот план показал мне теневые стороны личности, которые я предпочитал не замечать.
    Работаю с принятием и интеграцией. Понимаю, что это часть пути.`,
    planNumber: 45
  },
  
  victoryReport: {
    userId: TEST_USERS.premiumPlayer.userId,
    report: `Достижение плана 68! Завершение цикла самопознания.
    
    Чувствую глубокую благодарность за весь пройденный путь.
    Каждый план был учителем. Готов к новому циклу роста.`,
    planNumber: 68
  }
};

// 4️⃣ PLAYER STATE UPDATE TEST OBJECTS
export const PLAYER_STATE_UPDATE_TESTS: { [key: string]: PlayerStateUpdateEventData } = {
  updateMessage: {
    userId: TEST_USERS.existingPlayer.userId,
    updates: {
      message: 'Новое вдохновляющее сообщение для игрока'
    },
    timestamp: Date.now()
  },
  
  updateProfile: {
    userId: TEST_USERS.newPlayer.userId,
    updates: {
      fullName: 'Арджуна Кришнамурти',
      avatar: 'https://example.com/avatar.jpg',
      intention: 'Достижение внутренней гармонии и мудрости'
    },
    timestamp: Date.now()
  },
  
  updateGameState: {
    userId: TEST_USERS.existingPlayer.userId,
    updates: {
      plan: 25,
      previous_plan: 20,
      needsReport: true,
      message: 'План 25: Время для глубокой рефлексии'
    },
    timestamp: Date.now()
  },
  
  completeGame: {
    userId: TEST_USERS.premiumPlayer.userId,
    updates: {
      plan: 68,
      previous_plan: 65,
      isFinished: true,
      needsReport: false,
      message: '🎉 Поздравляем! Вы завершили путь самопознания!'
    },
    timestamp: Date.now()
  },
  
  resetGame: {
    userId: TEST_USERS.existingPlayer.userId,
    updates: {
      plan: 68,
      previous_plan: 0,
      isFinished: true,
      needsReport: false,
      consecutiveSixes: 0,
      positionBeforeThreeSixes: 0,
      message: 'Игра сброшена. Бросьте 6 для начала нового путешествия.'
    },
    timestamp: Date.now()
  }
};

// 🎯 COMPLETE EVENT OBJECTS (готовые для отправки в Inngest)
export const COMPLETE_EVENTS = {
  playerInit: {
    name: 'game.player.init',
    data: PLAYER_INIT_TESTS.validNewPlayer
  },
  
  diceRollStart: {
    name: 'game.dice.roll',
    data: DICE_ROLL_TESTS.startGameRoll
  },
  
  diceRollNormal: {
    name: 'game.dice.roll', 
    data: DICE_ROLL_TESTS.normalRoll
  },
  
  reportSubmit: {
    name: 'game.report.submit',
    data: REPORT_SUBMIT_TESTS.detailedReport
  },
  
  stateUpdate: {
    name: 'game.player.state.update',
    data: PLAYER_STATE_UPDATE_TESTS.updateProfile
  }
};

// 🎪 TESTING SCENARIOS (цепочки событий)
export const TESTING_SCENARIOS = {
  // Полный цикл нового игрока
  newPlayerFlow: [
    COMPLETE_EVENTS.playerInit,
    COMPLETE_EVENTS.diceRollStart,
    {
      name: 'game.report.submit',
      data: { ...REPORT_SUBMIT_TESTS.shortReport, planNumber: 6 }
    },
    {
      name: 'game.dice.roll',
      data: { ...DICE_ROLL_TESTS.normalRoll, roll: 3 }
    }
  ],
  
  // Тест последовательных шестерок
  consecutiveSixesFlow: [
    COMPLETE_EVENTS.diceRollNormal,
    {
      name: 'game.dice.roll',
      data: DICE_ROLL_TESTS.consecutiveSix1
    },
    {
      name: 'game.dice.roll', 
      data: DICE_ROLL_TESTS.consecutiveSix2
    },
    {
      name: 'game.dice.roll',
      data: DICE_ROLL_TESTS.consecutiveSix3
    }
  ],
  
  // Тест завершения игры
  gameCompletionFlow: [
    {
      name: 'game.dice.roll',
      data: { ...DICE_ROLL_TESTS.normalRoll, userId: TEST_USERS.premiumPlayer.userId }
    },
    {
      name: 'game.report.submit',
      data: REPORT_SUBMIT_TESTS.victoryReport
    },
    {
      name: 'game.player.state.update',
      data: PLAYER_STATE_UPDATE_TESTS.completeGame
    }
  ]
};

// 🎨 DISPLAY FUNCTIONS
function displayTestObject(title: string, obj: any, color: string) {
  console.log(`${color}${colors.bright}${title}${colors.reset}`);
  console.log(JSON.stringify(obj, null, 2));
  console.log('');
}

function displayAllTests() {
  console.log(`${colors.cyan}${colors.bright}🎮 PLAYER INITIALIZATION TESTS${colors.reset}`);
  Object.entries(PLAYER_INIT_TESTS).forEach(([key, value]) => {
    displayTestObject(`✅ ${key}:`, value, colors.green);
  });
  
  console.log(`${colors.yellow}${colors.bright}🎲 DICE ROLL TESTS${colors.reset}`);
  Object.entries(DICE_ROLL_TESTS).forEach(([key, value]) => {
    displayTestObject(`🎯 ${key}:`, value, colors.yellow);
  });
  
  console.log(`${colors.magenta}${colors.bright}📝 REPORT SUBMIT TESTS${colors.reset}`);
  Object.entries(REPORT_SUBMIT_TESTS).forEach(([key, value]) => {
    displayTestObject(`📋 ${key}:`, value, colors.magenta);
  });
  
  console.log(`${colors.blue}${colors.bright}👤 PLAYER STATE UPDATE TESTS${colors.reset}`);
  Object.entries(PLAYER_STATE_UPDATE_TESTS).forEach(([key, value]) => {
    displayTestObject(`🔄 ${key}:`, value, colors.blue);
  });
  
  console.log(`${colors.red}${colors.bright}🎪 TESTING SCENARIOS${colors.reset}`);
  Object.entries(TESTING_SCENARIOS).forEach(([key, value]) => {
    displayTestObject(`🎬 ${key}:`, value, colors.red);
  });
}

// 🚀 HTTP HELPER FUNCTIONS
export async function sendEventToInngest(event: any, baseUrl = 'http://localhost:3001') {
  try {
    const response = await fetch(`${baseUrl}/api/inngest`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(event)
    });
    
    const result = await response.text();
    console.log(`${colors.green}✅ Event sent successfully:${colors.reset}`, event.name);
    console.log(`${colors.cyan}Response:${colors.reset}`, result);
    return result;
  } catch (error) {
    console.error(`${colors.red}❌ Failed to send event:${colors.reset}`, error);
    throw error;
  }
}

export async function runTestScenario(scenarioName: keyof typeof TESTING_SCENARIOS, delay = 2000) {
  const scenario = TESTING_SCENARIOS[scenarioName];
  console.log(`${colors.bright}🎬 Running scenario: ${scenarioName}${colors.reset}`);
  
  for (let i = 0; i < scenario.length; i++) {
    const event = scenario[i];
    console.log(`${colors.cyan}Step ${i + 1}/${scenario.length}:${colors.reset} ${event.name}`);
    await sendEventToInngest(event);
    
    if (i < scenario.length - 1) {
      console.log(`${colors.yellow}⏳ Waiting ${delay}ms before next step...${colors.reset}`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  console.log(`${colors.green}🎉 Scenario ${scenarioName} completed!${colors.reset}`);
}

// 🎯 QUICK TEST FUNCTIONS
export const quickTests = {
  async initPlayer() {
    return sendEventToInngest(COMPLETE_EVENTS.playerInit);
  },
  
  async rollDice(roll: number = 6) {
    const event = {
      name: 'game.dice.roll',
      data: { ...DICE_ROLL_TESTS.startGameRoll, roll }
    };
    return sendEventToInngest(event);
  },
  
  async submitReport(content: string = 'Тестовый отчет') {
    const event = {
      name: 'game.report.submit', 
      data: { ...REPORT_SUBMIT_TESTS.shortReport, report: content }
    };
    return sendEventToInngest(event);
  },
  
  async updateState(updates: any) {
    const event = {
      name: 'game.player.state.update',
      data: { ...PLAYER_STATE_UPDATE_TESTS.updateMessage, updates }
    };
    return sendEventToInngest(event);
  }
};

// 📊 MAIN EXECUTION
// Проверяем, запущен ли файл напрямую (а не импортирован)
const isMainModule = process.argv[1]?.includes('test-inngest-events.ts');

if (isMainModule) {
  displayAllTests();
  
  console.log(`${colors.bright}🚀 USAGE EXAMPLES:${colors.reset}

${colors.cyan}// Import in your test files:${colors.reset}
import { COMPLETE_EVENTS, quickTests, runTestScenario } from './test-inngest-events';

${colors.cyan}// Quick testing:${colors.reset}
await quickTests.initPlayer();
await quickTests.rollDice(6);
await quickTests.submitReport('My reflection');

${colors.cyan}// Send specific events:${colors.reset}
await sendEventToInngest(COMPLETE_EVENTS.playerInit);

${colors.cyan}// Run full scenarios:${colors.reset}
await runTestScenario('newPlayerFlow');

${colors.yellow}📚 Run with: bun run scripts/test-inngest-events.ts${colors.reset}
`);
}

console.log(`${colors.green}${colors.bright}🕉️ "कर्मण्येवाधिकारस्ते मा फलेषु कदाचन"${colors.reset}`);
console.log(`${colors.green}Ready for testing! All test objects created successfully.${colors.reset}`); 
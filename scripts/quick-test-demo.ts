#!/usr/bin/env bun

/**
 * 🕉️ NeuroLeela Quick Test Demo
 * Практический пример использования тестовых объектов
 */

import { 
  COMPLETE_EVENTS,
  quickTests,
  runTestScenario,
  sendEventToInngest,
  DICE_ROLL_TESTS,
  REPORT_SUBMIT_TESTS
} from './test-inngest-events';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  magenta: '\x1b[35m'
};

console.log(`
╔══════════════════════════════════════════════════════════════╗
║               🕉️ NEUROLEELA QUICK TEST DEMO                ║
║          Practical examples of testing functions            ║
╚══════════════════════════════════════════════════════════════╝
`);

async function demo() {
  console.log(`${colors.cyan}${colors.bright}🚀 Starting Quick Test Demo...${colors.reset}\n`);

  try {
    // 1. Тест инициализации игрока
    console.log(`${colors.yellow}1️⃣ Testing Player Initialization...${colors.reset}`);
    await quickTests.initPlayer();
    await sleep(1000);

    // 2. Тест броска кубика
    console.log(`\n${colors.yellow}2️⃣ Testing Dice Roll (Starting with 6)...${colors.reset}`);
    await quickTests.rollDice(6);
    await sleep(1000);

    // 3. Тест обычного броска
    console.log(`\n${colors.yellow}3️⃣ Testing Normal Dice Roll (4)...${colors.reset}`);
    await quickTests.rollDice(4);
    await sleep(1000);

    // 4. Тест отправки отчета
    console.log(`\n${colors.yellow}4️⃣ Testing Report Submission...${colors.reset}`);
    await quickTests.submitReport('Тестовый отчет через demo скрипт');
    await sleep(1000);

    // 5. Тест обновления состояния
    console.log(`\n${colors.yellow}5️⃣ Testing State Update...${colors.reset}`);
    await quickTests.updateState({
      message: 'Обновлено через демо скрипт!',
      plan: 42
    });

    console.log(`\n${colors.green}${colors.bright}🎉 Quick Test Demo completed successfully!${colors.reset}`);

  } catch (error) {
    console.error(`${colors.red}❌ Demo failed:${colors.reset}`, error);
  }
}

async function advancedDemo() {
  console.log(`\n${colors.magenta}${colors.bright}🎪 Advanced Demo: Running Test Scenario...${colors.reset}`);
  
  try {
    // Запуск полного сценария нового игрока
    await runTestScenario('newPlayerFlow', 1500);
    
    console.log(`\n${colors.green}${colors.bright}🎊 Advanced Demo completed!${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}❌ Advanced demo failed:${colors.reset}`, error);
  }
}

async function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Главная функция
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
${colors.bright}🕉️ NeuroLeela Quick Test Demo Usage:${colors.reset}

${colors.cyan}Basic commands:${colors.reset}
  bun run scripts/quick-test-demo.ts              # Run basic demo
  bun run scripts/quick-test-demo.ts --advanced   # Run advanced demo  
  bun run scripts/quick-test-demo.ts --help       # Show this help

${colors.cyan}What it does:${colors.reset}
  ✅ Tests all 4 Inngest functions
  🎯 Uses pre-built test objects
  📊 Shows real-time results
  🔄 Demonstrates complete workflows

${colors.yellow}Note: Make sure Inngest server is running first!${colors.reset}
  Run: bun dev (in another terminal)
`);
    return;
  }

  if (args.includes('--advanced')) {
    await advancedDemo();
  } else {
    await demo();
  }
}

// Запуск
if (process.argv[1]?.includes('quick-test-demo.ts')) {
  main().catch(console.error);
}

export { demo, advancedDemo }; 
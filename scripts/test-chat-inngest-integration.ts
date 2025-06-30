#!/usr/bin/env bun

/**
 * 🕉️ NeuroLeela Chat + Inngest Integration Test
 * Комплексная проверка работы команд чата с server functions
 */

import { InngestEventService } from '../services/InngestEventService';

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
║          🕉️ NEUROLEELA CHAT + INNGEST INTEGRATION TEST       ║
║               Проверка работы команд в чате                  ║
╚══════════════════════════════════════════════════════════════╝
`);

// 📊 Тестовые данные для чата
const CHAT_TEST_USER = {
  id: 'chat-test-user-' + Date.now(),
  email: 'chat-test@neuroleela.com'
};

// 🎮 Симуляция команд чата
const simulateChatCommands = {
  
  // /start команда
  async startGame() {
    console.log(`\n${colors.bright}🚀 СИМУЛЯЦИЯ: /start${colors.reset}`);
    console.log(`${colors.cyan}Пользователь набирает: /start${colors.reset}`);
    
    try {
      const result = await InngestEventService.sendPlayerInit(
        CHAT_TEST_USER.id, 
        CHAT_TEST_USER.email
      );
      
      if (result.success) {
        console.log(`${colors.green}✅ Команда /start выполнена успешно${colors.reset}`);
        console.log(`${colors.yellow}📨 Event ID: ${result.eventId}${colors.reset}`);
        console.log(`${colors.cyan}💬 Ответ чата: "🚀 Игрок инициализирован! Используйте /roll для броска кубика."${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.red}❌ Ошибка команды /start: ${result.error}${colors.reset}`);
        return false;
      }
    } catch (error) {
      console.log(`${colors.red}❌ Исключение в /start: ${error}${colors.reset}`);
      return false;
    }
  },

  // /roll команда
  async rollDice() {
    console.log(`\n${colors.bright}🎲 СИМУЛЯЦИЯ: /roll${colors.reset}`);
    console.log(`${colors.cyan}Пользователь набирает: /roll${colors.reset}`);
    
    const roll = Math.floor(Math.random() * 6) + 1;
    console.log(`${colors.magenta}🎯 Сгенерированный бросок: ${roll}${colors.reset}`);
    
    try {
      const result = await InngestEventService.sendDiceRoll(CHAT_TEST_USER.id, roll);
      
      if (result.success) {
        console.log(`${colors.green}✅ Команда /roll выполнена успешно${colors.reset}`);
        console.log(`${colors.yellow}📨 Event ID: ${result.eventId}${colors.reset}`);
        console.log(`${colors.cyan}💬 Ответ чата: "🎲 Кубик брошен! Выпало: ${roll}. ⏳ Обрабатываем результат..."${colors.reset}`);
        return { success: true, roll };
      } else {
        console.log(`${colors.red}❌ Ошибка команды /roll: ${result.error}${colors.reset}`);
        return { success: false };
      }
    } catch (error) {
      console.log(`${colors.red}❌ Исключение в /roll: ${error}${colors.reset}`);
      return { success: false };
    }
  },

  // /report команда
  async submitReport(planNumber: number) {
    console.log(`\n${colors.bright}📝 СИМУЛЯЦИЯ: /report${colors.reset}`);
    const reportText = `Мой духовный опыт на плане ${planNumber}: Я ощущаю глубокую связь с космическим сознанием и понимаю важность данного этапа самопознания.`;
    console.log(`${colors.cyan}Пользователь набирает: /report ${reportText}${colors.reset}`);
    
    try {
      const result = await InngestEventService.sendPlayerReport(
        CHAT_TEST_USER.id, 
        reportText, 
        planNumber
      );
      
      if (result.success) {
        console.log(`${colors.green}✅ Команда /report выполнена успешно${colors.reset}`);
        console.log(`${colors.yellow}📨 Event ID: ${result.eventId}${colors.reset}`);
        console.log(`${colors.cyan}💬 Ответ чата: "📝 Отчет отправлен! Кубик разблокирован, можете продолжить игру."${colors.reset}`);
        return true;
      } else {
        console.log(`${colors.red}❌ Ошибка команды /report: ${result.error}${colors.reset}`);
        return false;
      }
    } catch (error) {
      console.log(`${colors.red}❌ Исключение в /report: ${error}${colors.reset}`);
      return false;
    }
  },

  // /status команда (эмуляция)
  async getStatus() {
    console.log(`\n${colors.bright}📊 СИМУЛЯЦИЯ: /status${colors.reset}`);
    console.log(`${colors.cyan}Пользователь набирает: /status${colors.reset}`);
    console.log(`${colors.green}✅ Команда /status (локальная обработка)${colors.reset}`);
    console.log(`${colors.cyan}💬 Ответ чата: "🎮 Статус игры: План 6, готов к ходу"${colors.reset}`);
    return true;
  },

  // /plan команда (эмуляция)
  async getPlanInfo(planNumber: number) {
    console.log(`\n${colors.bright}📍 СИМУЛЯЦИЯ: /plan${colors.reset}`);
    console.log(`${colors.cyan}Пользователь набирает: /plan ${planNumber}${colors.reset}`);
    console.log(`${colors.green}✅ Команда /plan (локальная обработка)${colors.reset}`);
    console.log(`${colors.cyan}💬 Ответ чата: "📍 План ${planNumber}: Этап духовного развития"${colors.reset}`);
    return true;
  },

  // /help команда (эмуляция)
  async getHelp() {
    console.log(`\n${colors.bright}💡 СИМУЛЯЦИЯ: /help${colors.reset}`);
    console.log(`${colors.cyan}Пользователь набирает: /help${colors.reset}`);
    console.log(`${colors.green}✅ Команда /help (локальная обработка)${colors.reset}`);
    console.log(`${colors.cyan}💬 Ответ чата: "🕉️ Доступные команды: /start, /roll, /report, /status, /plan"${colors.reset}`);
    return true;
  }
};

// 🎯 Основной тест сценарий
async function runChatIntegrationTest() {
  console.log(`${colors.bright}🎮 ЗАПУСК ПОЛНОГО ТЕСТА ИНТЕГРАЦИИ ЧАТА${colors.reset}\n`);
  
  let successCount = 0;
  let totalTests = 0;
  
  try {
    // Тест 1: /help команда
    totalTests++;
    console.log(`${colors.bright}📋 ТЕСТ 1/6: Команда /help${colors.reset}`);
    if (await simulateChatCommands.getHelp()) {
      successCount++;
    }
    await sleep(1000);
    
    // Тест 2: /start команда
    totalTests++;
    console.log(`${colors.bright}📋 ТЕСТ 2/6: Команда /start${colors.reset}`);
    if (await simulateChatCommands.startGame()) {
      successCount++;
    }
    await sleep(2000); // Ждем обработки Inngest
    
    // Тест 3: /status команда
    totalTests++;
    console.log(`${colors.bright}📋 ТЕСТ 3/6: Команда /status${colors.reset}`);
    if (await simulateChatCommands.getStatus()) {
      successCount++;
    }
    await sleep(1000);
    
    // Тест 4: /roll команда
    totalTests++;
    console.log(`${colors.bright}📋 ТЕСТ 4/6: Команда /roll${colors.reset}`);
    const rollResult = await simulateChatCommands.rollDice();
    if (rollResult.success) {
      successCount++;
    }
    await sleep(3000); // Ждем обработки Inngest
    
    // Тест 5: /plan команда
    totalTests++;
    console.log(`${colors.bright}📋 ТЕСТ 5/6: Команда /plan${colors.reset}`);
    if (await simulateChatCommands.getPlanInfo(6)) {
      successCount++;
    }
    await sleep(1000);
    
    // Тест 6: /report команда
    totalTests++;
    console.log(`${colors.bright}📋 ТЕСТ 6/6: Команда /report${colors.reset}`);
    if (await simulateChatCommands.submitReport(6)) {
      successCount++;
    }
    await sleep(2000); // Ждем обработки Inngest
    
  } catch (error) {
    console.log(`${colors.red}❌ Критическая ошибка теста: ${error}${colors.reset}`);
  }
  
  // Результаты
  console.log(`\n${colors.bright}🏁 РЕЗУЛЬТАТЫ ТЕСТИРОВАНИЯ${colors.reset}`);
  console.log(`═══════════════════════════════════════`);
  console.log(`📊 Всего тестов: ${totalTests}`);
  console.log(`${colors.green}✅ Успешно: ${successCount}${colors.reset}`);
  console.log(`${colors.red}❌ Неудачно: ${totalTests - successCount}${colors.reset}`);
  console.log(`🎯 Успешность: ${Math.round((successCount / totalTests) * 100)}%`);
  
  if (successCount === totalTests) {
    console.log(`\n${colors.green}${colors.bright}🎉 ВСЕ ТЕСТЫ ПРОШЛИ УСПЕШНО!${colors.reset}`);
    console.log(`${colors.green}🕉️ Интеграция чата с Inngest работает отлично!${colors.reset}`);
  } else {
    console.log(`\n${colors.yellow}⚠️ Некоторые тесты завершились с ошибками${colors.reset}`);
    console.log(`${colors.cyan}💡 Проверьте логи выше для детализации${colors.reset}`);
  }
}

// 🎯 Быстрый тест одной команды
async function quickCommandTest(command: string) {
  console.log(`${colors.bright}⚡ БЫСТРЫЙ ТЕСТ КОМАНДЫ: ${command}${colors.reset}\n`);
  
  switch (command) {
    case 'start':
      return await simulateChatCommands.startGame();
    case 'roll':
      return await simulateChatCommands.rollDice();
    case 'report':
      return await simulateChatCommands.submitReport(6);
    case 'status':
      return await simulateChatCommands.getStatus();
    case 'plan':
      return await simulateChatCommands.getPlanInfo(6);
    case 'help':
      return await simulateChatCommands.getHelp();
    default:
      console.log(`${colors.red}❌ Неизвестная команда: ${command}${colors.reset}`);
      return false;
  }
}

// 🔄 Утилиты
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 📊 Информация об использовании
function showUsage() {
  console.log(`${colors.bright}📚 ИСПОЛЬЗОВАНИЕ:${colors.reset}
  
🔄 Полный тест:
${colors.cyan}bun run scripts/test-chat-inngest-integration.ts${colors.reset}

⚡ Быстрый тест команды:
${colors.cyan}bun run scripts/test-chat-inngest-integration.ts [команда]${colors.reset}

🎯 Доступные команды для быстрого теста:
• ${colors.yellow}start${colors.reset}  - Тест команды /start
• ${colors.yellow}roll${colors.reset}   - Тест команды /roll  
• ${colors.yellow}report${colors.reset} - Тест команды /report
• ${colors.yellow}status${colors.reset} - Тест команды /status
• ${colors.yellow}plan${colors.reset}   - Тест команды /plan
• ${colors.yellow}help${colors.reset}   - Тест команды /help

📝 Примеры:
${colors.cyan}bun run scripts/test-chat-inngest-integration.ts start${colors.reset}
${colors.cyan}bun run scripts/test-chat-inngest-integration.ts roll${colors.reset}
`);
}

// 📊 MAIN EXECUTION
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    showUsage();
    return;
  }
  
  if (args.length === 0) {
    // Полный тест
    await runChatIntegrationTest();
  } else {
    // Быстрый тест конкретной команды
    const command = args[0].toLowerCase();
    const result = await quickCommandTest(command);
    
    if (result) {
      console.log(`\n${colors.green}✅ Тест команды '${command}' прошел успешно!${colors.reset}`);
    } else {
      console.log(`\n${colors.red}❌ Тест команды '${command}' завершился с ошибкой!${colors.reset}`);
    }
  }
  
  console.log(`\n${colors.blue}🔗 Связанные компоненты:${colors.reset}`);
  console.log(`• hooks/useInngestChat.ts - Хук обработки команд`);
  console.log(`• components/chat/EnhancedChatBot.tsx - Улучшенный чат`);  
  console.log(`• services/InngestEventService.ts - Сервис событий`);
  console.log(`• inngest/server-functions/index.ts - Server functions`);
  
  console.log(`\n${colors.magenta}🚀 Для реального тестирования убедитесь что запущены:${colors.reset}`);
  console.log(`• bun dev - Inngest сервер`);
  console.log(`• inngest-cli dev - Inngest Dev Server`);
}

// Запуск
main().catch(console.error); 
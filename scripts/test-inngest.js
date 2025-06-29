#!/usr/bin/env node

/**
 * Тестовый скрипт для проверки работы Inngest событий
 * Запуск: node scripts/test-inngest.js
 */

import { InngestEventService } from '../services/InngestEventService.js';

async function testInngestEvents() {
  console.log('🧪 [Test] Начинаем тестирование Inngest событий...');

  const testUserId = 'test-user-' + Date.now();
  const testRoll = Math.floor(Math.random() * 6) + 1;

  try {
    // Тест 1: Создание игрока
    console.log('🧪 [Test] 1. Тестируем создание игрока...');
    const playerResult = await InngestEventService.sendPlayerCreate(testUserId, 'test@example.com');
    console.log('🧪 [Test] Результат создания игрока:', playerResult);

    // Небольшая задержка
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Тест 2: Бросок кубика
    console.log('🧪 [Test] 2. Тестируем бросок кубика...');
    const diceResult = await InngestEventService.sendDiceRoll(testUserId, testRoll);
    console.log('🧪 [Test] Результат броска кубика:', diceResult);

    // Небольшая задержка
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Тест 3: Отправка отчета
    console.log('🧪 [Test] 3. Тестируем отправку отчета...');
    const reportResult = await InngestEventService.sendPlayerReport(
      testUserId, 
      'Тестовый отчет о духовном опыте', 
      6
    );
    console.log('🧪 [Test] Результат отправки отчета:', reportResult);

    console.log('✅ [Test] Все тесты завершены успешно!');

  } catch (error) {
    console.error('❌ [Test] Ошибка в тестах:', error);
    process.exit(1);
  }
}

// Запуск тестов
testInngestEvents(); 
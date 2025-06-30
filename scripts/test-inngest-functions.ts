#!/usr/bin/env bun

// Тестовый скрипт для проверки всех Inngest функций
import { Inngest } from 'inngest';

// Создаем клиент для отправки событий в локальный dev сервер
const inngestClient = new Inngest({ 
  id: 'test-client',
  // Настройки для dev сервера
  baseUrl: 'http://localhost:8288', // Inngest dev server
  fetch: fetch
});

async function testInngestFunctions() {
  console.log('🧪 Тестирование всех Inngest функций (локальный dev сервер)...\n');
  
  const testUserId = `test-player-${Date.now()}`;
  console.log(`👤 Тестовый игрок: ${testUserId}\n`);

  try {
    // ТЕСТ 1: Инициализация игрока
    console.log('1️⃣ Тестирование: initializePlayer');
    const initResult = await inngestClient.send({
      name: 'game.player.init',
      data: {
        userId: testUserId,
        email: 'test@neuroleela.com'
      }
    });
    console.log('✅ Событие инициализации отправлено:', initResult.ids);

    // Ждем обработки
    await new Promise(resolve => setTimeout(resolve, 2000));

    // ТЕСТ 2: Бросок кубика для начала игры
    console.log('\n2️⃣ Тестирование: processDiceRoll (начало)');
    const diceResult1 = await inngestClient.send({
      name: 'game.dice.roll',
      data: {
        userId: testUserId,
        roll: 6
      }
    });
    console.log('✅ Первый бросок отправлен:', diceResult1.ids);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ТЕСТ 3: Обычный бросок
    console.log('\n3️⃣ Тестирование: processDiceRoll (обычный ход)');
    const diceResult2 = await inngestClient.send({
      name: 'game.dice.roll',
      data: {
        userId: testUserId,
        roll: 4
      }
    });
    console.log('✅ Второй бросок отправлен:', diceResult2.ids);

    await new Promise(resolve => setTimeout(resolve, 3000));

    // ТЕСТ 4: Отправка отчета
    console.log('\n4️⃣ Тестирование: processReport');
    const reportResult = await inngestClient.send({
      name: 'game.report.submit',
      data: {
        userId: testUserId,
        planNumber: 10,
        report: 'Тестовый отчет для проверки функции processReport'
      }
    });
    console.log('✅ Отчет отправлен:', reportResult.ids);

    await new Promise(resolve => setTimeout(resolve, 2000));

    // ТЕСТ 5: Обновление состояния
    console.log('\n5️⃣ Тестирование: updatePlayerState');
    const updateResult = await inngestClient.send({
      name: 'game.player.state.update',
      data: {
        userId: testUserId,
        updates: {
          message: 'Состояние обновлено тестом'
        }
      }
    });
    console.log('✅ Обновление состояния отправлено:', updateResult.ids);

    console.log('\n🎉 ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ!');
    console.log('📋 Проверьте логи Inngest сервера для детальной информации');
    console.log('📋 Проверьте базу данных на наличие тестовых данных');
    
  } catch (error) {
    console.error('💥 Ошибка тестирования:', error);
    process.exit(1);
  }
}

testInngestFunctions().catch(console.error); 
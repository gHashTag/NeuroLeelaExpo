#!/usr/bin/env bun

// Простой тест Inngest функций через HTTP API
import { ServerPlayerService, ServerReportService } from '../inngest/server-config/database';

async function sendEvent(eventName: string, data: any) {
  const response = await fetch('http://localhost:8288/e/test', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      name: eventName,
      data: data,
    }),
  });
  
  if (!response.ok) {
    console.error(`❌ Ошибка отправки события ${eventName}:`, response.status, await response.text());
    return false;
  }
  
  const result = await response.text();
  console.log(`✅ Событие ${eventName} отправлено, ответ:`, result);
  return true;
}

async function testDirectAPI() {
  console.log('🧪 Тестирование Inngest функций через HTTP API...\n');
  
  const testUserId = `test-direct-${Date.now()}`;
  console.log(`👤 Тестовый игрок: ${testUserId}\n`);

  try {
    // ТЕСТ 1: Инициализация игрока
    console.log('1️⃣ Инициализация игрока...');
    const init = await sendEvent('game.player.init', {
      userId: testUserId,
      email: 'test@neuroleela.com'
    });
    
    if (init) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Проверяем в базе данных
      const player = await ServerPlayerService.getPlayer(testUserId);
      if (player) {
        console.log('✅ Игрок найден в БД:', {
          id: player.id,
          plan: player.plan,
          isFinished: player.isFinished
        });
      } else {
        console.log('⚠️ Игрок пока не найден в БД');
      }
    }

    // ТЕСТ 2: Бросок кубика
    console.log('\n2️⃣ Бросок кубика (6 для начала)...');
    const dice1 = await sendEvent('game.dice.roll', {
      userId: testUserId,
      roll: 6
    });
    
    if (dice1) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const playerAfterDice = await ServerPlayerService.getPlayer(testUserId);
      if (playerAfterDice) {
        console.log('✅ Состояние после броска:', {
          plan: playerAfterDice.plan,
          previous_plan: playerAfterDice.previous_plan,
          isFinished: playerAfterDice.isFinished,
          needsReport: playerAfterDice.needsReport
        });
      }
    }

    // ТЕСТ 3: Еще один бросок
    console.log('\n3️⃣ Второй бросок кубика (4)...');
    const dice2 = await sendEvent('game.dice.roll', {
      userId: testUserId,
      roll: 4
    });
    
    if (dice2) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const playerAfterSecond = await ServerPlayerService.getPlayer(testUserId);
      if (playerAfterSecond) {
        console.log('✅ Состояние после второго броска:', {
          plan: playerAfterSecond.plan,
          previous_plan: playerAfterSecond.previous_plan,
          needsReport: playerAfterSecond.needsReport
        });
        
        // ТЕСТ 4: Отчет (если нужен)
        if (playerAfterSecond.needsReport) {
          console.log('\n4️⃣ Отправка отчета...');
          const report = await sendEvent('game.report.submit', {
            userId: testUserId,
            planNumber: playerAfterSecond.plan,
            report: 'Тестовый отчет через HTTP API'
          });
          
          if (report) {
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Проверяем отчеты в БД
            const reports = await ServerReportService.getPlayerReports(testUserId);
            console.log(`✅ Найдено отчетов в БД: ${reports.length}`);
            
            const playerAfterReport = await ServerPlayerService.getPlayer(testUserId);
            if (playerAfterReport) {
              console.log('✅ needsReport после отчета:', playerAfterReport.needsReport);
            }
          }
        } else {
          console.log('ℹ️ Отчет не требуется');
        }
      }
    }

    // ТЕСТ 5: Обновление состояния
    console.log('\n5️⃣ Обновление состояния игрока...');
    const update = await sendEvent('game.player.state.update', {
      userId: testUserId,
      updates: {
        message: 'Тестовое сообщение через HTTP API'
      }
    });

    console.log('\n🎉 ВСЕ ТЕСТЫ ЗАВЕРШЕНЫ!');
    console.log('📊 Финальное состояние в БД:');
    
    const finalPlayer = await ServerPlayerService.getPlayer(testUserId);
    if (finalPlayer) {
      console.log({
        id: finalPlayer.id,
        plan: finalPlayer.plan,
        isFinished: finalPlayer.isFinished,
        needsReport: finalPlayer.needsReport,
        message: finalPlayer.message
      });
    }

    const finalReports = await ServerReportService.getPlayerReports(testUserId);
    console.log(`📋 Всего отчетов: ${finalReports.length}`);
    
  } catch (error) {
    console.error('💥 Ошибка тестирования:', error);
  }
}

testDirectAPI().catch(console.error); 
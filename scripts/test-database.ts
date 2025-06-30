#!/usr/bin/env bun

// Тестовый скрипт для проверки подключения к реальной базе данных Neon PostgreSQL
import { ServerPlayerService, ServerReportService, testServerDatabaseConnection, db, pgPool } from '../inngest/server-config/database';

async function main() {
  console.log('🔍 Тестирование подключения к базе данных Neon PostgreSQL...\n');

  // Шаг 1: Тест подключения
  console.log('1️⃣ Проверка подключения...');
  const isConnected = await testServerDatabaseConnection();
  if (!isConnected) {
    console.error('❌ Не удалось подключиться к базе данных!');
    process.exit(1);
  }

  // Шаг 2: Получить информацию о схеме БД
  console.log('\n2️⃣ Проверка структуры таблиц...');
  
  try {
    // Проверяем наличие таблиц через SQL запрос
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('players', 'reports', 'chat_history')
      ORDER BY table_name;
    `;
    
    const tablesResult = await pgPool.query(tablesQuery);
    const foundTables = tablesResult.rows.map(row => row.table_name);
    
    console.log('Найденные таблицы:', foundTables);
    console.log(`Таблица players: ${foundTables.includes('players') ? '✅ Найдена' : '❌ Отсутствует'}`);
    console.log(`Таблица reports: ${foundTables.includes('reports') ? '✅ Найдена' : '❌ Отсутствует'}`);
    console.log(`Таблица chat_history: ${foundTables.includes('chat_history') ? '✅ Найдена' : '❌ Отсутствует'}`);
  } catch (error) {
    console.error('⚠️ Ошибка проверки таблиц:', error);
  }

  // Шаг 3: Тест чтения существующих данных
  console.log('\n3️⃣ Проверка существующих данных...');
  
  try {
    const existingPlayers = await pgPool.query('SELECT id, plan, "isFinished" FROM players LIMIT 5');
    console.log(`✅ Найдено игроков: ${existingPlayers.rows.length}`);
    if (existingPlayers.rows.length > 0) {
      console.log('📋 Примеры игроков:');
      existingPlayers.rows.forEach(player => {
        console.log(`  - ID: ${player.id}, План: ${player.plan}, Завершено: ${player.isFinished}`);
      });
    }
  } catch (error) {
    console.error('❌ Ошибка чтения игроков:', error);
  }

  try {
    const existingReports = await pgPool.query('SELECT id, user_id, plan_number FROM reports LIMIT 5');
    console.log(`✅ Найдено отчетов: ${existingReports.rows.length}`);
    if (existingReports.rows.length > 0) {
      console.log('📋 Примеры отчетов:');
      existingReports.rows.forEach(report => {
        console.log(`  - ID: ${report.id}, Пользователь: ${report.user_id}, План: ${report.plan_number}`);
      });
    }
  } catch (error) {
    console.error('❌ Ошибка чтения отчетов:', error);
  }

  // Шаг 4: Тест создания тестового игрока
  console.log('\n4️⃣ Тестирование создания данных...');
  
  const testUserId = `test-user-${Date.now()}`;
  console.log(`Создание тестового игрока с ID: ${testUserId}`);
  
  const testPlayer = await ServerPlayerService.createPlayer({
    id: testUserId,
    plan: 1,
    previous_plan: 0,
    message: 'Тестовое сообщение от скрипта проверки БД',
    isStart: true,
    isFinished: false,
    consecutiveSixes: 0,
    positionBeforeThreeSixes: 0,
    needsReport: false,
  });

  if (!testPlayer) {
    console.error('❌ Не удалось создать тестового игрока!');
  } else {
    console.log('✅ Тестовый игрок создан:', testPlayer);
  }

  // Шаг 5: Тест создания тестового отчета
  if (testPlayer) {
    console.log('\n5️⃣ Тестирование создания отчета...');
    
    const testReport = await ServerReportService.saveReport({
      user_id: testUserId,
      plan_number: 1,
      content: 'Тестовый отчет от скрипта проверки БД. Проверяю сохранение в реальную базу данных Neon.',
      likes: 0,
      comments: 0,
    });

    if (!testReport) {
      console.error('❌ Не удалось создать тестовый отчет!');
    } else {
      console.log('✅ Тестовый отчет создан:', testReport);
    }
  }

  // Шаг 6: Проверка, что данные действительно сохранились
  console.log('\n6️⃣ Проверка сохранения данных...');
  
  const retrievedPlayer = await ServerPlayerService.getPlayer(testUserId);
  if (retrievedPlayer) {
    console.log('✅ Игрок найден в БД:', {
      id: retrievedPlayer.id,
      plan: retrievedPlayer.plan,
      message: retrievedPlayer.message,
      created_at: retrievedPlayer.created_at
    });
  } else {
    console.error('❌ Игрок не найден в БД!');
  }

  const retrievedReports = await ServerReportService.getPlayerReports(testUserId);
  if (retrievedReports.length > 0) {
    console.log('✅ Отчеты найдены в БД:', retrievedReports.length, 'шт.');
    retrievedReports.forEach(report => {
      console.log(`  - Отчет ID: ${report.id}, Содержимое: ${report.content?.substring(0, 50)}...`);
    });
  } else {
    console.error('❌ Отчеты не найдены в БД!');
  }

  // Шаг 7: Очистка тестовых данных (опционально)
  console.log('\n7️⃣ Очистка тестовых данных...');
  
  try {
    // Удаляем тестовые отчеты через SQL
    const deleteReportsResult = await pgPool.query('DELETE FROM reports WHERE user_id = $1', [testUserId]);
    console.log(`✅ Удалено тестовых отчетов: ${deleteReportsResult.rowCount}`);
  } catch (error) {
    console.error('⚠️ Ошибка удаления тестовых отчетов:', error);
  }

  try {
    // Удаляем тестового игрока через SQL
    const deletePlayerResult = await pgPool.query('DELETE FROM players WHERE id = $1', [testUserId]);
    console.log(`✅ Удалено тестовых игроков: ${deletePlayerResult.rowCount}`);
  } catch (error) {
    console.error('⚠️ Ошибка удаления тестового игрока:', error);
  }

  // Результат
  console.log('\n🎉 Тестирование базы данных завершено!');
  console.log('📊 Резюме:');
  console.log(`✅ Подключение к Neon PostgreSQL: ${isConnected ? 'Работает' : 'Не работает'}`);
  console.log(`✅ Создание игроков: ${testPlayer ? 'Работает' : 'Не работает'}`);
  console.log(`✅ Сохранение отчетов: ${retrievedReports.length > 0 ? 'Работает' : 'Не работает'}`);
  console.log(`✅ Чтение данных: ${retrievedPlayer ? 'Работает' : 'Не работает'}`);
  
  if (isConnected && testPlayer && retrievedPlayer && retrievedReports.length > 0) {
    console.log('\n🟢 ВСЕ ТЕСТЫ ПРОЙДЕНЫ! База данных Neon работает корректно.');
  } else {
    console.log('\n🔴 ЕСТЬ ПРОБЛЕМЫ! Проверьте конфигурацию базы данных.');
  }

  // Закрываем подключения
  await pgPool.end();
  console.log('🔐 Подключения к базе данных закрыты');
}

main().catch((error) => {
  console.error('💥 Критическая ошибка тестирования:', error);
  process.exit(1);
}); 
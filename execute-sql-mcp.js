// Этот скрипт предполагает, что у нас есть активное соединение с MCP Supabase
// и мы можем вызывать инструменты MCP API

const fetch = require('node-fetch');

// SQL-запрос для выполнения
const sql = `
  SELECT * FROM payments_v2 
  WHERE bot_username = 'Gaia_Kamskaia_bot' 
  ORDER BY created_at DESC;
`;

// Функция для вызова MCP API
async function executeSql() {
  try {
    // Выводим информацию о запросе
    console.log('Выполняем SQL-запрос через MCP API:');
    console.log(sql);
    
    // Вызываем MCP API для выполнения SQL
    const response = await fetch('http://localhost:54321/rest/v1/rpc/execute_sql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Используем сервисный ключ для аутентификации (требуется настроить в проекте)
        'apikey': process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dWtmcWNzZGhreXhlZ2Z3bGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMjY1MTE0MiwiZXhwIjoyMDI4MjI3MTQyfQ.1w71ZIIZbcKN534jqxQyKucyuTPOAVn_BowIVmKZ-sc',
      },
      body: JSON.stringify({
        query: sql
      })
    });
    
    // Проверяем ответ
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status} - ${errorText}`);
    }
    
    // Выводим результаты
    const data = await response.json();
    console.log('\nРезультаты запроса:');
    console.log(JSON.stringify(data, null, 2));
    
    // Анализируем результаты для формирования статистики
    if (data && data.length > 0) {
      // Подсчитываем платежи по типам подписок
      const stats = {};
      data.forEach(payment => {
        const subType = payment.subscription_type || 'unknown';
        if (!stats[subType]) {
          stats[subType] = { count: 0, total: 0 };
        }
        stats[subType].count++;
        stats[subType].total += payment.amount || 0;
      });
      
      console.log('\nСтатистика по подпискам:');
      console.log(JSON.stringify(stats, null, 2));
    }
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

// Выполняем запрос
executeSql(); 
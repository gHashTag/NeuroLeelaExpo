const { Pool } = require('pg');

// Получаем параметры подключения
const host = process.env.DB_HOST || 'db.yuukfqcsdhkyxegfwlcb.supabase.co';
const database = process.env.DB_NAME || 'postgres';
const user = process.env.DB_USER || 'postgres';
const password = process.env.DB_PASSWORD || process.argv[2]; // Пароль как аргумент командной строки
const port = process.env.DB_PORT || 5432;
const ssl = { rejectUnauthorized: false };

if (!password) {
  console.error('Необходимо указать пароль как аргумент командной строки или переменную окружения DB_PASSWORD');
  process.exit(1);
}

// Создаем пул соединений
const pool = new Pool({
  host,
  database,
  user,
  password,
  port,
  ssl
});

async function getPayments() {
  const client = await pool.connect();
  try {
    const result = await client.query(`
      SELECT * FROM payments_v2 
      WHERE bot_username = 'Gaia_Kamskaia_bot' 
      ORDER BY created_at DESC
    `);
    
    console.log(JSON.stringify(result.rows, null, 2));
    console.log(`Всего платежей: ${result.rowCount}`);
    
    // Посчитаем сумму платежей по типам подписок
    const subscriptionStats = await client.query(`
      SELECT subscription_type, COUNT(*) as count, SUM(amount) as total_amount
      FROM payments_v2 
      WHERE bot_username = 'Gaia_Kamskaia_bot' 
      GROUP BY subscription_type
    `);
    
    console.log("\nСтатистика по подпискам:");
    console.log(JSON.stringify(subscriptionStats.rows, null, 2));
    
  } catch (err) {
    console.error('Ошибка выполнения запроса:', err);
  } finally {
    client.release();
  }
}

getPayments().finally(() => pool.end()); 
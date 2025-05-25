const { createClient } = require('@supabase/supabase-js');

// Мы будем использовать знания о том, что у нас есть соединение через MCP
// URL и ключ Supabase можно получить из проекта
const supabaseUrl = 'https://yuukfqcsdhkyxegfwlcb.supabase.co';
// Используем публичный ключ (anon key) для аутентификации
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl1dWtmcWNzZGhreXhlZ2Z3bGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTI2NTExNDIsImV4cCI6MjAyODIyNzE0Mn0.AErPw_3cKzh4_wV1D8z5t5nhZqNlFPWZG1O1FrYlgUQ';

// Инициализация клиента Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function getPaymentsData() {
  try {
    console.log('Запрос данных о платежах бота Gaia_Kamskaia_bot...');
    
    // Проверим наличие таблицы payments_v2
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');
    
    if (tablesError) {
      console.log('Ошибка при получении списка таблиц:', tablesError);
    } else {
      console.log('Доступные таблицы:', tablesData.map(t => t.table_name).join(', '));
    }
    
    // Запрос к таблице payments_v2
    const { data: paymentsData, error: paymentsError } = await supabase
      .from('payments_v2')
      .select('*')
      .eq('bot_username', 'Gaia_Kamskaia_bot')
      .order('created_at', { ascending: false });
    
    if (paymentsError) {
      console.error('Ошибка при получении данных о платежах:', paymentsError);
      
      // Попробуем выполнить SQL запрос через RPC, если таблица payments_v2 есть 
      // но к ней нет доступа через API
      console.log('Пробуем выполнить запрос через RPC...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('get_payments_data', { 
        bot_name: 'Gaia_Kamskaia_bot'
      });
      
      if (rpcError) {
        console.error('Ошибка при выполнении RPC:', rpcError);
      } else {
        console.log('Данные о платежах (через RPC):', JSON.stringify(rpcData, null, 2));
        
        // Выводим статистику по подпискам, если есть данные
        if (rpcData && rpcData.length > 0) {
          const stats = {};
          rpcData.forEach(payment => {
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
      }
      return;
    }
    
    console.log('Данные о платежах:', JSON.stringify(paymentsData, null, 2));
    
    // Выводим статистику по подпискам, если есть данные
    if (paymentsData && paymentsData.length > 0) {
      const stats = {};
      paymentsData.forEach(payment => {
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
    console.error('Произошла ошибка:', error);
  }
}

getPaymentsData(); 
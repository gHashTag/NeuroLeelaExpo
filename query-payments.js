const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://yuukfqcsdhkyxegfwlcb.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || process.argv[2]; // Передаем ключ как аргумент, если нет в окружении

if (!supabaseKey) {
  console.error('Необходимо указать SUPABASE_KEY как переменную окружения или аргумент командной строки');
  process.exit(1);
}

// Инициализация клиента Supabase
const supabase = createClient(supabaseUrl, supabaseKey);

async function getPaymentsData() {
  try {
    // Выполняем SQL запрос к функции
    const { data, error } = await supabase.rpc('get_payments_for_bot', {
      bot_username_param: 'Gaia_Kamskaia_bot'
    });

    // Если функции нет, попробуем прямой SQL через supabase.from
    if (error && error.message.includes('function get_payments_for_bot() does not exist')) {
      console.log('Функция не существует, используем прямой запрос...');
      
      const { data: directData, error: directError } = await supabase
        .from('payments_v2')
        .select('*')
        .eq('bot_username', 'Gaia_Kamskaia_bot')
        .order('created_at', { ascending: false });
      
      if (directError) {
        throw directError;
      }
      
      console.log(JSON.stringify(directData, null, 2));
      return;
    }
    
    if (error) {
      throw error;
    }
    
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Ошибка:', error);
  }
}

getPaymentsData(); 
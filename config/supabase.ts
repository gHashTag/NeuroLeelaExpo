import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Переменная для хранения единственного экземпляра клиента
let supabaseInstance: SupabaseClient | null = null;

// Проверка наличия переменных окружения
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Функция для получения экземпляра Supabase клиента (реализация singleton паттерна)
export const getSupabaseClient = (): SupabaseClient => {
  if (!supabaseInstance) {
    console.log('DEBUG: Creating new Supabase client instance');
    
    // Создаем новый экземпляр клиента
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  }
  
  return supabaseInstance;
};

// Создаем и экспортируем клиент Supabase (инициализируем только один раз)
export const supabase: SupabaseClient = getSupabaseClient();

// Предотвращаем повторное создание экземпляра при повторном импорте модуля
Object.freeze(supabase);


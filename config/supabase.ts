import { createClient, SupabaseClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Переменная для хранения единственного экземпляра клиента
let supabaseInstance: SupabaseClient | null = null;

if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables. Check your .env file.');
}

// Отладочная информация
console.log('DEBUG: Attempting to read Supabase ENV vars');
console.log('DEBUG: Raw EXPO_PUBLIC_SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL);

// Initialize Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// Функция для получения экземпляра Supabase клиента (реализация singleton-паттерна)
export const getSupabaseClient = (): SupabaseClient => {
  // Если экземпляр еще не создан, создаем его
  if (!supabaseInstance) {
    console.log('DEBUG: Creating new Supabase client instance');
    supabaseInstance = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    });
  } else {
    console.log('DEBUG: Reusing existing Supabase client instance');
  }
  
  return supabaseInstance;
};

// Create and export the Supabase client (для обратной совместимости)
export const supabase = getSupabaseClient();


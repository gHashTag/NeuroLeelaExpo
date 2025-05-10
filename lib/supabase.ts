import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { AppState, Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

console.log("DEBUG: Attempting to read Supabase ENV vars");
console.log("DEBUG: Raw EXPO_PUBLIC_SUPABASE_URL:", process.env.EXPO_PUBLIC_SUPABASE_URL);
console.log("DEBUG: Raw EXPO_PUBLIC_SUPABASE_ANON_KEY:", process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Отсутствуют переменные окружения для Supabase:', {
    url: supabaseUrl ? '✅ Установлен' : '❌ Отсутствует',
    key: supabaseKey ? '✅ Установлен' : '❌ Отсутствует'
  });
  throw new Error('Missing Supabase environment variables');
}

// Состояние сети
let isNetworkConnected = true;
let isInternetReachable = true;

// Проверка сетевого подключения
NetInfo.addEventListener((state) => {
  isNetworkConnected = state.isConnected ?? false;
  isInternetReachable = state.isInternetReachable ?? false;
  
  console.log('🌐 Состояние сети:', {
    type: state.type,
    isConnected: isNetworkConnected,
    isInternetReachable: isInternetReachable
  });

  if (!isNetworkConnected || !isInternetReachable) {
    console.warn('⚠️ Проблемы с подключением к сети');
  }
});

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web'
  },
  global: {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      ...(Platform.OS === 'web' ? {
        'Access-Control-Allow-Origin': '*',
      } : {}),
    },
  },
  realtime: {
    params: {
      eventsPerSecond: 2,
    },
  },
});

// Мониторинг состояния авторизации
supabase.auth.onAuthStateChange((event, session) => {
  console.log('🔐 Изменение состояния авторизации:', event);
  if (session) {
    console.log('👤 Пользователь авторизован:', {
      id: session.user.id,
      email: session.user.email
    });
  } else {
    console.log('❌ Нет активной сессии');
  }
});

// Управление автообновлением токена
AppState.addEventListener('change', (state) => {
  if (state === 'active') {
    if (isNetworkConnected && isInternetReachable) {
      supabase.auth.startAutoRefresh();
      console.log('🔄 Автообновление токена запущено');
    } else {
      console.warn('⚠️ Автообновление токена не запущено из-за проблем с сетью');
    }
  } else {
    supabase.auth.stopAutoRefresh();
    console.log('⏹️ Автообновление токена остановлено');
  }
}); 
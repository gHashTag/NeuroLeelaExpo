import { Platform } from 'react-native';
import Constants from 'expo-constants';

console.log('🚀 Loading environment variables...');

const extra = Constants.expoConfig?.extra;

if (!extra) {
  console.error('❌ No environment variables found in expo config!');
  throw new Error('Environment variables not loaded');
}

console.log('✅ Environment variables loaded successfully');

// Clean and validate JWT token
const cleanJwtToken = (token: string | undefined) => {
  if (!token) {
    console.error('❌ JWT token is missing!');
    throw new Error('JWT token is required');
  }
  return token.trim();
};

(() => {
  const jwt = extra.pinataJwt;
  if (jwt) {
    console.log(`ℹ️ JWT token length: ${jwt.length}`);
    console.log(`ℹ️ JWT token first 50 chars: ${jwt.substring(0, 50)}...`);
    console.log('✅ JWT token loaded and cleaned');
  }
})();

// Log Pinata keys status
console.log(`ℹ️ Pinata API Key: ${extra.pinataApiKey ? '✅ Set' : '❌ Missing'}`);
console.log(`ℹ️ Pinata Secret Key: ${extra.pinataSecretKey ? '✅ Set' : '❌ Missing'}`);
console.log(`ℹ️ Pinata Gateway URL: ${extra.pinataGatewayUrl ? '✅ Set' : '❌ Missing'}`);

export const PINATA = {
  JWT: cleanJwtToken(extra.pinataJwt),
  GATEWAY_URL: extra.pinataGatewayUrl || 'https://gateway.pinata.cloud/ipfs/',
  API_KEY: extra.pinataApiKey,
  SECRET_KEY: extra.pinataSecretKey
};

export const SUPABASE = {
  URL: extra.supabaseUrl,
  SERVICE_KEY: extra.supabaseServiceKey
};

export * from "./colors";
export * from "./dimensions";

// Debug environment variables
console.log('🔍 Загрузка переменных окружения...');
console.log('📦 process.env:', process.env);

// Pinata configuration
const rawJWT = process.env.EXPO_PUBLIC_PINATA_JWT || '';
console.log('🔍 Raw JWT токен:', {
  value: rawJWT.substring(0, 20) + '...',
  length: rawJWT.length,
  type: typeof rawJWT,
  isEmpty: !rawJWT,
  hasNewlines: rawJWT.includes('\n'),
  hasCarriageReturns: rawJWT.includes('\r')
});

// Функция для очистки JWT токена
const cleanJWT = (token: string): string => {
  console.log('🔍 Начинаем очистку JWT токена');
  console.log('📝 Исходная длина:', token.length);
  
  // Сначала пробуем простую очистку
  const simpleClean = token
    .replace(/\\n/g, '')     // Удаляем экранированные переносы
    .replace(/[\n\r]/g, '')  // Удаляем обычные переносы
    .replace(/\s+/g, '')     // Удаляем пробельные символы
    .trim();                 // Удаляем пробелы в начале и конце

  // Если простая очистка не сработала, используем более агрессивный метод
  if (!simpleClean || simpleClean.split('.').length !== 3) {
    console.log('⚠️ Простая очистка не помогла, пробуем агрессивную очистку');
    return token.split('').filter(char => {
      const code = char.charCodeAt(0);
      return code > 32 || char === '.';  // Оставляем только печатные символы и точки
    }).join('');
  }

  return simpleClean;
};

// Функция для валидации JWT токена
const validateJWT = (token: string): boolean => {
  console.log('🔍 Валидация JWT токена');
  console.log('📝 Проверяемый токен:', {
    value: token.substring(0, 20) + '...',
    length: token.length,
    parts: token.split('.').length
  });
  
  if (!token) {
    console.error('❌ Токен пустой');
    return false;
  }
  
  const parts = token.split('.');
  console.log('📝 Части токена:', parts.map(p => ({ length: p.length })));
  
  if (parts.length !== 3) {
    console.error('❌ JWT токен должен содержать 3 части');
    return false;
  }
  
  // Проверяем каждую часть на валидность base64
  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];
    
    if (!part) {
      console.error(`❌ Часть ${i + 1} пустая`);
      return false;
    }
    
    try {
      // Подготавливаем строку для декодирования
      const prepared = part
        .replace(/-/g, '+')
        .replace(/_/g, '/');
      
      // Добавляем padding если необходимо
      const padding = prepared.length % 4;
      const padded = padding ? prepared + '='.repeat(4 - padding) : prepared;
      
      const decoded = atob(padded);
      console.log(`✅ Часть ${i + 1} декодирована:`, {
        originalLength: part.length,
        preparedLength: prepared.length,
        paddedLength: padded.length,
        decodedLength: decoded.length
      });
      
      if (i === 1) { // Проверяем payload
        const payload = JSON.parse(decoded);
        console.log('✅ Payload валиден:', {
          keys: Object.keys(payload),
          size: JSON.stringify(payload).length
        });
      }
    } catch (error) {
      console.error(`❌ Ошибка декодирования части ${i + 1}:`, error);
      return false;
    }
  }
  
  return true;
};

// Обработка JWT токена
const cleanedJWT = cleanJWT(rawJWT);
console.log('🔍 JWT токен после очистки:', {
  value: cleanedJWT.substring(0, 20) + '...',
  length: cleanedJWT.length,
  parts: cleanedJWT.split('.').length
});

export const PINATA_JWT = (() => {
  console.log('🔑 Проверяем EXPO_PUBLIC_PINATA_JWT');
  const jwt = process.env.EXPO_PUBLIC_PINATA_JWT;
  
  if (!jwt) {
    console.error('❌ EXPO_PUBLIC_PINATA_JWT отсутствует в process.env');
    return null;
  }

  console.log('📝 Длина JWT токена:', jwt.length);
  console.log('📝 Первые 50 символов JWT:', jwt.substring(0, 50));

  // Очищаем токен от всех пробельных символов
  const cleanedJwt = jwt
    .replace(/\s+/g, '')
    .replace(/\\n/g, '')
    .replace(/\n/g, '')
    .replace(/\r/g, '');

  console.log('📝 Длина очищенного JWT:', cleanedJwt.length);
  console.log('📝 Первые 50 символов очищенного JWT:', cleanedJwt.substring(0, 50));

  return cleanedJwt;
})();

export const PINATA_API_KEY = process.env.EXPO_PUBLIC_PINATA_API_KEY || '';
export const PINATA_SECRET_KEY = process.env.EXPO_PUBLIC_PINATA_SECRET_KEY || '';
export const PINATA_GATEWAY_URL = process.env.EXPO_PUBLIC_PINATA_GATEWAY_URL || '';
if (!PINATA_GATEWAY_URL) {
  console.error('❌ Отсутствует PINATA_GATEWAY_URL');
}

// Логируем все ключи для проверки
console.log('🔐 Ключи Pinata:');
console.log('- API Key:', PINATA_API_KEY ? '✅ Установлен' : '❌ Отсутствует');
console.log('- Secret Key:', PINATA_SECRET_KEY ? '✅ Установлен' : '❌ Отсутствует');
console.log('- Gateway URL:', PINATA_GATEWAY_URL ? '✅ Установлен' : '❌ Отсутствует');
console.log('- JWT:', PINATA_JWT ? '✅ Установлен' : '❌ Отсутствует');

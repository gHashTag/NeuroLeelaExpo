import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from '@/db/schema';

// Настройка для веб-клиента
neonConfig.fetchConnectionCache = true;

// Строка подключения для Neon
// Формат: postgresql://[user]:[password]@[hostname]/[database]
// Эту строку нужно взять из консоли Neon.tech (Connection Details)
const connectionString = process.env.EXPO_PUBLIC_DATABASE_URL!

// Маскируем пароль в логах для отладки
const maskedConnectionString = connectionString.replace(/postgresql:\/\/([^:]+):([^@]+)@/, 'postgresql://$1:***@');
console.log('Attempting to connect to Neon with connection string:', maskedConnectionString);

// Создаем SQL-клиент
const sql = neon(connectionString);

// Создаём Drizzle клиент с нашей схемой
export const neonDb = drizzle(sql, { schema });

// Типизация для экспорта
export type NeonDatabase = typeof neonDb; 
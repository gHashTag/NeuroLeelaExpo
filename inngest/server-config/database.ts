// Серверная конфигурация базы данных для Neon PostgreSQL
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { players, reports, chatHistory, type Player, type NewPlayer, type Report, type NewReport } from '../../db/schema';
import { eq } from 'drizzle-orm';

// Получаем переменные среды для Neon
const databaseUrl = process.env.EXPO_PUBLIC_DATABASE_URL;

if (!databaseUrl) {
  throw new Error(`
    ❌ Ошибка конфигурации Neon PostgreSQL:
    - DATABASE_URL: ${databaseUrl ? '✅' : '❌ не найден'}
    
    Убедитесь, что переменная EXPO_PUBLIC_DATABASE_URL настроена правильно.
  `);
}

console.log('🔗 Подключение к Neon PostgreSQL:', databaseUrl.replace(/:[^:]*@/, ':***@'));

// Создаем пул подключений PostgreSQL для Neon
export const pgPool = new Pool({
  connectionString: databaseUrl,
  ssl: {
    rejectUnauthorized: false, // Neon требует SSL
  },
  max: 10, // максимум соединений в пуле
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Создаем Drizzle ORM клиент
export const db = drizzle(pgPool);

// Экспортируем типы из схемы для использования в сервере
export type ServerPlayer = Player;
export type ServerNewPlayer = NewPlayer;
export type ServerReport = Report;
export type ServerNewReport = NewReport;

// Утилиты для работы с игроками через Drizzle ORM
export class ServerPlayerService {
  // Получить игрока по ID
  static async getPlayer(userId: string): Promise<ServerPlayer | null> {
    try {
      const result = await db.select().from(players).where(eq(players.id, userId)).limit(1);
      
      if (result.length === 0) {
        console.log(`[NeonDB] Игрок ${userId} не найден`);
        return null;
      }

      console.log(`[NeonDB] Игрок ${userId} найден`);
      return result[0];
    } catch (error) {
      console.error(`[NeonDB] Ошибка получения игрока ${userId}:`, error);
      return null;
    }
  }

  // Создать нового игрока
  static async createPlayer(playerData: ServerNewPlayer): Promise<ServerPlayer | null> {
    try {
      const result = await db.insert(players).values(playerData).returning();
      
      if (result.length === 0) {
        console.error(`[NeonDB] Не удалось создать игрока`);
        return null;
      }

      console.log(`[NeonDB] Игрок создан:`, result[0]);
      return result[0];
    } catch (error) {
      console.error(`[NeonDB] Ошибка создания игрока:`, error);
      return null;
    }
  }

  // Обновить игрока
  static async updatePlayer(userId: string, updates: Partial<ServerNewPlayer>): Promise<boolean> {
    try {
      const result = await db.update(players)
        .set(updates)
        .where(eq(players.id, userId))
        .returning();

      if (result.length === 0) {
        console.error(`[NeonDB] Игрок ${userId} не найден для обновления`);
        return false;
      }

      console.log(`[NeonDB] Игрок ${userId} обновлен:`, updates);
      return true;
    } catch (error) {
      console.error(`[NeonDB] Ошибка обновления игрока ${userId}:`, error);
      return false;
    }
  }
}

// Утилиты для работы с отчетами через Drizzle ORM
export class ServerReportService {
  // Сохранить отчет
  static async saveReport(reportData: ServerNewReport): Promise<ServerReport | null> {
    try {
      const result = await db.insert(reports).values(reportData).returning();
      
      if (result.length === 0) {
        console.error(`[NeonDB] Не удалось сохранить отчет`);
        return null;
      }

      console.log(`[NeonDB] Отчет сохранен:`, result[0]);
      return result[0];
    } catch (error) {
      console.error(`[NeonDB] Ошибка сохранения отчета:`, error);
      return null;
    }
  }

  // Получить отчеты игрока
  static async getPlayerReports(userId: string): Promise<ServerReport[]> {
    try {
      const result = await db.select().from(reports).where(eq(reports.user_id, userId));
      
      console.log(`[NeonDB] Найдено отчетов для ${userId}: ${result.length}`);
      return result;
    } catch (error) {
      console.error(`[NeonDB] Ошибка получения отчетов для ${userId}:`, error);
      return [];
    }
  }
}

// Тестовая функция подключения к Neon
export async function testServerDatabaseConnection(): Promise<boolean> {
  try {
    console.log(`[NeonDB] Тестирование подключения к Neon PostgreSQL...`);
    
    // Простой запрос для проверки подключения
    const result = await db.select().from(players).limit(1);

    console.log(`[NeonDB] ✅ Подключение к Neon PostgreSQL успешно!`);
    console.log(`[NeonDB] ✅ Найдено игроков в таблице: ${result.length >= 0 ? 'Таблица доступна' : 'Таблица пуста'}`);
    return true;
  } catch (err) {
    console.error(`[NeonDB] ❌ Критическая ошибка подключения к Neon:`, err);
    return false;
  }
}

// Функция для закрытия подключений (для graceful shutdown)
export async function closeDatabaseConnections(): Promise<void> {
  try {
    await pgPool.end();
    console.log('[NeonDB] 🔐 Подключения к базе данных закрыты');
  } catch (error) {
    console.error('[NeonDB] ⚠️ Ошибка при закрытии подключений:', error);
  }
} 
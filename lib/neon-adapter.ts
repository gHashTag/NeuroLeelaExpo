import { Player } from '@/db/schema';
import { neonDb } from './neon-client';
import { eq } from 'drizzle-orm';
import * as schema from '@/db/schema';

// Адаптер для работы с данными через Neon + Drizzle
// Эмулирует тот же интерфейс, что и DrizzleAdapter
export class NeonAdapter {
  // Метод для выбора данных
  async select(userId: string): Promise<Player | null> {
    try {
      console.log('NeonAdapter: Selecting player data for user', userId);
      const result = await neonDb.select().from(schema.players).where(eq(schema.players.id, userId));
      console.log('NeonAdapter: Select result', result);
      
      if (result.length === 0) {
        return null;
      }
      
      return result[0] as Player;
    } catch (error) {
      console.error('NeonAdapter: Error selecting data:', error);
      throw error;
    }
  }
  
  // Метод для создания новой записи
  async insert(data: Partial<Player>): Promise<void> {
    try {
      console.log('NeonAdapter: Inserting player data', data);
      
      // Убедимся, что id существует (требуется по типу)
      if (!data.id) {
        throw new Error('NeonAdapter: Cannot insert player without id');
      }
      
      // Используем необходимые поля явно
      await neonDb.insert(schema.players).values({
        id: data.id,
        plan: data.plan || 1,
        previous_plan: data.previous_plan || 0,
        message: data.message || null,
        avatar: data.avatar || null,
        fullName: data.fullName || null,
        intention: data.intention || null,
        isStart: data.isStart || false,
        isFinished: data.isFinished || false,
        consecutiveSixes: data.consecutiveSixes || 0,
        positionBeforeThreeSixes: data.positionBeforeThreeSixes || 0
      });
      
      console.log('NeonAdapter: Insert successful');
    } catch (error) {
      console.error('NeonAdapter: Error inserting data:', error);
      throw error;
    }
  }
  
  // Метод для обновления записи
  async update(userId: string, data: Partial<Player>): Promise<void> {
    try {
      console.log('NeonAdapter: Updating player data for user', userId, data);
      await neonDb.update(schema.players)
        .set(data)
        .where(eq(schema.players.id, userId));
      console.log('NeonAdapter: Update successful');
    } catch (error) {
      console.error('NeonAdapter: Error updating data:', error);
      throw error;
    }
  }
  
  // Метод для удаления записи
  async delete(userId: string): Promise<void> {
    try {
      console.log('NeonAdapter: Deleting player data for user', userId);
      await neonDb.delete(schema.players)
        .where(eq(schema.players.id, userId));
      console.log('NeonAdapter: Delete successful');
    } catch (error) {
      console.error('NeonAdapter: Error deleting data:', error);
      throw error;
    }
  }
  
  // Метод для получения всех записей
  async selectAll(): Promise<Player[]> {
    try {
      console.log('NeonAdapter: Selecting all players');
      const result = await neonDb.select().from(schema.players);
      console.log('NeonAdapter: SelectAll result length:', result.length);
      return result as Player[];
    } catch (error) {
      console.error('NeonAdapter: Error selecting all data:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр адаптера
export const neonAdapter = new NeonAdapter(); 
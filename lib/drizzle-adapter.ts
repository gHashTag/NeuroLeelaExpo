import { supabase } from '@/config/supabase';
import { players, Player } from '@/db/schema';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

// Адаптер для работы с данными через Supabase REST API
// Эмулирует интерфейс Drizzle ORM, но использует Supabase вместо прямого подключения к PostgreSQL
export class DrizzleAdapter {
  // Метод для выбора данных
  async select(userId: string): Promise<Player | null> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Запись не найдена
          return null;
        }
        console.error('Ошибка при запросе данных:', error);
        throw error;
      }
      
      return data as Player;
    } catch (error) {
      console.error('Ошибка при выборе данных:', error);
      throw error;
    }
  }
  
  // Метод для создания новой записи
  async insert(data: Partial<Player>): Promise<void> {
    try {
      const { error } = await supabase
        .from('players')
        .insert(data);
      
      if (error) {
        console.error('Ошибка при вставке данных:', error);
        throw error;
      }
    } catch (error) {
      console.error('Ошибка при вставке данных:', error);
      throw error;
    }
  }
  
  // Метод для обновления записи
  async update(userId: string, data: Partial<Player>): Promise<void> {
    try {
      const { error } = await supabase
        .from('players')
        .update(data)
        .eq('id', userId);
      
      if (error) {
        console.error('Ошибка при обновлении данных:', error);
        throw error;
      }
    } catch (error) {
      console.error('Ошибка при обновлении данных:', error);
      throw error;
    }
  }
  
  // Метод для удаления записи
  async delete(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('players')
        .delete()
        .eq('id', userId);
      
      if (error) {
        console.error('Ошибка при удалении данных:', error);
        throw error;
      }
    } catch (error) {
      console.error('Ошибка при удалении данных:', error);
      throw error;
    }
  }
  
  // Метод для получения всех записей
  async selectAll(): Promise<Player[]> {
    try {
      const { data, error } = await supabase
        .from('players')
        .select('*');
      
      if (error) {
        console.error('Ошибка при запросе всех данных:', error);
        throw error;
      }
      
      return data as Player[];
    } catch (error) {
      console.error('Ошибка при выборе всех данных:', error);
      throw error;
    }
  }
}

// Создаем и экспортируем экземпляр адаптера
export const drizzleAdapter = new DrizzleAdapter(); 
import { ApolloClient, InMemoryCache, makeVar } from '@apollo/client';
import { Player } from '@/db/schema';
import { supabase } from '@/config/supabase';
// import { neonAdapter } from './neon-adapter';

// Создаем реактивные переменные для хранения состояния
export const currentPlayerVar = makeVar<Player | null>(null);
export const isLoadingVar = makeVar<boolean>(true);
export const errorVar = makeVar<string | null>(null);

// Ключ для localStorage
const PLAYER_STORAGE_KEY = 'neuroleela_player_data';

// Функция для сохранения данных игрока в localStorage
const savePlayerToStorage = (playerData: Player) => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(playerData));
      console.log('[Apollo] Данные игрока сохранены в localStorage');
    }
  } catch (error) {
    console.error('[Apollo] Ошибка при сохранении в localStorage:', error);
  }
};

// Функция для загрузки данных игрока из localStorage
const loadPlayerFromStorage = (userId: string): Player | null => {
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
      if (stored) {
        const playerData = JSON.parse(stored);
        if (playerData.id === userId) {
          console.log('[Apollo] Данные игрока загружены из localStorage:', playerData);
          return playerData;
        }
      }
    }
  } catch (error) {
    console.error('[Apollo] Ошибка при загрузке из localStorage:', error);
  }
  return null;
};

// Функция для загрузки данных игрока из Supabase
export const loadPlayerData = async (userId: string) => {
  try {
    isLoadingVar(true);
    errorVar(null);
    
    console.log('[Apollo] Загрузка данных игрока для userId:', userId);
    
    // Сначала пытаемся загрузить из localStorage
    const storedPlayer = loadPlayerFromStorage(userId);
    if (storedPlayer) {
      currentPlayerVar(storedPlayer);
      console.log('[Apollo] Используем данные из localStorage');
      return;
    }
    
    // Если в localStorage нет данных, пытаемся загрузить из Supabase
    try {
      const { data: playerData, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows found
        throw error;
      }
      
      let finalPlayerData;
      
      if (!playerData) {
        // Если игрок не найден, создаем нового с начальными данными
        console.log('[Apollo] Игрок не найден, создаем нового с начальными данными');
        
        finalPlayerData = {
          id: userId,
          plan: 68, // Начинаем с позиции победы (68)
          previous_plan: 0,
          message: 'Бросьте 6 чтобы начать путь самопознания',
          avatar: null,
          fullName: null,
          intention: null,
          isStart: false,
          isFinished: true, // Устанавливаем в true, чтобы активировать логику "нужна 6 для старта"
          consecutiveSixes: 0,
          positionBeforeThreeSixes: 0
        };
        
        // Пытаемся сохранить нового игрока в Supabase
        try {
          const { data: createdPlayer, error: createError } = await supabase
            .from('players')
            .insert([finalPlayerData])
            .select()
            .single();
          
          if (!createError && createdPlayer) {
            finalPlayerData = createdPlayer;
            console.log('[Apollo] Новый игрок создан в Supabase:', createdPlayer);
          }
        } catch (createError) {
          console.log('[Apollo] Не удалось создать игрока в Supabase, используем локальные данные');
        }
      } else {
        finalPlayerData = playerData;
        console.log('[Apollo] Данные игрока загружены из Supabase:', playerData);
      }
      
      currentPlayerVar(finalPlayerData as Player);
      savePlayerToStorage(finalPlayerData as Player);
      
    } catch (supabaseError) {
      console.log('[Apollo] Supabase недоступен, используем начальные данные');
      
      // Создаем начальные данные
      const initialPlayerData = {
        id: userId,
        plan: 68,
        previous_plan: 0,
        message: 'Бросьте 6 чтобы начать путь самопознания',
        avatar: null,
        fullName: null,
        intention: null,
        isStart: false,
        isFinished: true,
        consecutiveSixes: 0,
        positionBeforeThreeSixes: 0
      };
      
      currentPlayerVar(initialPlayerData as Player);
      savePlayerToStorage(initialPlayerData as Player);
    }
    
  } catch (error) {
    console.error('[Apollo] Критическая ошибка при загрузке данных игрока:', error);
    errorVar('Ошибка загрузки данных игрока');
  } finally {
    isLoadingVar(false);
  }
};

// Функция для обновления данных игрока
export const updatePlayerInStorage = (updatedPlayer: Player) => {
  currentPlayerVar(updatedPlayer);
  savePlayerToStorage(updatedPlayer);
};

// Функция для обновления позиции игрока
export const updatePlayerPosition = async (userId: string, newPosition: number) => {
  try {
    isLoadingVar(true);
    errorVar(null);
    
    const currentPlayer = currentPlayerVar();
    if (!currentPlayer) {
      throw new Error('Игрок не найден');
    }
    
    const oldPosition = currentPlayer.plan;
    
    // ВРЕМЕННО: Только обновляем локальное состояние без Neon
    console.log(`[Apollo] Обновление позиции игрока с ${oldPosition} на ${newPosition} для userId:`, userId);
    
    // Обращаем внимание, что флаг isFinished обновляется отдельно в компоненте
    // через параметр, а здесь мы просто обновляем позицию
    currentPlayerVar({
      ...currentPlayer,
      plan: newPosition,
      previous_plan: oldPosition,
    });
    
    console.log('[Apollo] Позиция игрока обновлена:', currentPlayerVar());
  } catch (error) {
    console.error('[Apollo] Ошибка при обновлении позиции:', error);
    errorVar('Не удалось обновить позицию игрока');
  } finally {
    isLoadingVar(false);
  }
};

// Создаем Apollo клиент
export const apolloClient = new ApolloClient({
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          currentPlayer: {
            read() {
              return currentPlayerVar();
            }
          },
          isLoading: {
            read() {
              return isLoadingVar();
            }
          },
          error: {
            read() {
              return errorVar();
            }
          }
        }
      }
    }
  }),
  // Мы не используем URL, так как работаем с локальными данными
  uri: 'http://localhost:4000' // Это будет игнорироваться, так как мы не делаем сетевых запросов
}); 
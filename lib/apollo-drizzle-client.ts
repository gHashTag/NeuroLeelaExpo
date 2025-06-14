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
    console.log('[Apollo] loadPlayerFromStorage: НАЧАЛО для userId:', userId);
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(PLAYER_STORAGE_KEY);
      console.log('[Apollo] loadPlayerFromStorage: Данные из localStorage:', stored);
      if (stored) {
        const playerData = JSON.parse(stored);
        console.log('[Apollo] loadPlayerFromStorage: Распарсенные данные:', playerData);
        console.log('[Apollo] loadPlayerFromStorage: playerData.id:', playerData.id, 'userId:', userId);
        if (playerData.id === userId) {
          console.log('[Apollo] Данные игрока загружены из localStorage:', playerData);
          return playerData;
        } else {
          console.log('[Apollo] loadPlayerFromStorage: ID не совпадает');
        }
      } else {
        console.log('[Apollo] loadPlayerFromStorage: localStorage пуст');
      }
    } else {
      console.log('[Apollo] loadPlayerFromStorage: window не определен');
    }
  } catch (error) {
    console.error('[Apollo] Ошибка при загрузке из localStorage:', error);
  }
  return null;
};

// Функция для загрузки данных игрока из Supabase
export const loadPlayerData = async (userId: string) => {
  try {
    console.log('[Apollo] loadPlayerData: НАЧАЛО ФУНКЦИИ для userId:', userId);
    isLoadingVar(true);
    errorVar(null);
    
    console.log('[Apollo] Загрузка данных игрока для userId:', userId);
    
    // Сначала пытаемся загрузить из localStorage
    const storedPlayer = loadPlayerFromStorage(userId);
    if (storedPlayer) {
      console.log('[Apollo] loadPlayerData: Данные найдены в localStorage:', storedPlayer);
      currentPlayerVar(storedPlayer);
      console.log('[Apollo] Используем данные из localStorage');
      isLoadingVar(false); // Добавляем сброс флага загрузки
      return;
    } else {
      console.log('[Apollo] loadPlayerData: Данные НЕ найдены в localStorage');
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
          positionBeforeThreeSixes: 0,
          needsReport: false // Изначально отчет не нужен
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
        positionBeforeThreeSixes: 0,
        needsReport: false // Изначально отчет не нужен
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
  console.log('[Apollo] updatePlayerInStorage вызвана с данными:', updatedPlayer);
  currentPlayerVar(updatedPlayer);
  savePlayerToStorage(updatedPlayer);
  console.log('[Apollo] Состояние обновлено в Apollo и localStorage');
};

// Централизованная функция для обновления состояния игрока
export const updatePlayerState = (updates: Partial<Player>) => {
  console.log('🔥 [Apollo] updatePlayerState: === НАЧАЛО ФУНКЦИИ ===');
  console.log('🔥 [Apollo] updatePlayerState: входящие updates =', updates);
  
  const currentPlayer = currentPlayerVar();
  console.log('🔥 [Apollo] updatePlayerState: currentPlayer ДО обновления =', currentPlayer);
  
  if (!currentPlayer) {
    console.error('🔥 [Apollo] updatePlayerState: ОШИБКА - Игрок не найден!');
    return;
  }
  
  const updatedPlayer = {
    ...currentPlayer,
    ...updates
  };
  
  console.log('🔥 [Apollo] updatePlayerState: updatedPlayer (результат слияния) =', updatedPlayer);
  console.log('🔥 [Apollo] updatePlayerState: КЛЮЧЕВЫЕ ИЗМЕНЕНИЯ:');
  console.log('🔥 [Apollo] updatePlayerState: plan:', currentPlayer.plan, '->', updatedPlayer.plan);
  console.log('🔥 [Apollo] updatePlayerState: previous_plan:', currentPlayer.previous_plan, '->', updatedPlayer.previous_plan);
  console.log('🔥 [Apollo] updatePlayerState: isFinished:', currentPlayer.isFinished, '->', updatedPlayer.isFinished);
  console.log('🔥 [Apollo] updatePlayerState: needsReport:', currentPlayer.needsReport, '->', updatedPlayer.needsReport);
  
  // Обновляем реактивную переменную
  console.log('🔥 [Apollo] updatePlayerState: ВЫЗЫВАЕМ currentPlayerVar(updatedPlayer)...');
  currentPlayerVar(updatedPlayer);
  console.log('🔥 [Apollo] updatePlayerState: currentPlayerVar обновлена');
  
  // Сохраняем в localStorage
  console.log('🔥 [Apollo] updatePlayerState: СОХРАНЯЕМ в localStorage...');
  savePlayerToStorage(updatedPlayer);
  console.log('🔥 [Apollo] updatePlayerState: данные сохранены в localStorage');
  
  // Проверяем, что обновление прошло успешно
  const verifyPlayer = currentPlayerVar();
  console.log('🔥 [Apollo] updatePlayerState: ПРОВЕРКА - новое состояние currentPlayerVar() =', verifyPlayer);
  console.log('🔥 [Apollo] updatePlayerState: ПРОВЕРКА - план изменился?', verifyPlayer?.plan === updatedPlayer.plan ? '✅ ДА' : '❌ НЕТ');
  console.log('🔥 [Apollo] updatePlayerState: === КОНЕЦ ФУНКЦИИ ===');
};

// Функция для отметки о завершении отчета
export const markReportCompleted = async (userId: string) => {
  try {
    console.log('💫 [Apollo] markReportCompleted: === НАЧАЛО ФУНКЦИИ ===');
    console.log('💫 [Apollo] markReportCompleted: userId =', userId);
    
    // Проверяем текущее состояние ДО изменения
    const playerBefore = currentPlayerVar();
    console.log('💫 [Apollo] markReportCompleted: состояние ДО изменения =', playerBefore);
    console.log('💫 [Apollo] markReportCompleted: needsReport ДО =', playerBefore?.needsReport);
    
    // Сначала обновляем локальное состояние (быстро)
    console.log('💫 [Apollo] markReportCompleted: ВЫЗЫВАЕМ updatePlayerState({ needsReport: false })...');
    updatePlayerState({ needsReport: false });
    
    // Проверяем состояние ПОСЛЕ локального изменения
    const playerAfter = currentPlayerVar();
    console.log('💫 [Apollo] markReportCompleted: состояние ПОСЛЕ локального изменения =', playerAfter);
    console.log('💫 [Apollo] markReportCompleted: needsReport ПОСЛЕ =', playerAfter?.needsReport);
    console.log('💫 [Apollo] markReportCompleted: изменение успешно?', playerAfter?.needsReport === false ? '✅ ДА' : '❌ НЕТ');
    
    console.log('💫 [Apollo] markReportCompleted: Локальное состояние обновлено: needsReport = false');
    
    // Пытаемся обновить в Supabase с таймаутом
    try {
      console.log('💫 [Apollo] markReportCompleted: Пытаемся обновить Supabase...');
      const supabaseUpdatePromise = supabase
        .from('players')
        .update({ needsReport: false })
        .eq('id', userId);
      
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Supabase timeout')), 2000);
      });
      
      await Promise.race([supabaseUpdatePromise, timeoutPromise]);
      console.log('💫 [Apollo] markReportCompleted: needsReport успешно сброшен в Supabase');
      
    } catch (supabaseError) {
      console.log('💫 [Apollo] markReportCompleted: Supabase недоступен или медленный, используем только локальное состояние');
      console.log('💫 [Apollo] markReportCompleted: Ошибка Supabase:', supabaseError);
    }
    
    console.log('💫 [Apollo] markReportCompleted: === КОНЕЦ ФУНКЦИИ ===');
    
  } catch (error) {
    console.error('💫 [Apollo] markReportCompleted: КРИТИЧЕСКАЯ ОШИБКА:', error);
    // Не выбрасываем ошибку, так как локальное состояние уже обновлено
  }
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

// Функция для сброса игрока с проблемной позиции (временное решение)
export const resetPlayerFromStuckPosition = () => {
  const currentPlayer = currentPlayerVar();
  if (!currentPlayer) {
    console.error('[Apollo] resetPlayerFromStuckPosition: Игрок не найден');
    return;
  }
  
  console.log('[Apollo] resetPlayerFromStuckPosition: Сбрасываем игрока с позиции', currentPlayer.plan);
  
  // Сбрасываем на начальную позицию игры
  const resetPlayer = {
    ...currentPlayer,
    plan: 68, // Возвращаем на стартовую позицию
    previous_plan: currentPlayer.plan,
    isFinished: true, // Игра завершена, нужно бросить 6 для старта
    consecutiveSixes: 0,
    positionBeforeThreeSixes: 0,
    needsReport: false,
    message: 'Игрок сброшен. Бросьте 6 чтобы начать заново!'
  };
  
  currentPlayerVar(resetPlayer);
  savePlayerToStorage(resetPlayer);
  console.log('[Apollo] Игрок сброшен на начальную позицию:', resetPlayer);
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
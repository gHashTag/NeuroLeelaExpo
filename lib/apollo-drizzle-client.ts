import { ApolloClient, InMemoryCache, makeVar } from '@apollo/client';
import { Player } from '@/db/schema';
// import { neonAdapter } from './neon-adapter';

// Создаем реактивные переменные для хранения состояния
export const currentPlayerVar = makeVar<Player | null>(null);
export const isLoadingVar = makeVar<boolean>(true);
export const errorVar = makeVar<string | null>(null);

// Функция для загрузки данных игрока из Neon через наш адаптер
export const loadPlayerData = async (userId: string) => {
  try {
    isLoadingVar(true);
    errorVar(null);
    
    // ВРЕМЕННО: Используем мок-данные вместо Neon
    console.log('[Apollo] Загрузка данных игрока для userId:', userId);
    
    const mockPlayerData = {
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
    
    currentPlayerVar(mockPlayerData as Player);
    console.log('[Apollo] Данные игрока загружены:', mockPlayerData);
  } catch (error) {
    console.error('[Apollo] Ошибка при загрузке данных игрока:', error);
    errorVar('Не удалось загрузить данные игрока');
  } finally {
    isLoadingVar(false);
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
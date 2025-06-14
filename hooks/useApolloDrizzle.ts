import { useReactiveVar } from '@apollo/client';
import { currentPlayerVar, isLoadingVar, errorVar, loadPlayerData, updatePlayerPosition } from '@/lib/apollo-drizzle-client';
import { useEffect, useRef } from 'react';
import { useSupabase } from '@/context/supabase-provider';
import { Player } from '@/db/schema';

export const useApolloDrizzle = () => {
  const { user } = useSupabase();
  const currentPlayer = useReactiveVar(currentPlayerVar);
  const isLoading = useReactiveVar(isLoadingVar);
  const error = useReactiveVar(errorVar);
  const isMounted = useRef(true);

  // Добавляем логирование для диагностики
  console.log('�� [useApolloDrizzle] Хук вызван, текущее состояние:');
  console.log('🔄 [useApolloDrizzle] user:', user);
  console.log('🔄 [useApolloDrizzle] currentPlayer:', currentPlayer);
  console.log('🔄 [useApolloDrizzle] isLoading:', isLoading);
  console.log('🔄 [useApolloDrizzle] error:', error);

  // Отслеживаем изменения currentPlayer
  useEffect(() => {
    console.log('🔥 [useApolloDrizzle] currentPlayer ИЗМЕНИЛСЯ!');
    console.log('🔥 [useApolloDrizzle] Новое значение currentPlayer:', currentPlayer);
    if (currentPlayer) {
      console.log('🔥 [useApolloDrizzle] План игрока:', currentPlayer.plan);
      console.log('🔥 [useApolloDrizzle] isFinished:', currentPlayer.isFinished);
      console.log('🔥 [useApolloDrizzle] needsReport:', currentPlayer.needsReport);
    }
  }, [currentPlayer]);

  // Устанавливаем флаг размонтирования
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Загружаем данные игрока при входе пользователя
  useEffect(() => {
    let isSubscribed = true;
    
    if (user) {
      console.log('🔄 [useApolloDrizzle] Пользователь найден, загружаем данные для:', user.id);
      const fetchData = async () => {
        try {
          await loadPlayerData(user.id);
        } catch (error) {
          console.error('Error loading player data:', error);
          // Только если компонент все еще смонтирован
          if (isSubscribed && isMounted.current) {
            errorVar(error instanceof Error ? error.message : 'Ошибка загрузки данных');
          }
        }
      };
      
      fetchData();
    } else {
      console.log('🔄 [useApolloDrizzle] Пользователь НЕ найден, создаем тестового пользователя');
      // Временное решение: создаем тестового пользователя для демонстрации
      const testUserId = 'test-user-demo';
      const fetchData = async () => {
        try {
          await loadPlayerData(testUserId);
        } catch (error) {
          console.error('Error loading test player data:', error);
          if (isSubscribed && isMounted.current) {
            errorVar(error instanceof Error ? error.message : 'Ошибка загрузки тестовых данных');
          }
        }
      };
      
      fetchData();
    }
    
    return () => {
      isSubscribed = false;
    };
  }, [user]);

  // Функция для обновления позиции игрока
  const movePlayer = async (newPosition: number, isFinishedFlag?: boolean) => {
    if (!isMounted.current) return;
    
    try {
      const currentPlayer = currentPlayerVar();
      if (!currentPlayer) {
        console.error('[Apollo Drizzle] Игрок не найден при попытке обновить позицию');
        return;
      }
      
      const oldPosition = currentPlayer.plan;
      const previousIsFinished = currentPlayer.isFinished;
      
      // Определяем значение isFinished:
      // 1. Если явно передан параметр isFinishedFlag, используем его
      // 2. В противном случае оставляем текущее значение
      const newIsFinished = isFinishedFlag !== undefined ? isFinishedFlag : previousIsFinished;
      
      console.log(`[Apollo Drizzle] Обновление локального состояния: позиция ${oldPosition} -> ${newPosition}, isFinished ${previousIsFinished} -> ${newIsFinished}`);
      
      // ВАЖНО: НЕ вызываем updatePlayerPosition здесь, так как GameService уже обновил Supabase
      // Только обновляем локальное состояние Apollo
      
      // Обновляем локальное состояние с флагом isFinished
      const updatedPlayer = {...currentPlayer};
      updatedPlayer.plan = newPosition;
      updatedPlayer.previous_plan = oldPosition;
      updatedPlayer.isFinished = newIsFinished;
      
      // Обновляем сообщение в зависимости от состояния игры
      if (newPosition === 68 && newIsFinished) {
        updatedPlayer.message = 'Победа! 🕉 Бросьте 6, чтобы начать заново';
      } else if (newIsFinished) {
        updatedPlayer.message = 'Бросьте 6 чтобы начать путь самопознания';
      } else {
        updatedPlayer.message = 'Игра продолжается...';
      }
      
      currentPlayerVar(updatedPlayer);
      console.log('[Apollo Drizzle] Локальное состояние обновлено:', updatedPlayer);
    } catch (error) {
      console.error('[Apollo Drizzle] Ошибка при обновлении локального состояния:', error);
      // Только если компонент все еще смонтирован
      if (isMounted.current) {
        errorVar(error instanceof Error ? error.message : 'Ошибка обновления позиции');
      }
    }
  };

  // Функция для полного обновления состояния игрока
  const updatePlayerState = (updates: Partial<Player>) => {
    if (!isMounted.current) return;
    
    try {
      const currentPlayer = currentPlayerVar();
      if (!currentPlayer) {
        console.error('[Apollo Drizzle] Игрок не найден при попытке обновить состояние');
        return;
      }
      
      console.log('[Apollo Drizzle] Полное обновление состояния игрока:', updates);
      
      // Создаем обновленного игрока с новыми данными
      const updatedPlayer = { ...currentPlayer, ...updates };
      
      currentPlayerVar(updatedPlayer);
      console.log('[Apollo Drizzle] Состояние игрока полностью обновлено:', updatedPlayer);
    } catch (error) {
      console.error('[Apollo Drizzle] Ошибка при полном обновлении состояния:', error);
      if (isMounted.current) {
        errorVar(error instanceof Error ? error.message : 'Ошибка обновления состояния');
      }
    }
  };

  return {
    currentPlayer,
    isLoading,
    error,
    movePlayer,
    updatePlayerState,
    loadPlayer: () => {
      if (user && isMounted.current) {
        return loadPlayerData(user.id);
      }
      return Promise.resolve();
    }
  };
}; 
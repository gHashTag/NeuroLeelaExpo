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
    }
    
    return () => {
      isSubscribed = false;
    };
  }, [user]);

  // Функция для обновления позиции игрока
  const movePlayer = async (newPosition: number) => {
    if (!user || !isMounted.current) return;
    
    try {
      await updatePlayerPosition(user.id, newPosition);
    } catch (error) {
      console.error('Error updating player position:', error);
      // Только если компонент все еще смонтирован
      if (isMounted.current) {
        errorVar(error instanceof Error ? error.message : 'Ошибка обновления позиции');
      }
    }
  };

  return {
    currentPlayer,
    isLoading,
    error,
    movePlayer,
    loadPlayer: () => {
      if (user && isMounted.current) {
        return loadPlayerData(user.id);
      }
      return Promise.resolve();
    }
  };
}; 
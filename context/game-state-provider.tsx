import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/config/supabase';
import { useSupabase } from './supabase-provider';

interface GamePlayer {
  id: string;
  plan: number;
  avatar?: any;
  fullName?: string;
  intention?: string;
  previousPlan?: number;
  isStart?: boolean;
  isFinished?: boolean;
  consecutiveSixes?: number;
  positionBeforeThreeSixes?: number;
  message?: string;
}

interface GameStateContextProps {
  currentPlayer: GamePlayer;
  setCurrentPlayer: (player: GamePlayer) => void;
  loading: boolean;
  updatePlayerPosition: (newPosition: number) => Promise<void>;
}

const defaultContext: GameStateContextProps = {
  currentPlayer: {
    id: '',
    plan: 1, // Начинаем с первой позиции
  },
  setCurrentPlayer: () => {},
  loading: true,
  updatePlayerPosition: async () => {},
};

export const GameStateContext = createContext<GameStateContextProps>(defaultContext);

export const useGameState = () => useContext(GameStateContext);

export const GameStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSupabase();
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer>(defaultContext.currentPlayer);
  const [loading, setLoading] = useState(true);

  // Загрузка текущего состояния игрока из базы данных
  useEffect(() => {
    if (user) {
      loadPlayerState();
    }
  }, [user]);

  const loadPlayerState = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Проверяем наличие записи игрока
      const { data, error } = await supabase
        .from('game_state')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          // Запись не найдена, создаем начальное состояние
          await createInitialPlayerState();
          
          // Устанавливаем начальное состояние
          setCurrentPlayer({
            id: user.id,
            plan: 1,
          });
        } else {
          console.error('Ошибка при загрузке состояния игры:', error);
        }
      } else if (data) {
        // Устанавливаем состояние из базы данных
        setCurrentPlayer({
          id: user.id,
          plan: data.position || 1,
          previousPlan: data.previous_position,
          message: data.message,
        });
      }
    } catch (error) {
      console.error('Ошибка при загрузке состояния игры:', error);
    } finally {
      setLoading(false);
    }
  };

  const createInitialPlayerState = async () => {
    if (!user) return;
    
    try {
      await supabase
        .from('game_state')
        .insert({
          user_id: user.id,
          position: 1,
          previous_position: 0,
          message: 'Начало пути'
        });
    } catch (error) {
      console.error('Ошибка при создании начального состояния:', error);
    }
  };

  const updatePlayerPosition = async (newPosition: number) => {
    if (!user) return;
    
    try {
      const oldPosition = currentPlayer.plan;
      
      // Обновляем состояние в базе данных
      const { error } = await supabase
        .from('game_state')
        .update({
          position: newPosition,
          previous_position: oldPosition,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Ошибка при обновлении позиции:', error);
        return;
      }
      
      // Обновляем локальное состояние
      setCurrentPlayer({
        ...currentPlayer,
        plan: newPosition,
        previousPlan: oldPosition
      });
    } catch (error) {
      console.error('Ошибка при обновлении позиции:', error);
    }
  };

  return (
    <GameStateContext.Provider
      value={{
        currentPlayer,
        setCurrentPlayer,
        loading,
        updatePlayerPosition
      }}
    >
      {children}
    </GameStateContext.Provider>
  );
}; 
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSupabase } from './supabase-provider';
// import { neonAdapter } from '@/lib/neon-adapter';

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

export const GameStateProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useSupabase();
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer>(defaultContext.currentPlayer);
  const [loading, setLoading] = useState(true);
  const isMountedRef = useRef(false);
  
  if (!isMountedRef.current) {
    console.log('GameStateProvider mounted');
    isMountedRef.current = true;
  }

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
      console.log('Loading player state for user:', user.id);
      
      // ВРЕМЕННО: Используем моковые данные вместо Neon
      const mockPlayerData = {
        id: user.id,
        plan: 1,
        previous_plan: 0,
        message: 'Начало пути'
      };
      
      console.log('Using mock player data:', mockPlayerData);
      
      setCurrentPlayer({
        id: user.id,
        plan: 1,
        message: 'Начало пути'
      });
      
    } catch (error) {
      console.error('Ошибка при загрузке состояния игры:', error);
    } finally {
      setLoading(false);
    }
  };

  const updatePlayerPosition = async (newPosition: number) => {
    if (!user) return;
    
    try {
      const oldPosition = currentPlayer.plan;
      console.log(`Updating player position from ${oldPosition} to ${newPosition}`);
      
      // ВРЕМЕННО: Только обновляем локальное состояние без Neon
      
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
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useSupabase } from './supabase-provider';
import { Player } from '@/db/schema';
import { drizzleAdapter } from '@/lib/drizzle-adapter';

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
      
      // Используем адаптер для доступа к данным
      const playerData = await drizzleAdapter.select(user.id);
      
      if (!playerData) {
        console.log('Player not found, creating initial state');
        // Создаем начальное состояние, если запись не найдена
        await drizzleAdapter.insert({
          id: user.id,
          plan: 1,
          previous_plan: 0,
          message: 'Начало пути'
        });
        
        // Загружаем созданного игрока
        const newPlayerData = await drizzleAdapter.select(user.id);
        
        if (newPlayerData) {
          setCurrentPlayer({
            id: user.id,
            plan: 1,
            message: 'Начало пути'
          });
        }
      } else {
        console.log('Player found:', playerData);
        // Устанавливаем состояние из базы данных
        setCurrentPlayer({
          id: user.id,
          plan: playerData.plan || 1,
          previousPlan: playerData.previous_plan !== null ? playerData.previous_plan : undefined,
          message: playerData.message || undefined,
          fullName: playerData.fullName || undefined,
          avatar: playerData.avatar || undefined,
          intention: playerData.intention || undefined,
          isStart: playerData.isStart !== null ? playerData.isStart : undefined,
          isFinished: playerData.isFinished !== null ? playerData.isFinished : undefined,
          consecutiveSixes: playerData.consecutiveSixes !== null ? playerData.consecutiveSixes : undefined,
          positionBeforeThreeSixes: playerData.positionBeforeThreeSixes !== null ? playerData.positionBeforeThreeSixes : undefined,
        });
      }
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
      
      // Используем адаптер для обновления данных
      await drizzleAdapter.update(user.id, {
        plan: newPosition,
        previous_plan: oldPosition,
        updated_at: new Date()
      });
      
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
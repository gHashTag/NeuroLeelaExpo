import React, { useEffect } from 'react';
import { useGameState } from '@/context/game-state-provider';
import { 
  currentPlayerPositionVar,
  loadingStateVar
} from '@/lib/apollo-client';

/**
 * Этот компонент синхронизирует состояние React Context с Apollo Client реактивными переменными.
 * Он должен быть размещен внутри GameStateProvider и ApolloProvider.
 */
export const ApolloStateInitializer: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const gameState = useGameState();

  // Безопасно проверяем наличие данных
  const currentPlayer = gameState?.currentPlayer;
  const loading = gameState?.loading ?? true;

  // Один эффект для обновления всех реактивных переменных
  useEffect(() => {
    // Защита от undefined
    if (currentPlayer && typeof currentPlayer.plan === 'number') {
      // Устанавливаем начальную позицию игрока из контекста в Apollo
      currentPlayerPositionVar(currentPlayer.plan);
      
      // Устанавливаем начальное состояние загрузки из контекста в Apollo
      loadingStateVar(loading);
      
      console.log('Apollo reactive variables initialized with GameState data:', { 
        position: currentPlayer.plan,
        loading
      });
    }
  }, [currentPlayer, loading]);

  return children ? <>{children}</> : null;
};

/**
 * Вспомогательная функция для синхронизации данных между обычным React состоянием 
 * и Apollo Client реактивными переменными.
 */
export const syncGameStateWithApollo = (player: any, isLoading: boolean) => {
  if (player && typeof player.plan === 'number') {
    currentPlayerPositionVar(player.plan);
  }
  loadingStateVar(isLoading);
}; 
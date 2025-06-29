import { Inngest } from 'inngest';

// Создаем Inngest клиент для NeuroLeela игры
export const inngest = new Inngest({ 
  id: 'neuroleela-game',
  name: 'NeuroLeela Game Engine'
});

// Типы событий для игры
export interface GameEvents {
  'game.dice.roll': {
    data: {
      userId: string;
      roll: number;
      timestamp: number;
    }
  };
  
  'game.report.submit': {
    data: {
      userId: string;
      report: string;
      planNumber: number;
      timestamp: number;
    }
  };
  
  'game.player.create': {
    data: {
      userId: string;
      email?: string;
      timestamp: number;
    }
  };
  
  'game.player.state.update': {
    data: {
      userId: string;
      updates: {
        plan?: number;
        previous_plan?: number;
        isFinished?: boolean;
        needsReport?: boolean;
        message?: string;
        consecutiveSixes?: number;
        positionBeforeThreeSixes?: number;
      };
      timestamp: number;
    }
  };
} 
import { inngest } from '../client';
import { supabase } from '@/config/supabase';
import { currentPlayerVar } from '@/lib/apollo-drizzle-client';

// Inngest функция для обновления состояния игрока в Apollo Client
export const updatePlayerState = inngest.createFunction(
  { 
    id: 'update-player-state',
    name: 'Обновление состояния игрока в Apollo'
  },
  { event: 'game.player.state.update' },
  async ({ event, step }) => {
    const { userId, updates } = event.data;
    
    console.log(`[Inngest] updatePlayerState: userId=${userId}, updates=`, updates);

    // Обновляем Apollo реактивную переменную
    await step.run('update-apollo-state', async () => {
      try {
        const currentPlayer = currentPlayerVar();
        
        if (!currentPlayer) {
          console.log(`[Inngest] currentPlayer не найден в Apollo, загружаем из Supabase`);
          
          // Загружаем актуальное состояние из Supabase
          const { data: player, error } = await supabase
            .from('players')
            .select('*')
            .eq('id', userId)
            .single();

          if (!error && player) {
            console.log(`[Inngest] Игрок загружен из Supabase:`, player);
            currentPlayerVar(player);
          } else {
            console.error(`[Inngest] Ошибка загрузки игрока из Supabase:`, error);
            return;
          }
        } else {
          // Обновляем существующего игрока
          const updatedPlayer = {
            ...currentPlayer,
            ...updates
          };
          
          console.log(`[Inngest] Обновляем Apollo состояние:`, updatedPlayer);
          currentPlayerVar(updatedPlayer);
        }

        console.log(`[Inngest] Apollo состояние обновлено успешно`);
      } catch (error) {
        console.error(`[Inngest] Ошибка обновления Apollo состояния:`, error);
        throw error;
      }
    });

    return {
      success: true,
      userId,
      updatesApplied: updates
    };
  }
);

// Inngest функция для инициализации нового игрока
export const initializePlayer = inngest.createFunction(
  { 
    id: 'initialize-player',
    name: 'Инициализация нового игрока'
  },
  { event: 'game.player.create' },
  async ({ event, step }) => {
    const { userId, email } = event.data;
    
    console.log(`[Inngest] initializePlayer: userId=${userId}, email=${email}`);

    // Шаг 1: Проверка существования игрока
    const existingPlayer = await step.run('check-existing-player', async () => {
      const { data: player, error } = await supabase
        .from('players')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && player) {
        console.log(`[Inngest] Игрок уже существует:`, player);
        return player;
      }

      return null;
    });

    if (existingPlayer) {
      // Игрок уже существует, просто обновляем Apollo состояние
      await step.sendEvent('send-state-update', {
        name: 'game.player.state.update',
        data: {
          userId,
          updates: existingPlayer,
          timestamp: Date.now()
        }
      });

      return {
        success: true,
        userId,
        playerCreated: false,
        existingPlayer: true
      };
    }

    // Шаг 2: Создание нового игрока
    const newPlayer = await step.run('create-new-player', async () => {
      const playerData = {
        id: userId,
        plan: 68, // Начинаем с финальной позиции
        previous_plan: 0,
        message: 'Бросьте 6 чтобы начать путь самопознания',
        avatar: null,
        fullName: null,
        intention: null,
        isStart: false,
        isFinished: true, // Игра не активна, ждем 6 для старта
        consecutiveSixes: 0,
        positionBeforeThreeSixes: 0,
        needsReport: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const { data: createdPlayer, error } = await supabase
        .from('players')
        .insert([playerData])
        .select()
        .single();

      if (error) {
        console.error(`[Inngest] Ошибка создания игрока:`, error);
        throw new Error(`Ошибка создания игрока: ${error.message}`);
      }

      console.log(`[Inngest] Новый игрок создан:`, createdPlayer);
      return createdPlayer;
    });

    // Шаг 3: Обновление Apollo состояния
    await step.sendEvent('send-state-update', {
      name: 'game.player.state.update',
      data: {
        userId,
        updates: newPlayer,
        timestamp: Date.now()
      }
    });

    console.log(`[Inngest] initializePlayer завершена для ${userId}`);
    
    return {
      success: true,
      userId,
      playerCreated: true,
      newPlayer: newPlayer
    };
  }
); 
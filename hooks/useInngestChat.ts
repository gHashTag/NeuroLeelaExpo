import { useState, useEffect, useCallback } from 'react';
import { InngestEventService } from '@/services/InngestEventService';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { useSupabase } from '@/context/supabase-provider';

export interface ChatCommand {
  command: string;
  description: string;
  handler: (args: string[]) => Promise<ChatCommandResult>;
  allowedStates?: ('needsReport' | 'canRoll' | 'gameFinished' | 'waitingToStart')[];
}

export interface ChatCommandResult {
  success: boolean;
  message: string;
  data?: any;
  nextAction?: 'waitForReport' | 'enableDice' | 'showPlan' | 'gameComplete';
}

export interface ChatGameUpdate {
  type: 'diceResult' | 'reportSubmitted' | 'playerStateChanged' | 'gameComplete';
  data: any;
  timestamp: number;
}

export const useInngestChat = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<ChatGameUpdate | null>(null);
  const [gameUpdates, setGameUpdates] = useState<ChatGameUpdate[]>([]);
  
  const { currentPlayer, updatePlayerState } = useApolloDrizzle();
  const { user } = useSupabase();

  // 🎲 Команда: Бросить кубик
  const rollDiceCommand = useCallback(async (args: string[]): Promise<ChatCommandResult> => {
    if (!user?.id) {
      return { success: false, message: '❌ Необходима авторизация для броска кубика' };
    }

    if (currentPlayer?.needsReport) {
      return { 
        success: false, 
        message: `📝 Сначала напишите отчет о плане ${currentPlayer.plan}` 
      };
    }

    try {
      setIsProcessing(true);
      
      // Генерируем случайное число от 1 до 6
      const roll = Math.floor(Math.random() * 6) + 1;
      
      console.log(`[useInngestChat] Отправляем бросок кубика: ${roll}`);
      
      const result = await InngestEventService.sendDiceRoll(user.id, roll);
      
      if (!result.success) {
        return { 
          success: false, 
          message: `❌ Ошибка при броске кубика: ${result.error}` 
        };
      }

      // Добавляем обновление в историю
      const gameUpdate: ChatGameUpdate = {
        type: 'diceResult',
        data: { roll, userId: user.id, eventId: result.eventId },
        timestamp: Date.now()
      };
      
      setLastUpdate(gameUpdate);
      setGameUpdates(prev => [...prev, gameUpdate]);

      return {
        success: true,
        message: `🎲 Кубик брошен! Выпало: **${roll}**\n\n⏳ Обрабатываем результат...`,
        data: { roll },
        nextAction: 'waitForReport'
      };
      
    } catch (error) {
      console.error('[useInngestChat] Ошибка броска кубика:', error);
      return { 
        success: false, 
        message: `❌ Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, currentPlayer?.needsReport, currentPlayer?.plan]);

  // 📝 Команда: Отправить отчет
  const submitReportCommand = useCallback(async (args: string[]): Promise<ChatCommandResult> => {
    if (!user?.id) {
      return { success: false, message: '❌ Необходима авторизация для отправки отчета' };
    }

    if (!currentPlayer?.needsReport) {
      return { 
        success: false, 
        message: '📝 Отчет не требуется. Можете бросить кубик для следующего хода.' 
      };
    }

    const reportText = args.join(' ');
    if (reportText.length < 10) {
      return { 
        success: false, 
        message: '📝 Отчет должен содержать минимум 10 символов. Опишите ваш духовный опыт на этом плане.' 
      };
    }

    try {
      setIsProcessing(true);
      
      console.log(`[useInngestChat] Отправляем отчет для плана ${currentPlayer.plan}`);
      
      const result = await InngestEventService.sendPlayerReport(
        user.id, 
        reportText, 
        currentPlayer.plan
      );
      
      if (!result.success) {
        return { 
          success: false, 
          message: `❌ Ошибка при отправке отчета: ${result.error}` 
        };
      }

      // Добавляем обновление в историю
      const gameUpdate: ChatGameUpdate = {
        type: 'reportSubmitted',
        data: { 
          report: reportText, 
          planNumber: currentPlayer.plan, 
          eventId: result.eventId 
        },
        timestamp: Date.now()
      };
      
      setLastUpdate(gameUpdate);
      setGameUpdates(prev => [...prev, gameUpdate]);

      return {
        success: true,
        message: `📝 **Отчет отправлен!**\n\n"${reportText}"\n\n✅ Кубик разблокирован, можете продолжить игру.`,
        data: { report: reportText, planNumber: currentPlayer.plan },
        nextAction: 'enableDice'
      };
      
    } catch (error) {
      console.error('[useInngestChat] Ошибка отправки отчета:', error);
      return { 
        success: false, 
        message: `❌ Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, currentPlayer?.needsReport, currentPlayer?.plan]);

  // 🎯 Команда: Статус игры
  const gameStatusCommand = useCallback(async (args: string[]): Promise<ChatCommandResult> => {
    if (!currentPlayer) {
      return { 
        success: true, 
        message: '🎮 **Игра не начата**\n\nИспользуйте `/start` для инициализации игрока.' 
      };
    }

    const statusMessage = `🎮 **Статус игры:**\n\n` +
      `📍 **Текущий план:** ${currentPlayer.plan}\n` +
      `📊 **Предыдущий план:** ${currentPlayer.previous_plan}\n` +
      `🎲 **Подряд шестерок:** ${currentPlayer.consecutiveSixes}\n` +
      `📝 **Нужен отчет:** ${currentPlayer.needsReport ? 'Да' : 'Нет'}\n` +
      `🏁 **Игра завершена:** ${currentPlayer.isFinished ? 'Да' : 'Нет'}\n` +
      `💬 **Сообщение:** ${currentPlayer.message || 'Нет сообщения'}\n\n` +
      `💡 **Доступные команды:**\n` +
      `${currentPlayer.needsReport ? '• \`/report [ваш отчет]\` - Отправить отчет' : '• \`/roll\` - Бросить кубик'}\n` +
      `• \`/status\` - Статус игры\n` +
      `• \`/plan\` - Информация о текущем плане`;

    return {
      success: true,
      message: statusMessage,
      data: currentPlayer
    };
  }, [currentPlayer]);

  // 🚀 Команда: Инициализация игрока
  const startGameCommand = useCallback(async (args: string[]): Promise<ChatCommandResult> => {
    if (!user?.id) {
      return { success: false, message: '❌ Необходима авторизация для начала игры' };
    }

    if (currentPlayer) {
      return { 
        success: true, 
        message: `🎮 Игра уже инициализирована!\n\nВы на плане ${currentPlayer.plan}.\nИспользуйте \`/status\` для проверки состояния.` 
      };
    }

    try {
      setIsProcessing(true);
      
      console.log(`[useInngestChat] Инициализируем игрока: ${user.id}`);
      
      const result = await InngestEventService.sendPlayerInit(user.id, user.email);
      
      if (!result.success) {
        return { 
          success: false, 
          message: `❌ Ошибка инициализации: ${result.error}` 
        };
      }

      return {
        success: true,
        message: `🚀 **Игрок инициализирован!**\n\n🕉️ Добро пожаловать в священную игру Лила!\n\n🎯 Бросьте 6, чтобы начать путешествие к космическому сознанию.\n\nИспользуйте \`/roll\` для броска кубика.`,
        data: { userId: user.id, eventId: result.eventId },
        nextAction: 'enableDice'
      };
      
    } catch (error) {
      console.error('[useInngestChat] Ошибка инициализации:', error);
      return { 
        success: false, 
        message: `❌ Произошла ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}` 
      };
    } finally {
      setIsProcessing(false);
    }
  }, [user?.id, user?.email, currentPlayer]);

  // 📋 Команда: Информация о плане  
  const planInfoCommand = useCallback(async (args: string[]): Promise<ChatCommandResult> => {
    if (!currentPlayer) {
      return { success: false, message: '❌ Сначала инициализируйте игру командой `/start`' };
    }

    const planNumber = args.length > 0 ? parseInt(args[0]) : Number(currentPlayer.plan);
    
    if (isNaN(planNumber) || planNumber < 1 || planNumber > 72) {
      return { 
        success: false, 
        message: '❌ Номер плана должен быть от 1 до 72.\n\nИспользование: `/plan [номер]` или просто `/plan` для текущего плана' 
      };
    }

    // Здесь можно добавить получение информации о плане
    // Пока возвращаем базовую информацию
    const planMessage = `📍 **План ${planNumber}**\n\n` +
      `🎯 Это этап духовного развития на пути к самопознанию.\n` +
      `💫 Каждый план представляет определенное состояние сознания.\n\n` +
      `${planNumber === Number(currentPlayer.plan) ? '🔸 Вы находитесь здесь сейчас' : '🔹 Информационный план'}`;

    return {
      success: true,
      message: planMessage,
      data: { planNumber }
    };
  }, [currentPlayer]);

  // 🎯 Список доступных команд
  const commands: ChatCommand[] = [
    {
      command: '/start',
      description: 'Инициализировать игрока',
      handler: startGameCommand
    },
    {
      command: '/roll',
      description: 'Бросить кубик',
      handler: rollDiceCommand,
      allowedStates: ['canRoll']
    },
    {
      command: '/report',
      description: 'Отправить отчет',
      handler: submitReportCommand,
      allowedStates: ['needsReport']
    },
    {
      command: '/status',
      description: 'Показать статус игры',
      handler: gameStatusCommand
    },
    {
      command: '/plan',
      description: 'Информация о плане',
      handler: planInfoCommand
    }
  ];

  // 🔍 Парсер команд
  const parseCommand = useCallback((message: string): { command: string; args: string[] } | null => {
    const trimmed = message.trim();
    if (!trimmed.startsWith('/')) {
      return null;
    }

    const parts = trimmed.split(/\s+/);
    const command = parts[0].toLowerCase();
    const args = parts.slice(1);

    return { command, args };
  }, []);

  // 🎯 Обработчик команд
  const handleCommand = useCallback(async (message: string): Promise<ChatCommandResult | null> => {
    const parsed = parseCommand(message);
    if (!parsed) {
      return null;
    }

    const commandHandler = commands.find(cmd => cmd.command === parsed.command);
    if (!commandHandler) {
      return {
        success: false,
        message: `❌ Неизвестная команда: ${parsed.command}\n\n💡 Доступные команды:\n${commands.map(cmd => `• \`${cmd.command}\` - ${cmd.description}`).join('\n')}`
      };
    }

    console.log(`[useInngestChat] Выполняем команду: ${parsed.command}`, parsed.args);
    
    return await commandHandler.handler(parsed.args);
  }, [commands, parseCommand, rollDiceCommand, submitReportCommand, gameStatusCommand, startGameCommand, planInfoCommand]);

  // 💡 Генерация справочного сообщения
  const getHelpMessage = useCallback((): string => {
    if (!user) {
      return `🕉️ **Добро пожаловать в NeuroLeela!**\n\n` +
        `💡 **Доступные команды:**\n` +
        `• \`/start\` - Начать игру самопознания\n` +
        `• \`/help\` - Эта справка`;
    }

    if (!currentPlayer) {
      return `🕉️ **Духовное путешествие ждет!**\n\n` +
        `💡 **Доступные команды:**\n` +
        `• \`/start\` - Инициализировать игрока\n` +
        `• \`/help\` - Справка по командам`;
    }

    return `🕉️ **Справка по командам NeuroLeela:**\n\n` +
      `🎮 **Игровые команды:**\n` +
      `${currentPlayer.needsReport ? '• `/report [ваш отчет]` - Отправить отчет' : '• `/roll` - Бросить кубик'}\n` +
      `• \`/status\` - Статус игры\n` +
      `• \`/plan\` - Информация о текущем плане\n\n` +
      `💡 **Информационные команды:**\n` +
      `• \`/help\` - Эта справка\n\n` +
      `🎯 **Текущий статус:** План ${currentPlayer.plan}, ${currentPlayer.needsReport ? 'нужен отчет' : 'готов к ходу'}`;
  }, [user, currentPlayer]);

  // 🔄 Эффект для обновления состояния игрока
  useEffect(() => {
    if (currentPlayer) {
      const gameUpdate: ChatGameUpdate = {
        type: 'playerStateChanged',
        data: currentPlayer,
        timestamp: Date.now()
      };
      
      setLastUpdate(gameUpdate);
    }
  }, [currentPlayer]);

  return {
    // Основные функции
    handleCommand,
    parseCommand,
    getHelpMessage,
    
    // Состояние
    isProcessing,
    lastUpdate,
    gameUpdates,
    commands,
    
    // Данные игры
    currentPlayer,
    user,
    
    // Утилиты
    clearUpdates: () => setGameUpdates([]),
    isCommand: (message: string) => message.trim().startsWith('/')
  };
}; 
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanCard } from './PlanCard';
import { DiceInChat } from './DiceInChat';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { processGameStep } from '@/services/GameService';
import { markReportCompleted } from '@/lib/apollo-drizzle-client';
import { supabase } from '@/lib/supabase';
import { useSupabase } from '@/context/supabase-provider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ToolInvocation {
  toolCallId: string;
  toolName: 'createPlanCard' | 'showDice' | 'gameStatus' | 'showDiceButton' | 'showReportButton' | 'showGameResult';
  state: 'partial-call' | 'call' | 'result' | 'error';
  args?: any;
  result?: any;
}

export const ChatBot = () => {
  console.log('🎯 [ChatBot] =================== КОМПОНЕНТ CHATBOT РЕНДЕРИТСЯ ===================');
  console.log('🎯 [ChatBot] Компонент ChatBot загружается...');
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Я здесь, чтобы помочь вам понять глубокий смысл вашего духовного путешествия. Спросите меня о любом плане (1-72) или просто поделитесь своими мыслями!' 
    },
    // ТЕСТОВЫЙ КУБИК ДЛЯ ДИАГНОСТИКИ
    {
      id: 'test-dice-message',
      role: 'assistant',
      content: '🧪 ТЕСТОВЫЙ КУБИК для диагностики:',
      toolInvocations: [{
        toolCallId: 'test-dice-call',
        toolName: 'showDice',
        state: 'result',
        result: {
          message: '🎲 ТЕСТОВЫЙ КУБИК - нажмите для проверки анимации!',
          disabled: false
        }
      }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRoll, setLastRoll] = useState(1);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // Игровое состояние
  const { currentPlayer, updatePlayerState } = useApolloDrizzle();
  const { user } = useSupabase();
  const { userData } = useSupabase();

  console.log('🎯 [ChatBot] ОСНОВНОЕ СОСТОЯНИЕ:');
  console.log('🎯 [ChatBot] - currentPlayer =', currentPlayer);
  console.log('🎯 [ChatBot] - user =', !!user);
  console.log('🎯 [ChatBot] - userData =', !!userData);
  console.log('🎯 [ChatBot] - messages.length =', messages.length);
  console.log('🎯 [ChatBot] - lastRoll =', lastRoll);

  // Функция для получения информации о плане
  const getPlanInfo = (planNumber: number) => {
    const plansData: Record<number, { name: string; description: string; element: string; color: string }> = {
      1: { name: "Рождение", description: "Начало духовного пути, первое воплощение души", element: "🌱", color: "green" },
      2: { name: "Иллюзия", description: "Майя - завеса, скрывающая истинную природу реальности", element: "🎭", color: "purple" },
      3: { name: "Гнев", description: "Разрушительная эмоция, препятствующая духовному росту", element: "😡", color: "red" },
      4: { name: "Жадность", description: "Привязанность к материальным благам", element: "💰", color: "gold" },
      5: { name: "Физический план", description: "Материальный мир и телесные потребности", element: "🏃", color: "brown" },
      6: { name: "Заблуждение", description: "Ложные представления о природе реальности", element: "🌫️", color: "gray" },
      7: { name: "Тщеславие", description: "Гордыня и эгоизм, раздувающие ложное 'я'", element: "👑", color: "purple" },
      8: { name: "Ревность", description: "Зависть и сравнение себя с другими", element: "💚", color: "green" },
      9: { name: "Чувственность", description: "Привязанность к чувственным удовольствиям", element: "🌹", color: "pink" },
      10: { name: "Очищение", description: "Освобождение от негативных качеств", element: "🧘", color: "blue" },
      11: { name: "Развлечения", description: "Отвлечения от духовного пути", element: "🎪", color: "orange" },
      12: { name: "Змея", description: "Кундалини - духовная энергия, ведущая вниз", element: "🐍", color: "red" },
      13: { name: "Человеческий план", description: "Осознание своей человеческой природы", element: "👤", color: "blue" },
      14: { name: "Милосердие", description: "Сострадание и доброта к живым существам", element: "❤️", color: "red" },
      15: { name: "Астральный план", description: "Тонкий мир эмоций и желаний", element: "✨", color: "violet" },
      16: { name: "Радость", description: "Духовное блаженство и внутренняя гармония", element: "😊", color: "yellow" },
      17: { name: "Ревность", description: "Повторное столкновение с завистью", element: "💚", color: "green" },
      18: { name: "Сострадание", description: "Глубокое понимание страданий других", element: "🤲", color: "blue" },
      19: { name: "Феноменальный план", description: "Мир явлений и форм", element: "🌍", color: "green" },
      20: { name: "Духовная преданность", description: "Бхакти - путь любви к Божественному", element: "🙏", color: "gold" },
      21: { name: "Небесный план", description: "Высшие сферы сознания", element: "☁️", color: "blue" },
      22: { name: "Стрела", description: "Быстрый духовный подъем", element: "🏹", color: "gold" },
      23: { name: "Небеса", description: "Состояние блаженства и покоя", element: "☁️", color: "blue" },
      24: { name: "Плохие наклонности", description: "Негативные кармические отпечатки", element: "⚫", color: "black" },
      25: { name: "Очищение", description: "Второй уровень духовного очищения", element: "🧘", color: "blue" },
      26: { name: "Милосердие", description: "Углубление сострадания", element: "❤️", color: "red" },
      27: { name: "Нейтральность", description: "Равновесие между противоположностями", element: "⚖️", color: "gray" },
      28: { name: "Правильное знание", description: "Истинное понимание природы реальности", element: "📚", color: "blue" },
      29: { name: "Духовная преданность", description: "Углубление бхакти", element: "🙏", color: "gold" },
      30: { name: "Хорошие наклонности", description: "Позитивные кармические отпечатки", element: "⚪", color: "white" },
      31: { name: "Очищение", description: "Третий уровень очищения", element: "🧘", color: "blue" },
      32: { name: "Ясность", description: "Чистота восприятия и понимания", element: "💎", color: "clear" },
      33: { name: "Равновесие", description: "Гармония всех аспектов бытия", element: "⚖️", color: "gray" },
      34: { name: "Благость", description: "Саттва - качество чистоты и света", element: "🌟", color: "white" },
      35: { name: "Милосердие", description: "Высшее проявление сострадания", element: "❤️", color: "red" },
      36: { name: "Стрела", description: "Второй духовный подъем", element: "🏹", color: "gold" },
      37: { name: "Правильное знание", description: "Углубление мудрости", element: "📚", color: "blue" },
      38: { name: "Духовная преданность", description: "Совершенная бхакти", element: "🙏", color: "gold" },
      39: { name: "Нейтральность", description: "Совершенное равновесие", element: "⚖️", color: "gray" },
      40: { name: "Хорошие наклонности", description: "Укрепление позитивной кармы", element: "⚪", color: "white" },
      41: { name: "Добрые дела", description: "Карма служения и самоотверженности", element: "🤝", color: "gold" },
      42: { name: "Правильное знание", description: "Мудрость высшего порядка", element: "📚", color: "blue" },
      43: { name: "Различение", description: "Способность отличать реальное от нереального", element: "🔍", color: "blue" },
      44: { name: "Нейтральность", description: "Отсутствие привязанности к результатам", element: "⚖️", color: "gray" },
      45: { name: "Стрела", description: "Третий духовный подъем", element: "🏹", color: "gold" },
      46: { name: "Различение", description: "Углубление способности различения", element: "🔍", color: "blue" },
      47: { name: "Духовная преданность", description: "Абсолютная преданность", element: "🙏", color: "gold" },
      48: { name: "Нейтральность", description: "Полная беспристрастность", element: "⚖️", color: "gray" },
      49: { name: "Стрела", description: "Четвертый духовный подъем", element: "🏹", color: "gold" },
      50: { name: "Энергия", description: "Духовная сила и жизненность", element: "⚡", color: "yellow" },
      51: { name: "Различение", description: "Совершенная способность различения", element: "🔍", color: "blue" },
      52: { name: "Правильное знание", description: "Абсолютное знание", element: "📚", color: "blue" },
      53: { name: "Энергия", description: "Высшая духовная энергия", element: "⚡", color: "yellow" },
      54: { name: "Стрела", description: "Пятый духовный подъем", element: "🏹", color: "gold" },
      55: { name: "Правильное знание", description: "Знание единства", element: "📚", color: "blue" },
      56: { name: "Различение", description: "Окончательное различение", element: "🔍", color: "blue" },
      57: { name: "Энергия", description: "Космическая энергия", element: "⚡", color: "yellow" },
      58: { name: "Стрела", description: "Шестой духовный подъем", element: "🏹", color: "gold" },
      59: { name: "Правильное знание", description: "Знание Абсолюта", element: "📚", color: "blue" },
      60: { name: "Различение", description: "Абсолютное различение", element: "🔍", color: "blue" },
      61: { name: "Энергия", description: "Божественная энергия", element: "⚡", color: "yellow" },
      62: { name: "Стрела", description: "Седьмой духовный подъем", element: "🏹", color: "gold" },
      63: { name: "Правильное знание", description: "Совершенное знание", element: "📚", color: "blue" },
      64: { name: "Различение", description: "Высшее различение", element: "🔍", color: "blue" },
      65: { name: "Энергия", description: "Абсолютная энергия", element: "⚡", color: "yellow" },
      66: { name: "Стрела", description: "Восьмой духовный подъем", element: "🏹", color: "gold" },
      67: { name: "Правильное знание", description: "Окончательное знание", element: "📚", color: "blue" },
      68: { name: "Космическое сознание", description: "Высшее просветление и единство с Абсолютом", element: "🕉️", color: "violet" },
      69: { name: "Абсолютный план", description: "План чистого бытия", element: "∞", color: "white" },
      70: { name: "Сат-Чит-Ананда", description: "Бытие-Сознание-Блаженство", element: "🌟", color: "gold" },
      71: { name: "Абсолютное знание", description: "Знание без объекта", element: "💫", color: "white" },
      72: { name: "Абсолютная реальность", description: "Брахман - высшая истина", element: "🔆", color: "gold" }
    };
    
    return plansData[planNumber] || {
      name: `План ${planNumber}`,
      description: "Особый этап духовного развития на пути к самопознанию",
      element: "✨",
      color: "blue"
    };
  };

  // Функция для получения подсказки для отчета по плану
  const getPlanPrompt = (planNumber: number): string => {
    const planLevel = Math.ceil(planNumber / 9); // Определяем уровень (1-8)
    
    switch(planLevel) {
      case 1: // 1-9 - Физический план
        return "Опишите ваши физические ощущения и материальные наблюдения...";
      case 2: // 10-18 - Астральный план
        return "Какие эмоции и творческие порывы вы испытываете?";
      case 3: // 19-27 - Небесный план
        return "Как проявляется ваша внутренняя сила и воля?";
      case 4: // 28-36 - План баланса
        return "Что говорит ваше сердце? Как ощущаете баланс?";
      case 5: // 37-45 - Человеческий план
        return "Какую истину вы готовы выразить?";
      case 6: // 46-54 - План аскетизма
        return "Что открывается вашему внутреннему взору?";
      case 7: // 55-63 - План сознания
        return "Как изменилось ваше сознание на этом плане?";
      case 8: // 64-72 - Абсолютный план
        return "Опишите переживание единства с Абсолютом...";
      default:
        return "Опишите свой опыт и размышления...";
    }
  };

  // Функция для загрузки истории чата
  const loadChatHistory = async () => {
    if (!user || historyLoaded) return;

    try {
      const { data, error } = await supabase
        .from('chat_history')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20); // Загружаем последние 20 диалогов

      if (error) {
        console.error('Ошибка загрузки истории чата:', error);
        return;
      }

      if (data && data.length > 0) {
        const historyMessages: Message[] = [];
        
        // Преобразуем историю в сообщения чата
        data.reverse().forEach((record) => {
          // Добавляем сообщение пользователя
          historyMessages.push({
            id: `history-user-${record.id}`,
            role: 'user',
            content: record.user_message
          });
          
          // Добавляем ответ ИИ
          historyMessages.push({
            id: `history-ai-${record.id}`,
            role: 'assistant',
            content: record.ai_response
          });
        });

        // Добавляем историю в начало (после приветственного сообщения)
        setMessages(prev => [
          prev[0], // Приветственное сообщение
          ...historyMessages,
          ...prev.slice(1) // Остальные сообщения
        ]);
      }

      setHistoryLoaded(true);
    } catch (error) {
      console.error('Ошибка при загрузке истории чата:', error);
    }
  };

  // Инициализация чата при загрузке
  useEffect(() => {
    if (!historyLoaded && currentPlayer) {
      console.log('🔄 [ChatBot] Инициализация чата...');
      
      // Загружаем историю чата
      loadChatHistory();
      
      // Показываем приветственное сообщение
      const welcomeMessage: Message = {
        id: 'welcome',
        role: 'assistant',
        content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Добро пожаловать на путь духовного развития!'
      };
      
      setMessages(prev => {
        // Проверяем, есть ли уже приветственное сообщение
        if (prev.some(msg => msg.id === 'welcome')) {
          return prev;
        }
        return [welcomeMessage, ...prev];
      });

      // Если игрок готов к игре, показываем кнопку броска
      if (currentPlayer && !currentPlayer.needsReport) {
        setTimeout(() => {
          startGameTurn();
        }, 1000);
      } else if (currentPlayer?.needsReport) {
        // Если нужен отчет, показываем кнопку отчета
        setTimeout(() => {
          addGameMessage('showReportButton', {
            planNumber: currentPlayer.plan,
            disabled: false
          });
        }, 1000);
      }
      
      setHistoryLoaded(true);
    }
  }, [currentPlayer, historyLoaded]);

  // Добавляем игровые сообщения при изменении состояния игрока
  useEffect(() => {
    console.log('🔄 [ChatBot] useEffect: состояние игрока изменилось', {
      plan: currentPlayer?.plan,
      previous_plan: currentPlayer?.previous_plan,
      needsReport: currentPlayer?.needsReport,
      isFinished: currentPlayer?.isFinished
    });
    
    if (currentPlayer) {
      // Если игрок переместился на новый план, показываем информацию о нем
      if (currentPlayer.plan !== currentPlayer.previous_plan && currentPlayer.plan > 0) {
        console.log('🎯 [ChatBot] Игрок переместился на новый план:', currentPlayer.plan);
        const planInfo = getPlanInfo(currentPlayer.plan);
        addGameMessage('createPlanCard', {
          type: 'plan-card',
          planNumber: currentPlayer.plan,
          planInfo,
          isCurrentPosition: true,
          timestamp: new Date().toISOString()
        }, `🎯 Вы достигли плана ${currentPlayer.plan}: "${planInfo.name}" ${planInfo.element}\n\n${planInfo.description}`);
      }
      
      // Показываем начальный кубик только при первой загрузке, если игрок готов играть
      if (!historyLoaded && !currentPlayer.needsReport && currentPlayer.plan > 0) {
        console.log('🎲 [ChatBot] Показываем начальный кубик');
        if (currentPlayer.plan === 68 && currentPlayer.isFinished) {
          addGameMessage('showDice', {
            message: "🎲 Вы достигли Космического сознания! Бросьте 6, чтобы начать новый путь самопознания!",
            disabled: false
          });
        } else if (!currentPlayer.isFinished) {
          addGameMessage('showDice', {
            message: `🎲 Готовы к следующему шагу? Вы на плане ${currentPlayer.plan}`,
            disabled: false
          });
        }
      }
    }
  }, [currentPlayer?.plan, currentPlayer?.isFinished, currentPlayer?.previous_plan, historyLoaded]);

  // Функция для добавления простых сообщений от ассистента
  const addSimpleMessage = (content: string) => {
    const message: Message = {
      id: `simple-${Date.now()}`,
      role: 'assistant',
      content
    };
    setMessages(prev => [message, ...prev]);
  };

  // Функция для добавления игровых сообщений
  const addGameMessage = (toolName: ToolInvocation['toolName'], data: any, customContent?: string) => {
    const gameMessage: Message = {
      id: `game-${Date.now()}`,
      role: 'assistant',
      content: customContent || getGameMessageContent(toolName, data),
      toolInvocations: [{
        toolCallId: `tool-${Date.now()}`,
        toolName,
        state: 'result',
        result: data
      }]
    };
    
    setMessages(prev => {
      // Если добавляем кубик, удаляем все предыдущие кубики
      if (toolName === 'showDice') {
        console.log('🎲 [ChatBot] Добавляем новый кубик, удаляем старые кубики');
        const filteredMessages = prev.filter(msg => {
          const hasDice = msg.toolInvocations?.some(tool => tool.toolName === 'showDice');
          if (hasDice) {
            console.log('🎲 [ChatBot] Удаляем старый кубик:', msg.id);
          }
          return !hasDice;
        });
        return [gameMessage, ...filteredMessages];
      }
      
      // Избегаем дублирования игровых сообщений одного типа подряд
      const firstMessage = prev[0];
      if (firstMessage?.toolInvocations?.[0]?.toolName === toolName && 
          firstMessage?.toolInvocations?.[0]?.result?.planNumber === data.planNumber) {
        return prev;
      }
      return [gameMessage, ...prev]; // Добавляем в начало массива
    });
  };

  // Функция для получения текста игрового сообщения
  const getGameMessageContent = (toolName: ToolInvocation['toolName'], data: any): string => {
    switch (toolName) {
      case 'showDice':
        return data.message || "Время для следующего хода! 🎲";
      case 'gameStatus':
        return data.message || "Обновление игрового статуса";
      default:
        return "Игровое событие";
    }
  };

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [userMessage, ...prev]); // Добавляем в начало
    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    console.log('🎯 Начинаем обработку сообщения:', userInput);
    console.log('🎮 Состояние игрока:', { 
      needsReport: currentPlayer?.needsReport, 
      plan: currentPlayer?.plan,
      user: !!user 
    });

    // Добавляем таймаут для всей операции
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('TIMEOUT: Обработка сообщения зависла на более чем 10 секунд')), 10000);
    });

    try {
      const result = await Promise.race([
        handleSubmitCore(userInput),
        timeoutPromise
      ]);
      
      console.log('🏁 Обработка сообщения завершена успешно');
      
    } catch (error) {
      console.error('❌ Критическая ошибка или таймаут:', error);
      
      // Показываем пользователю понятное сообщение об ошибке
      const errorMessage: Message = {
        id: `error-${Date.now()}`,
        role: 'assistant',
        content: `🙏 Прошу прощения, произошла техническая ошибка или превышено время ожидания. ${
          currentPlayer?.needsReport 
            ? 'Ваш отчет может быть не сохранен. Попробуйте написать его еще раз.' 
            : 'Попробуйте задать вопрос еще раз.'
        }\n\nОшибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
      };
      
      setMessages(prev => [errorMessage, ...prev]);
    } finally {
      setIsLoading(false);
      console.log('🏁 Обработка сообщения завершена (finally)');
    }
  };

  // Выносим основную логику в отдельную функцию для лучшего контроля
  const handleSubmitCore = async (userInput: string) => {
    console.log('🔍 [ChatBot] handleSubmitCore: ДЕТАЛЬНАЯ ДИАГНОСТИКА');
    console.log('🔍 [ChatBot] handleSubmitCore: currentPlayer?.needsReport =', currentPlayer?.needsReport);
    console.log('🔍 [ChatBot] handleSubmitCore: currentPlayer?.plan =', currentPlayer?.plan);
    console.log('🔍 [ChatBot] handleSubmitCore: user =', !!user);
    
    // Проверяем, нужен ли отчет
    if (currentPlayer?.needsReport && user) {
      console.log('📝 [ChatBot] handleSubmitCore: ОБРАБАТЫВАЕМ ОТЧЕТ для плана:', currentPlayer.plan);
      console.log('📝 [ChatBot] handleSubmitCore: user.id =', user.id);
      
      // Сначала отмечаем отчет как завершенный (это быстрая локальная операция)
      console.log('🔄 [ChatBot] handleSubmitCore: Вызываем markReportCompleted...');
      try {
        await markReportCompleted(user.id);
        console.log('✅ [ChatBot] handleSubmitCore: markReportCompleted ВЫПОЛНЕНА УСПЕШНО');
        
        // Проверяем, изменилось ли состояние НЕМЕДЛЕННО
        console.log('🔍 [ChatBot] handleSubmitCore: Проверяем состояние после markReportCompleted');
        console.log('🔍 [ChatBot] handleSubmitCore: currentPlayer?.needsReport после markReportCompleted =', currentPlayer?.needsReport);
        
      } catch (markError) {
        console.error('⚠️ [ChatBot] handleSubmitCore: ОШИБКА markReportCompleted:', markError);
      }

      // Создаем духовный комментарий Лилы к отчету
      const planInfo = getPlanInfo(currentPlayer.plan);
      const spiritualCommentary = generateSpiritualCommentary(userInput, currentPlayer.plan, planInfo);

      console.log('💬 [ChatBot] handleSubmitCore: Генерируем ответ Лилы');

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: spiritualCommentary
      };

      setMessages(prev => [responseMessage, ...prev]);

      // Сохраняем отчет в фоне (не блокируя UI)
      console.log('💾 [ChatBot] handleSubmitCore: Начинаем сохранение отчета в фоне...');
      saveReportInBackground(userInput, spiritualCommentary);

      // Показываем кубик для следующего хода НЕМЕДЛЕННО
      console.log('🎲 [ChatBot] handleSubmitCore: Показываем кубик для следующего хода...');
      console.log('🎲 [ChatBot] handleSubmitCore: currentPlayer.plan =', currentPlayer.plan);
      console.log('🎲 [ChatBot] handleSubmitCore: currentPlayer.isFinished =', currentPlayer.isFinished);
      
      const nextStepMessage = currentPlayer.plan === 68 && currentPlayer.isFinished 
        ? "🎉 Вы достигли Космического Сознания! Готовы начать новый путь самопознания?"
        : "Отлично! Теперь вы готовы к следующему шагу на пути самопознания.";
        
      const diceMessage = currentPlayer.plan === 68 && currentPlayer.isFinished
        ? "🎲 Бросьте 6, чтобы начать новый путь самопознания!"
        : "🎲 Готовы к следующему шагу? Бросьте кубик для продолжения путешествия!";

      console.log('🎲 [ChatBot] handleSubmitCore: Показываем кубик через addGameMessage');
      console.log('🎲 [ChatBot] handleSubmitCore: diceMessage =', diceMessage);
      
      addGameMessage('showDice', {
        message: diceMessage,
        disabled: false
      }, nextStepMessage);

      return; // Выходим, так как это был отчет
    } else {
      console.log('🤔 [ChatBot] handleSubmitCore: НЕ ОБРАБАТЫВАЕМ КАК ОТЧЕТ');
      console.log('🤔 [ChatBot] handleSubmitCore: Причины:');
      console.log('🤔 [ChatBot] handleSubmitCore: - currentPlayer?.needsReport =', currentPlayer?.needsReport);
      console.log('🤔 [ChatBot] handleSubmitCore: - user =', !!user);
    }

    // Обычная обработка сообщений (если отчет не нужен)
    console.log('💭 [ChatBot] handleSubmitCore: Обрабатываем обычное сообщение');
    
    // Используем мок ответ вместо API
    const mockResponse = generateMockResponse(userInput);
    setMessages(prev => [mockResponse, ...prev]);
    
    // Сохраняем обычный диалог в истории чата в фоне
    if (user) {
      saveHistoryInBackground(userInput, mockResponse.content, 'question');
    }
  };

  // Функция для сохранения отчета в фоне
  const saveReportInBackground = async (userInput: string, aiResponse: string) => {
    if (!user || !currentPlayer) return;

    try {
      console.log('🔄 Фоновое сохранение отчета...');
      
      // Пытаемся сохранить отчет с коротким таймаутом
      const reportSavePromise = supabase
        .from("reports")
        .insert({
          user_id: user.id,
          plan_number: currentPlayer.plan,
          content: userInput,
          likes: 0,
          comments: 0
        })
        .select()
        .single();

      const reportTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Background save timeout')), 2000);
      });

      const { data: reportData } = await Promise.race([
        reportSavePromise,
        reportTimeoutPromise
      ]) as any;

      console.log('✅ Отчет сохранен в фоне:', reportData?.id);

      // Сохраняем диалог в истории
      await supabase
        .from("chat_history")
        .insert({
          user_id: user.id,
          plan_number: currentPlayer.plan,
          user_message: userInput,
          ai_response: aiResponse,
          report_id: reportData?.id,
          message_type: 'report'
        });

      console.log('✅ История диалога сохранена в фоне');

    } catch (error) {
      console.warn('⚠️ Фоновое сохранение не удалось (не критично):', error);
      // Можно добавить в очередь для повторной попытки позже
    }
  };

  // Функция для сохранения истории в фоне
  const saveHistoryInBackground = async (userInput: string, aiResponse: string, messageType: string) => {
    if (!user || !currentPlayer) return;

    try {
      console.log('🔄 Фоновое сохранение истории...');
      
      const historySavePromise = supabase
        .from("chat_history")
        .insert({
          user_id: user.id,
          plan_number: currentPlayer.plan || 1,
          user_message: userInput,
          ai_response: aiResponse,
          message_type: messageType
        });

      const historyTimeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Background history save timeout')), 2000);
      });

      await Promise.race([historySavePromise, historyTimeoutPromise]);
      console.log('✅ История сохранена в фоне');

    } catch (error) {
      console.warn('⚠️ Фоновое сохранение истории не удалось (не критично):', error);
    }
  };

  // Функция для генерации мок ответов от Лилы
  const generateMockResponse = (userInput: string): Message => {
    const input = userInput.toLowerCase();
    
    // Проверяем, спрашивает ли пользователь о конкретном плане
    const planMatch = input.match(/план\s*(\d+)|позиция\s*(\d+)|(\d+)/);
    const planNumber = planMatch ? parseInt(planMatch[1] || planMatch[2] || planMatch[3]) : null;
    
    let content = '';
    let toolInvocations: ToolInvocation[] = [];
    
    if (planNumber && planNumber >= 1 && planNumber <= 72) {
      content = `Намасте! 🙏 Позвольте мне рассказать вам о плане ${planNumber}. Это особое место на пути самопознания.`;
      
      // Создаем мок tool invocation для карточки плана
      const planInfo = getPlanInfo(planNumber);
      toolInvocations = [{
        toolCallId: `mock-${Date.now()}`,
        toolName: 'createPlanCard',
        state: 'result',
        result: {
          type: 'plan-card',
          planNumber,
          planInfo,
          isCurrentPosition: false,
          timestamp: new Date().toISOString()
        }
      }];
    } else if (input.includes('привет') || input.includes('hi') || input.includes('hello')) {
      content = 'Намасте! 🙏 Добро пожаловать в игру самопознания! Я - Лила, ваш духовный проводник. Спросите меня о любом плане (1-72) или поделитесь своими мыслями о духовном пути.';
    } else if (input.includes('помощь') || input.includes('help')) {
      content = 'Я могу помочь вам понять значение планов игры Лила! 🎭\n\nПопробуйте спросить:\n• "Что означает план 10?"\n• "Расскажи о позиции 23"\n• "Объясни план 68"\n\nИли просто поделитесь своими мыслями о духовном пути! ✨';
    } else {
      content = 'Намасте! 🙏 Ваши слова несут глубокий смысл. В игре Лила каждый момент - это возможность для самопознания. Расскажите мне больше о том, что вас интересует, или спросите о конкретном плане игры.';
    }
    
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
    };
  };

  // Функция для генерации духовного комментария Лилы к отчету
  const generateSpiritualCommentary = (userReport: string, planNumber: number, planInfo: any): string => {
    const reportLength = userReport.length;
    const hasDeepReflection = userReport.toLowerCase().includes('чувствую') || 
                             userReport.toLowerCase().includes('понимаю') || 
                             userReport.toLowerCase().includes('осознаю') ||
                             userReport.toLowerCase().includes('ощущаю');
    
    // Базовые духовные комментарии в зависимости от плана
    const spiritualWisdom = [
      `🙏 Намасте! Ваш отчет о плане ${planNumber} "${planInfo.name}" наполнен искренностью.`,
      `✨ Благодарю за ваши размышления о "${planInfo.name}". Каждое слово отражает ваш внутренний путь.`,
      `🕉️ Ваш опыт на плане ${planNumber} показывает глубину вашего самопознания.`,
      `🌟 Прекрасно! Ваши мысли о "${planInfo.name}" раскрывают мудрость души.`
    ];

    // Дополнительные комментарии в зависимости от качества отчета
    const qualityComments = reportLength > 100 && hasDeepReflection 
      ? [
          "Ваша глубокая рефлексия показывает истинное понимание духовного пути.",
          "Я вижу, как вы искренне исследуете свое внутреннее состояние.",
          "Ваша осознанность на этом плане поможет вам в дальнейшем путешествии."
        ]
      : [
          "Каждый шаг на пути самопознания ценен, даже самый маленький.",
          "Продолжайте наблюдать за своими внутренними процессами.",
          "Ваша искренность важнее длины отчета."
        ];

    // Мудрость в зависимости от номера плана
    const planWisdom = planNumber <= 9 
      ? "На начальных планах важно заложить крепкий фундамент самопознания."
      : planNumber <= 36 
      ? "Вы проходите важные уроки эмоционального и ментального развития."
      : planNumber <= 54
      ? "Эти планы учат вас балансу между материальным и духовным."
      : "Вы приближаетесь к высшим планам сознания. Каждый шаг теперь особенно важен.";

    // Заключительная мотивация
    const motivation = [
      "Продолжайте свой путь с открытым сердцем! 💖",
      "Каждый ваш шаг приближает к космическому сознанию! 🌌",
      "Ваша душа растет и развивается с каждым планом! 🌱",
      "Доверьтесь процессу - Вселенная ведет вас к истине! ✨"
    ];

    // Собираем финальный комментарий
    const randomWisdom = spiritualWisdom[Math.floor(Math.random() * spiritualWisdom.length)];
    const randomQuality = qualityComments[Math.floor(Math.random() * qualityComments.length)];
    const randomMotivation = motivation[Math.floor(Math.random() * motivation.length)];

    return `${randomWisdom}

${randomQuality} ${planWisdom}

${randomMotivation}`;
  };

  // Новая функция для начала хода - показывает кнопку броска кубика
  const startGameTurn = () => {
    console.log('🎮 [ChatBot] startGameTurn: Начинаем новый ход');
    
    if (!currentPlayer) {
      console.error('🎮 [ChatBot] startGameTurn: нет currentPlayer');
      return;
    }

    const message = currentPlayer.plan === 68 && currentPlayer.isFinished
      ? "🎲 Для начала новой игры бросьте 6!"
      : "🎲 Готовы к следующему шагу на пути самопознания?";

    addGameMessage('showDiceButton', {
      message,
      disabled: false
    });
  };

  // Новая функция для обработки броска кубика
  const handleNewDiceRoll = async (): Promise<void> => {
    console.log('🎲 [ChatBot] handleNewDiceRoll: НАЧАЛО');
    
    if (!currentPlayer) {
      console.error('🎲 [ChatBot] handleNewDiceRoll: нет currentPlayer');
      return;
    }

    const roll = Math.floor(Math.random() * 6) + 1;
    console.log('🎲 [ChatBot] handleNewDiceRoll: сгенерирован бросок:', roll);
    
    // НЕМЕДЛЕННО обновляем lastRoll для отображения
    setLastRoll(roll);

    try {
      // Определяем userId
      const userId = user?.id || userData?.user_id || 'test-user-demo';
      console.log('🎲 [ChatBot] handleNewDiceRoll: используем userId:', userId);
      
      // Обрабатываем ход
      console.log('🎲 [ChatBot] handleNewDiceRoll: вызываем processGameStep...');
      const result = await processGameStep(roll, userId);
      console.log('🎮 [ChatBot] handleNewDiceRoll: результат хода:', result);
      
      // Обновляем состояние игрока
      const updatedPlayer = {
        ...currentPlayer,
        plan: result.gameStep.loka,
        previous_plan: result.gameStep.previous_loka,
        consecutiveSixes: result.gameStep.consecutive_sixes,
        positionBeforeThreeSixes: result.gameStep.position_before_three_sixes,
        isFinished: result.gameStep.is_finished,
        needsReport: result.gameStep.loka !== result.gameStep.previous_loka && !result.gameStep.is_finished,
        message: result.message
      };
      
      console.log('🎲 [ChatBot] handleNewDiceRoll: обновляем состояние игрока:', updatedPlayer);
      updatePlayerState(updatedPlayer);
      
      // Показываем результат броска
      addGameMessage('showGameResult', {
        roll,
        fromPlan: result.gameStep.previous_loka,
        toPlan: result.gameStep.loka,
        direction: result.direction,
        message: result.message
      });

      // Показываем описание плана
      const planInfo = getPlanInfo(updatedPlayer.plan);
      const planMessage: Message = {
        id: `plan-description-${Date.now()}`,
        role: 'assistant',
        content: `📍 **План ${updatedPlayer.plan}: "${planInfo.name}"**\n\n${planInfo.description}\n\n💭 Размышляйте об этом состоянии сознания и его влиянии на ваш духовный путь.`,
        toolInvocations: [{
          toolCallId: `plan-card-${Date.now()}`,
          toolName: 'createPlanCard',
          state: 'result',
          result: {
            type: 'plan-card',
            planNumber: updatedPlayer.plan,
            planInfo,
            isCurrentPosition: true,
            timestamp: new Date().toISOString()
          }
        }]
      };
      
      setMessages(prev => [planMessage, ...prev]);

      // Если нужен отчет, показываем кнопку отчета
      if (updatedPlayer.needsReport) {
        setTimeout(() => {
          addGameMessage('showReportButton', {
            planNumber: updatedPlayer.plan,
            disabled: false
          });
        }, 1000); // Небольшая пауза для чтения описания
      } else {
        // Если отчет не нужен, сразу показываем кнопку следующего хода
        setTimeout(() => {
          startGameTurn();
        }, 2000);
      }
      
    } catch (error) {
      console.error('🎲 [ChatBot] handleNewDiceRoll: ошибка:', error);
      const errorMessage: Message = {
        id: `dice-error-${Date.now()}`,
        role: 'assistant',
        content: `🎲 Выпало ${roll}, но произошла ошибка при обработке хода. Попробуйте еще раз.`
      };
      setMessages(prev => [errorMessage, ...prev]);
    }
  };

  // Новая функция для начала написания отчета
  const startReportWriting = () => {
    console.log('📝 [ChatBot] startReportWriting: Начинаем написание отчета');
    
    if (!currentPlayer) {
      console.error('📝 [ChatBot] startReportWriting: нет currentPlayer');
      return;
    }

    const planInfo = getPlanInfo(currentPlayer.plan);
    const prompt = getPlanPrompt(currentPlayer.plan);
    
    const reportMessage: Message = {
      id: `report-request-${Date.now()}`,
      role: 'assistant',
      content: `📝 **Время для отчета о плане ${currentPlayer.plan}: "${planInfo.name}"**\n\n${prompt}\n\n💡 Напишите ваши размышления и наблюдения в чате. После отправки отчета вы сможете продолжить игру.`
    };
    
    setMessages(prev => [reportMessage, ...prev]);
  };

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    const { toolName, state, result } = toolInvocation;

    if (state === 'result' && result) {
      switch (toolName) {
        case 'createPlanCard':
          return (
            <PlanCard
              key={toolInvocation.toolCallId}
              planNumber={result.planNumber}
              planInfo={result.planInfo}
              isCurrentPosition={result.isCurrentPosition}
            />
          );
        
        case 'showDice':
          console.log('🎲 [ChatBot] ================ renderToolInvocation: СОЗДАЕМ DiceInChat ================');
          console.log('🎲 [ChatBot] renderToolInvocation: result =', result);
          console.log('🎲 [ChatBot] renderToolInvocation: result.disabled =', result.disabled);
          console.log('🎲 [ChatBot] renderToolInvocation: currentPlayer?.needsReport =', currentPlayer?.needsReport);
          console.log('🎲 [ChatBot] renderToolInvocation: currentPlayer =', currentPlayer);
          
          const finalDisabled = result.disabled || (currentPlayer?.needsReport ?? false);
          console.log('🎲 [ChatBot] renderToolInvocation: ИТОГОВЫЙ disabled =', finalDisabled);
          console.log('🎲 [ChatBot] renderToolInvocation: ПРИЧИНА disabled:', {
            'result.disabled': result.disabled,
            'needsReport': currentPlayer?.needsReport,
            'итог': finalDisabled
          });
          
          return (
            <DiceInChat
              key={toolInvocation.toolCallId}
              onRoll={handleNewDiceRoll}
              lastRoll={lastRoll}
              disabled={finalDisabled}
              message={result.message}
            />
          );

        case 'showDiceButton':
          return (
            <DiceButton
              key={toolInvocation.toolCallId}
              onRoll={handleNewDiceRoll}
              disabled={result.disabled}
              message={result.message}
            />
          );

        case 'showGameResult':
          return (
            <GameResult
              key={toolInvocation.toolCallId}
              roll={result.roll}
              fromPlan={result.fromPlan}
              toPlan={result.toPlan}
              direction={result.direction}
              message={result.message}
            />
          );

        case 'showReportButton':
          return (
            <ReportButton
              key={toolInvocation.toolCallId}
              onReport={startReportWriting}
              planNumber={result.planNumber}
              disabled={result.disabled}
            />
          );
        
        default:
          return null;
      }
    }

    if (state !== 'result') {
      return (
        <View key={toolInvocation.toolCallId} className="bg-purple-50 rounded-lg p-3 m-2">
          <Text className="text-purple-600 text-sm">
            {toolName === 'createPlanCard' ? '🎴 Создаю карточку плана...' : 
             toolName === 'showDice' ? '🎲 Подготавливаю кубик...' :
             toolName === 'showDiceButton' ? '🎲 Подготавливаю кнопку броска...' :
             toolName === 'showGameResult' ? '🎮 Обрабатываю результат...' :
             toolName === 'showReportButton' ? '📝 Подготавливаю форму отчета...' :
             'Обрабатываю...'}
          </Text>
        </View>
      );
    }

    return null;
  };

  // Функция для очистки истории чата (для тестирования)
  const clearChatHistory = () => {
    setMessages([
      { 
        id: '1', 
        role: 'assistant', 
        content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Я здесь, чтобы помочь вам понять глубокий смысл вашего духовного путешествия. Спросите меня о любом плане (1-72) или просто поделитесь своими мыслями!' 
      },
    ]);
    setHistoryLoaded(false);
  };

  // Компонент кнопки для броска кубика
  const DiceButton: React.FC<{ onRoll: () => Promise<void>; disabled?: boolean; message?: string }> = ({ 
    onRoll, 
    disabled = false, 
    message = "🎲 Готовы бросить кубик?" 
  }) => {
    const [isRolling, setIsRolling] = useState(false);

    const handleRoll = async () => {
      if (disabled || isRolling) return;
      
      setIsRolling(true);
      try {
        await onRoll();
      } catch (error) {
        console.error('Ошибка при броске кубика:', error);
      } finally {
        setIsRolling(false);
      }
    };

    return (
      <View className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg p-4 m-2">
        <Text className="text-white text-center mb-3">{message}</Text>
        <TouchableOpacity
          onPress={handleRoll}
          disabled={disabled || isRolling}
          className={`bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg py-3 px-6 ${
            disabled || isRolling ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white text-center font-semibold">
            {isRolling ? '🎲 Бросаю...' : '🎲 Бросить кубик'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Компонент для отображения результата броска
  const GameResult: React.FC<{ 
    roll: number; 
    fromPlan: number; 
    toPlan: number; 
    direction: string;
    message: string;
  }> = ({ roll, fromPlan, toPlan, direction, message }) => {
    return (
      <View className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 m-2 border border-green-200">
        <Text className="text-lg font-bold text-green-800 text-center mb-2">
          🎲 Выпало: {roll}
        </Text>
        <Text className="text-gray-700 text-center mb-2">
          Переход: План {fromPlan} → План {toPlan}
        </Text>
        <Text className="text-gray-600 text-center text-sm mb-2">
          Направление: {direction}
        </Text>
        <Text className="text-gray-700 text-center">
          {message}
        </Text>
      </View>
    );
  };

  // Компонент кнопки для написания отчета
  const ReportButton: React.FC<{ onReport: () => void; planNumber: number; disabled?: boolean }> = ({ 
    onReport, 
    planNumber, 
    disabled = false 
  }) => {
    return (
      <View className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 m-2">
        <Text className="text-gray-700 text-center mb-3">
          📝 Время для размышлений о плане {planNumber}
        </Text>
        <TouchableOpacity
          onPress={onReport}
          disabled={disabled}
          className={`bg-gradient-to-r from-orange-500 to-yellow-500 rounded-lg py-3 px-6 ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-white text-center font-semibold">
            📝 Написать отчет
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white flex flex-col overflow-hidden">
      <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-gray-100">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-base font-medium text-gray-700">🕉️ Лила - Духовный проводник</Text>
            {currentPlayer && (
              <Text className="text-xs text-gray-500 mt-1">
                {currentPlayer.needsReport 
                  ? `📝 Ожидается отчет о плане ${currentPlayer.plan}` 
                  : `🎲 План ${currentPlayer.plan} • Готов к следующему ходу`
                }
              </Text>
            )}
          </View>
          <TouchableOpacity 
            onPress={clearChatHistory}
            className="bg-purple-100 rounded-full p-2"
          >
            <Ionicons name="refresh" size={16} color="#6A0DAD" />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView className="flex-1 p-3">
        {isLoading && (
          <View className="items-start flex flex-row mb-3">
            <View className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg px-4 py-2 shadow-sm">
              <Text className="text-gray-600">Лила размышляет... 🤔</Text>
            </View>
          </View>
        )}
        
        {messages.map((msg) => (
          <View key={msg.id}>
          <View 
              className={`mb-3 ${msg.role === 'user' ? 'items-end' : 'items-start'} flex flex-row`}
          >
            <View 
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                  msg.role === 'user' 
                  ? 'bg-blue-500 ml-auto shadow-sm' 
                    : 'bg-gradient-to-r from-purple-100 to-blue-100 shadow-sm'
              }`}
            >
              <Text 
                  className={msg.role === 'user' ? 'text-white' : 'text-gray-800'}
              >
                  {msg.content}
              </Text>
              </View>
            </View>

            {/* Отображение tool invocations */}
            {msg.toolInvocations && (
              <View className="mb-3">
                {msg.toolInvocations.map(renderToolInvocation)}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
      
      <View className="border-t border-gray-100 p-3">
        <View className="flex-row items-center">
        <TextInput
            value={input}
            onChangeText={setInput}
            placeholder={
              currentPlayer?.needsReport 
                ? "Напишите ваш отчет о духовном опыте..."
                : "Спросите о плане или поделитесь мыслями..."
            }
          placeholderTextColor="rgba(107,114,128,0.5)"
          className="flex-1 bg-gray-50 rounded-full px-4 py-2 mr-2 text-gray-700"
            editable={!isLoading}
            onSubmitEditing={handleSubmit}
        />
        <TouchableOpacity 
            onPress={handleSubmit} 
            disabled={isLoading}
            className={`rounded-full p-2 shadow-sm ${
              isLoading ? 'bg-gray-300' : 'bg-gradient-to-r from-purple-500 to-blue-500'
            }`}
          >
            <Ionicons 
              name={isLoading ? "hourglass" : "send"} 
              size={16} 
              color="white" 
            />
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}; 
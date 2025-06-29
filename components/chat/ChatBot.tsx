import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanCard } from './PlanCard';
import { DiceInChat } from './DiceInChat';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { InngestEventService } from '@/services/InngestEventService';
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
      content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Я здесь, чтобы помочь вам понять глубокий смысл вашего духовного путешествия через священную игру Лила.\n\n🎮 Готовы начать свое путешествие по планам сознания?' 
    },
    // Кнопка начала игры
    {
      id: 'start-game-message',
      role: 'assistant',
      content: '🎯 Начните свое духовное путешествие:',
      toolInvocations: [{
        toolCallId: 'start-game-button',
        toolName: 'showDiceButton',
        state: 'result',
        result: {
          message: '🎲 Начать игру Лила',
          disabled: false
        }
      }]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRoll, setLastRoll] = useState(1);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  
  // Ref для автопрокрутки
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Игровое состояние
  const { currentPlayer, updatePlayerState } = useApolloDrizzle();
  const { user } = useSupabase();
  const { userData } = useSupabase();

  // Получаем needsReport из состояния игрока в Apollo
  const needsReport = currentPlayer?.needsReport ?? false;
  const currentPlanForReport = needsReport ? currentPlayer?.plan : null;

  // МАКСИМАЛЬНОЕ ЛОГИРОВАНИЕ СОСТОЯНИЯ
  console.log('🎯 [ChatBot] =================== ПОЛНОЕ СОСТОЯНИЕ КОМПОНЕНТА ===================');
  console.log('🎯 [ChatBot] ОСНОВНОЕ СОСТОЯНИЕ:');
  console.log('🎯 [ChatBot] - currentPlayer =', JSON.stringify(currentPlayer, null, 2));
  console.log('🎯 [ChatBot] - needsReport (из Apollo) =', needsReport);
  console.log('🎯 [ChatBot] - currentPlanForReport =', currentPlanForReport);
  console.log('🎯 [ChatBot] - user =', user ? { id: user.id, email: user.email } : null);
  console.log('🎯 [ChatBot] - userData =', userData ? { user_id: userData.user_id } : null);
  console.log('🎯 [ChatBot] - messages.length =', messages.length);
  console.log('🎯 [ChatBot] - lastRoll =', lastRoll);
  console.log('🎯 [ChatBot] - isLoading =', isLoading);
  console.log('🎯 [ChatBot] - historyLoaded =', historyLoaded);
  console.log('🎯 [ChatBot] - input =', input);
  console.log('🎯 [ChatBot] =================== КОНЕЦ СОСТОЯНИЯ КОМПОНЕНТА ===================');

  // Автопрокрутка к последнему сообщению
  useEffect(() => {
    console.log('📜 [ChatBot] useEffect автопрокрутки: messages.length =', messages.length);
    if (scrollViewRef.current && messages.length > 0) {
      console.log('📜 [ChatBot] useEffect: выполняем автопрокрутку');
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
        console.log('📜 [ChatBot] useEffect: автопрокрутка выполнена');
      }, 100); // Небольшая задержка для корректного рендеринга
    } else {
      console.log('📜 [ChatBot] useEffect: автопрокрутка НЕ выполнена, причины:', {
        'scrollViewRef.current': !!scrollViewRef.current,
        'messages.length': messages.length
      });
    }
  }, [messages]);

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

  // Функция для добавления простого сообщения
  const addSimpleMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content
    };
    setMessages(prev => [...prev, message]); // Добавляем в конец
  };

  // Функция для добавления игрового сообщения с tool invocation
  const addGameMessage = (toolName: ToolInvocation['toolName'], data: any, customContent?: string) => {
    const content = customContent || getGameMessageContent(toolName, data);
    
    const message: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content,
      toolInvocations: [{
        toolCallId: `${toolName}-${Date.now()}`,
        toolName,
        state: 'result',
        result: data
      }]
    };
    
    setMessages(prev => [...prev, message]); // Добавляем в конец
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

    const userInput = input.trim();
    setInput('');
    setIsLoading(true);

    // Добавляем сообщение пользователя в конец
    setMessages(prev => [...prev, userMessage]);

    try {
      await handleSubmitCore(userInput);
    } catch (error) {
      console.error('Ошибка при обработке сообщения:', error);
      addSimpleMessage('Извините, произошла ошибка. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
    }
  };

  // Выносим основную логику в отдельную функцию для лучшего контроля
  const handleSubmitCore = async (userInput: string) => {
    console.log('🔍 [GAME_FLOW] ================ ЭТАП 3: ПРОВЕРКА НА ОТЧЕТ ================');
    console.log('🔍 [GAME_FLOW] handleSubmitCore: ДЕТАЛЬНАЯ ДИАГНОСТИКА');
    console.log('🔍 [GAME_FLOW] handleSubmitCore: needsReport (локальное) =', needsReport);
    console.log('🔍 [GAME_FLOW] handleSubmitCore: currentPlanForReport =', currentPlanForReport);
    console.log('🔍 [GAME_FLOW] handleSubmitCore: currentPlayer?.plan =', currentPlayer?.plan);
    console.log('🔍 [GAME_FLOW] handleSubmitCore: user =', !!user);
    console.log('🔍 [GAME_FLOW] handleSubmitCore: userInput.length =', userInput.length);
    
    // Проверяем, нужен ли отчет (используем локальное состояние)
    if (needsReport && currentPlanForReport && user) {
      console.log('📝 [GAME_FLOW] ================ ЭТАП 4: ОБРАБОТКА ОТЧЕТА ================');
      console.log('📝 [GAME_FLOW] handleSubmitCore: ОБРАБАТЫВАЕМ ОТЧЕТ для плана:', currentPlanForReport);
      console.log('📝 [GAME_FLOW] handleSubmitCore: user.id =', user.id);
      console.log('📝 [GAME_FLOW] handleSubmitCore: Длина отчета:', userInput.length, 'символов');
      
      // ✨ НОВАЯ АРХИТЕКТУРА: markReportCompleted теперь выполняется в Inngest
      // при обработке события game.report.submit - флаг needsReport будет сброшен автоматически
      console.log('✅ [EventDriven] handleSubmitCore: Отчет будет обработан в Inngest - флаг needsReport сбросится автоматически');

      console.log('📝 [GAME_FLOW] ================ ЭТАП 5: ГЕНЕРАЦИЯ ДУХОВНОГО КОММЕНТАРИЯ ================');
      // Создаем духовный комментарий Лилы к отчету
      const planInfo = getPlanInfo(currentPlanForReport);
      console.log('📝 [GAME_FLOW] handleSubmitCore: planInfo =', JSON.stringify(planInfo, null, 2));
      const spiritualCommentary = generateSpiritualCommentary(userInput, currentPlanForReport, planInfo);
      console.log('📝 [GAME_FLOW] handleSubmitCore: spiritualCommentary длина =', spiritualCommentary.length);

      console.log('💬 [GAME_FLOW] handleSubmitCore: Генерируем ответ Лилы на отчет');

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: spiritualCommentary
      };

      setMessages(prev => [...prev, responseMessage]); // Добавляем в конец

      // ✨ НОВАЯ АРХИТЕКТУРА: Отправляем событие отчета в Inngest
      console.log('💾 [EventDriven] handleSubmitCore: Отправляем событие отчета в Inngest...');
      const userId = user?.id || userData?.user_id || 'test-user-demo';
      InngestEventService.sendPlayerReport(userId, userInput, currentPlanForReport);

      // Флаг needsReport будет сброшен автоматически в Inngest при обработке события

      console.log('🔄 [GAME_FLOW] ================ ЭТАП 6: РАЗБЛОКИРОВКА КУБИКА ================');
      // УБИРАЕМ автоматический бросок кубика - игрок должен сам решить, когда готов продолжить
      console.log('✅ [GAME_FLOW] handleSubmitCore: Отчет обработан, кубик разблокирован');
      
      // Добавляем сообщение о том, что кубик разблокирован
      setTimeout(() => {
        console.log('🎲 [GAME_FLOW] Добавляем сообщение о разблокировке кубика');
        addSimpleMessage('✅ **Отчет принят!** Кубик разблокирован. Вы можете продолжить духовное путешествие, бросив кубик, или задать мне вопросы для углубления понимания.');
        
        // ДОБАВЛЯЕМ НОВЫЙ КУБИК после разблокировки
        setTimeout(() => {
          console.log('🎲 [GAME_FLOW] Добавляем новый кубик для следующего хода');
          addGameMessage('showDiceButton', {
            message: '🎲 Готовы к следующему ходу?',
            disabled: false
          }, 'Кубик готов к новому броску:');
          console.log('🎲 [GAME_FLOW] ================ ЦИКЛ ЗАВЕРШЕН - ГОТОВ К НОВОМУ ЭТАПУ 1 ================');
        }, 300);
      }, 500); // Короткая задержка для лучшего UX

      return; // Выходим, так как это был отчет
    } else {
      console.log('🤔 [GAME_FLOW] handleSubmitCore: НЕ ОБРАБАТЫВАЕМ КАК ОТЧЕТ');
      console.log('🤔 [GAME_FLOW] handleSubmitCore: Причины:');
      console.log('🤔 [GAME_FLOW] handleSubmitCore: - needsReport =', needsReport);
      console.log('🤔 [GAME_FLOW] handleSubmitCore: - currentPlanForReport =', currentPlanForReport);
      console.log('🤔 [GAME_FLOW] handleSubmitCore: - user =', !!user);
    }

    console.log('💭 [GAME_FLOW] ================ ОБЫЧНОЕ СООБЩЕНИЕ ================');
    // Обычная обработка сообщений (если отчет не нужен)
    console.log('💭 [GAME_FLOW] handleSubmitCore: Обрабатываем обычное сообщение');
    
    // Используем мок ответ вместо API
    const mockResponse = generateMockResponse(userInput);
    setMessages(prev => [...prev, mockResponse]); // Добавляем в конец
    
    // ✨ TODO: В будущем можно добавить сохранение обычных диалогов через Inngest
    // if (user) {
    //   InngestEventService.sendChatHistory(user.id, userInput, mockResponse.content, 'question');
    // }
  };

  // ✨ REMOVED: Старые функции сохранения заменены на Inngest события
  // saveReportInBackground и saveHistoryInBackground теперь обрабатываются в Inngest

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
    
    // ДОБАВЛЯЕМ КУБИК если игра готова к ходу и отчет не нужен
    console.log('🎮 [generateMockResponse] Проверяем, нужно ли добавить кубик:');
    console.log('🎮 [generateMockResponse] - currentPlayer =', currentPlayer);
    console.log('🎮 [generateMockResponse] - needsReport =', needsReport);
    console.log('🎮 [generateMockResponse] - currentPlayer?.isFinished =', currentPlayer?.isFinished);
    
    if (currentPlayer && !needsReport && !currentPlayer.isFinished) {
      console.log('🎮 [generateMockResponse] ДОБАВЛЯЕМ КУБИК к обычному ответу');
      
      // Добавляем кубик к toolInvocations
      toolInvocations.push({
        toolCallId: `dice-${Date.now()}`,
        toolName: 'showDiceButton',
        state: 'result',
        result: {
          message: '🎲 Готовы продолжить путешествие?',
          disabled: false
        }
      });
    } else {
      console.log('🎮 [generateMockResponse] НЕ добавляем кубик, причины:', {
        'нет currentPlayer': !currentPlayer,
        'нужен отчет': needsReport,
        'игра завершена': currentPlayer?.isFinished
      });
    }
    
    return {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content,
      toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
    };
  };

  // Функция для генерации глубокого духовного комментария Лилы к отчету
  const generateSpiritualCommentary = (userReport: string, planNumber: number, planInfo: any): string => {
    const reportLength = userReport.length;
    const hasDeepReflection = userReport.toLowerCase().includes('чувствую') || 
                             userReport.toLowerCase().includes('понимаю') || 
                             userReport.toLowerCase().includes('осознаю') ||
                             userReport.toLowerCase().includes('ощущаю') ||
                             userReport.toLowerCase().includes('переживаю');
    
    // Анализ качества отчета
    let qualityFeedback = '';
    if (reportLength < 30) {
      qualityFeedback = '\n\n📝 *Краткие размышления тоже ценны, но попробуйте в следующий раз углубиться в детали своего опыта.*';
    } else if (reportLength > 100 && hasDeepReflection) {
      qualityFeedback = '\n\n✨ *Ваша глубокая рефлексия и искренность вдохновляют! Именно так раскрывается внутренняя мудрость.*';
    } else if (hasDeepReflection) {
      qualityFeedback = '\n\n💫 *Ваша осознанность и честность с собой - ключ к духовному росту.*';
    }

    // Базовые духовные приветствия
    const greetings = [
      `🙏 **Намасте, дорогая душа!** Ваш отчет о плане ${planNumber} "${planInfo.name}" тронул мое сердце.`,
      `✨ **Благословенно!** Ваши размышления о "${planInfo.name}" показывают истинное стремление к самопознанию.`,
      `🕉️ **Саттва наполняет ваши слова!** Опыт на плане ${planNumber} отражает рост вашего сознания.`,
      `🌟 **Дхарма ведет вас верно!** Ваше описание "${planInfo.name}" демонстрирует глубину понимания.`
    ];

    // Мудрость по уровням планов
    const planLevel = Math.ceil(planNumber / 9);
    let levelWisdom = '';
    let spiritualQuestion = '';
    
    switch(planLevel) {
      case 1: // 1-9 Физический план
        levelWisdom = '\n\n🌱 **Физический план сознания** - здесь душа учится через материю и тело. Каждое переживание на этом уровне закладывает фундамент для высших планов.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Как ваше тело и материальные обстоятельства отражают состояние вашей души? Что физический мир учит вас о духовных законах?';
        break;
      case 2: // 10-18 Астральный план  
        levelWisdom = '\n\n✨ **Астральный план** - мир эмоций, творчества и тонких энергий. Здесь вы учитесь различать истинные чувства от эмоциональных иллюзий.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Какие эмоции ведут вас к истине, а какие - в майю (иллюзию)? Как творческая энергия связывает вас с Божественным источником?';
        break;
      case 3: // 19-27 Небесный план
        levelWisdom = '\n\n☁️ **Небесный план** - сфера воли, силы и формирования характера. Здесь закаляется ваша духовная решимость.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Как ваша воля служит высшей цели? Какие качества характера помогают, а какие мешают вашему освобождению?';
        break;
      case 4: // 28-36 План баланса
        levelWisdom = '\n\n❤️ **План баланса** - гармония между противоположностями, единство разума и сердца. Здесь рождается мудрость равновесия.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Где в вашей жизни нужно больше равновесия? Как объединить мудрость ума с мудростью сердца в единое целое?';
        break;
      case 5: // 37-45 Человеческий план
        levelWisdom = '\n\n🗣️ **Человеческий план** - место истины, самовыражения и служения. Здесь вы учитесь быть подлинно человечными.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Какую истину вы готовы выразить миру? Как ваше служение другим становится служением собственному освобождению?';
        break;
      case 6: // 46-54 План аскетизма
        levelWisdom = '\n\n👁️ **План аскетизма** - развитие внутреннего зрения и отречение от иллюзий. Здесь открывается третий глаз мудрости.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** От каких привязанностей вы готовы отречься ради истины? Что открывается вашему внутреннему взору в тишине?';
        break;
      case 7: // 55-63 План сознания
        levelWisdom = '\n\n🧠 **План сознания** - высшие сферы разума, где рождается истинная мудрость. Здесь ум становится инструментом духа.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Как изменилось ваше понимание реальности? Какая мудрость приходит к вам в моменты глубокой тишины ума?';
        break;
      case 8: // 64-72 Абсолютный план
        levelWisdom = '\n\n🕉️ **Абсолютный план** - единство с космическим сознанием, врата к мокше. Здесь индивидуальное сознание сливается с универсальным.';
        spiritualQuestion = '\n\n💭 **Вопрос для размышления:** Как ощущается единство со всем сущим? Что означает для вас растворение эго в океане Абсолютного Сознания?';
        break;
    }
    
    // Заключительное вдохновение
    const inspirations = [
      '\n\n🌸 **Продолжайте садхану:** Каждый вопрос, каждое сомнение, каждое прозрение - это ступени лестницы к самореализации.',
      '\n\n🌺 **Доверьтесь процессу:** Ваша душа знает путь. Позвольте интуиции и мудрости сердца направлять вас.',
      '\n\n🪷 **Углубляйтесь в понимание:** Диалог с мудростью - это тоже форма медитации. Задавайте вопросы, исследуйте глубже.',
      '\n\n🌿 **Каждый момент священен:** В этом диалоге, в этом размышлении происходит настоящая трансформация сознания.'
    ];

    // Собираем финальный комментарий
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];
    const inspiration = inspirations[Math.floor(Math.random() * inspirations.length)];

    return greeting + levelWisdom + spiritualQuestion + qualityFeedback + inspiration;
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
    console.log('🎲 [EventDriven] ================ ОТПРАВКА СОБЫТИЯ БРОСКА КУБИКА ================');
    console.log('🎲 [EventDriven] handleNewDiceRoll: НАЧАЛО - теперь только отправка события');
    
    if (!currentPlayer) {
      console.error('🎲 [EventDriven] ОШИБКА - нет currentPlayer');
      addSimpleMessage('❌ ОШИБКА: Игрок не найден. Попробуйте перезагрузить страницу.');
      return;
    }

    // Проверяем блокировку кубика
    if (needsReport) {
      console.log('🎲 [EventDriven] КУБИК ЗАБЛОКИРОВАН! needsReport =', needsReport);
      addSimpleMessage('🚫 Кубик заблокирован! Сначала напишите отчет о вашем текущем плане в чате!');
      return;
    }

    try {
      setIsLoading(true);
      
      // Генерируем случайное число от 1 до 6
      const roll = Math.floor(Math.random() * 6) + 1;
      console.log('🎲 [EventDriven] Сгенерированный бросок =', roll);
      setLastRoll(roll);
      
      // Определяем userId
      const userId = user?.id || userData?.user_id || 'test-user-demo';
      console.log('🎲 [EventDriven] Отправляем событие в Inngest: userId =', userId, 'roll =', roll);

      // ✨ НОВАЯ АРХИТЕКТУРА: Отправляем событие в Inngest вместо прямого вызова
      const result = await InngestEventService.sendDiceRoll(userId, roll);
      
      if (!result.success) {
        throw new Error(`Ошибка отправки события: ${result.error}`);
      }

      console.log('🎲 [EventDriven] Событие отправлено успешно, eventId =', result.eventId);
      
      // Показываем пользователю, что бросок обрабатывается
      addSimpleMessage(`🎲 Бросок ${roll}! Обрабатываю результат...`);
      
      // Состояние будет обновлено автоматически через Apollo при получении события game.player.state.update

    } catch (error) {
      console.error('🎲 [EventDriven] ОШИБКА отправки события:', error);
      addSimpleMessage('❌ Произошла ошибка при броске кубика. Попробуйте еще раз.');
    } finally {
      setIsLoading(false);
      console.log('🎲 [EventDriven] ================ ЗАВЕРШЕНИЕ ================');
    }
  };

  // Новая функция для начала написания отчета
  const startReportWriting = () => {
    // Эта функция больше не нужна, так как отчеты пишутся прямо в чат
    console.log('📝 [ChatBot] startReportWriting: DEPRECATED - отчеты теперь пишутся в чат');
  };

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    console.log('🔧 [ChatBot] ================ renderToolInvocation: НАЧАЛО ================');
    console.log('🔧 [ChatBot] renderToolInvocation: toolInvocation =', JSON.stringify(toolInvocation, null, 2));
    
    const { toolName, state, result } = toolInvocation;
    console.log('🔧 [ChatBot] renderToolInvocation: toolName =', toolName);
    console.log('🔧 [ChatBot] renderToolInvocation: state =', state);
    console.log('🔧 [ChatBot] renderToolInvocation: result =', JSON.stringify(result, null, 2));

    if (state === 'result' && result) {
      console.log('🔧 [ChatBot] renderToolInvocation: state === result && result существует');
      
      switch (toolName) {
        case 'createPlanCard':
          console.log('🔧 [ChatBot] renderToolInvocation: СОЗДАЕМ PlanCard');
          return (
            <PlanCard
              key={toolInvocation.toolCallId}
              planNumber={result.planNumber}
              planInfo={result.planInfo}
              isCurrentPosition={result.isCurrentPosition}
            />
          );
        
        case 'showDice':
          console.log('🔧 [ChatBot] ================ renderToolInvocation: СОЗДАЕМ DiceInChat ================');
              console.log('🔧 [GAME_FLOW] renderToolInvocation: ДЕТАЛЬНАЯ ДИАГНОСТИКА КУБИКА:');
    console.log('🔧 [GAME_FLOW] renderToolInvocation: result =', JSON.stringify(result, null, 2));
    console.log('🔧 [GAME_FLOW] renderToolInvocation: result.disabled =', result.disabled);
    console.log('🔧 [GAME_FLOW] renderToolInvocation: currentPlayer =', JSON.stringify(currentPlayer, null, 2));
    console.log('🔧 [GAME_FLOW] renderToolInvocation: currentPlayer?.needsReport =', currentPlayer?.needsReport);
    console.log('🔧 [GAME_FLOW] renderToolInvocation: needsReport (локальная переменная) =', needsReport);
          
          const finalDisabled = result.disabled || (currentPlayer?.needsReport ?? false);
          console.log('🔧 [ChatBot] renderToolInvocation: РАСЧЕТ ИТОГОВОГО disabled:');
          console.log('🔧 [ChatBot] renderToolInvocation: - result.disabled =', result.disabled);
          console.log('🔧 [ChatBot] renderToolInvocation: - currentPlayer?.needsReport =', currentPlayer?.needsReport);
          console.log('🔧 [ChatBot] renderToolInvocation: - needsReport =', needsReport);
          console.log('🔧 [ChatBot] renderToolInvocation: - ИТОГОВЫЙ finalDisabled =', finalDisabled);
          console.log('🔧 [ChatBot] renderToolInvocation: ЛОГИКА: result.disabled || currentPlayer?.needsReport =', result.disabled, '||', currentPlayer?.needsReport, '=', finalDisabled);
          
          console.log('🔧 [ChatBot] renderToolInvocation: СОЗДАЕМ DiceInChat с параметрами:');
          console.log('🔧 [ChatBot] renderToolInvocation: - key =', toolInvocation.toolCallId);
          console.log('🔧 [ChatBot] renderToolInvocation: - onRoll = handleNewDiceRoll (функция)');
          console.log('🔧 [ChatBot] renderToolInvocation: - lastRoll =', lastRoll);
          console.log('🔧 [ChatBot] renderToolInvocation: - disabled =', finalDisabled);
          console.log('🔧 [ChatBot] renderToolInvocation: - message =', result.message);
          
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
          console.log('🔧 [ChatBot] renderToolInvocation: СОЗДАЕМ DiceButton');
          console.log('🔧 [ChatBot] renderToolInvocation: DiceButton параметры:');
          console.log('🔧 [ChatBot] renderToolInvocation: - key =', toolInvocation.toolCallId);
          console.log('🔧 [ChatBot] renderToolInvocation: - onRoll = handleNewDiceRoll (функция)');
          console.log('🔧 [ChatBot] renderToolInvocation: - disabled =', result.disabled);
          console.log('🔧 [ChatBot] renderToolInvocation: - message =', result.message);
          
          return (
            <DiceButton
              key={toolInvocation.toolCallId}
              onRoll={handleNewDiceRoll}
              disabled={result.disabled}
              message={result.message}
            />
          );

        case 'showGameResult':
          console.log('🔧 [ChatBot] renderToolInvocation: СОЗДАЕМ GameResult');
          console.log('🔧 [ChatBot] renderToolInvocation: GameResult параметры:', {
            roll: result.roll,
            fromPlan: result.fromPlan,
            toPlan: result.toPlan,
            direction: result.direction,
            message: result.message
          });
          
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
          console.log('🔧 [ChatBot] renderToolInvocation: showReportButton DEPRECATED - отчеты теперь в чате');
          // Кнопка отчета больше не используется - отчеты пишутся прямо в чат
          return null;
        
        default:
          console.log('🔧 [ChatBot] renderToolInvocation: НЕИЗВЕСТНЫЙ toolName =', toolName);
          return null;
      }
    }

    if (state !== 'result') {
      console.log('🔧 [ChatBot] renderToolInvocation: state !== result, показываем индикатор загрузки');
      console.log('🔧 [ChatBot] renderToolInvocation: state =', state);
      
      const loadingMessage = toolName === 'createPlanCard' ? '🎴 Создаю карточку плана...' : 
                            toolName === 'showDice' ? '🎲 Подготавливаю кубик...' :
                            toolName === 'showDiceButton' ? '🎲 Подготавливаю кнопку броска...' :
                            toolName === 'showGameResult' ? '🎮 Обрабатываю результат...' :
                            toolName === 'showReportButton' ? '📝 Подготавливаю форму отчета...' :
                            'Обрабатываю...';
      
      console.log('🔧 [ChatBot] renderToolInvocation: loadingMessage =', loadingMessage);
      
      return (
        <View key={toolInvocation.toolCallId} className="bg-purple-50 rounded-lg p-3 m-2">
          <Text className="text-purple-600 text-sm">
            {loadingMessage}
          </Text>
        </View>
      );
    }

    console.log('🔧 [ChatBot] renderToolInvocation: Возвращаем null (нет подходящих условий)');
    console.log('🔧 [ChatBot] renderToolInvocation: ================ ЗАВЕРШЕНИЕ ================');
    return null;
  };

  // Функция для очистки истории чата (для тестирования)
  const clearChatHistory = () => {
    setMessages([
      { 
        id: '1', 
        role: 'assistant', 
        content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Я здесь, чтобы помочь вам понять глубокий смысл вашего духовного путешествия через священную игру Лила.\n\n🎮 Готовы начать свое путешествие по планам сознания?' 
      },
      {
        id: 'start-game-message',
        role: 'assistant',
        content: '🎯 Начните свое духовное путешествие:',
        toolInvocations: [{
          toolCallId: 'start-game-button',
          toolName: 'showDiceButton',
          state: 'result',
          result: {
            message: '🎲 Начать игру Лила',
            disabled: false
          }
        }]
      }
    ]);
    setHistoryLoaded(false);
  };

  // Компонент кнопки для броска кубика
  const DiceButton: React.FC<{ onRoll: () => Promise<void>; disabled?: boolean; message?: string }> = ({ 
    onRoll, 
    disabled = false, 
    message = "🎲 Готовы бросить кубик?" 
  }) => {
    console.log('🎲 [DiceButton] ================ КОМПОНЕНТ DiceButton РЕНДЕРИТСЯ ================');
    console.log('🎲 [DiceButton] Параметры компонента:');
    console.log('🎲 [DiceButton] - onRoll =', typeof onRoll, '(функция существует)');
    console.log('🎲 [DiceButton] - disabled =', disabled);
    console.log('🎲 [DiceButton] - message =', message);
    console.log('🎲 [DiceButton] - isLoading =', isLoading);
    console.log('🎲 [DiceButton] - needsReport =', needsReport);

    const handleRoll = async () => {
      console.log('🎲 [DiceButton] ================ handleRoll: НАЧАЛО ================');
      console.log('🎲 [DiceButton] handleRoll: Кнопка кубика нажата!');
      console.log('🎲 [DiceButton] handleRoll: disabled =', disabled);
      console.log('🎲 [DiceButton] handleRoll: isLoading =', isLoading);
      console.log('🎲 [DiceButton] handleRoll: needsReport =', needsReport);
      console.log('🎲 [DiceButton] handleRoll: onRoll =', typeof onRoll);
      
      if (disabled || isLoading || needsReport) {
        console.log('🎲 [DiceButton] handleRoll: БЛОКИРОВКА - кнопка заблокирована');
        console.log('🎲 [DiceButton] handleRoll: - disabled =', disabled);
        console.log('🎲 [DiceButton] handleRoll: - isLoading =', isLoading);
        console.log('🎲 [DiceButton] handleRoll: - needsReport =', needsReport);
        return;
      }

      try {
        console.log('🎲 [DiceButton] handleRoll: Вызываем onRoll()...');
        await onRoll();
        console.log('🎲 [DiceButton] handleRoll: onRoll() успешно выполнен');
      } catch (error) {
        console.error('🎲 [DiceButton] handleRoll: ОШИБКА при выполнении onRoll:', error);
        console.error('🎲 [DiceButton] handleRoll: Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');
      }
      
      console.log('🎲 [DiceButton] handleRoll: ================ ЗАВЕРШЕНИЕ ================');
    };

    const buttonMessage = needsReport 
      ? "📝 Сначала напишите отчет о текущем плане!"
      : message;

    const isButtonDisabled = disabled || isLoading || needsReport;

    console.log('🎲 [DiceButton] Рендеринг с параметрами:');
    console.log('🎲 [DiceButton] - buttonMessage =', buttonMessage);
    console.log('🎲 [DiceButton] - isButtonDisabled =', isButtonDisabled);
    console.log('🎲 [DiceButton] - onPress = handleRoll (функция)');

    return (
      <View className="glass-effect glass-button m-2 p-4 border-2 border-purple-400">
        <Text className="text-black text-center mb-3 font-medium">{buttonMessage}</Text>
        <TouchableOpacity
          onPress={handleRoll}
          disabled={isButtonDisabled}
          className={`glass-effect rounded-lg py-3 px-6 border border-purple-300 ${
            isButtonDisabled ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-black text-center font-semibold">
            {isLoading ? '🎲 Бросаю...' : needsReport ? '🔒 Заблокировано' : '🎲 Бросить кубик'}
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
      <View className="glass-effect glass-card m-2 p-4 border-2 border-green-400">
        <Text className="text-lg font-bold text-black text-center mb-2">
          🎲 Выпало: {roll}
        </Text>
        <Text className="text-black text-center mb-2 font-medium">
          Переход: План {fromPlan} → План {toPlan}
        </Text>
        <Text className="text-black text-center text-sm mb-2">
          Направление: {direction}
        </Text>
        <Text className="text-black text-center">
          {message}
        </Text>
      </View>
    );
  };

  // Компонент кнопки для написания отчета (теперь не используется)
  const ReportButton: React.FC<{ onReport: () => void; planNumber: number; disabled?: boolean }> = ({ 
    onReport, 
    planNumber, 
    disabled = false 
  }) => {
    return (
      <View className="glass-effect glass-card m-2 p-4 border-2 border-orange-400">
        <Text className="text-black text-center mb-3 font-medium">
          📝 Время для отчета о плане {planNumber}
        </Text>
        <TouchableOpacity
          onPress={onReport}
          disabled={disabled}
          className={`glass-effect rounded-lg py-3 px-6 border border-orange-300 ${
            disabled ? 'opacity-50' : ''
          }`}
        >
          <Text className="text-black text-center font-semibold">
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
                {needsReport 
                  ? `📝 Напишите отчет о плане ${currentPlanForReport}` 
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
      
      <ScrollView className="flex-1 p-3" ref={scrollViewRef}>
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
              needsReport 
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
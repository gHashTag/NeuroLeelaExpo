import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanCard } from './PlanCard';
import { DiceInChat } from './DiceInChat';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { processGameStep } from '@/services/GameService';
import { updatePlayerInStorage, markReportCompleted } from '@/lib/apollo-drizzle-client';
import { supabase } from '@/config/supabase';
import { useSupabase } from '@/context/supabase-provider';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ToolInvocation {
  toolCallId: string;
  toolName: 'createPlanCard' | 'showDice' | 'gameStatus';
  state: 'partial-call' | 'call' | 'result' | 'error';
  args?: any;
  result?: any;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Я здесь, чтобы помочь вам понять глубокий смысл вашего духовного путешествия. Спросите меня о любом плане (1-72) или просто поделитесь своими мыслями!' 
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [lastRoll, setLastRoll] = useState(1);
  
  // Игровое состояние
  const { currentPlayer } = useApolloDrizzle();
  const { user } = useSupabase();

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

  // Добавляем игровые сообщения при изменении состояния игрока
  useEffect(() => {
    if (currentPlayer) {
      // Если игрок переместился на новый план, показываем информацию о нем
      if (currentPlayer.plan !== currentPlayer.previous_plan && currentPlayer.plan > 0) {
        const planInfo = getPlanInfo(currentPlayer.plan);
        addGameMessage('createPlanCard', {
          type: 'plan-card',
          planNumber: currentPlayer.plan,
          planInfo,
          isCurrentPosition: true,
          timestamp: new Date().toISOString()
        }, `🎯 Вы достигли плана ${currentPlayer.plan}: "${planInfo.name}" ${planInfo.element}\n\n${planInfo.description}`);
      }
      
      // Проверяем, нужно ли показать запрос отчета
      if (currentPlayer.needsReport) {
        const planInfo = getPlanInfo(currentPlayer.plan);
        const prompt = getPlanPrompt(currentPlayer.plan);
        addSimpleMessage(`📝 Время для отчета о плане ${currentPlayer.plan}: "${planInfo.name}"\n\n${prompt}\n\n💡 Напишите ваши размышления и наблюдения в чате. После отправки отчета вы сможете продолжить игру.`);
      }
      // Показываем кубик только если отчет НЕ нужен и игрок может делать ход
      else if (!currentPlayer.needsReport && currentPlayer.plan > 0) {
        // Если игра завершена на плане 68
        if (currentPlayer.plan === 68 && currentPlayer.isFinished) {
          addGameMessage('showDice', {
            message: "🎲 Вы достигли Космического сознания! Бросьте 6, чтобы начать новый путь самопознания!",
            disabled: false
          });
        } 
        // Если игра не завершена
        else if (!currentPlayer.isFinished) {
          addGameMessage('showDice', {
            message: `🎲 Готовы к следующему шагу? Вы на плане ${currentPlayer.plan}`,
            disabled: false
          });
        }
      }
    }
  }, [currentPlayer?.needsReport, currentPlayer?.plan, currentPlayer?.isFinished, currentPlayer?.previous_plan]);

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

    try {
      // Проверяем, нужен ли отчет
      if (currentPlayer?.needsReport && user) {
        // Сохраняем отчет пользователя в базу данных
        const { data: reportData, error: reportError } = await supabase
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

        if (reportError) {
          console.error("Ошибка при создании отчета:", reportError);
          throw reportError;
        }

        // Отмечаем отчет как завершенный
        await markReportCompleted(user.id);

        // Формируем контекст для ИИ с информацией о плане и отчете
        const planInfo = getPlanInfo(currentPlayer.plan);
        const systemPrompt = `Ты - Лила, богиня игры самопознания. Игрок только что написал отчет о своем опыте на плане ${currentPlayer.plan}: "${planInfo.name}" (${planInfo.description}).

Отчет игрока: "${userInput}"

Твоя задача:
- Дать мудрый и сострадательный отклик на отчет игрока
- Связать его опыт с духовным значением плана ${currentPlayer.plan}
- Дать рекомендации для дальнейшего духовного развития
- Поздравить с завершением отчета и предложить продолжить игру

Отвечай с мудростью древних ведических текстов, будь сострадательной и понимающей. В конце обязательно скажи что-то вроде "Теперь вы готовы к следующему шагу на пути самопознания! 🎲"`;

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
            'HTTP-Referer': 'https://neurolila.app',
            'X-Title': 'NeuroLila Game'
          },
          body: JSON.stringify({
            model: 'meta-llama/llama-3.1-8b-instruct:free',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userInput }
            ],
            temperature: 0.7,
            max_tokens: 500
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenRouter API error: ${response.status}`);
        }

        const data = await response.json();
        const aiResponse = data.choices?.[0]?.message?.content || 
          `✅ Благодарю за ваш искренний отчет о плане ${currentPlayer.plan}! Ваши размышления записаны в дневник духовного пути. Теперь вы готовы к следующему шагу на пути самопознания! 🎲`;

        // Сохраняем диалог в истории чата
        await supabase
          .from("chat_history")
          .insert({
            user_id: user.id,
            plan_number: currentPlayer.plan,
            user_message: userInput,
            ai_response: aiResponse,
            report_id: reportData.id,
            message_type: 'report'
          });

        const responseMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: aiResponse
        };

        setMessages(prev => [responseMessage, ...prev]);

        // После ответа ИИ на отчет автоматически показываем кубик для следующего хода
        setTimeout(() => {
          if (currentPlayer.plan === 68 && currentPlayer.isFinished) {
            addGameMessage('showDice', {
              message: "🎲 Вы достигли Космического сознания! Бросьте 6, чтобы начать новый путь самопознания!",
              disabled: false
            });
          } else {
            addGameMessage('showDice', {
              message: `🎲 Готовы к следующему шагу? Бросьте кубик для продолжения путешествия!`,
              disabled: false
            });
          }
        }, 1000);

        return; // Выходим, так как это был отчет
      }

      // Обычная обработка сообщений (если отчет не нужен)
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.EXPO_PUBLIC_OPENROUTER_API_KEY}`,
          'HTTP-Referer': 'https://neurolila.app',
          'X-Title': 'NeuroLila Game'
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            {
              role: 'system',
              content: `Ты - Лила, богиня игры самопознания. Ты мудрая наставница, которая помогает игрокам понять глубокий смысл их путешествия по игровому полю. 

Твоя роль:
- Объяснять значение позиций на игровом поле (планы 1-72)
- Давать духовные советы и наставления
- Помогать игрокам понять уроки, которые несет каждый ход
- Отвечать с мудростью древних ведических текстов
- Быть сострадательной и понимающей

Отвечай кратко, но глубоко. Используй эмодзи для выражения эмоций. Всегда помни, что игра Лила - это путь к самопознанию и космическому сознанию.

Если игрок спрашивает о конкретном плане, дай подробное объяснение его духовного значения.`
            },
            // Обращаем порядок сообщений для API (от старых к новым)
            ...[userMessage, ...messages].reverse().map(msg => ({
              role: msg.role,
              content: msg.content
            }))
          ],
          temperature: 0.7,
          max_tokens: 500
        }),
      });

      if (!response.ok) {
        throw new Error(`OpenRouter API error: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content || 'Извините, произошла ошибка при получении ответа.';

      // Сохраняем обычный диалог в истории чата
      if (user) {
        await supabase
          .from("chat_history")
          .insert({
            user_id: user.id,
            plan_number: currentPlayer?.plan || 1,
            user_message: userInput,
            ai_response: aiResponse,
            message_type: 'question'
          });
      }

      // Проверяем, упоминает ли ИИ конкретный план для создания карточки
      const planMatch = aiResponse.match(/план[а-я\s]*(\d+)|позици[а-я\s]*(\d+)|(\d+)[а-я\s]*план/i);
      const planNumber = planMatch ? parseInt(planMatch[1] || planMatch[2] || planMatch[3]) : null;

      let toolInvocations: ToolInvocation[] = [];
      
      // Если ИИ упоминает план, создаем карточку
      if (planNumber && planNumber >= 1 && planNumber <= 72) {
        const planInfo = getPlanInfo(planNumber);
        toolInvocations = [{
          toolCallId: `ai-${Date.now()}`,
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
      }

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: aiResponse,
        toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
      };

      setMessages(prev => [responseMessage, ...prev]); // Добавляем в начало
    } catch (error) {
      console.error('Ошибка ИИ:', error);
      // Fallback к мок ответам только в случае ошибки
      const mockResponse = generateMockResponse(userInput);
      setMessages(prev => [mockResponse, ...prev]); // Добавляем в начало
    } finally {
      setIsLoading(false);
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
          return (
            <DiceInChat
              key={toolInvocation.toolCallId}
              onRoll={handleDiceRoll}
              lastRoll={lastRoll}
              disabled={result.disabled || (currentPlayer?.needsReport ?? false)}
              message={result.message}
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
             'Обрабатываю...'}
          </Text>
        </View>
      );
    }

    return null;
  };

  // Обработчик броска кубика
  const handleDiceRoll = async (): Promise<number> => {
    if (!user || !currentPlayer) return 1;

    const roll = Math.floor(Math.random() * 6) + 1;
    setLastRoll(roll);

    try {
      console.log(`🎲 Бросок кубика: ${roll}, текущая позиция: ${currentPlayer.plan}`);
      
      const result = await processGameStep(roll, user.id);
      console.log('🎮 Результат хода:', result);
      
      // Обновляем состояние в localStorage и Apollo
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
      updatePlayerInStorage(updatedPlayer);
      
      // Добавляем только сообщение о результате броска (карточка плана покажется автоматически через useEffect)
      const resultMessage: Message = {
        id: `dice-result-${Date.now()}`,
        role: 'assistant',
        content: `🎲 Выпало ${roll}! ${result.message}`
      };
      
      setMessages(prev => [resultMessage, ...prev]);
      
    } catch (error) {
      console.error('Ошибка при броске кубика:', error);
      const errorMessage: Message = {
        id: `dice-error-${Date.now()}`,
        role: 'assistant',
        content: `🎲 Выпало ${roll}, но произошла ошибка при обработке хода. Попробуйте еще раз.`
      };
      setMessages(prev => [errorMessage, ...prev]);
    }

    return roll;
  };

  return (
    <View className="flex-1 bg-white flex flex-col overflow-hidden">
      <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-700">🕉️ Лила - Духовный проводник</Text>
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
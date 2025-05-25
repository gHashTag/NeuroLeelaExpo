import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PlanCard } from './PlanCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

interface ToolInvocation {
  toolCallId: string;
  toolName: string;
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

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Прямой вызов к OpenRouter API
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
            ...[...messages, userMessage].map(msg => ({
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

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Ошибка ИИ:', error);
      // Fallback к мок ответам только в случае ошибки
      const mockResponse = generateMockResponse(userMessage.content);
      setMessages(prev => [...prev, mockResponse]);
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

  const renderToolInvocation = (toolInvocation: ToolInvocation) => {
    const { toolName, state, result } = toolInvocation;

    if (state === 'result' && toolName === 'createPlanCard' && result) {
      return (
        <PlanCard
          key={toolInvocation.toolCallId}
          planNumber={result.planNumber}
          planInfo={result.planInfo}
          isCurrentPosition={result.isCurrentPosition}
        />
      );
    }

    if (state !== 'result') {
      return (
        <View key={toolInvocation.toolCallId} className="bg-purple-50 rounded-lg p-3 m-2">
          <Text className="text-purple-600 text-sm">
            {toolName === 'createPlanCard' ? '🎴 Создаю карточку плана...' : 'Обрабатываю...'}
          </Text>
        </View>
      );
    }

    return null;
  };

  return (
    <View className="flex-1 bg-white flex flex-col overflow-hidden">
      <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-700">🕉️ Лила - Духовный проводник</Text>
      </View>
      
      <ScrollView className="flex-1 p-3">
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
        
        {isLoading && (
          <View className="items-start flex flex-row mb-3">
            <View className="bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg px-4 py-2 shadow-sm">
              <Text className="text-gray-600">Лила размышляет... 🤔</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
      <View className="border-t border-gray-100 p-3">
        <View className="flex-row items-center">
          <TextInput
            value={input}
            onChangeText={setInput}
            placeholder="Спросите о плане или поделитесь мыслями..."
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
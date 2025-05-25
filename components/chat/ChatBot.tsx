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
      // Сначала пробуем реальный API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(msg => ({
            role: msg.role,
            content: msg.content
          }))
        }),
      });

      // Если API недоступен, используем мок ответы
      if (!response.ok || response.headers.get('content-type')?.includes('text/html')) {
        console.log('API недоступен, используем мок ответы');
        const mockResponse = generateMockResponse(userMessage.content);
        setMessages(prev => [...prev, mockResponse]);
        return;
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';
      let toolInvocations: ToolInvocation[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              // Обычный текстовый контент
              const content = line.slice(3, -1);
              assistantMessage += content;
            } else if (line.startsWith('2:')) {
              // Tool invocation
              try {
                const toolData = JSON.parse(line.slice(2));
                if (toolData.toolInvocation) {
                  toolInvocations.push(toolData.toolInvocation);
                }
              } catch (e) {
                console.log('Не удалось распарсить tool data:', e);
              }
            }
          }
        }
      }

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage || 'Извините, произошла ошибка при получении ответа.',
        toolInvocations: toolInvocations.length > 0 ? toolInvocations : undefined
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Ошибка чата:', error);
      // Используем мок ответ в случае ошибки
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
      1: { name: "Рождение", description: "Начало духовного пути", element: "🌱", color: "green" },
      10: { name: "Майя (Иллюзия)", description: "Понимание природы реальности", element: "🎭", color: "purple" },
      23: { name: "Небеса", description: "Состояние блаженства", element: "☁️", color: "blue" },
      41: { name: "Добрые дела", description: "Карма служения", element: "🤝", color: "gold" },
      68: { name: "Космическое сознание", description: "Высшее просветление", element: "🕉️", color: "violet" }
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
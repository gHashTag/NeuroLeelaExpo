import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: 'Намасте! 🙏 Я - Лила, богиня игры самопознания. Я здесь, чтобы помочь вам понять глубокий смысл вашего духовного путешествия. Чем могу помочь?' 
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

      if (!response.ok) {
        throw new Error('Ошибка сети');
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let assistantMessage = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('0:')) {
              const content = line.slice(3, -1); // Убираем '0:"' и '"'
              assistantMessage += content;
            }
          }
        }
      }

      const responseMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage || 'Извините, произошла ошибка при получении ответа.'
      };

      setMessages(prev => [...prev, responseMessage]);
    } catch (error) {
      console.error('Ошибка чата:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Извините, произошла ошибка. Попробуйте позже. 🙏'
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-white flex flex-col overflow-hidden">
      <View className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-700">🕉️ Лила - Духовный проводник</Text>
      </View>
      
      <ScrollView className="flex-1 p-3">
        {messages.map((msg) => (
          <View 
            key={msg.id} 
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
            placeholder="Задайте вопрос о вашем духовном пути..."
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
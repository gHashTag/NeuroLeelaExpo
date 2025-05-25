import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export const ChatBot = () => {
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState([
    { type: 'bot', text: 'Здравствуйте! Я ваш духовный проводник в игре Лила. Чем могу помочь?' },
  ]);

  const sendMessage = () => {
    if (!message.trim()) return;
    
    // Добавляем сообщение пользователя в историю
    setChatHistory([...chatHistory, { type: 'user', text: message }]);
    
    // Здесь будет логика обработки сообщения и ответа бота
    setTimeout(() => {
      setChatHistory(prev => [...prev, { 
        type: 'bot', 
        text: 'Я понимаю ваш духовный путь. Продолжайте движение с осознанностью и внутренней гармонией.' 
      }]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <View className="flex-1 bg-white flex flex-col overflow-hidden">
      <View className="bg-gray-50 p-3 border-b border-gray-100">
        <Text className="text-base font-medium text-gray-700">Духовный проводник</Text>
      </View>
      
      <ScrollView className="flex-1 p-3">
        {chatHistory.map((msg, index) => (
          <View 
            key={index} 
            className={`mb-3 ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-row`}
          >
            <View 
              className={`rounded-lg px-4 py-2 max-w-[85%] ${
                msg.type === 'user' 
                  ? 'bg-blue-500 ml-auto shadow-sm' 
                  : 'bg-gray-100 shadow-sm'
              }`}
            >
              <Text 
                className={msg.type === 'user' ? 'text-white' : 'text-gray-800'}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View className="border-t border-gray-100 p-3 flex-row items-center">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Задайте вопрос..."
          placeholderTextColor="rgba(107,114,128,0.5)"
          className="flex-1 bg-gray-50 rounded-full px-4 py-2 mr-2 text-gray-700"
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          className="bg-blue-500 rounded-full p-2 shadow-sm"
        >
          <Ionicons name="send" size={16} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 
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
    <View className="flex-1 bg-white/40 backdrop-blur-sm rounded-xl shadow-md flex flex-col overflow-hidden border border-white/30">
      <View className="bg-sky-500/20 backdrop-blur-sm p-3 border-b border-white/20">
        <Text className="text-base font-semibold text-sky-700">Духовный помощник</Text>
      </View>
      
      <ScrollView className="flex-1 p-3">
        {chatHistory.map((msg, index) => (
          <View 
            key={index} 
            className={`mb-3 ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-row`}
          >
            <View 
              className={`rounded-2xl px-4 py-2 max-w-[85%] ${
                msg.type === 'user' 
                  ? 'bg-pink-500/90 ml-auto shadow-sm' 
                  : 'bg-white/50 backdrop-blur-sm shadow-sm border border-white/30'
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
      
      <View className="border-t border-white/20 p-2 flex-row items-center">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Задайте вопрос..."
          className="flex-1 bg-white/40 border border-white/30 backdrop-blur-sm rounded-full px-4 py-2 mr-2"
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          className="bg-pink-500/90 rounded-full p-3 shadow-sm"
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 
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
    <View className="flex-1 bg-black/10 backdrop-blur-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-white/10">
      <View className="bg-white/5 backdrop-blur-xl p-4 border-b border-white/10">
        <Text className="text-base font-semibold text-white/90">Духовный проводник</Text>
      </View>
      
      <ScrollView className="flex-1 p-4">
        {chatHistory.map((msg, index) => (
          <View 
            key={index} 
            className={`mb-4 ${msg.type === 'user' ? 'items-end' : 'items-start'} flex flex-row`}
          >
            <View 
              className={`rounded-2xl px-5 py-3 max-w-[85%] ${
                msg.type === 'user' 
                  ? 'bg-gradient-to-r from-pink-600 to-purple-600 ml-auto shadow-lg' 
                  : 'bg-white/10 backdrop-blur-xl shadow-lg border border-white/10'
              }`}
            >
              <Text 
                className={msg.type === 'user' ? 'text-white' : 'text-white/90'}
              >
                {msg.text}
              </Text>
            </View>
          </View>
        ))}
      </ScrollView>
      
      <View className="border-t border-white/10 p-3 flex-row items-center">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Задайте вопрос..."
          placeholderTextColor="rgba(255,255,255,0.5)"
          className="flex-1 bg-white/5 border border-white/10 backdrop-blur-xl rounded-full px-5 py-3 mr-3 text-white"
        />
        <TouchableOpacity 
          onPress={sendMessage} 
          className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-full p-4 shadow-lg"
        >
          <Ionicons name="send" size={18} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
}; 
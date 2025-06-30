import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Image,
  ImageBackground,
} from "react-native";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";
import { format } from "date-fns";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { Header } from "@/components/layout/Header";

interface Message {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export default function AIChat() {
  const { session } = useSupabase();
  const [messages, setMessages] = useState<Message[]>([
    // Начальное сообщение от Leela
    {
      id: "initial",
      content:
        "Namaste!\nMy name is Leela.\nMy job is to guide you through the game to cosmic consciousness.\nHow can I help you?",
      isUser: false,
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Прокрутка к последнему сообщению при добавлении новых сообщений
  useEffect(() => {
    if (messages.length > 0) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [messages]);

  // Функция для отправки сообщения
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    // Создаем уникальный ID для сообщения
    const userMessageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Добавляем сообщение пользователя
    const userMessage: Message = {
      id: userMessageId,
      content: inputText.trim(),
      isUser: true,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsLoading(true);

    // Здесь будет вызов вашего AI API
    try {
      // Имитация задержки ответа от сервера
      setTimeout(() => {
        const aiResponse: Message = {
          id: `ai-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          content:
            "Я помогу вам достичь космического сознания через игру Лила. Задавайте любые вопросы о вашем духовном пути.",
          isUser: false,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiResponse]);
        setIsLoading(false);
      }, 1000);

      // Реальный вызов API будет выглядеть примерно так:
      /*
			const response = await fetch('ваш_api_endpoint', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session?.access_token}`
				},
				body: JSON.stringify({ message: inputText.trim() })
			});
			
			const data = await response.json();
			
			const aiResponse: Message = {
				id: (Date.now() + 1).toString(),
				content: data.response,
				isUser: false,
				timestamp: new Date()
			};
			
			setMessages(prev => [...prev, aiResponse]);
			setIsLoading(false);
			*/
    } catch (error) {
      console.error("Ошибка при получении ответа от AI:", error);
      setIsLoading(false);

      // Добавляем сообщение об ошибке
      const errorMessage: Message = {
        id: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        content: "Извините, произошла ошибка при обработке вашего запроса.",
        isUser: false,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  // Форматирование времени
  const formatTime = (date: Date) => {
    return format(date, "h:mm a");
  };

  // Форматирование даты
  const formatDate = (date: Date) => {
    return format(date, "MMM d, yyyy");
  };

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 w-full">
        <Header title="AI Chat" onInfoPress={() => {}} onBookPress={() => {}} />

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          className="flex-1"
          keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
        >
          <ScrollView
            ref={scrollViewRef}
            className="flex-1 px-4"
            onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 20 }}
          >
            {messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                content={msg.content}
                timestamp={formatTime(msg.timestamp)}
                isUser={msg.isUser}
              />
            ))}

            {isLoading && <ChatMessage content="" timestamp="" isUser={false} loading={true} />}
          </ScrollView>

          {/* Поле ввода */}
          <View className="p-4 border-t border-gray-200 bg-white bg-opacity-90">
            <View className="flex-row items-center bg-gray-100 rounded-full px-4 py-2">
              <TextInput
                value={inputText}
                onChangeText={setInputText}
                placeholder="Type your message..."
                className="flex-1 mr-2"
                multiline
              />
              <TouchableOpacity onPress={sendMessage} disabled={isLoading}>
                <Icon name="send" size={24} color={inputText.trim() ? "#6A0DAD" : "#9CA3AF"} />
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </ImageBackground>
  );
}

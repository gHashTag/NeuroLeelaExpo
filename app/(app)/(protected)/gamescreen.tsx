import React, { useState, useEffect } from "react";
import { View, ImageBackground, Platform, Text, Image, TouchableOpacity, useWindowDimensions } from "react-native";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { Ionicons } from '@expo/vector-icons';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { ChatBot } from '@/components/chat/ChatBot';
import { ApolloStatus } from '@/components/ui/ApolloStatus';
import { GlassContainer } from '@/components/ui/GlassContainer';

// Logo component for the app
const AppLogo = () => (
  <View className="flex-row items-center">
    <View className="w-16 h-16 mr-3 overflow-hidden rounded-full shadow-sm">
      <Image 
        source={require('../../../assets/icon.jpg')}
        style={{ width: '100%', height: '100%' }}
        className="rounded-full"
      />
    </View>
    <Text className="text-xl font-medium text-gray-800">НейроЛила</Text>
  </View>
);

const GameScreen: React.FC = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { userData } = useSupabase();
  const isWeb = Platform.OS === 'web';
  
  // Apollo Drizzle — единый источник истины
  const { currentPlayer, isLoading, error } = useApolloDrizzle();

  // Custom header component - соответствует ширине чата
  const AppHeader = () => (
    <View className="py-4 px-2 z-10 items-center">
      <GlassContainer style={{ borderRadius: 12, overflow: 'hidden', maxWidth: 760, width: '100%' }}>
        <View className="py-3 px-4">
          <View className="flex-row items-center justify-between space-x-4">
        <AppLogo />
        <View className="flex-1 min-w-0 px-2">
          <Text className="text-sm text-center text-gray-700 font-medium leading-relaxed">
                🎮 Игра Лила - духовное путешествие в чате
          </Text>
        </View>
        <View className="flex-row items-center space-x-3">
          {/* Кнопка отчетов */}
          <TouchableOpacity 
            onPress={() => router.push('/reports')}
            className="bg-purple-50 p-2 rounded-full shadow-sm"
          >
            <Ionicons name="book-outline" size={20} color="#8E24AA" />
          </TouchableOpacity>
          
          {/* Индикатор уровня */}
          <View className="flex-row items-center bg-gray-50 px-3 py-2 rounded-full shadow-sm">
                <Text className="text-sm text-gray-500 mr-2">План:</Text>
            <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center shadow-inner">
              <Text className="font-medium text-blue-600">{currentPlayer?.plan ?? '-'}</Text>
            </View>
          </View>
        </View>
      </View>
        </View>
      </GlassContainer>
    </View>
  );

  // Основной интерфейс - только чат на весь экран
      return (
    <ImageBackground
      source={require('../../../public/static/backImage/Green_small_one_palm_leaf_on_white_background.png')}
      style={{ flex: 1 }}
      className="bg-white"
      imageStyle={{ opacity: 1 }}
    >
      <View className="flex-1 bg-transparent">
          <AppHeader />
          
        {/* Статус Apollo в правом верхнем углу */}
        <View className="absolute top-4 right-4 z-20">
          <ApolloStatus />
        </View>
        
        {/* Чат по центру с ограниченной шириной */}
        <View className="flex-1 p-2 items-center">
          <GlassContainer style={{ flex: 1, borderRadius: 12, overflow: 'hidden', maxWidth: 760, width: '100%' }}>
            <ChatBot />
          </GlassContainer>
        </View>
      </View>
    </ImageBackground>
  );
};

export default GameScreen;


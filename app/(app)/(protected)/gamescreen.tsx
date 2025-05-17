import React, { useState, useEffect } from "react";
import { View, ImageBackground, Platform, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, Dimensions, useWindowDimensions } from "react-native";
import { Display, Dice, GameBoard, PlayerStats, PlayerInfoApollo } from "@components/ui/index";
import { ApolloStatus } from "@/components/ui/ApolloStatus";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { ChatBot } from '@/components/chat/ChatBot';
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

// Logo component for the app
const AppLogo = () => (
  <View className="flex-row items-center">
    <View className="w-20 h-20 mr-2 overflow-hidden rounded-full border-2 border-white/20 shadow-lg">
      <Image 
        source={require('../../../assets/icon.jpg')}
        style={{ width: '100%', height: '100%' }}
        className="rounded-full"
      />
    </View>
    <Text className="text-2xl font-bold text-white drop-shadow-md">НейроЛила</Text>
  </View>
);

const GameScreen: React.FC = () => {
  const [lastRoll, setLastRoll] = useState(1);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { userData, getAvatarUrl } = useSupabase();
  const isWeb = Platform.OS === 'web';
  const isLandscape = windowWidth > windowHeight;
  
  // Apollo Drizzle — единый источник истины
  const { currentPlayer, isLoading, error, movePlayer } = useApolloDrizzle();

  // Определяем макет в зависимости от ширины экрана
  const getLayout = () => {
    // Extra large displays
    if (windowWidth > 1600) {
      return {
        leftColumn: "w-1/5", 
        centerColumn: "w-3/5", 
        rightColumn: "w-1/5",
        padding: "p-6",
        gameBoardPadding: "p-4",
        maxWidth: "max-w-[1600px]"
      };
    } 
    // Large displays
    else if (windowWidth > 1200) {
      return {
        leftColumn: "w-1/4", 
        centerColumn: "w-2/4", 
        rightColumn: "w-1/4",
        padding: "p-5",
        gameBoardPadding: "p-3",
        maxWidth: "max-w-[1400px]"
      };
    } 
    // Medium displays
    else if (windowWidth > 992) {
      return {
        leftColumn: "w-1/5", 
        centerColumn: "w-3/5", 
        rightColumn: "w-1/5",
        padding: "p-4",
        gameBoardPadding: "p-2",
        maxWidth: "max-w-[1200px]"
      };
    } 
    // Small displays
    else if (windowWidth > 768) {
      return {
        leftColumn: "w-1/6", 
        centerColumn: "w-4/6", 
        rightColumn: "w-1/6",
        padding: "p-3",
        gameBoardPadding: "p-2",
        maxWidth: "max-w-full"
      };
    }
    // Tablets and mobile (landscape) 
    else if (windowWidth > 640 || isLandscape) {
      return {
        leftColumn: "w-1/6", 
        centerColumn: "w-4/6", 
        rightColumn: "w-1/6",
        padding: "p-2",
        gameBoardPadding: "p-1",
        maxWidth: "max-w-full"
      };
    }
    // Mobile phone (portrait)
    else {
      return {
        leftColumn: "w-full", 
        centerColumn: "w-full", 
        rightColumn: "w-full",
        padding: "p-2",
        gameBoardPadding: "p-1",
        maxWidth: "max-w-full"
      };
    }
  };

  const layout = getLayout();
  
  // Функция броска кубика через Apollo Drizzle
  const rollDice = () => {
    if (!currentPlayer) return;
    const roll = Math.floor(Math.random() * 6) + 1;
    setLastRoll(roll);
    movePlayer(currentPlayer.plan + roll);
    // router.push("/(app)/report"); // если нужен переход
    return roll;
  };

  // Custom header component
  const AppHeader = () => (
    <View className="bg-black/20 backdrop-blur-xl shadow-2xl py-4 px-6 border-b border-white/10 z-10">
      <View className="flex-row items-center justify-between w-full space-x-4">
        <AppLogo />
        <View className="flex-1 min-w-0">
          <Text className="text-xs text-center text-white/80 drop-shadow-md truncate">
            Игра Лила — это древний путь самопознания, ведущий к Космическому Сознанию.
          </Text>
        </View>
        <View className="flex-row items-center bg-white/10 backdrop-blur-xl px-4 py-3 rounded-full shadow-lg border border-white/10">
          <Text className="text-sm text-white/70 mr-2">Уровень:</Text>
          <View className="bg-black/20 w-9 h-9 rounded-full items-center justify-center shadow-inner backdrop-blur-xl">
            <Text className="font-bold text-white/90">{currentPlayer?.plan ?? '-'}</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // Перед передачей в GameBoard:
  const safePlayer = currentPlayer
    ? {
        ...currentPlayer,
        fullName: currentPlayer.fullName || '',
        avatar: currentPlayer.avatar || '',
        intention: currentPlayer.intention || '',
        isStart: currentPlayer.isStart ?? undefined,
        isFinished: currentPlayer.isFinished ?? undefined,
        consecutiveSixes: currentPlayer.consecutiveSixes ?? undefined,
        positionBeforeThreeSixes: currentPlayer.positionBeforeThreeSixes ?? undefined,
        message: currentPlayer.message || '',
      }
    : null;

  // Адаптивный макет для Web и Mobile
  if (isWeb) {
    // Мобильный web в портретной ориентации - показываем мобильную версию интерфейса
    if (windowWidth < 640 && !isLandscape) {
      return (
        <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700">
          <AppHeader />
          
          {/* Статус Apollo */}
          <ApolloStatus />
          
          <ScrollView>
            <View className="p-4 pb-8">
              {/* Блок с игровым полем - возвращаем нормальное поле без масштабирования */}
              <View className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl mb-5 p-3 border border-white/10">
                <GameBoard players={safePlayer ? [safePlayer] : []} />
              </View>
              
              {/* Кубик полностью без фона, внешне сзади элементов */}
              <View className="items-center justify-center mb-5 mx-auto w-full">
                <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
              </View>
              
              {/* Player Info Apollo component */}
              <View className="mb-5 bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 border border-white/10">
                <PlayerInfoApollo />
              </View>

              {/* PlayerStats component */}
              <View className="mb-5 bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 border border-white/10">
                <PlayerStats />
              </View>

              {/* ChatBot component */}
              <View className="h-[400px] bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl border border-white/10">
                <ChatBot />
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }
    
    // Десктопная или ландшафтная мобильная версия
    return (
      <View className="flex-1 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-700">
        <AppHeader />
        
        <View className={`flex-1 flex-row ${layout.padding} mx-auto ${layout.maxWidth} space-x-5`}>
          {/* Левая колонка */}
          {(windowWidth >= 768) && (
            <View className={`${layout.leftColumn} space-y-5`}>
              <View className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 flex-1 border border-white/10">
                <PlayerInfoApollo />
              </View>
              <View className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl p-4 border border-white/10">
                <PlayerStats />
              </View>
            </View>
          )}

          {/* Центральная колонка */}
          <View className={`${layout.centerColumn} flex flex-col space-y-5`}>
            {/* GameBoard Container */}
            <View className={`bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl ${layout.gameBoardPadding} flex-grow flex items-center justify-center border border-white/10`}>
              <GameBoard players={safePlayer ? [safePlayer] : []} />
            </View>
            
            {/* Dice Container */}
            <View className="items-center justify-center w-full">
              <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
            </View>
          </View>

          {/* Правая колонка */}
          {(windowWidth >= 768) && (
            <View className={`${layout.rightColumn} flex flex-col`}>
              <View className="bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-2xl shadow-2xl flex-1 overflow-hidden border border-white/10">
                <ChatBot />
              </View>
            </View>
          )}
        </View>
      </View>
    );
  }

  // Мобильная версия
  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <AppHeader />
      
      <ScrollView>
        <View className="p-3 pb-6">
          {/* Блок с игровым полем - возвращаем нормальное поле без масштабирования */}
          <View className="bg-white/10 rounded-2xl overflow-hidden shadow-2xl mb-0 backdrop-blur-2xl p-2 border border-white/10">
            <GameBoard players={safePlayer ? [safePlayer] : []} />
          </View>
          
          {/* Кубик полностью без фона, внешне сзади элементов */}
          <View className="items-center justify-center mb-5 mx-auto w-full">
            <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
          </View>
          
          {/* Player Info Apollo component */}
          <View className="mb-5">
            <PlayerInfoApollo />
          </View>
          
          {/* Блок чат-бота */}
          <View className="bg-white/10 rounded-2xl shadow-2xl p-3 backdrop-blur-2xl mb-4 border border-white/10">
            <ChatBot />
          </View>
        </View>
      </ScrollView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    minHeight: '100%',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  webContentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  diceContainer: {
    backgroundColor: 'transparent',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#ffffff', 
  }
});

export default GameScreen;


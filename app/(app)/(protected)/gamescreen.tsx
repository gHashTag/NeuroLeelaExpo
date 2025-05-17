import React, { useState, useEffect } from "react";
import { View, ImageBackground, Platform, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, Dimensions, useWindowDimensions } from "react-native";
import { Display, Dice, GameBoard, PlayerStats, PlayerInfoApollo } from "@components/ui/index";
import { ApolloStatus } from "@/components/ui/ApolloStatus";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

// Logo component for the app
const AppLogo = () => (
  <View className="flex-row items-center">
    <View className="w-8 h-8 mr-2 border-2 border-red-500">
      <Image 
        source={{ uri: '/web/images/logo.jpg' }}
        className="w-full h-full rounded-full"
      />
    </View>
    <Text className="text-xl font-bold text-purple-800 dark:text-purple-200">НейроЛила</Text>
  </View>
);

// Компонент чат-бота с адаптивной высотой
const ChatBot = () => {
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
        text: 'Я понимаю ваш духовный путь. Продолжайте двигаться вперед с осознанностью.' 
      }]);
    }, 1000);
    
    setMessage("");
  };

  return (
    <View className="flex-1 bg-white rounded-xl shadow-md border border-purple-100 flex flex-col overflow-hidden">
      <View className="bg-purple-50 p-3 border-b border-purple-100">
        <Text className="text-base font-semibold text-purple-900">Духовный помощник</Text>
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
                  ? 'bg-purple-600 ml-auto' 
                  : 'bg-gray-100'
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
      
      <View className="border-t border-gray-200 p-2 flex-row items-center">
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Задайте вопрос..."
          className="flex-1 bg-gray-100 rounded-full px-4 py-2 mr-2"
        />
        <TouchableOpacity onPress={sendMessage} className="bg-purple-600 rounded-full p-2">
          <Ionicons name="send" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

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
        padding: "p-4",
        gameBoardPadding: "p-3",
        maxWidth: "max-w-[1600px]"
      };
    } 
    // Large displays
    else if (windowWidth > 1200) {
      return {
        leftColumn: "w-1/4", 
        centerColumn: "w-2/4", 
        rightColumn: "w-1/4",
        padding: "p-3",
        gameBoardPadding: "p-2",
        maxWidth: "max-w-[1400px]"
      };
    } 
    // Medium displays
    else if (windowWidth > 992) {
      return {
        leftColumn: "w-1/5", 
        centerColumn: "w-3/5", 
        rightColumn: "w-1/5",
        padding: "p-2",
        gameBoardPadding: "p-1",
        maxWidth: "max-w-[1200px]"
      };
    } 
    // Small displays
    else if (windowWidth > 768) {
      return {
        leftColumn: "w-1/6", 
        centerColumn: "w-4/6", 
        rightColumn: "w-1/6",
        padding: "p-2",
        gameBoardPadding: "p-1",
        maxWidth: "max-w-full"
      };
    }
    // Tablets and mobile (landscape) 
    else if (windowWidth > 640 || isLandscape) {
      return {
        leftColumn: "w-1/6", 
        centerColumn: "w-4/6", 
        rightColumn: "w-1/6",
        padding: "p-1",
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
        padding: "p-1",
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
    <View className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-lg py-2 px-4">
      <View className="flex-row items-center justify-between w-full space-x-4">
        <AppLogo />
        <View className="flex-1 min-w-0">
          <Text className="text-xs text-center text-purple-700 dark:text-purple-300 truncate">
            Игра Лила — это древний путь самопознания, ведущий к Космическому Сознанию.
          </Text>
        </View>
        <View className="flex-row items-center">
          <Text className="text-sm text-purple-700 mr-2">Уровень:</Text>
          <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center">
            <Text className="font-bold text-purple-800">{currentPlayer?.plan ?? '-'}</Text>
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
        <View className="flex-1 bg-gray-50 dark:bg-slate-950">
          <AppHeader />
          
          {/* Статус Apollo */}
          <ApolloStatus />
          
          <ScrollView>
            <View className="p-3 pb-6">
              {/* Блок с игровым полем - возвращаем нормальное поле без масштабирования */}
              <View className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg mb-4 p-2">
                <GameBoard players={safePlayer ? [safePlayer] : []} />
              </View>
              
              {/* Кубик полностью без фона, внешне сзади элементов */}
              <View className="items-center justify-center mb-3 mx-auto w-full">
                <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
              </View>
              
              {/* Player Info Apollo component */}
              <View className="mb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg p-4">
                <PlayerInfoApollo />
              </View>

              {/* PlayerStats component */}
              <View className="mb-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg p-4">
                <PlayerStats />
              </View>

              {/* ChatBot component */}
              <View className="h-[400px] bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg">
                <ChatBot />
              </View>
            </View>
          </ScrollView>
        </View>
      );
    }
    
    // Десктопная или ландшафтная мобильная версия
    return (
      <View className="flex-1 bg-gray-100 dark:bg-slate-900">
        <AppHeader />
        
        <View className={`flex-1 flex-row ${layout.padding} mx-auto ${layout.maxWidth} space-x-4`}>
          {/* Левая колонка */}
          {(windowWidth >= 768) && (
            <View className={`${layout.leftColumn} space-y-4`}>
              <View className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg p-4 flex-1">
                <PlayerInfoApollo />
              </View>
              <View className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg p-4">
                <PlayerStats />
              </View>
            </View>
          )}

          {/* Центральная колонка */}
          <View className={`${layout.centerColumn} flex flex-col space-y-4`}>
            {/* GameBoard Container */}
            <View className={`bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg ${layout.gameBoardPadding} flex-grow flex items-center justify-center`}>
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
              <View className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-xl shadow-lg flex-1 overflow-hidden">
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
        <View className="p-2 pb-4">
          {/* Блок с игровым полем - возвращаем нормальное поле без масштабирования */}
          <View className="bg-white/70 rounded-xl overflow-hidden shadow-lg mb-0 backdrop-blur-md p-1">
            <GameBoard players={safePlayer ? [safePlayer] : []} />
          </View>
          
          {/* Кубик полностью без фона, внешне сзади элементов */}
          <View className="items-center justify-center mb-3 mx-auto w-full">
            <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
          </View>
          
          {/* Player Info Apollo component */}
          <View className="mb-4">
            <PlayerInfoApollo />
          </View>
          
          {/* Блок чат-бота */}
          <View className="bg-white/80 rounded-xl shadow-md p-3 backdrop-blur-md mb-4">
            <Text className="text-sm font-semibold text-purple-900 mb-3">Духовный помощник:</Text>
            
            <View className="bg-gray-100 rounded-lg p-3 mb-3">
              <Text className="text-xs text-gray-800">
                Здравствуйте! Я ваш духовный проводник в игре Лила. Чем могу помочь?
              </Text>
            </View>
            
            <View className="flex-row">
              <TextInput
                placeholder="Задайте вопрос..."
                className="flex-1 bg-white border border-gray-200 rounded-lg px-3 py-2 mr-2 text-xs"
              />
              <TouchableOpacity className="bg-purple-600 rounded-lg p-2">
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>
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
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
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
    color: '#6A0DAD',
  }
});

export default GameScreen;


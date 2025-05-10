import React, { useState, useEffect } from "react";
import { View, ImageBackground, Platform, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, Dimensions, useWindowDimensions } from "react-native";
import { Display, Dice, GameBoard } from "@components/ui/index";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

// Logo component for the app
const AppLogo = () => (
  <View className="flex-row items-center">
    <View className="w-10 h-10 rounded-full overflow-hidden bg-purple-100 border-2 border-purple-300 shadow-md">
      <Image 
        source={require('@/assets/icons/1024.png')} 
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>
    <Text className="text-2xl font-bold ml-3 text-purple-800">НейроЛила</Text>
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
  
  const { currentPlayer, rollDice, message } = {
    currentPlayer: {
      id: "1",
      fullName: "Player One",
      plan: 5,
      avatar: require("@/assets/defaultImage/defaultProfileImage.png"),
      intention: "Win the game",
      previousPlan: 0,
      isStart: true,
      isFinished: false,
      consecutiveSixes: 0,
      positionBeforeThreeSixes: 0,
      message: "Ready to play",
    },
    rollDice: () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      router.push("/(app)/report");
      return roll;
    },
    message: userData?.designation || "",
  };

  // Custom header component
  const AppHeader = () => (
    <BlurView intensity={60} tint="light" className="border-b border-gray-200/50 py-4 px-5">
      <View className="flex-row items-center justify-between">
        <AppLogo />
        <View className="flex-row items-center">
          <Text className="text-sm text-purple-700 mr-2">Уровень:</Text>
          <View className="bg-purple-100 w-8 h-8 rounded-full items-center justify-center">
            <Text className="font-bold text-purple-800">{currentPlayer.plan}</Text>
          </View>
        </View>
      </View>
    </BlurView>
  );

  // Адаптивный макет для Web и Mobile
  if (isWeb) {
    // Мобильный web в портретной ориентации - показываем мобильную версию интерфейса
    if (windowWidth < 640 && !isLandscape) {
      return (
        <View className="flex-1 bg-gray-50">
          <AppHeader />
          
          <View className="py-2 px-3 bg-purple-50">
            <Text className="text-sm font-medium text-purple-800 italic text-center">
              Игра Лила — древний путь к Космическому Сознанию
            </Text>
          </View>
          
          <ScrollView>
            <View className="p-3 pb-6">
              {/* Блок с игровым полем */}
              <View className="bg-white/70 rounded-xl overflow-hidden shadow-lg mb-4 backdrop-blur-md p-1">
                <GameBoard players={[currentPlayer]} />
              </View>
              
              {/* Только кубик по центру, блок с позицией удален */}
              <View className="bg-white/80 rounded-xl p-4 items-center justify-center backdrop-blur-md mb-4 mx-auto w-full">
                <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
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
        </View>
      );
    }
    
    // Десктопная или ландшафтная мобильная версия
    return (
      <View className="flex-1 bg-gray-50">
        <AppHeader />
        
        <View className="py-3 px-4 bg-purple-50">
          <View className={layout.maxWidth + " mx-auto"}>
            <Text className="text-base font-medium text-purple-800 italic text-center">
              Игра Лила — это древний путь самопознания, ведущий к Космическому Сознанию. Сформулируйте ваше духовное намерение, с которым вы вступаете в эту священную игру.
            </Text>
          </View>
        </View>
        
        <View className={`flex-1 ${windowWidth < 768 ? '' : 'flex-row'} ${layout.maxWidth} mx-auto w-full ${layout.padding}`}>
          {/* Левая панель с информацией */}
          <View className={`${windowWidth < 768 ? 'w-full mb-3' : layout.leftColumn} pr-2 flex ${windowWidth < 768 ? 'flex-row' : 'flex-col'}`}>
            <View className={`bg-white rounded-xl shadow-md p-4 ${windowWidth < 768 ? 'flex-1 mr-2' : 'mb-4'} border border-purple-100`}>
              <Text className="text-base font-semibold text-purple-900 mb-2">Текущая позиция:</Text>
              <View className="flex-row items-center mb-3">
                <View className="bg-purple-100 rounded-full w-10 h-10 items-center justify-center mr-3">
                  <Text className="text-xl font-bold text-purple-800">{currentPlayer.plan}</Text>
                </View>
                <Text className="text-sm text-gray-700">Клетка на игровом поле</Text>
              </View>
            </View>
            
            {/* Блок с кубиком по центру */}
            <View className={`bg-white rounded-xl shadow-md p-4 border border-purple-100 ${windowWidth < 768 ? 'flex-1' : 'mb-4 mt-auto'}`}>
              <Text className="text-base font-semibold text-purple-900 mb-3 text-center">Бросок кубика:</Text>
              <View className="items-center justify-center pt-2 pb-4">
                <Dice rollDice={rollDice} lastRoll={lastRoll} size={windowWidth < 768 ? "small" : "medium"} />
              </View>
              
              <Text className="text-xs text-gray-500 text-center mt-2">
                Ваше продвижение по игре отражает ваш духовный путь
              </Text>
            </View>
          </View>
          
          {/* Центральная панель с игровым полем - адаптивная */}
          <View className={`${windowWidth < 768 ? 'w-full mb-3' : layout.centerColumn} px-2`}>
            <View className={`bg-white/40 backdrop-blur-md rounded-xl overflow-hidden shadow-xl border border-purple-100 ${windowWidth < 768 ? 'min-h-[450px]' : 'min-h-[550px]'} flex items-center justify-center ${layout.gameBoardPadding}`}>
              <GameBoard players={[currentPlayer]} />
            </View>
          </View>
          
          {/* Правая панель с чат-ботом - адаптивная */}
          <View className={`${windowWidth < 768 ? 'w-full' : layout.rightColumn} pl-2`}>
            <ChatBot />
          </View>
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
      
      <View className="py-3 px-4 bg-purple-50/80 backdrop-blur-sm">
        <Text className="text-sm font-medium text-purple-800 italic text-center">
          Игра Лила — путь духовного самопознания
        </Text>
      </View>
      
      <ScrollView>
        <View className="p-3 pb-6">
          {/* Блок с игровым полем - увеличен */}
          <View className="bg-white/70 rounded-xl overflow-hidden shadow-lg mb-1 backdrop-blur-md p-1">
            <GameBoard players={[currentPlayer]} />
          </View>
          
          {/* Удалена информация о позиции, только кубик по центру */}
          <View className="bg-white/80 rounded-xl p-2 pt-1 items-center justify-center backdrop-blur-md mb-3 mx-auto w-full">
            <Dice rollDice={rollDice} lastRoll={lastRoll} size="large" />
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


import React, { useState, useEffect } from "react";
import { View, ImageBackground, Platform, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, Dimensions, useWindowDimensions } from "react-native";
import { Display, Dice, GameBoard, PlayerInfoConsolidated } from "@components/ui/index";
import { PlayerStats, PlayerInfoApollo } from "@components/ui/index";
import { ApolloStatus } from "@/components/ui/ApolloStatus";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { ChatBot } from '@/components/chat/ChatBot';
import { processGameStep } from '@/services/GameService';
import { GameMessageService } from '@/services/GameMessageService';
import { updatePlayerState } from '@/lib/apollo-drizzle-client';
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

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
  const [lastRoll, setLastRoll] = useState(1);
  const [currentMessage, setCurrentMessage] = useState<string>(GameMessageService.getWelcomeMessage());
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { userData, getAvatarUrl } = useSupabase();
  const isWeb = Platform.OS === 'web';
  const isLandscape = windowWidth > windowHeight;
  
  // Apollo Drizzle — единый источник истины
  const { currentPlayer, isLoading, error, movePlayer } = useApolloDrizzle();

  // Обновляем сообщение при изменении состояния игрока
  useEffect(() => {
    if (currentPlayer) {
      if (currentPlayer.plan === 68 && currentPlayer.isFinished) {
        setCurrentMessage("🎲 Бросьте 6, чтобы начать путь самопознания!");
      } else if (currentPlayer.message && currentPlayer.message !== 'Last move: ') {
        // Если есть сообщение от последнего хода, используем его
        setCurrentMessage(currentPlayer.message);
      }
    }
  }, [currentPlayer]);

  // Определяем макет в зависимости от ширины экрана
  const getLayout = () => {
    // Extra large displays
    if (windowWidth > 1600) {
      return {
        leftColumn: "hidden", // Убираем левую колонку
        centerColumn: "w-2/5", // Уменьшаем центральную колонку
        rightColumn: "w-3/5", // Расширяем правую колонку для чата
        padding: "p-5",
        gameBoardPadding: "p-4",
        maxWidth: "max-w-[1600px]"
      };
    } 
    // Large displays
    else if (windowWidth > 1200) {
      return {
        leftColumn: "hidden", // Убираем левую колонку
        centerColumn: "w-2/5", // Уменьшаем центральную колонку
        rightColumn: "w-3/5", // Расширяем правую колонку для чата
        padding: "p-4",
        gameBoardPadding: "p-3",
        maxWidth: "max-w-[1400px]"
      };
    } 
    // Medium displays
    else if (windowWidth > 992) {
      return {
        leftColumn: "hidden", // Убираем левую колонку
        centerColumn: "w-2/5", // Уменьшаем центральную колонку
        rightColumn: "w-3/5", // Расширяем правую колонку для чата
        padding: "p-3",
        gameBoardPadding: "p-2",
        maxWidth: "max-w-[1200px]"
      };
    } 
    // Small displays
    else if (windowWidth > 768) {
      return {
        leftColumn: "hidden", // Убираем левую колонку
        centerColumn: "w-2/5", // Уменьшаем центральную колонку
        rightColumn: "w-3/5", // Расширяем правую колонку для чата
        padding: "p-3",
        gameBoardPadding: "p-2",
        maxWidth: "max-w-full"
      };
    }
    // Tablets and mobile (landscape) 
    else if (windowWidth > 640 || isLandscape) {
      return {
        leftColumn: "hidden", // Убираем левую колонку
        centerColumn: "w-2/5", // Уменьшаем центральную колонку
        rightColumn: "w-3/5", // Расширяем правую колонку для чата
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
  
  // Функция броска кубика через Apollo Drizzle и GameService
  const rollDice = () => {
    console.log('🎲 [GameScreen] rollDice: НАЧАЛО ФУНКЦИИ');
    console.log('🎲 [GameScreen] rollDice: currentPlayer =', currentPlayer);
    console.log('🎲 [GameScreen] rollDice: userData =', userData);
    
    if (!currentPlayer) {
      console.error('🎲 [GameScreen] rollDice: Игрок не найден - не могу бросить кубик');
      return 0;
    }
    
    // Проверяем, нужен ли отчет перед следующим ходом
    if (currentPlayer.needsReport) {
      console.log('🎲 [GameScreen] rollDice: Требуется отчет перед следующим ходом');
      setCurrentMessage("📝 Сначала напишите отчет в чате о вашем текущем состоянии!");
      return 0;
    }
    
    // Проверяем наличие userData для получения user.id
    if (!userData?.user_id) {
      console.error('🎲 [GameScreen] rollDice: userData.user_id не найден!', userData);
      setCurrentMessage("❌ Ошибка: пользователь не авторизован");
      return 0;
    }
    
    try {
      // Генерируем случайное число от 1 до 6
      const roll = Math.floor(Math.random() * 6) + 1;
      console.log(`🎲 [GameScreen] rollDice: Бросок кубика: ${roll}, текущая позиция: ${currentPlayer.plan}, isFinished: ${currentPlayer.isFinished}`);
      
      // Обновляем отображаемое значение кубика
      setLastRoll(roll);
      
      // Вызываем функцию processGameStep для обработки хода по правилам игры
      console.log(`🎲 [GameScreen] rollDice: Вызываем processGameStep с roll=${roll}, id=${userData.user_id}`);
      
      processGameStep(roll, userData.user_id)
        .then(({ gameStep, direction, message }) => {
          console.log(`🎲 [GameScreen] rollDice: Результат processGameStep:`, gameStep);
          console.log(`🎲 [GameScreen] rollDice: Новая позиция: ${gameStep.loka}, направление: ${direction}, isFinished: ${gameStep.is_finished}`);
          console.log(`🎲 [GameScreen] rollDice: Сообщение: ${message}`);
          
          // Обновляем сообщение
          setCurrentMessage(message);
          
          // Определяем, нужен ли отчет - если позиция изменилась и игра активна
          const needsReport = gameStep.loka !== gameStep.previous_loka && !gameStep.is_finished;
          
          // Обновляем локальное состояние Apollo со всеми данными из gameStep
          const updates = {
            plan: gameStep.loka,
            previous_plan: gameStep.previous_loka,
            isFinished: gameStep.is_finished,
            consecutiveSixes: gameStep.consecutive_sixes,
            positionBeforeThreeSixes: gameStep.position_before_three_sixes,
            needsReport: needsReport, // Устанавливаем флаг необходимости отчета
            message: message
          };
          
          // Используем updatePlayerState для обновления состояния
          updatePlayerState(updates);
          console.log('🎲 [GameScreen] rollDice: Локальное состояние Apollo обновлено через updatePlayerState:', updates);
          
          // Проверяем, что состояние действительно обновилось
          setTimeout(() => {
            const verifyPlayer = currentPlayer;
            console.log('🎲 [GameScreen] rollDice: ПРОВЕРКА ЧЕРЕЗ 100ms - текущее состояние:', verifyPlayer);
          }, 100);
          
          // Если нужен отчет, показываем сообщение в чате
          if (needsReport) {
            console.log('🎲 [GameScreen] rollDice: Требуется отчет, показываем сообщение в чате');
            setCurrentMessage("📝 Напишите отчет в чате о вашем новом состоянии!");
          }
        })
        .catch(error => {
          console.error('🎲 [GameScreen] rollDice: Ошибка при обработке хода:', error);
          setCurrentMessage(`❌ Ошибка при обработке хода: ${error.message}`);
        });
      
      return roll;
    } catch (error) {
      console.error('🎲 [GameScreen] rollDice: Критическая ошибка при броске кубика:', error);
      setCurrentMessage(`❌ Критическая ошибка: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return 0;
    }
  };

  // Custom header component
  const AppHeader = () => (
    <View className="bg-white py-4 px-5 border-b border-gray-100 z-10 shadow-sm">
      <View className="flex-row items-center justify-between w-full space-x-4">
        <AppLogo />
        <View className="flex-1 min-w-0 px-2">
          <Text className="text-sm text-center text-gray-700 font-medium leading-relaxed">
            {currentMessage}
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
            <Text className="text-sm text-gray-500 mr-2">Уровень:</Text>
            <View className="bg-blue-50 w-8 h-8 rounded-full items-center justify-center shadow-inner">
              <Text className="font-medium text-blue-600">{currentPlayer?.plan ?? '-'}</Text>
            </View>
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
        <View className="flex-1 bg-gray-50">
          <AppHeader />
          
          {/* Статус Apollo */}
          <ApolloStatus />
          
          <ScrollView>
            <View className="p-2 pb-4">
              {/* Блок с игровым полем - возвращаем нормальное поле без масштабирования */}
              <View className="bg-white rounded-lg shadow-sm mb-2 p-1">
                <GameBoard players={safePlayer ? [safePlayer] : []} />
              </View>
              
              {/* Кубик полностью без фона, внешне сзади элементов */}
              <View className="items-center justify-center mb-2 mx-auto w-full">
                <Dice rollDice={rollDice} lastRoll={lastRoll} size="extra-small" />
              </View>
              
              {/* Компактная информация об игроке */}
              <View className="bg-white rounded-lg shadow-sm p-3 mb-2">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-600">Текущий план:</Text>
                  <View className="bg-blue-500 px-3 py-1 rounded-full">
                    <Text className="font-bold text-white text-sm">{currentPlayer?.plan || 1}</Text>
                  </View>
                </View>
                {currentPlayer?.needsReport && (
                  <Text className="text-xs text-orange-600 mt-2 text-center">
                    📝 Напишите отчет в чате о вашем духовном опыте
                  </Text>
                )}
              </View>

              {/* ChatBot component - увеличиваем высоту */}
              <View className="h-[500px] bg-white rounded-lg shadow-sm">
                <ChatBot />
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
        
        <View className={`flex-1 flex-row ${layout.padding} mx-auto ${layout.maxWidth} space-x-2`}>
          {/* Центральная колонка */}
          <View className={`${layout.centerColumn} flex flex-col space-y-2`}>
            {/* GameBoard Container */}
            <View className={`bg-white rounded-lg shadow-sm ${layout.gameBoardPadding} flex-grow flex items-center justify-center`}>
              <GameBoard players={safePlayer ? [safePlayer] : []} />
            </View>
            
            {/* Dice Container */}
            <View className="items-center justify-center w-full">
              <Dice rollDice={rollDice} lastRoll={lastRoll} size="extra-small" />
            </View>
            
            {/* Компактная информация об игроке под кубиком */}
            <View className="bg-white rounded-lg shadow-sm p-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-600">План:</Text>
                <View className="bg-blue-500 px-3 py-1 rounded-full">
                  <Text className="font-bold text-white text-sm">{currentPlayer?.plan || 1}</Text>
                </View>
              </View>
              {currentPlayer?.needsReport && (
                <Text className="text-xs text-orange-600 mt-1 text-center">
                  📝 Напишите отчет в чате
                </Text>
              )}
            </View>
          </View>

          {/* Правая колонка - расширенный чат */}
          {(windowWidth >= 768) && (
            <View className={`${layout.rightColumn} flex flex-col`}>
              <View className="bg-white rounded-lg shadow-sm flex-1 overflow-hidden">
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
    <View className="flex-1 bg-gray-50">
      <AppHeader />
      
      <ScrollView>
        <View className="p-2 pb-3">
          {/* Блок с игровым полем - возвращаем нормальное поле без масштабирования */}
          <View className="bg-white rounded-lg overflow-hidden shadow-sm mb-1 p-1">
            <GameBoard players={safePlayer ? [safePlayer] : []} />
          </View>
          
          {/* Кубик полностью без фона, внешне сзади элементов */}
          <View className="items-center justify-center mb-2 mx-auto w-full">
            <Dice rollDice={rollDice} lastRoll={lastRoll} size="extra-small" />
          </View>
          
          {/* Компактная информация об игроке */}
          <View className="bg-white rounded-lg shadow-sm p-3 mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Текущий план:</Text>
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="font-bold text-white text-sm">{currentPlayer?.plan || 1}</Text>
              </View>
            </View>
            {currentPlayer?.needsReport && (
              <Text className="text-xs text-orange-600 mt-2 text-center">
                📝 Напишите отчет в чате о вашем духовном опыте
              </Text>
            )}
          </View>
          
          {/* Блок чат-бота - увеличиваем высоту */}
          <View className="bg-white rounded-lg shadow-sm p-2 mb-3 h-[450px]">
            <ChatBot />
          </View>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#f9fafb',
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  headerContainer: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '500',
    marginLeft: 8,
    color: '#374151',
  }
});

export default GameScreen;


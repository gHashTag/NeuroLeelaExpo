import React, { useState, useEffect } from "react";
import { View, ImageBackground, Platform, Text, Image, ScrollView, StyleSheet, TextInput, TouchableOpacity, Dimensions, useWindowDimensions } from "react-native";
import { Display, GameBoard, PlayerInfoConsolidated } from "@components/ui/index";
import { PlayerStats, PlayerInfoApollo } from "@components/ui/index";
import { ApolloStatus } from "@/components/ui/ApolloStatus";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { BlurView } from "expo-blur";
import { Ionicons } from '@expo/vector-icons';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { ChatBot } from '@/components/chat/ChatBot';
import { InngestEventService } from '@/services/InngestEventService';
import { GameMessageService } from '@/services/GameMessageService';

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
  const [currentMessage, setCurrentMessage] = useState<string>(GameMessageService.getWelcomeMessage());
  const [attemptCount, setAttemptCount] = useState<number>(0);
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const { userData, getAvatarUrl } = useSupabase();
  const isWeb = Platform.OS === 'web';
  const isLandscape = windowWidth > windowHeight;
  
  // Apollo Drizzle — единый источник истины
  const { currentPlayer, isLoading, error, movePlayer, updatePlayerState } = useApolloDrizzle();

  // Отслеживаем изменения currentPlayer в GameScreen
  useEffect(() => {
    console.log('🔥 [GameScreen] currentPlayer ИЗМЕНИЛСЯ в GameScreen!');
    console.log('🔥 [GameScreen] Новое значение currentPlayer:', currentPlayer);
    if (currentPlayer) {
      console.log('🔥 [GameScreen] План игрока в GameScreen:', currentPlayer.plan);
      console.log('🔥 [GameScreen] isFinished в GameScreen:', currentPlayer.isFinished);
    }
  }, [currentPlayer]);

  // Обновляем сообщение при изменении состояния игрока
  useEffect(() => {
    if (currentPlayer) {
      if (currentPlayer.plan === 68 && currentPlayer.isFinished) {
        const baseMessage = "🎯 ПРАВИЛО НАЧАЛА ИГРЫ: Нужно выбросить ШЕСТЕРКУ для старта!";
        if (attemptCount > 0) {
          setCurrentMessage(`${baseMessage} (Попытка ${attemptCount + 1})`);
        } else {
          setCurrentMessage(baseMessage);
        }
      } else if (currentPlayer.message && currentPlayer.message !== 'Last move: ') {
        // Если есть сообщение от последнего хода, используем его
        setCurrentMessage(currentPlayer.message);
        // Сбрасываем счетчик попыток когда игра началась
        setAttemptCount(0);
      }
    }
  }, [currentPlayer, attemptCount]);

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
  
  // ✨ НОВАЯ EVENT-DRIVEN АРХИТЕКТУРА: Функция броска кубика через Inngest
  const rollDice = async () => {
    console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] ================== rollDice НАЧАЛО ==================');
    console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Функция вызвана!');
    console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: currentPlayer =', JSON.stringify(currentPlayer, null, 2));
    console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: userData =', userData ? { user_id: userData.user_id } : 'null');
    console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: attemptCount =', attemptCount);
    console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: currentMessage =', currentMessage);
    
    if (!currentPlayer) {
      console.error('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] ОШИБКА: Игрок не найден');
      setCurrentMessage("❌ Ошибка: игрок не найден");
      return 0;
    }
    
    // Проверяем блокировку кубика
    if (currentPlayer.needsReport) {
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] БЛОКИРОВКА: Кубик заблокирован - нужен отчет');
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] БЛОКИРОВКА: currentPlayer.needsReport =', currentPlayer.needsReport);
      setCurrentMessage("📝 Сначала напишите отчет в чате о вашем текущем состоянии!");
      return 0;
    }
    
    try {
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Начинаем бросок кубика...');
      
      // Генерируем бросок
      const roll = Math.floor(Math.random() * 6) + 1;
      console.log(`🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Сгенерированный бросок = ${roll}`);
      
      // Проверяем состояние начала игры для счетчика попыток
      const isWaitingForSix = currentPlayer.plan === 68 && currentPlayer.isFinished;
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: isWaitingForSix =', isWaitingForSix);
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: currentPlayer.plan =', currentPlayer.plan);
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: currentPlayer.isFinished =', currentPlayer.isFinished);
      
      // Определяем userId
      const userId = userData?.user_id || 'test-user-demo';
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: userId =', userId);
      
      // ✨ ОТПРАВЛЯЕМ СОБЫТИЕ В INNGEST
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Отправляем событие в Inngest...');
      const result = await InngestEventService.sendDiceRoll(userId, roll);
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Результат отправки =', result);
      
      if (!result.success) {
        throw new Error(`Ошибка отправки события: ${result.error}`);
      }
      
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Событие отправлено успешно! eventId =', result.eventId);
      
      // Обновляем сообщение в зависимости от состояния
      if (isWaitingForSix) {
        if (roll === 6) {
          console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: УСПЕХ! Выпала 6, игра началась!');
          setCurrentMessage(`🎉 ОТЛИЧНО! Выпала ${roll}! Игра началась!`);
          setAttemptCount(0); // Сбрасываем счетчик
        } else {
          const newAttemptCount = attemptCount + 1;
          console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Не выпала 6, счетчик попыток:', newAttemptCount);
          setAttemptCount(newAttemptCount);
          setCurrentMessage(`😔 Выпало ${roll}, а нужна 6. Попробуйте еще раз! (Попытка ${newAttemptCount})`);
        }
      } else {
        console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Обычный ход в игре');
        setCurrentMessage(`🎲 Бросок ${roll}! Обрабатываю результат...`);
      }
      
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] rollDice: Возвращаем roll =', roll);
      // Состояние обновится автоматически через Apollo при получении события
      return roll;
      
    } catch (error) {
      console.error('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] КРИТИЧЕСКАЯ ОШИБКА в rollDice:', error);
      console.error('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] Стек ошибки:', error instanceof Error ? error.stack : 'Нет стека');
      setCurrentMessage(`❌ Ошибка при броске кубика: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      return 0;
    } finally {
      console.log('🎲🎲🎲 [GameScreen-ДИАГНОСТИКА] ================== rollDice ЗАВЕРШЕНИЕ ==================');
    }
  };

  // Custom header component with beautiful leaf glass effects
  const AppHeader = () => (
    <View className="glass-chat-header py-4 px-5 z-10 animate-fade-in">
      <View className="flex-row items-center justify-between w-full space-x-4">
        <View className="glass-leaf rounded-2xl p-3 animate-pearl-float">
          <AppLogo />
        </View>
        <View className="flex-1 min-w-0 px-2">
          <View className="glass-message rounded-2xl p-3">
            <Text className="text-sm text-center text-gray-800 font-medium leading-relaxed">
              {currentMessage}
            </Text>
          </View>
        </View>
        <View className="flex-row items-center space-x-3">
          {/* Кнопка отчетов с glass эффектом */}
          <TouchableOpacity 
            onPress={() => router.push('/reports')}
            className="glass-button p-3 rounded-2xl animate-pearl-float"
          >
            <Ionicons name="book-outline" size={20} color="#228B22" />
          </TouchableOpacity>
          
          {/* Индикатор уровня с glass эффектом */}
          <View className="glass-leaf px-4 py-3 rounded-2xl">
            <View className="flex-row items-center">
              <Text className="text-sm text-gray-700 mr-2 font-medium">Уровень:</Text>
              <View className="glass-button w-10 h-10 rounded-full items-center justify-center">
                <Text className="font-bold text-green-700 text-lg">{currentPlayer?.plan ?? '-'}</Text>
              </View>
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

  // Добавляем логирование для диагностики
  console.log('🎮 [GameScreen] Диагностика данных игрока:');
  console.log('🎮 [GameScreen] currentPlayer:', currentPlayer);
  console.log('🎮 [GameScreen] safePlayer:', safePlayer);
  console.log('🎮 [GameScreen] Передаем в GameBoard players:', safePlayer ? [safePlayer] : []);

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
              {/* Блок с игровым полем с glass эффектом */}
              <View className="glass-leaf rounded-2xl mb-3 p-3 animate-fade-in">
                <GameBoard players={safePlayer ? [safePlayer] : []} />
              </View>
              
              {/* Компактная информация об игроке с glass эффектами */}
              <View className="glass-pearl rounded-2xl p-4 mb-3 animate-fade-in">
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-gray-700 font-medium">Текущий план:</Text>
                  <View className="glass-button px-4 py-2 rounded-full">
                    <Text className="font-bold text-green-700 text-sm">{currentPlayer?.plan || 1}</Text>
                  </View>
                </View>
                
                {/* Специальный блок для состояния ожидания шестерки */}
                {currentPlayer?.plan === 68 && currentPlayer?.isFinished && (
                  <View className="mt-4 glass-leaf p-4 rounded-2xl animate-pearl-float">
                    <Text className="text-sm font-semibold text-green-800 text-center mb-2">
                      🎯 НАЧАЛО ИГРЫ
                    </Text>
                    <Text className="text-xs text-green-700 text-center mb-3">
                      Для старта нужно выбросить ШЕСТЕРКУ
                    </Text>
                    {attemptCount > 0 && (
                      <View className="flex-row items-center justify-center">
                        <View className="glass-button px-3 py-2 rounded-full">
                          <Text className="text-xs text-green-600 font-medium">
                            Попытка {attemptCount + 1}
                          </Text>
                        </View>
                      </View>
                    )}
                  </View>
                )}
                
                {currentPlayer?.needsReport && (
                  <Text className="text-xs text-orange-600 mt-2 text-center">
                    📝 Напишите отчет в чате о вашем духовном опыте
                  </Text>
                )}
              </View>

              {/* ChatBot component с glass эффектом */}
              <View className="h-[500px] glass-pearl rounded-2xl animate-fade-in">
                <ChatBot onRoll={rollDice} />
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
            {/* GameBoard Container с glass эффектом */}
            <View className={`glass-leaf rounded-2xl ${layout.gameBoardPadding} flex-grow flex items-center justify-center animate-fade-in`}>
              <GameBoard players={safePlayer ? [safePlayer] : []} />
            </View>
            
            {/* Компактная информация об игроке с glass эффектом */}
            <View className="glass-pearl rounded-2xl p-3 animate-fade-in">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-gray-700 font-medium">План:</Text>
                <View className="glass-button px-4 py-2 rounded-full">
                  <Text className="font-bold text-green-700 text-sm">{currentPlayer?.plan || 1}</Text>
                </View>
              </View>
              
              {/* Специальный блок для состояния ожидания шестерки */}
              {currentPlayer?.plan === 68 && currentPlayer?.isFinished && (
                <View className="mt-3 glass-leaf p-3 rounded-2xl animate-pearl-float">
                  <Text className="text-xs font-semibold text-green-800 text-center mb-1">
                    🎯 НАЧАЛО ИГРЫ
                  </Text>
                  <Text className="text-xs text-green-700 text-center mb-2">
                    Для старта нужно выбросить ШЕСТЕРКУ
                  </Text>
                  {attemptCount > 0 && (
                    <View className="flex-row items-center justify-center">
                      <View className="glass-button px-2 py-1 rounded-full">
                        <Text className="text-xs text-green-600 font-medium">
                          Попытка {attemptCount + 1}
                        </Text>
                      </View>
                    </View>
                  )}
                </View>
              )}
              
              {currentPlayer?.needsReport && (
                <Text className="text-xs text-orange-600 mt-1 text-center">
                  📝 Напишите отчет в чате
                </Text>
              )}
            </View>
          </View>

          {/* Правая колонка - расширенный чат с glass эффектом */}
          {(windowWidth >= 768) && (
            <View className={`${layout.rightColumn} flex flex-col`}>
              <View className="glass-pearl rounded-2xl flex-1 overflow-hidden animate-fade-in">
                <ChatBot onRoll={rollDice} />
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
          {/* Блок с игровым полем */}
          <View className="bg-white rounded-lg overflow-hidden shadow-sm mb-1 p-1">
            <GameBoard players={safePlayer ? [safePlayer] : []} />
          </View>
          
          {/* Компактная информация об игроке */}
          <View className="bg-white rounded-lg shadow-sm p-3 mb-2">
            <View className="flex-row items-center justify-between">
              <Text className="text-sm text-gray-600">Текущий план:</Text>
              <View className="bg-blue-500 px-3 py-1 rounded-full">
                <Text className="font-bold text-white text-sm">{currentPlayer?.plan || 1}</Text>
              </View>
            </View>
            
            {/* Специальный блок для состояния ожидания шестерки */}
            {currentPlayer?.plan === 68 && currentPlayer?.isFinished && (
              <View className="mt-3 p-3 bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg border border-purple-200">
                <Text className="text-sm font-semibold text-purple-800 text-center mb-1">
                  🎯 НАЧАЛО ИГРЫ
                </Text>
                <Text className="text-xs text-purple-700 text-center mb-2">
                  Для старта нужно выбросить ШЕСТЕРКУ
                </Text>
                {attemptCount > 0 && (
                  <View className="flex-row items-center justify-center">
                    <View className="bg-purple-100 px-2 py-1 rounded-full">
                      <Text className="text-xs text-purple-600">
                        Попытка {attemptCount + 1}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            )}
            
            {currentPlayer?.needsReport && (
              <Text className="text-xs text-orange-600 mt-2 text-center">
                📝 Напишите отчет в чате о вашем духовном опыте
              </Text>
            )}
          </View>
          
          {/* Блок чат-бота - увеличиваем высоту */}
          <View className="bg-white rounded-lg shadow-sm p-2 mb-3 h-[450px]">
            <ChatBot onRoll={rollDice} />
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


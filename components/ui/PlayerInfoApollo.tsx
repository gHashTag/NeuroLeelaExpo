import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';

export const PlayerInfoApollo = () => {
  const { currentPlayer, isLoading, error, movePlayer } = useApolloDrizzle();

  // Безопасный обработчик перемещения
  const handleMove = useCallback(async (newPosition: number) => {
    try {
      await movePlayer(newPosition);
    } catch (error) {
      console.error('Error moving player:', error);
      // Ошибка обрабатывается внутри хука useApolloDrizzle
    }
  }, [movePlayer]);

  if (isLoading) {
    return (
      <View className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-md">
        <ActivityIndicator size="small" color="#38bdf8" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-md">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!currentPlayer) {
    return (
      <View className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-md">
        <Text className="text-gray-500">Данные игрока не найдены</Text>
      </View>
    );
  }

  return (
    <View className="bg-white/40 backdrop-blur-sm rounded-xl p-4 shadow-md">
      <Text className="text-lg font-semibold text-sky-700 mb-3">Информация об игроке</Text>
      
      <View className="space-y-3">
        <View className="flex-row justify-between items-center bg-white/30 backdrop-blur-sm p-3 rounded-lg">
          <Text className="text-sky-700">Текущая позиция:</Text>
          <View className="bg-sky-100/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <Text className="font-semibold">{currentPlayer.plan}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center bg-white/30 backdrop-blur-sm p-3 rounded-lg">
          <Text className="text-sky-700">Предыдущая позиция:</Text>
          <View className="bg-sky-100/50 backdrop-blur-sm px-3 py-1 rounded-full">
            <Text className="font-semibold">{currentPlayer.previous_plan || 0}</Text>
          </View>
        </View>
        
        {currentPlayer.message && (
          <View className="flex-row justify-between items-center bg-white/30 backdrop-blur-sm p-3 rounded-lg">
            <Text className="text-sky-700">Сообщение:</Text>
            <Text className="font-semibold">{currentPlayer.message}</Text>
          </View>
        )}
        
        <View className="pt-3">
          <Text className="text-sky-700 mb-2">Действия:</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={() => handleMove(currentPlayer.plan + 1)}
              className="bg-pink-500/90 flex-1 rounded-full shadow-md px-1"
            >
              <Text className="text-white font-medium py-2 text-center">
                Шаг вперед
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleMove(1)}
              className="bg-sky-600/90 flex-1 rounded-full shadow-md px-1"
            >
              <Text className="text-white font-medium py-2 text-center">
                В начало
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}; 
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
      <View className="bg-white rounded-xl p-4 shadow-md">
        <ActivityIndicator size="small" color="#8b5cf6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-md">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!currentPlayer) {
    return (
      <View className="bg-white rounded-xl p-4 shadow-md">
        <Text className="text-gray-500">Данные игрока не найдены</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-xl p-4 shadow-md">
      <Text className="text-lg font-bold text-purple-800 mb-2">Информация об игроке</Text>
      
      <View className="space-y-2">
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Текущая позиция:</Text>
          <Text className="font-semibold">{currentPlayer.plan}</Text>
        </View>
        
        <View className="flex-row justify-between">
          <Text className="text-gray-600">Предыдущая позиция:</Text>
          <Text className="font-semibold">{currentPlayer.previous_plan || 0}</Text>
        </View>
        
        {currentPlayer.message && (
          <View className="flex-row justify-between">
            <Text className="text-gray-600">Сообщение:</Text>
            <Text className="font-semibold">{currentPlayer.message}</Text>
          </View>
        )}
        
        <View className="pt-2">
          <Text className="text-sm text-gray-500 mb-2">Действия:</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity onPress={() => handleMove(currentPlayer.plan + 1)}>
              <Text className="bg-purple-600 text-white px-3 py-1 rounded-lg text-center">
                Шаг вперед
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleMove(1)}>
              <Text className="bg-gray-600 text-white px-3 py-1 rounded-lg text-center">
                В начало
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}; 
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
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!currentPlayer) {
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-gray-500">Данные игрока не найдены</Text>
      </View>
    );
  }

  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-medium text-gray-700 mb-3">Информация об игроке</Text>
      
      <View className="space-y-3">
        <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
          <Text className="text-gray-600">Текущая позиция:</Text>
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="font-medium text-blue-600">{currentPlayer.plan}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
          <Text className="text-gray-600">Предыдущая позиция:</Text>
          <View className="bg-blue-50 px-3 py-1 rounded-full">
            <Text className="font-medium text-blue-600">{currentPlayer.previous_plan || 0}</Text>
          </View>
        </View>
        
        {currentPlayer.message && (
          <View className="flex-row justify-between items-center bg-gray-50 p-3 rounded-lg">
            <Text className="text-gray-600">Сообщение:</Text>
            <Text className="font-medium text-gray-700">{currentPlayer.message}</Text>
          </View>
        )}
        
        <View className="pt-3">
          <Text className="text-gray-600 mb-2">Действия:</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={() => handleMove(currentPlayer.plan + 1)}
              className="bg-blue-500 flex-1 rounded-lg shadow-sm"
            >
              <Text className="text-white font-medium py-2 text-center">
                Шаг вперед
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleMove(1)}
              className="bg-gray-500 flex-1 rounded-lg shadow-sm"
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
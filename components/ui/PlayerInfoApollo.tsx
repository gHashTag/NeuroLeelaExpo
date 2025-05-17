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
      <View className="bg-black/10 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10">
        <ActivityIndicator size="small" color="#E0AAFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-black/10 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10">
        <Text className="text-pink-400">{error}</Text>
      </View>
    );
  }

  if (!currentPlayer) {
    return (
      <View className="bg-black/10 backdrop-blur-2xl rounded-2xl p-4 shadow-xl border border-white/10">
        <Text className="text-white/70">Данные игрока не найдены</Text>
      </View>
    );
  }

  return (
    <View className="bg-black/10 backdrop-blur-2xl rounded-2xl p-5 shadow-xl border border-white/10">
      <Text className="text-lg font-semibold text-white/90 mb-4">Информация об игроке</Text>
      
      <View className="space-y-4">
        <View className="flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/5">
          <Text className="text-white/80">Текущая позиция:</Text>
          <View className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 backdrop-blur-xl px-4 py-2 rounded-full">
            <Text className="font-semibold text-white">{currentPlayer.plan}</Text>
          </View>
        </View>
        
        <View className="flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/5">
          <Text className="text-white/80">Предыдущая позиция:</Text>
          <View className="bg-gradient-to-r from-pink-600/30 to-purple-600/30 backdrop-blur-xl px-4 py-2 rounded-full">
            <Text className="font-semibold text-white">{currentPlayer.previous_plan || 0}</Text>
          </View>
        </View>
        
        {currentPlayer.message && (
          <View className="flex-row justify-between items-center bg-white/5 backdrop-blur-xl p-4 rounded-xl border border-white/5">
            <Text className="text-white/80">Сообщение:</Text>
            <Text className="font-semibold text-white/90">{currentPlayer.message}</Text>
          </View>
        )}
        
        <View className="pt-4">
          <Text className="text-white/80 mb-3">Действия:</Text>
          <View className="flex-row space-x-3">
            <TouchableOpacity 
              onPress={() => handleMove(currentPlayer.plan + 1)}
              className="bg-gradient-to-r from-pink-600 to-purple-600 flex-1 rounded-full shadow-xl px-2 py-1"
            >
              <Text className="text-white font-medium py-3 text-center">
                Шаг вперед
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleMove(1)}
              className="bg-gradient-to-r from-indigo-600 to-blue-600 flex-1 rounded-full shadow-xl px-2 py-1"
            >
              <Text className="text-white font-medium py-3 text-center">
                В начало
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}; 
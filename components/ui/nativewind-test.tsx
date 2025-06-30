import React from 'react';
import { View, Text, Pressable } from 'react-native';

export function NativeWindTest() {
  return (
    <View className="flex-1 justify-center items-center bg-gradient-to-br from-purple-400 via-pink-500 to-red-500 p-6">
      {/* Главная карточка */}
      <View className="bg-white/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl w-full max-w-md border border-white/20">
        {/* Заголовок */}
        <Text className="text-3xl font-bold text-gray-800 text-center mb-2">
          🕉️ NativeWind Test
        </Text>
        
        <Text className="text-lg text-gray-600 text-center mb-6 font-medium">
          Проверяем дизайн-систему
        </Text>

        {/* Responsive grid */}
        <View className="flex flex-row flex-wrap gap-3 mb-6">
          <View className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 min-h-[80px] justify-center items-center">
            <Text className="text-white font-semibold text-center">Responsive</Text>
          </View>
          <View className="flex-1 bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 min-h-[80px] justify-center items-center">
            <Text className="text-white font-semibold text-center">Design</Text>
          </View>
        </View>

        {/* Buttons */}
        <View className="space-y-4">
          <Pressable className="bg-gradient-to-r from-purple-600 to-purple-700 active:from-purple-700 active:to-purple-800 px-6 py-4 rounded-2xl shadow-lg active:shadow-xl transition-all duration-200">
            <Text className="text-white font-bold text-lg text-center">
              Главная кнопка
            </Text>
          </Pressable>

          <Pressable className="border-2 border-purple-600 bg-white px-6 py-4 rounded-2xl active:bg-purple-50">
            <Text className="text-purple-600 font-bold text-lg text-center">
              Вторичная кнопка
            </Text>
          </Pressable>
        </View>

        {/* Status indicators */}
        <View className="flex flex-row justify-around mt-6 pt-6 border-t border-gray-200">
          <View className="items-center">
            <View className="w-4 h-4 bg-green-500 rounded-full mb-2"></View>
            <Text className="text-xs text-gray-600 font-medium">Tailwind</Text>
          </View>
          <View className="items-center">
            <View className="w-4 h-4 bg-blue-500 rounded-full mb-2"></View>
            <Text className="text-xs text-gray-600 font-medium">NativeWind</Text>
          </View>
          <View className="items-center">
            <View className="w-4 h-4 bg-purple-500 rounded-full mb-2"></View>
            <Text className="text-xs text-gray-600 font-medium">Expo</Text>
          </View>
        </View>
      </View>

      {/* Floating elements */}
      <View className="absolute top-10 left-6 w-6 h-6 bg-yellow-400 rounded-full opacity-80"></View>
      <View className="absolute top-20 right-8 w-4 h-4 bg-pink-400 rounded-full opacity-60"></View>
      <View className="absolute bottom-20 left-10 w-8 h-8 bg-blue-400 rounded-full opacity-50"></View>
    </View>
  );
} 
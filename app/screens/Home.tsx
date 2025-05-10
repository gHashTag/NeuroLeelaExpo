import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../types/navigation';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

export default function Home() {
  const navigation = useNavigation<HomeScreenNavigationProp>();

  async function signOut() {
    try {
      console.log('🚪 Начинаем процесс выхода...');
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('❌ Ошибка при выходе:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: error.message,
          position: 'bottom',
        });
        return;
      }

      console.log('✅ Успешный выход');
      Toast.show({
        type: 'success',
        text1: 'До свидания!',
        position: 'bottom',
      });
    } catch (error) {
      console.error('❌ Неожиданная ошибка:', error);
      Toast.show({
        type: 'error',
        text1: 'Ошибка',
        text2: 'Произошла неожиданная ошибка',
        position: 'bottom',
      });
    }
  }

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <Text className="text-2xl font-bold mb-8">
        Главная страница
      </Text>

      <View className="w-full max-w-sm space-y-4">
        <TouchableOpacity
          className="w-full h-12 bg-blue-500 rounded-lg flex items-center justify-center"
          onPress={() => navigation.navigate('Profile')}
        >
          <Text className="text-white font-semibold">
            Профиль
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="w-full h-12 bg-red-500 rounded-lg flex items-center justify-center"
          onPress={signOut}
        >
          <Text className="text-white font-semibold">
            Выйти
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    try {
      setLoading(true);
      console.log('🚀 Начинаем процесс входа...');
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Ошибка входа:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Ошибка входа',
          text2: error.message,
          position: 'bottom',
        });
        return;
      }

      console.log('✅ Успешный вход');
      Toast.show({
        type: 'success',
        text1: 'Добро пожаловать!',
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
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 items-center justify-center p-4 bg-white">
      <View className="w-full max-w-sm space-y-4">
        <Text className="text-2xl font-bold text-center mb-8">
          Вход в систему
        </Text>

        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />

        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg"
          placeholder="Пароль"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          autoCapitalize="none"
        />

        <TouchableOpacity
          className={`w-full h-12 rounded-lg flex items-center justify-center ${
            loading ? 'bg-gray-400' : 'bg-blue-500'
          }`}
          onPress={signInWithEmail}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">Войти</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 
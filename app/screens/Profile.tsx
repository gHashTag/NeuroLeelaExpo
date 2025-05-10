import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator } from 'react-native';
import { supabase } from '../../lib/supabase';
import Toast from 'react-native-toast-message';

interface Profile {
  id: string;
  username: string;
  updated_at: string;
}

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('');
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    getProfile();
  }, []);

  async function getProfile() {
    try {
      setLoading(true);
      console.log('🔍 Получаем данные профиля...');

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('❌ Пользователь не найден');
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: 'Пользователь не найден',
          position: 'bottom',
        });
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('❌ Ошибка при получении профиля:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: error.message,
          position: 'bottom',
        });
        return;
      }

      if (data) {
        setProfile(data);
        setUsername(data.username);
        console.log('✅ Профиль получен:', data);
      }
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

  async function updateProfile() {
    try {
      setLoading(true);
      console.log('📝 Обновляем профиль...');

      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        console.error('❌ Пользователь не найден');
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: 'Пользователь не найден',
          position: 'bottom',
        });
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          username,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        console.error('❌ Ошибка при обновлении профиля:', error.message);
        Toast.show({
          type: 'error',
          text1: 'Ошибка',
          text2: error.message,
          position: 'bottom',
        });
        return;
      }

      console.log('✅ Профиль обновлен');
      Toast.show({
        type: 'success',
        text1: 'Профиль обновлен',
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
          Профиль
        </Text>

        <TextInput
          className="w-full h-12 px-4 border border-gray-300 rounded-lg"
          placeholder="Имя пользователя"
          value={username}
          onChangeText={setUsername}
          autoCapitalize="none"
        />

        <TouchableOpacity
          className={`w-full h-12 rounded-lg flex items-center justify-center ${
            loading ? 'bg-gray-400' : 'bg-blue-500'
          }`}
          onPress={updateProfile}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="white" />
          ) : (
            <Text className="text-white font-semibold">
              Сохранить
            </Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
} 
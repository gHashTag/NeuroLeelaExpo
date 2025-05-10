import React from 'react';
import { View, StyleSheet } from 'react-native';
import { UsernameCheck } from '../components/UsernameCheck';
import { router } from 'expo-router';

const UsernameScreen: React.FC = () => {
  const handleUsernameValidated = async (username: string) => {
    try {
      console.log('✅ Username валидирован:', username);
      
      // Здесь можно добавить сохранение username в базу данных
      
      // Переходим на следующий экран
      router.push('/welcome');
    } catch (error) {
      console.error('❌ Ошибка при обработке username:', error);
    }
  };

  return (
    <View style={styles.container}>
      <UsernameCheck onUsernameValidated={handleUsernameValidated} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default UsernameScreen; 
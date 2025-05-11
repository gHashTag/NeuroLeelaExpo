import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { useSupabase } from '@/context/supabase-provider';
import { router } from 'expo-router';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';

export default function LoginScreen() {
  const { signInWithPassword, user } = useSupabase();
  const { loadPlayer } = useApolloDrizzle();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Пожалуйста, введите email и пароль');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      // Авторизация через Supabase
      await signInWithPassword(email, password);

      // Успешный вход, загружаем данные игрока через Apollo и Drizzle
      await loadPlayer();
      
      // Переходим на главный экран игры
      router.replace('/(app)/(protected)/gamescreen');
    } catch (err: any) {
      setError(err.message || 'Ошибка при входе');
      console.error('Ошибка входа:', err);
    } finally {
      setLoading(false);
    }
  };

  const navigateToRegister = () => {
    router.push('/register' as any);
  };

  return (
    <View style={styles.container}>
      <View style={styles.formContainer}>
        {/* Логотип */}
        <View style={styles.logoContainer}>
          <Image 
            source={require('@/assets/icons/1024.png')} 
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>НейроЛила</Text>
        </View>
        
        <Text style={styles.title}>Вход в аккаунт</Text>
        
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Введите ваш email"
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>
        
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Пароль</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Введите ваш пароль"
            secureTextEntry
          />
        </View>
        
        <TouchableOpacity 
          style={styles.forgotPasswordLink}
          onPress={() => router.push('/reset-password' as any)}
        >
          <Text style={styles.forgotPasswordText}>Забыли пароль?</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.button}
          onPress={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.buttonText}>Войти</Text>
          )}
        </TouchableOpacity>
        
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>Нет учетной записи?</Text>
          <TouchableOpacity onPress={navigateToRegister}>
            <Text style={styles.registerLink}>Зарегистрироваться</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  logoText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#8b5cf6',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 10,
    borderRadius: 5,
    fontSize: 16,
  },
  forgotPasswordLink: {
    alignSelf: 'flex-end',
    marginBottom: 20,
  },
  forgotPasswordText: {
    color: '#8b5cf6',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#8b5cf6',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
    marginBottom: 15,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 14,
    color: '#555',
  },
  registerLink: {
    fontSize: 14,
    color: '#8b5cf6',
    fontWeight: '600',
    marginLeft: 5,
  },
}); 
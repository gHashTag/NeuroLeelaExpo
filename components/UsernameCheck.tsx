import React, { useState, useCallback } from 'react';
import { View, TextInput, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';

interface UsernameCheckProps {
  onUsernameValidated: (username: string) => void;
}

export const UsernameCheck: React.FC<UsernameCheckProps> = ({ onUsernameValidated }) => {
  const [username, setUsername] = useState('');
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const validateUsername = useCallback(async () => {
    if (!username) {
      setError('Введите username');
      return;
    }

    try {
      setChecking(true);
      setError(null);
      
      console.log('🔍 Начинаем проверку username:', username);
      
      // Простая валидация
      if (username.length < 3) {
        throw new Error('Username должен быть не менее 3 символов');
      }
      
      if (!/^[a-zA-Z0-9_]+$/.test(username)) {
        throw new Error('Username может содержать только буквы, цифры и знак подчеркивания');
      }
      
      // Имитируем проверку на сервере
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('✅ Username прошел валидацию:', username);
      onUsernameValidated(username);
    } catch (error) {
      console.error('❌ Ошибка при проверке username:', error);
      setError(error instanceof Error ? error.message : 'Неизвестная ошибка');
    } finally {
      setChecking(false);
    }
  }, [username, onUsernameValidated]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Выберите Username</Text>
      <Text style={styles.description}>
        Выберите username для вашего аккаунта. Вы сможете изменить его позже.
      </Text>
      
      <TextInput
        style={styles.input}
        value={username}
        onChangeText={(text) => {
          setUsername(text);
          setError(null);
        }}
        placeholder="Введите username"
        autoCapitalize="none"
        autoCorrect={false}
        editable={!checking}
        onSubmitEditing={validateUsername}
      />
      
      <TouchableOpacity 
        style={[
          styles.button,
          checking && styles.buttonDisabled
        ]}
        onPress={validateUsername}
        disabled={checking}
      >
        {checking ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
            <Text style={styles.buttonTextLoading}>Проверяем...</Text>
          </View>
        ) : (
          <Text style={styles.buttonText}>Продолжить</Text>
        )}
      </TouchableOpacity>
      
      {error && (
        <Text style={styles.errorText}>{error}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    width: '100%',
  },
  label: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    backgroundColor: '#999',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextLoading: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center',
  },
}); 
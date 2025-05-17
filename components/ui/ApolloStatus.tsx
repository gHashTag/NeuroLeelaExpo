import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useReactiveVar } from '@apollo/client';
import { currentPlayerPositionVar, loadingStateVar } from '@/lib/apollo-client';

/**
 * Компонент для отображения текущего статуса Apollo реактивных переменных
 * Используется для отладки
 */
export function ApolloStatus() {
  // Безопасное получение значений без вызова хуков внутри других функций
  let position = 0;
  let loading = true;
  let error = null;
  
  try {
    position = currentPlayerPositionVar();
    loading = loadingStateVar();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Unknown error';
    console.error('Error accessing Apollo reactive variables:', e);
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Apollo Error</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Apollo Status</Text>
      <Text style={styles.status}>
        Position: {position}, Loading: {loading ? 'Yes' : 'No'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 6,
    color: 'rgba(255, 255, 255, 0.9)',
  },
  status: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  errorContainer: {
    padding: 12,
    backgroundColor: 'rgba(191, 30, 46, 0.2)',
    borderRadius: 16,
    margin: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    backdropFilter: 'blur(16px)',
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#FF5C8D',
    marginBottom: 6,
  },
  errorText: {
    fontSize: 12,
    color: '#FF8EB4',
  }
}); 
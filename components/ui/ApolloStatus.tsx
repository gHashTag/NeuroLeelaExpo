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
    padding: 10,
    backgroundColor: '#e8f5e9',
    borderRadius: 5,
    margin: 5,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  status: {
    fontSize: 12,
  },
  errorContainer: {
    padding: 10,
    backgroundColor: '#ffebee',
    borderRadius: 5,
    margin: 5,
  },
  errorTitle: {
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    color: 'red',
  }
}); 
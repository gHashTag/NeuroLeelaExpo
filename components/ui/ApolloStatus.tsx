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
    backgroundColor: 'rgba(186, 230, 253, 0.2)',
    borderRadius: 12,
    margin: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(8px)',
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#0284c7',
  },
  status: {
    fontSize: 12,
    color: '#0369a1',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(254, 205, 211, 0.3)',
    borderRadius: 12,
    margin: 5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    backdropFilter: 'blur(8px)',
  },
  errorTitle: {
    fontWeight: 'bold',
    color: '#e11d48',
    marginBottom: 5,
  },
  errorText: {
    fontSize: 12,
    color: '#be123c',
  }
}); 
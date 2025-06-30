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
      <Text style={styles.status}>
        📍 {position} {loading ? '⏳' : '✅'}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  title: {
    fontWeight: '500',
    marginBottom: 4,
    color: '#3B82F6',
  },
  status: {
    fontSize: 12,
    color: '#4B5563',
  },
  errorContainer: {
    padding: 10,
    backgroundColor: 'rgba(254, 226, 226, 0.9)',
    borderRadius: 8,
    margin: 6,
    borderWidth: 1,
    borderColor: 'rgba(252, 165, 165, 0.7)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  errorTitle: {
    fontWeight: '500',
    color: '#DC2626',
    marginBottom: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
  }
}); 
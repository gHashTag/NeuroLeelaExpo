import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { 
  useCurrentPlayerPositionDirect,
  useLoadingStateDirect 
} from '@/hooks/useApolloState';
import { supabase } from '@/config/supabase';
import { useSupabase } from '@/context/supabase-provider';

// Максимальное количество позиций на доске
const MAX_POSITION = 72;

export const PlayerPositionApollo: React.FC = () => {
  const { currentPosition, setCurrentPosition } = useCurrentPlayerPositionDirect();
  const { loading, setLoading } = useLoadingStateDirect();
  const { user } = useSupabase();

  // Функция для обновления позиции игрока в БД и Apollo Cache
  const updatePlayerPosition = async (newPosition: number) => {
    if (!user) {
      console.error('Пользователь не авторизован');
      return;
    }

    // Проверяем корректность новой позиции
    if (newPosition < 1 || newPosition > MAX_POSITION) {
      console.error('Некорректная позиция:', newPosition);
      return;
    }

    try {
      setLoading(true);

      // Обновляем позицию в базе данных
      const { error } = await supabase
        .from('players')
        .update({ plan: newPosition })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      // Обновляем позицию в Apollo Client
      setCurrentPosition(newPosition);
      
      console.log(`Позиция игрока обновлена на: ${newPosition}`);
    } catch (error: any) {
      console.error('Ошибка при обновлении позиции:', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Перемещение вперед
  const moveForward = () => {
    if (currentPosition < MAX_POSITION) {
      updatePlayerPosition(currentPosition + 1);
    }
  };

  // Перемещение назад
  const moveBackward = () => {
    if (currentPosition > 1) {
      updatePlayerPosition(currentPosition - 1);
    }
  };

  // Бросок кубика (случайное число от 1 до 6)
  const rollDice = () => {
    const diceResult = Math.floor(Math.random() * 6) + 1;
    const newPosition = Math.min(currentPosition + diceResult, MAX_POSITION);
    updatePlayerPosition(newPosition);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.positionText}>
        Текущая позиция: {currentPosition} из {MAX_POSITION}
      </Text>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.backButton, currentPosition <= 1 && styles.disabledButton]}
          onPress={moveBackward}
          disabled={loading || currentPosition <= 1}
        >
          <Text style={styles.buttonText}>← Назад</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.diceButton, loading && styles.disabledButton]}
          onPress={rollDice}
          disabled={loading || currentPosition >= MAX_POSITION}
        >
          <Text style={styles.buttonText}>🎲 Бросить кубик</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.button, styles.forwardButton, currentPosition >= MAX_POSITION && styles.disabledButton]}
          onPress={moveForward}
          disabled={loading || currentPosition >= MAX_POSITION}
        >
          <Text style={styles.buttonText}>Вперед →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    margin: 10,
  },
  positionText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    flex: 1,
    padding: 12,
    borderRadius: 5,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  backButton: {
    backgroundColor: '#f44336',
  },
  forwardButton: {
    backgroundColor: '#4CAF50',
  },
  diceButton: {
    backgroundColor: '#2196F3',
  },
  disabledButton: {
    opacity: 0.5,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
}); 
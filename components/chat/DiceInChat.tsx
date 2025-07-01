import React, { useRef, useState, useEffect } from 'react';
import { View, Text, Animated, Easing, Pressable, StyleSheet, Platform } from 'react-native';
import { vs } from 'react-native-size-matters';

interface DiceInChatProps {
  onRoll: () => Promise<void>;
  lastRoll: number;
  disabled?: boolean;
  message?: string;
}

export const DiceInChat: React.FC<DiceInChatProps> = ({ 
  onRoll, 
  lastRoll, 
  disabled = false,
  message = "Готовы к следующему шагу? Бросьте кубик!"
}) => {
  console.log('🎲 [DiceInChat] =================== РЕНДЕР КОМПОНЕНТА ===================');
  console.log('🎲 [DiceInChat] PROPS:', { disabled, lastRoll, message });
  console.log('🎲 [DiceInChat] onRoll type:', typeof onRoll);
  console.log('🎲 [DiceInChat] disabled:', disabled);
  console.log('🎲 [DiceInChat] КРИТИЧЕСКИ ВАЖНО: disabled =', disabled);

  const [isAnimating, setIsAnimating] = useState(false);

  // Добавляем анимацию ТОЧНО как в основном Dice компоненте
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  // Диагностика изменений lastRoll
  useEffect(() => {
    console.log('🎲 [DiceInChat] ================ lastRoll ИЗМЕНИЛСЯ ================');
    console.log('🎲 [DiceInChat] Новое значение lastRoll:', lastRoll);
    console.log('🎲 [DiceInChat] disabled:', disabled);
    console.log('🎲 [DiceInChat] isAnimating:', isAnimating);
  }, [lastRoll]);

  // Диагностика изменений disabled
  useEffect(() => {
    console.log('🎲 [DiceInChat] ================ disabled ИЗМЕНИЛСЯ ================');
    console.log('🎲 [DiceInChat] Новое значение disabled:', disabled);
  }, [disabled]);

  // Создаем интерполяцию для вращения
  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  // Функция для получения изображения кубика (ТОЧНО как в Dice компоненте)
  const getImage = (number: number) => {
    console.log('🎲 [DiceInChat] getImage вызвана с number:', number);
    switch (number) {
      case 1:
        return require("../../assets/dice/1.png");
      case 2:
        return require("../../assets/dice/2.png");
      case 3:
        return require("../../assets/dice/3.png");
      case 4:
        return require("../../assets/dice/4.png");
      case 5:
        return require("../../assets/dice/5.png");
      case 6:
        return require("../../assets/dice/6.png");
      default:
        console.warn('🎲 [DiceInChat] getImage: неизвестное число:', number);
        return require("../../assets/dice/1.png"); // fallback
    }
  };

  // ТОЧНАЯ КОПИЯ animateDice из основного Dice компонента
  const animateDice = async (): Promise<void> => {
    console.log('🎲 [DiceInChat] ================== animateDice ВЫЗВАНА ==================');
    console.log('🎲 [DiceInChat] animateDice: disabled =', disabled);
    console.log('🎲 [DiceInChat] animateDice: isAnimating =', isAnimating);
    
    if (disabled) {
      console.log('🚫 [DiceInChat] animateDice ЗАБЛОКИРОВАНА: disabled = true');
      return;
    }
    
    if (isAnimating) {
      console.log('🚫 [DiceInChat] animateDice ЗАБЛОКИРОВАНА: isAnimating = true');
      return;
    }

    console.log('✅ [DiceInChat] НАЧИНАЕМ АНИМАЦИЮ КУБИКА');
    setIsAnimating(true);
    
    // Запускаем анимацию вращения СРАЗУ
    console.log('🎲 [DiceInChat] Запускаем анимацию вращения...');
    spinValue.setValue(0);
    
    // Анимируем масштабирование
    console.log('🎲 [DiceInChat] Запускаем анимацию масштабирования...');
    scaleValue.setValue(1);
    
    // Запускаем обе анимации параллельно
    Animated.parallel([
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 500,
        easing: Easing.cubic,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ])
    ]).start(() => {
      // По окончании анимации сбрасываем состояние
      console.log('✅ [DiceInChat] Анимация завершена');
      spinValue.setValue(0);
      setIsAnimating(false);
    });
    
    // Вызываем onRoll() ПОСЛЕ начала анимации
    console.log('🎲 [DiceInChat] Вызываем onRoll()...');
    
    try {
      await onRoll(); // Теперь с await!
      console.log('✅ [DiceInChat] onRoll() выполнен успешно');
    } catch (error) {
      console.error('❌ [DiceInChat] Ошибка при вызове onRoll():', error);
      // В случае ошибки тоже сбрасываем анимацию
      setIsAnimating(false);
      spinValue.setValue(0);
    }
  };

  const diceSize = vs(55);

  console.log('🎲 [DiceInChat] ФИНАЛЬНАЯ ПРОВЕРКА disabled:', disabled);
  console.log('🎲 [DiceInChat] ФИНАЛЬНАЯ ПРОВЕРКА isAnimating:', isAnimating);

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.messageText}>
        {message}
      </Text>
      
      <View style={styles.diceContainer}>
        <Pressable 
          onPress={animateDice} 
          style={[
            styles.pressableArea,
            (disabled || isAnimating) && styles.pressableDisabled
          ]}
          disabled={disabled || isAnimating}
        >
          <Animated.Image
            style={[
              styles.image,
              {
                transform: [{ rotate: spin }, { scale: scaleValue }],
                height: diceSize,
                width: diceSize,
              },
            ]}
            source={getImage(lastRoll)}
          />
        </Pressable>
      </View>
      
      {disabled && (
        <Text style={styles.disabledText}>
          📝 Сначала напишите отчет
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    alignItems: 'center',
    padding: 16,
  },
  messageText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 12,
    fontWeight: '500',
  },
  diceContainer: {
    marginVertical: 8,
  },
  pressableArea: {
    padding: 10,
  },
  pressableDisabled: {
    opacity: 0.4,
  },
  image: {
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
  },
  lastRollText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: 12,
    marginTop: 10,
    fontWeight: '500',
  },
  disabledText: {
    textAlign: 'center',
    color: '#ea580c',
    fontSize: 13,
    marginTop: 8,
    fontWeight: '600',
  },
}); 
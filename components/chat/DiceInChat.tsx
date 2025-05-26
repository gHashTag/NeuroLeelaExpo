import React, { useRef, useState } from 'react';
import { View, Text, Animated, Easing, Pressable, Image } from 'react-native';
import { vs } from "react-native-size-matters";

interface DiceInChatProps {
  onRoll: () => Promise<number>;
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
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const getImage = (number: number) => {
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
        return require("../../assets/dice/1.png");
    }
  };

  const animateDice = async (): Promise<void> => {
    if (disabled || isAnimating) {
      console.log('🎲 [DiceInChat] animateDice: заблокировано', { disabled, isAnimating });
      return;
    }

    console.log('🎲 [DiceInChat] animateDice: начинаем анимацию');
    setIsAnimating(true);
    
    // Запускаем анимацию вращения кубика
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 800, // Немного дольше для эффектности в чате
      easing: Easing.cubic,
      useNativeDriver: true,
    }).start(() => {
      // По окончании анимации сбрасываем состояние
      console.log('🎲 [DiceInChat] анимация вращения завершена');
      spinValue.setValue(0);
      setIsAnimating(false);
    });

    // Анимируем масштабирование
    scaleValue.setValue(1);
    Animated.sequence([
      Animated.timing(scaleValue, {
        toValue: 1.3, // Больше масштаб для чата
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(scaleValue, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Анимируем прозрачность
    opacityValue.setValue(0.3);
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();

    // Вызываем функцию броска после начала анимации
    try {
      console.log('🎲 [DiceInChat] вызываем onRoll...');
      const result = await onRoll();
      console.log('🎲 [DiceInChat] onRoll завершен, результат:', result);
    } catch (error) {
      console.error('🎲 [DiceInChat] ошибка при броске кубика в чате:', error);
    }
  };

  return (
    <View className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 m-2 border border-purple-200">
      <Text className="text-center text-gray-700 text-sm mb-3 font-medium">
        {message}
      </Text>
      
      <View className="items-center">
        <Pressable
          onPress={animateDice}
          disabled={disabled || isAnimating}
          className={`items-center justify-center ${
            disabled || isAnimating ? 'opacity-50' : 'active:scale-95'
          }`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 8,
          }}
        >
          <Animated.Image
            style={{
              transform: [{ rotate: spin }, { scale: scaleValue }],
              height: vs(60), // Размер для чата
              width: vs(60),
              opacity: opacityValue,
              borderRadius: 12,
            }}
            source={getImage(lastRoll)}
          />
        </Pressable>
        
        {lastRoll > 0 && (
          <Text className="text-center text-gray-600 text-xs mt-3 font-medium">
            Последний бросок: {lastRoll}
          </Text>
        )}
      </View>
      
      {disabled && (
        <Text className="text-center text-orange-600 text-xs mt-2 font-medium">
          📝 Сначала напишите отчет о текущем состоянии
        </Text>
      )}
      
      {isAnimating && (
        <Text className="text-center text-purple-600 text-xs mt-2 font-medium animate-pulse">
          🎲 Кубик крутится...
        </Text>
      )}
    </View>
  );
}; 
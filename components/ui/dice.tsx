import React, { useRef, useEffect, useState } from "react";
import { Animated, StyleSheet, Easing, Pressable, useColorScheme, Image, Platform, View } from "react-native";
import { vs } from "react-native-size-matters";

export interface DiceProps {
  disabled?: boolean;
  rollDice: () => void;
  lastRoll: number;
  size?: "extra-small" | "small" | "medium" | "large";
}

const Dice = ({
  disabled = false,
  rollDice,
  lastRoll,
  size = "medium",
}: DiceProps & { lastRoll: number }) => {
  const spinValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;
  const [isAnimating, setIsAnimating] = useState(false);

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  const animateDice = (): void => {
    if (disabled || isAnimating) {
      return;
    }

    setIsAnimating(true);
    
    // Сначала вызываем rollDice() для обновления положения игрока
    // Это позволяет сразу обновить состояние игры, не дожидаясь анимации
    rollDice();
    
    // Затем запускаем анимацию вращения кубика
    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.cubic,
      useNativeDriver: true,
    }).start(() => {
      // По окончании анимации сбрасываем состояние
      spinValue.setValue(0);
      setIsAnimating(false);
    });

    // Анимируем масштабирование
    scaleValue.setValue(1);
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
    ]).start();

    // Анимируем прозрачность
    opacityValue.setValue(0);
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getSize = () => {
    switch (size) {
      case "extra-small":
        return vs(40);
      case "small":
        return vs(55);
      case "large":
        return vs(80);
      case "medium":
      default:
        return vs(65);
    }
  };
  
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
        return null;
    }
  };
  
  // Используем pointerEvents для контроля взаимодействия вместо preventDefault
  const pointerEventsValue = disabled || isAnimating ? 'none' : 'auto';
  
  return (
    <View 
      style={[styles.diceContainer, { 
        marginTop: size === "extra-small" ? 5 : 10,
        marginBottom: size === "extra-small" ? 5 : 10
      }]} 
      testID="dice-component"
      pointerEvents={pointerEventsValue}
    >
      <Pressable onPress={animateDice} style={styles.pressableArea}>
        <Animated.Image
          style={[
            styles.image,
            {
              transform: [{ rotate: spin }, { scale: scaleValue }],
              height: getSize(),
              width: getSize(),
              opacity: opacityValue,
              borderRadius: size === "extra-small" ? 8 : 10,
            },
          ]}
          source={getImage(lastRoll)}
          testID="dice-image"
        />
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  diceContainer: {
    alignItems: "center",
    alignSelf: "center",
    marginTop: 10,
    marginBottom: vs(8),
  },
  pressableArea: {
    alignItems: "center",
    justifyContent: "center",
    padding: 5,
  },
  image: {
    height: vs(90),
    width: vs(90),
    borderRadius: 10,
  },
});

export { Dice };

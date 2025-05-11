import React, { useRef, useEffect, useState } from "react";
import { Animated, StyleSheet, Easing, Pressable, useColorScheme, Image, Platform, View } from "react-native";
import { vs } from "react-native-size-matters";

export interface DiceProps {
  disabled?: boolean;
  rollDice: () => void;
  lastRoll: number;
  size?: "small" | "medium" | "large";
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

    spinValue.setValue(0);
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.cubic,
      useNativeDriver: true,
    }).start(() => {
      rollDice();
      spinValue.setValue(0);
      setIsAnimating(false);
    });

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

    opacityValue.setValue(0);
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const getSize = () => {
    switch (size) {
      case "small":
        return vs(60);
      case "large":
        return vs(110);
      case "medium":
      default:
        return vs(85);
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
      style={styles.diceContainer} 
      testID="dice-component"
      // Используем pointerEvents для контроля взаимодействия 
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
    marginTop: 30,
    marginBottom: vs(12),
  },
  pressableArea: {
    alignItems: "center",
    justifyContent: "center",
  },
  image: {
    height: vs(90),
    width: vs(90),
    borderRadius: 10,
  },
});

export { Dice };

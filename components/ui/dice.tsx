import React, { useRef, useEffect } from 'react'

import {
  Animated,
  StyleSheet,
  Easing,
  Pressable,
  useColorScheme,
  Image,
} from 'react-native'

import { vs } from 'react-native-size-matters'

export interface DiceProps {
  disabled?: boolean
  rollDice: () => void
  lastRoll: number
  size?: 'small' | 'medium' | 'large'
}

const Dice = ({
  disabled = false,
  rollDice,
  lastRoll,
  size = 'medium',
}: DiceProps & { lastRoll: number }) => {
  const spinValue = useRef(new Animated.Value(0)).current
  const scaleValue = useRef(new Animated.Value(1)).current
  const opacityValue = useRef(new Animated.Value(1)).current

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  })

  
  const animateDice = (): void => {
    if (disabled) {
      return
    }

    spinValue.setValue(0)
    Animated.timing(spinValue, {
      toValue: 1,
      duration: 500,
      easing: Easing.cubic,
      useNativeDriver: true,
    }).start(() => {
      rollDice()
      spinValue.setValue(0)
    })

    scaleValue.setValue(1)
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
    ]).start()

    opacityValue.setValue(0)
    Animated.timing(opacityValue, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start()
  }

  const getSize = () => {
    switch (size) {
      case 'small':
        return vs(50)
      case 'large':
        return vs(120)
      case 'medium':
      default:
        return vs(80)
    }
  }
  const getImage = (number: number) => {
    switch (number) {
      case 1:
        return require('../../assets/dice/1.png')
      case 2:
        return require('../../assets/dice/2.png')
      case 3:
        return require('../../assets/dice/3.png')
      case 4:
        return require('../../assets/dice/4.png')
      case 5:
        return require('../../assets/dice/5.png')
      case 6:
        return require('../../assets/dice/6.png')
      default:
        return null
    }
  }
  return (
    <Pressable
      onPress={animateDice}
      style={styles.diceContainer}
      testID="dice-component"
    >
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
  )
}

const styles = StyleSheet.create({
  diceContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: vs(12),
  },
  image: {
    height: vs(65),
    width: vs(65),
    borderRadius: 10,
  },
})

export { Dice }

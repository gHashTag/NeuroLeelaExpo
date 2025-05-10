import React from "react";
import { Text, StyleSheet, View, Image, Platform } from "react-native";

interface GemProps {
  player?: {
    id: string;
    plan: number;
    avatar?: any;
  };
  planNumber: number;
  cellSize?: number; // Добавляем опциональный параметр размера ячейки
  onPress?: () => void;
}

const Gem: React.FC<GemProps> = ({ player, planNumber, cellSize = 44, onPress }) => {
  const isWeb = Platform.OS === 'web';
  
  // Вычисляем масштабированные размеры
  const tokenSize = Math.max(30, cellSize * 0.75); // Токен должен быть примерно 75% от ячейки
  const fontSize = planNumber > 9 ? cellSize * 0.4 : cellSize * 0.5; // Размер шрифта масштабируется от размера ячейки
  
  let source;
  if (player?.avatar) {
    if (typeof player.avatar === "string" && player.avatar !== "") {
      source = { uri: player.avatar };
    } else if (typeof player.avatar === "number") {
      source = player.avatar;
    }
  }
  
  // Общий стиль для числа
  const numberStyle = [
    styles.number, 
    { fontSize },
    planNumber > 9 ? styles.twoDigitNumber : styles.singleDigitNumber,
    isWeb && styles.webNumber
  ];
  
  // Фишка игрока с номером
  if (player) {
    return (
      <View style={styles.container}>
        <View style={[
          styles.playerTokenOuter, 
          isWeb && styles.webPlayerTokenOuter,
          { width: tokenSize, height: tokenSize, borderRadius: tokenSize / 2 }
        ]}>
          <View style={[styles.playerTokenInner, { borderRadius: tokenSize / 2 }]}>
            {source && (
              <Image 
                source={source} 
                style={styles.playerImage} 
                resizeMode="cover" 
              />
            )}
          </View>
        </View>
        
        {/* Отображаем номер ячейки под фишкой в том же стиле */}
        <Text style={[numberStyle, styles.playerCellNumber]}>
          {planNumber}
        </Text>
      </View>
    );
  }
  
  // Обычная ячейка с числом
  return (
    <View style={styles.numberContainer}>
      <Text style={numberStyle}>
        {planNumber}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  
  // Стили для фишки игрока
  playerTokenOuter: {
    backgroundColor: '#8E24AA',
    borderColor: '#FFFFFF',
    borderWidth: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    elevation: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  webPlayerTokenOuter: {
    borderWidth: 4,
  },
  playerTokenInner: {
    width: '100%',
    height: '100%',
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
  },
  playerCellNumber: {
    position: 'absolute',
    bottom: -14,
    color: '#000000',
    fontWeight: '900',
  },
  
  // Стили для ячейки с числом
  numberContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  number: {
    fontWeight: 'bold',
    color: '#000000',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    padding: 0,
    margin: 0,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  twoDigitNumber: {
    fontSize: 18,
    lineHeight: 22,
  },
  singleDigitNumber: {
    fontWeight: '900',
  },
  webNumber: {
    fontWeight: '900',
    textShadowRadius: 4,
    color: '#000000',
    textShadowColor: 'rgba(255, 255, 255, 1)',
    textShadowOffset: { width: 0, height: 0 },
  }
});

export { Gem };

import React from "react";
import { Text, StyleSheet, View, Image, Platform } from "react-native";
import { s } from "react-native-size-matters";

interface GemProps {
  player?: {
    id: string;
    plan: number;
    avatar?: any;
  };
  planNumber: number;
  onPress?: () => void;
}

const Gem: React.FC<GemProps> = ({ player, planNumber, onPress }) => {
  const isWeb = Platform.OS === 'web';
  
  let source;
  if (player?.avatar) {
    if (typeof player.avatar === "string" && player.avatar !== "") {
      source = { uri: player.avatar };
    } else if (typeof player.avatar === "number") {
      source = player.avatar;
    }
  }
  
  // Фишка игрока
  if (player) {
    return (
      <View style={styles.container}>
        <View style={[styles.playerTokenOuter, isWeb && styles.webPlayerTokenOuter]}>
          <View style={styles.playerTokenInner}>
            {source && (
              <Image 
                source={source} 
                style={styles.playerImage} 
                resizeMode="cover" 
              />
            )}
          </View>
        </View>
      </View>
    );
  }
  
  // Обычная ячейка с числом
  return (
    <View style={styles.numberContainer}>
      <Text 
        style={[
          styles.number, 
          planNumber > 9 ? styles.twoDigitNumber : {},
          isWeb && styles.webNumber
        ]}
      >
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
    width: 32,
    height: 32,
    borderRadius: 16,
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
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 4,
  },
  playerTokenInner: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  playerImage: {
    width: '100%',
    height: '100%',
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
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    textAlignVertical: 'center',
    includeFontPadding: false,
    padding: 0,
    margin: 0,
    lineHeight: 26,
    textShadowColor: 'rgba(255, 255, 255, 0.9)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
  },
  twoDigitNumber: {
    fontSize: 18,
    lineHeight: 22,
  },
  webNumber: {
    fontSize: 22,
    fontWeight: '800',
    textShadowRadius: 5,
  }
});

export { Gem };

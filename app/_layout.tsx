import '../global.css';
import { Slot } from "expo-router";
import { View, Platform, StyleSheet, ImageBackground } from "react-native";
// Removed SplashScreen and useEffect imports
// import { useEffect } from "react";
// import { SplashScreen } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { GameStateProvider } from "@/context/game-state-provider";
// Keep SupabaseProvider and RegistrationProvider imports if needed later
// import { RegistrationProvider } from "@/context/registration-provider";

// Импортируем Apollo Provider
import { ApolloProvider } from '@apollo/client';
// Используем наш новый клиент Apollo с Drizzle
import { apolloClient } from '@/lib/apollo-drizzle-client';

export { ErrorBoundary } from "expo-router";

// Removed unstable_settings
// Removed SplashScreen.preventAutoHideAsync()

// Импортируем изображение листа
const leafImage = require('../assets/Green_small_one_palm_leaf_on_white_background.png');

export default function AppLayout() {
  // Removed useEffect hook

  // Add special styling for web platform
  const isWeb = Platform.OS === 'web';

  // Компонент для фонового изображения
  const BackgroundWrapper = ({ children }: { children: React.ReactNode }) => {
    if (isWeb) {
      // Для веб - используем ImageBackground с листом
      return (
        <ImageBackground 
          source={leafImage}
          style={styles.webBackground}
          resizeMode="cover"
        >
          <View style={styles.webOverlay}>
            <View style={styles.webContent}>
              {children}
            </View>
          </View>
        </ImageBackground>
      );
    } else {
      // Для мобильного - используем ImageBackground
      return (
        <ImageBackground 
          source={leafImage}
          style={styles.mobileBackground}
          resizeMode="cover"
        >
          <View style={styles.mobileOverlay}>
            {children}
          </View>
        </ImageBackground>
      );
    }
  };

  // Используем try-catch для отлова ошибок при инициализации
  try {
    return (
      // Используем наш новый Apollo клиент с Drizzle
      <ApolloProvider client={apolloClient}>
        <SupabaseProvider>
          <GameStateProvider>
            <BackgroundWrapper>
              <Slot />
            </BackgroundWrapper>
          </GameStateProvider>
        </SupabaseProvider>
      </ApolloProvider>
    );
  } catch (error) {
    // Fallback при любой ошибке - отображаем приложение без Apollo Provider
    console.error('Ошибка инициализации Apollo Provider:', error);
    return (
      <SupabaseProvider>
        <GameStateProvider>
          <BackgroundWrapper>
            <Slot />
          </BackgroundWrapper>
        </GameStateProvider>
      </SupabaseProvider>
    );
  }
}

const styles = StyleSheet.create({
  webContainer: {
    flex: 1,
    height: Platform.OS === 'web' ? '100vh' as unknown as number : '100%', 
  },
  webBackground: {
    flex: 1,
    width: '100%',
    height: Platform.OS === 'web' ? '100vh' as unknown as number : '100%',
  },
  webOverlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 255, 252, 0.25)', // Легкий зеленоватый overlay для лучшей читаемости веб-версии
  },
  webContent: {
    flex: 1,
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  },
  mobileBackground: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mobileOverlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 255, 252, 0.25)', // Легкий зеленоватый overlay для лучшей читаемости
  }
});

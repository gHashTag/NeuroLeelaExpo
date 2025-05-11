import '../global.css';
import { Slot } from "expo-router";
import { View, Platform, StyleSheet } from "react-native";
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

export default function AppLayout() {
  // Removed useEffect hook

  // Add special styling for web platform
  const isWeb = Platform.OS === 'web';

  // Используем try-catch для отлова ошибок при инициализации
  try {
    return (
      // Используем наш новый Apollo клиент с Drizzle
      <ApolloProvider client={apolloClient}>
        <SupabaseProvider>
          <GameStateProvider>
            {isWeb ? (
              <View style={styles.webContainer}>
                <View style={styles.webContent}>
                  <Slot />
                </View>
              </View>
            ) : (
              <Slot />
            )}
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
          {isWeb ? (
            <View style={styles.webContainer}>
              <View style={styles.webContent}>
                <Slot />
              </View>
            </View>
          ) : (
            <Slot />
          )}
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
  webContent: {
    flex: 1,
    maxWidth: 1200,
    marginLeft: 'auto',
    marginRight: 'auto',
    width: '100%',
  }
});

import '../global.css';
import { Slot } from "expo-router";
import { Platform, StyleSheet, View, ImageBackground } from "react-native";
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

// Импортируем изображение листа - простой подход
const leafImage = require('../assets/Green_small_one_palm_leaf_on_white_background.png');

export default function RootLayout() {
  if (Platform.OS === 'web') {
    return <Slot />;
  }
  // Для мобильных платформ
  return (
    <ImageBackground
      source={require('../assets/Green_small_one_palm_leaf_on_white_background.png')}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <Slot />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 255, 252, 0.05)', // Очень легкий overlay для максимальной видимости листа
  },
});

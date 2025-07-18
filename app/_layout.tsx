import '../global.css';
import { Slot } from "expo-router";
import { Platform, StyleSheet, View, ImageBackground } from "react-native";
import { useEffect } from "react";
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

// Импортируем изображение для фона
const backgroundImage = require('../public/static/backImage/Green_small_one_palm_leaf_on_white_background.png');

export default function RootLayout() {
  // Теперь ImageBackground применяется для всех платформ
    return (
    <ImageBackground
      source={backgroundImage}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SupabaseProvider>
        <ApolloProvider client={apolloClient}>
          <View style={styles.overlay}>
            <Slot />
          </View>
        </ApolloProvider>
      </SupabaseProvider>
    </ImageBackground>
    );
}

const styles = StyleSheet.create({
  backgroundImage: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(248, 255, 252, 0.05)', 
  },
});

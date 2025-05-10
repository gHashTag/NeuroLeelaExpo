import '../global.css';
import { Slot } from "expo-router";
import { View, Platform, StyleSheet } from "react-native";
// Removed SplashScreen and useEffect imports
// import { useEffect } from "react";
// import { SplashScreen } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
// Keep SupabaseProvider and RegistrationProvider imports if needed later
// import { RegistrationProvider } from "@/context/registration-provider";

export { ErrorBoundary } from "expo-router";

// Removed unstable_settings
// Removed SplashScreen.preventAutoHideAsync()

export default function AppLayout() {
  // Removed useEffect hook

  // Add special styling for web platform
  const isWeb = Platform.OS === 'web';

  return (
    <SupabaseProvider>
      {isWeb ? (
        <View style={styles.webContainer}>
          <View style={styles.webContent}>
            <Slot />
          </View>
        </View>
      ) : (
        <Slot />
      )}
    </SupabaseProvider>
  );
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

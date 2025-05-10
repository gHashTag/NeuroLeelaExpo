import '../global.css';
import { Slot } from "expo-router";
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

  return (
    <SupabaseProvider>
      <Slot />
    </SupabaseProvider>
  );
}

import "../global.css";

import { Slot } from "expo-router";
import { useEffect } from "react";
import { SplashScreen } from "expo-router";

import { SupabaseProvider } from "@/context/supabase-provider";
import { RegistrationProvider } from "@/context/registration-provider";

export { ErrorBoundary } from "expo-router";

export const unstable_settings = {
  initialRouteName: "/(app)/welcome",
};

SplashScreen.preventAutoHideAsync();

export default function AppLayout() {
  return (
    <SupabaseProvider>
      <RegistrationProvider>
        <Slot />
      </RegistrationProvider>
    </SupabaseProvider>
  );
}

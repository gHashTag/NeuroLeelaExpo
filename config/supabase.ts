import "react-native-url-polyfill/auto";

import AsyncStorage from "@react-native-async-storage/async-storage";
import { createClient } from "@supabase/supabase-js";
import { AppState, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Supabase configuration error:", {
    url: supabaseUrl ? "✅ Set" : "❌ Missing",
    key: supabaseKey ? "✅ Set" : "❌ Missing",
  });
}

// Проверка сетевого подключения
NetInfo.addEventListener((state) => {
  console.log("🌐 Connection type:", state.type);
  console.log("🔌 Is connected?", state.isConnected);
  console.log("📡 Is internet reachable?", state.isInternetReachable);
});

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    headers: {
      "Content-Type": "application/json",
      ...(Platform.OS === "web"
        ? {
            "Access-Control-Allow-Origin": "*",
          }
        : {}),
    },
  },
});

// Мониторинг состояния авторизации
supabase.auth.onAuthStateChange((event, session) => {
  console.log("🔐 Auth state changed:", event);
  if (session) {
    console.log("👤 User is authenticated");
  } else {
    console.log("❌ No active session");
  }
});

AppState.addEventListener("change", (state) => {
  if (state === "active") {
    supabase.auth.startAutoRefresh();
    console.log("🔄 Auto refresh started");
  } else {
    supabase.auth.stopAutoRefresh();
    console.log("⏹️ Auto refresh stopped");
  }
});

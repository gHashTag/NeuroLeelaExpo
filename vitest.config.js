import path from 'path';

export default {
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  test: {
    server: {
      deps: {
        inline: [
          "react-native",
          "expo",
          "expo-router",
          "@/components",
          "@/lib",
          "@inngest/test"
        ]
      }
    },
    environment: "jsdom",
    setupFiles: ["__tests__/setup.js"],
    // Настройки для Inngest тестов
    testTimeout: 30000, // 30 секунд для Inngest функций
    include: [
      "__tests__/**/*.{test,spec}.{js,ts,jsx,tsx}",
      "__tests__/inngest/**/*.{test,spec}.{js,ts}"
    ]
  }
} 
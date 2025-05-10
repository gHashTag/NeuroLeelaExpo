export default {
  test: {
    server: {
      deps: {
        inline: [
          "react-native",
          "expo",
          "expo-router",
          "@/components",
          "@/lib"
        ]
      }
    },
    environment: "jsdom",
    setupFiles: ["__tests__/setup.js"]
  }
} 
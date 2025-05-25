import { Tabs } from "expo-router";
import React from "react";
import { View, Platform, StyleSheet, Image, useWindowDimensions } from "react-native";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@core/useColorScheme";
import { Ionicons } from '@expo/vector-icons';

export default function ProtectedLayout() {
  const { colorScheme } = useColorScheme();
  const isWeb = Platform.OS === "web";
  const { width, height } = useWindowDimensions();
  
  // Цвет активной вкладки - фиолетовый для соответствия дизайну
  const activeColor = "#8E24AA"; // Пурпурный цвет
  const inactiveColor = colorScheme === "dark" ? "#9CA3AF" : "#6B7280"; // Серый цвет

  return (
    <View style={styles.container}>
      {/* Фоновое изображение помещаем в отдельный View в самом низу стека */}
      <View style={styles.backgroundContainer}>
        <Image 
          source={require("@/assets/icons/BG.png")}
          style={styles.backgroundImage}
          resizeMode="cover"
        />
      </View>
      
      <Tabs
        initialRouteName="gamescreen"
        screenOptions={{
          headerShown: false,
          // Скрываем табы полностью, чтобы удалить нижнюю навигацию
          tabBarStyle: {
            display: 'none',
          },
        }}
      >
        <Tabs.Screen
          name="gamescreen"
          options={{
            title: "Главная",
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Игра",
          }}
        />
        <Tabs.Screen
          name="aichat"
          options={{
            title: "Правила",
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Профиль",
          }}
        />
      </Tabs>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f5', // Чуть более насыщенный фон
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1, // Отрицательный z-index, чтобы быть позади ВСЕХ элементов
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 0.95, // Почти непрозрачный фон
  }
});

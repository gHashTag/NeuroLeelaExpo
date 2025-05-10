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
          tabBarStyle: {
            backgroundColor: colorScheme === "dark" ? "rgba(31, 41, 55, 0.9)" : "rgba(255, 255, 255, 0.95)",
            borderTopWidth: 1,
            borderTopColor: colorScheme === "dark" ? "rgba(55, 65, 81, 0.5)" : "rgba(229, 231, 235, 0.7)",
            elevation: 4,
            shadowOpacity: 0.1,
            shadowRadius: 4,
            shadowOffset: { width: 0, height: -2 },
            height: isWeb ? 64 : 56, // Больше высота для веб
            paddingBottom: isWeb ? 8 : 4,
            // Убеждаемся, что табы находятся поверх фона
            position: 'relative',
            zIndex: 10,
          },
          tabBarActiveTintColor: activeColor,
          tabBarInactiveTintColor: inactiveColor,
          tabBarShowLabel: true,
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: '500',
            marginTop: 2,
          },
        }}
      >
        <Tabs.Screen
          name="gamescreen"
          options={{
            title: "Главная",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="home-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="reports"
          options={{
            title: "Игра",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="game-controller-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="aichat"
          options={{
            title: "Правила",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="book-outline" color={color} size={size} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Профиль",
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
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
    zIndex: 1, // Низкий z-index, чтобы быть под всеми элементами
  },
  backgroundImage: {
    flex: 1,
    width: '100%',
    height: '100%',
    opacity: 0.95, // Почти непрозрачный фон
  }
});

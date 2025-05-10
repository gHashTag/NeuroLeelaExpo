import { Tabs } from "expo-router";
import React from "react";
import { ImageBackground, Platform } from "react-native";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@core/useColorScheme";
import { Ionicons } from '@expo/vector-icons';

export default function ProtectedLayout() {
  const { colorScheme } = useColorScheme();
  const isWeb = Platform.OS === "web";
  
  // Цвет активной вкладки - фиолетовый для соответствия дизайну
  const activeColor = "#8E24AA"; // Пурпурный цвет
  const inactiveColor = colorScheme === "dark" ? "#9CA3AF" : "#6B7280"; // Серый цвет

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
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
    </ImageBackground>
  );
}

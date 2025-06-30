import { Tabs } from "expo-router";
import React from "react";
import { View, Platform, StyleSheet, useWindowDimensions } from "react-native";

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
    backgroundColor: 'transparent', // Прозрачный фон, чтобы показать листочек из основного layout
  },
});

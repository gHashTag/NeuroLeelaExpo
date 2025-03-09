import { Tabs } from "expo-router";
import React from "react";
import { ImageBackground } from "react-native";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@core/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<ImageBackground 
			source={require('@/assets/icons/BG.png')} 
			style={{ flex: 1 }}
			resizeMode="cover"
		>
			<Tabs
				initialRouteName="gamescreen"
				screenOptions={{
					headerShown: false,
					tabBarStyle: {
						backgroundColor: 'transparent',
						borderTopWidth: 0,
						elevation: 0,
						shadowOpacity: 0,
					},
					tabBarActiveTintColor:
						colorScheme === "dark"
							? colors.dark.foreground
							: colors.light.foreground,
					tabBarShowLabel: false,
				}}
			>
				<Tabs.Screen
					name="gamescreen"
					options={{
						title: "Game",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="gamepad" color={color} size={size} />
						),
					}}
				/>
				<Tabs.Screen
					name="reports"
					options={{
						title: "Reports",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="chat" color={color} size={size} />
						),
					}}
				/>
				<Tabs.Screen
					name="aichat"
					options={{
						title: "AI Chat",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="memory" color={color} size={size} />
						),
					}}
				/>
				<Tabs.Screen
					name="settings"
					options={{
						title: "Settings",
						tabBarIcon: ({ color, size }) => (
							<MaterialCommunityIcons name="cog" color={color} size={size} />
						),
					}}
				/>
			</Tabs>
		</ImageBackground>
	);
}

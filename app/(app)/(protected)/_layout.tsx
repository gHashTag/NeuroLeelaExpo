import { Tabs } from "expo-router";
import React from "react";

import { colors } from "@/constants/colors";
import { useColorScheme } from "@core/useColorScheme";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";

export default function ProtectedLayout() {
	const { colorScheme } = useColorScheme();

	return (
		<Tabs
			initialRouteName="gamescreen"
			screenOptions={{
				headerShown: false,
				tabBarStyle: {
					backgroundColor:
						colorScheme === "dark"
							? colors.dark.background
							: colors.light.background,
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
				name="aichat"
				options={{
					title: "AI Chat",
					tabBarIcon: ({ color, size }) => (
						<MaterialCommunityIcons name="chat" color={color} size={size} />
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
	);
}

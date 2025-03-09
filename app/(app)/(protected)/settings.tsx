import React, { useState } from "react";
import { View, Image, TouchableOpacity, ScrollView } from "react-native";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import { Stack } from 'expo-router';
import { Header } from "@/components/layout/Header";

interface Post {
	id: string;
	number: string;
	content: string;
	date: string;
	likes: number;
	comments: number;
}

export default function Settings() {
	const { userData, getAvatarUrl } = useSupabase();
	const [activeTab, setActiveTab] = useState("Reports");

	const avatarUrl = userData?.pinata_avatar_id ? getAvatarUrl(userData.pinata_avatar_id) : null;
	// Пример данных для отображения
	const reportsPosts: Post[] = [
		{
			id: "1",
			number: "09",
			content: "Кама является первой стадией эволюции. Если бы не было желания, не было бы и никакого мироздания. Итак, кама-лока - это план желаний. Однако все желания исходят из чувственной природы человека, поэтому этот план еще называют чувственным планом",
			date: "4 days ago",
			likes: 0,
			comments: 1
		},
		{
			id: "2",
			number: "68",
			content: "It is to discover by what different combinations, with what new",
			date: "1 month ago",
			likes: 0,
			comments: 0
		}
	];
	
	const historyPosts = [
		{
			id: "3",
			number: "42",
			content: "История ваших действий в игре будет отображаться здесь",
			date: "2 months ago",
			likes: 3,
			comments: 2
		}
	];

	// Функция для рендеринга постов
	const renderPosts = (posts: Post[]) => {
		return posts.map((post) => (
			<View key={post.id} className="mb-6">
				<View className="flex-row items-start mb-2">
					<View className="relative">
						<Image 
							source={avatarUrl ? { uri: avatarUrl } : require('@/assets/defaultImage/defaultProfileImage.png')}
							className="w-12 h-12 rounded-full"
						/>
						<View className="absolute bottom-0 right-0 bg-white rounded-full px-1 border border-purple-200">
							<Text className="text-xs font-bold" style={{ color: '#6A0DAD' }}>{post.number}</Text>
						</View>
					</View>
					
					<View className="flex-1 ml-3">
						<View className="flex-row items-center">
							<Text className="text-lg font-semibold">{userData?.username || ''}</Text>
							<Text className="text-gray-400 text-xs ml-2">{post.date}</Text>
						</View>
						<Text className="text-gray-800 mt-1">{post.content}</Text>
						
						<View className="flex-row justify-between mt-3">
							<TouchableOpacity>
								<Icon name="dots-horizontal" size={20} color="#9CA3AF" />
							</TouchableOpacity>
							
							<TouchableOpacity className="flex-row items-center">
								<Icon name="comment-outline" size={20} color="#9CA3AF" />
								<Text className="ml-1 text-gray-400">{post.comments}</Text>
							</TouchableOpacity>
							
							<TouchableOpacity className="flex-row items-center">
								<Icon name="heart-outline" size={20} color="#9CA3AF" />
								<Text className="ml-1 text-gray-400">{post.likes}</Text>
							</TouchableOpacity>
							
							<TouchableOpacity>
								<Icon name="link-variant" size={20} color="#9CA3AF" />
							</TouchableOpacity>
						</View>
					</View>
				</View>
				
				{post.id !== posts[posts.length - 1].id && (
					<View className="h-px bg-gray-100 w-full my-4" />
				)}
			</View>
		));
	};

	return (
		<View className="flex-1 bg-white">
			<Stack.Screen options={{ headerShown: false }} />
			
			<Header 
				title="Profile"
				onInfoPress={() => {}}
				onBookPress={() => {}}
			/>

			{/* Profile Info */}
			<View className="items-center mb-6 mt-7">
				<View className="relative mb-2">
					<Image 
						source={avatarUrl ? { uri: avatarUrl } : require('@/assets/defaultImage/defaultProfileImage.png')}
						className="w-24 h-24 rounded-full"
					/>
					<View className="absolute bottom-0 right-0 bg-white rounded-full p-1 border border-purple-200">
						<Text className="text-lg font-bold" style={{ color: '#6A0DAD' }}>9</Text>
					</View>
				</View>
				<Text className="text-xl font-bold mb-4">{userData?.username || ''}</Text>
			</View>

			{/* Tabs */}
			<View className="flex-row justify-around border-b border-gray-100">
				{["Reports", "History", "Intention"].map((tab) => (
					<TouchableOpacity 
						key={tab}
						onPress={() => setActiveTab(tab)}
						className="pb-2 px-6"
					>
						{activeTab === tab && (
							<LinearGradient
								colors={['#FF00FF', '#FF69B4']}
								start={{ x: 0, y: 0 }}
								end={{ x: 1, y: 0 }}
								className="h-0.5 absolute bottom-0 left-0 right-0"
							/>
						)}
						<Text 
							className={`text-base ${activeTab === tab ? 'font-semibold' : ''}`}
							style={{ color: activeTab === tab ? '#FF00FF' : '#666' }}
						>
							{tab}
						</Text>
					</TouchableOpacity>
				))}
			</View>

			{/* Content */}
			<ScrollView className="flex-1 px-4">
				<View className="h-5"></View>
				{activeTab === "Reports" && renderPosts(reportsPosts)}
				{activeTab === "History" && renderPosts(historyPosts)}
				{activeTab === "Intention" && (
					<View className="py-4">
						<Text className="text-lg text-gray-800">{userData?.designation || ''}</Text>
					</View>
				)}
			</ScrollView>
		</View>
	);
}

import React, { useState } from "react";
import { View, Image, TouchableOpacity, ScrollView, ImageBackground } from "react-native";
import { Text } from "@/components/ui/text";
import { useSupabase } from "@/context/supabase-provider";
import Icon from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';

interface Post {
	id: string;
	number: string;
	content: string;
	date: string;
	likes: number;
	comments: number;
}

export default function Settings() {
	const { signOut, session } = useSupabase();
	const [activeTab, setActiveTab] = useState("Reports");

	// Пример данных для отображения
	const reportsPosts: Post[] = [
		{
			id: "1",
			number: "09",
			content: "кама-лока - это план желаний. Однако все желания исходят из чувственной природы человека, поэтому этот план еще называют чувственным планом. Он напрямую связан с неведением, отсутствием знания.",
			date: "today",
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
	
	const intentionPosts = [
		{
			id: "4",
			number: "21",
			content: "Ваши намерения и цели в духовном путешествии",
			date: "3 months ago",
			likes: 5,
			comments: 0
		}
	];

	// Функция для рендеринга постов
	const renderPosts = (posts: Post[]) => {
		return posts.map((post) => (
			<View key={post.id} className="mb-6 bg-transparent">
				<View className="flex-row mb-2">
					{/* Аватар и номер */}
					<View className="relative mr-3">
						<View className="w-12 h-12 rounded-full overflow-hidden border border-purple-200">
							<Image 
								source={require('@/assets/defaultImage/defaultProfileImage.png')} 
								style={{ width: '100%', height: '100%' }} 
							/>
						</View>
						<View className="absolute bottom-0 right-0 bg-white rounded-full px-1 border border-purple-200">
							<Text className="text-xs font-bold" style={{ color: '#6A0DAD' }}>{post.number}</Text>
						</View>
					</View>
					
					{/* Имя и дата */}
					<View className="flex-1">
						<View className="flex-row items-center">
							<Text className="font-semibold text-lg">PlayOm</Text>
						</View>
						<Text className="text-gray-400 text-xs">{post.date}</Text>
					</View>
				</View>
				
				{/* Содержание поста */}
				<Text className="text-gray-800 mb-2 ml-14">{post.content}</Text>
				
				{/* Кнопки действий */}
				<View className="flex-row justify-between mt-2 border-t border-gray-200 pt-2 ml-14">
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
				
				{/* Разделитель между постами */}
				{post.id !== posts[posts.length - 1].id && (
					<View className="h-px bg-gray-200 w-full my-4" />
				)}
			</View>
		));
	};

	return (
		<ImageBackground 
			source={require('@/assets/icons/BG.png')} 
			style={{ flex: 1 }}
			resizeMode="cover"
		>
			<View className="flex-1">
				{/* Заголовок */}
				<View className="p-4 border-b border-gray-200 flex-row justify-between items-center bg-white bg-opacity-90">
					<TouchableOpacity>
						<View className="w-10 h-10 bg-blue-100 rounded-md items-center justify-center">
							<Icon name="information" size={24} color="#4B5563" />
						</View>
					</TouchableOpacity>
					
					<Text className="text-xl font-semibold">Profile</Text>
					
					<TouchableOpacity>
						<View className="w-10 h-10 bg-blue-100 rounded-md items-center justify-center">
							<Icon name="arrow-right" size={24} color="#4B5563" />
						</View>
					</TouchableOpacity>
				</View>
				
				{/* Профиль пользователя */}
				<View className="items-center mt-6 relative">
					<View className="flex-row items-center">
						{/* Номер 9 слева от аватара */}
						<View className="mr-4">
							<Text className="text-6xl font-bold" style={{ color: '#6A0DAD' }}>9</Text>
						</View>
						
						{/* Аватар пользователя */}
						<View className="w-24 h-24 rounded-full overflow-hidden border-2 border-purple-200">
							<Image 
								source={require('@/assets/defaultImage/defaultProfileImage.png')} 
								style={{ width: '100%', height: '100%' }} 
								resizeMode="cover"
							/>
						</View>
					</View>
					
					{/* Название */}
					<View className="flex-row items-center mt-4">
						<Text className="text-3xl font-bold">PlayOm</Text>
					</View>
				</View>
				
				{/* Табы с градиентной подсветкой активного */}
				<View className="flex-row justify-around mt-6 border-b border-gray-200 bg-white bg-opacity-90">
					{["Reports", "History", "Intention"].map((tab) => (
						<TouchableOpacity 
							key={tab} 
							onPress={() => setActiveTab(tab)}
							className={`pb-2 px-4 ${activeTab === tab ? "" : ""}`}
						>
							{activeTab === tab ? (
								<LinearGradient
									colors={['#FF00FF', '#FF69B4']}
									start={{ x: 0, y: 0 }}
									end={{ x: 1, y: 0 }}
									className="h-0.5 absolute bottom-0 left-0 right-0"
								/>
							) : null}
							<Text 
								className={`text-lg ${activeTab === tab ? "font-semibold" : "text-gray-600"}`}
								style={{ color: activeTab === tab ? '#FF00FF' : '#4B5563' }}
							>
								{tab}
							</Text>
						</TouchableOpacity>
					))}
				</View>
				
				{/* Контент для активной вкладки */}
				{activeTab === "Reports" && (
					<ScrollView className="flex-1 p-4 bg-white bg-opacity-90">
						{renderPosts(reportsPosts)}
					</ScrollView>
				)}
				
				{activeTab === "History" && (
					<ScrollView className="flex-1 p-4 bg-white bg-opacity-90">
						{renderPosts(historyPosts)}
					</ScrollView>
				)}
				
				{activeTab === "Intention" && (
					<ScrollView className="flex-1 p-4 bg-white bg-opacity-90">
						{renderPosts(intentionPosts)}
					</ScrollView>
				)}
		</View>
		</ImageBackground>
	);
}

import React, { useState, useRef, useEffect } from "react";
import { 
	View, 
	ScrollView, 
	TextInput, 
	TouchableOpacity, 
	KeyboardAvoidingView, 
	Platform,
	ActivityIndicator
} from "react-native";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";

interface Message {
	id: string;
	content: string;
	isUser: boolean;
	timestamp: Date;
}

export default function AIChat() {
	const { session } = useSupabase();
	const [messages, setMessages] = useState<Message[]>([]);
	const [inputText, setInputText] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const scrollViewRef = useRef<ScrollView>(null);

	// Прокрутка к последнему сообщению при добавлении новых сообщений
	useEffect(() => {
		if (messages.length > 0) {
			scrollViewRef.current?.scrollToEnd({ animated: true });
		}
	}, [messages]);

	// Функция для отправки сообщения
	const sendMessage = async () => {
		if (!inputText.trim()) return;
		
		// Создаем ID для сообщения
		const userMessageId = Date.now().toString();
		
		// Добавляем сообщение пользователя
		const userMessage: Message = {
			id: userMessageId,
			content: inputText.trim(),
			isUser: true,
			timestamp: new Date()
		};
		
		setMessages(prev => [...prev, userMessage]);
		setInputText("");
		setIsLoading(true);
		
		// Здесь будет вызов вашего AI API
		try {
			// Имитация задержки ответа от сервера
			setTimeout(() => {
				const aiResponse: Message = {
					id: (Date.now() + 1).toString(),
					content: "Это пример ответа AI. Здесь будет интегрирован ваш реальный AI ответ с сервера.",
					isUser: false,
					timestamp: new Date()
				};
				
				setMessages(prev => [...prev, aiResponse]);
				setIsLoading(false);
			}, 1000);
			
			// Реальный вызов API будет выглядеть примерно так:
			/*
			const response = await fetch('ваш_api_endpoint', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${session?.access_token}`
				},
				body: JSON.stringify({ message: inputText.trim() })
			});
			
			const data = await response.json();
			
			const aiResponse: Message = {
				id: (Date.now() + 1).toString(),
				content: data.response,
				isUser: false,
				timestamp: new Date()
			};
			
			setMessages(prev => [...prev, aiResponse]);
			setIsLoading(false);
			*/
			
		} catch (error) {
			console.error('Ошибка при получении ответа от AI:', error);
			setIsLoading(false);
			
			// Добавляем сообщение об ошибке
			const errorMessage: Message = {
				id: (Date.now() + 1).toString(),
				content: "Извините, произошла ошибка при обработке вашего запроса.",
				isUser: false,
				timestamp: new Date()
			};
			
			setMessages(prev => [...prev, errorMessage]);
		}
	};

	return (
		<KeyboardAvoidingView 
			behavior={Platform.OS === "ios" ? "padding" : "height"}
			className="flex-1 bg-background"
		>
			<View className="flex-1 p-4">
				<H1 className="text-center mb-4">LEELA AI</H1>
				
				<ScrollView 
					ref={scrollViewRef}
					className="flex-1 mb-4"
					contentContainerStyle={{ paddingBottom: 10 }}
				>
					{messages.length === 0 ? (
						<View className="flex-1 items-center justify-center py-10">
							<Text className="text-muted-foreground text-center">
								Начните разговор с AI, отправив сообщение ниже.
							</Text>
						</View>
					) : (
						messages.map((msg) => (
							<View 
								key={msg.id} 
								className={`p-3 rounded-lg mb-2 max-w-[80%] ${
									msg.isUser 
										? "bg-primary self-end" 
										: "bg-secondary self-start"
								}`}
								style={{ alignSelf: msg.isUser ? 'flex-end' : 'flex-start' }}
							>
								<Text className={msg.isUser ? "text-primary-foreground" : "text-secondary-foreground"}>
									{msg.content}
								</Text>
								<Text className="text-xs opacity-70 mt-1">
									{msg.timestamp.toLocaleTimeString()}
								</Text>
							</View>
						))
					)}
					
					{isLoading && (
						<View className="p-3 rounded-lg mb-2 bg-secondary self-start">
							<ActivityIndicator size="small" color="#666" />
						</View>
					)}
				</ScrollView>
				
				<View className="flex-row items-center border border-input rounded-lg overflow-hidden max-h-[80px]">
					<TextInput
						className="flex-1 px-3 py-2 bg-background text-foreground min-h-[40px] max-h-[80px]"
						value={inputText}
						onChangeText={setInputText}
						placeholder="Введите сообщение..."
						placeholderTextColor="#666"
						multiline
						editable={!isLoading}
						style={{ textAlignVertical: 'center' }}
					/>
					<TouchableOpacity 
						onPress={sendMessage}
						disabled={isLoading || !inputText.trim()}
						className={`px-3 h-full justify-center ${
							isLoading || !inputText.trim() ? "bg-muted" : "bg-primary"
						}`}
					>
						<Text className={`font-medium ${
							isLoading || !inputText.trim() ? "text-muted-foreground" : "text-primary-foreground"
						}`}>
							Отправить
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		</KeyboardAvoidingView>
	);
}

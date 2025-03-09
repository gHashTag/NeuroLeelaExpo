import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Stack, useLocalSearchParams } from "expo-router";
import { useForm } from "react-hook-form";
import { ActivityIndicator, View } from "react-native";
import * as z from "zod";
import { useState } from "react";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";

const formSchema = z.object({
	email: z.string().email("Пожалуйста, введите корректный email адрес."),
	password: z.string().min(1, "Пожалуйста, введите пароль."),
});

export default function SignIn() {
	const { signInWithPassword } = useSupabase();
	const router = useRouter();
	const { verifyEmail } = useLocalSearchParams();
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		try {
			await signInWithPassword(data.email, data.password);
			form.reset();
		} catch (error: Error | any) {
			console.log(error.message);
			if (error.message === "Email not confirmed") {
				setError("Пожалуйста, подтвердите ваш email адрес. Проверьте почту и перейдите по ссылке для подтверждения.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<Stack.Screen options={{ headerShown: false }} />
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Вход</H1>
				{verifyEmail === "true" && (
					<View className="bg-yellow-500/20 p-4 rounded-lg">
						<Text className="text-yellow-500 font-medium">
							Пожалуйста, подтвердите ваш email адрес перед входом.
							Проверьте вашу почту и перейдите по ссылке для подтверждения.
						</Text>
					</View>
				)}
				{error && (
					<View className="bg-yellow-500/20 p-4 rounded-lg">
						<Text className="text-yellow-500 font-medium">
							{error}
						</Text>
					</View>
				)}
				<Form {...form}>
					<View className="gap-4">
						<FormField
							control={form.control}
							name="email"
							render={({ field }) => (
								<FormInput
									label="Email"
									placeholder="Email"
									autoCapitalize="none"
									autoComplete="email"
									autoCorrect={false}
									keyboardType="email-address"
									{...field}
								/>
							)}
						/>
						<FormField
							control={form.control}
							name="password"
							render={({ field }) => (
								<FormInput
									label="Пароль"
									placeholder="Пароль"
									autoCapitalize="none"
									autoCorrect={false}
									secureTextEntry
									{...field}
								/>
							)}
						/>
					</View>
				</Form>
			</View>
			<Button
				size="default"
				variant="default"
				onPress={form.handleSubmit(onSubmit)}
				disabled={isLoading}
				className="web:m-4"
			>
				{isLoading ? (
					<ActivityIndicator size="small" color="white" />
				) : (
					<Text>Войти</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter, Stack } from "expo-router";
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
import { IS_DEVELOPMENT, DEV_CREDENTIALS } from "@/constants/env";

const formSchema = z
	.object({
		email: z.string().email("Пожалуйста, введите корректный email адрес."),
		password: z
			.string()
			.min(8, "Пожалуйста, введите минимум 8 символов.")
			.max(64, "Пожалуйста, введите меньше 64 символов.")
			.regex(
				/^(?=.*[a-z])/,
				"Пароль должен содержать хотя бы одну строчную букву.",
			)
			.regex(
				/^(?=.*[A-Z])/,
				"Пароль должен содержать хотя бы одну заглавную букву.",
			)
			.regex(/^(?=.*[0-9])/, "Пароль должен содержать хотя бы одну цифру.")
			.regex(
				/^(?=.*[!@#$%^&*])/,
				"Пароль должен содержать хотя бы один специальный символ.",
			),
		confirmPassword: z.string().min(8, "Пожалуйста, введите минимум 8 символов."),
	})
	.refine((data) => data.password === data.confirmPassword, {
		message: "Пароли не совпадают.",
		path: ["confirmPassword"],
	});

export default function SignUp() {
	const { signUp } = useSupabase();
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const form = useForm<z.infer<typeof formSchema>>({
		resolver: zodResolver(formSchema),
		defaultValues: IS_DEVELOPMENT 
      ? {
          email: DEV_CREDENTIALS.email,
          password: DEV_CREDENTIALS.password,
          confirmPassword: DEV_CREDENTIALS.password,
        }
      : {
          email: "",
          password: "",
          confirmPassword: "",
        },
	});

	async function onSubmit(data: z.infer<typeof formSchema>) {
		setIsLoading(true);
		setError(null);
		try {
			await signUp(data.email, data.password);
			form.reset();
			setSuccess(true);
			setTimeout(() => {
				router.replace("/(app)/sign-in?verifyEmail=true");
			}, 3000);
		} catch (error: Error | any) {
			console.log(error.message);
			if (error.message.includes("User already registered")) {
				setError("Пользователь с таким email уже зарегистрирован.");
			} else {
				setError("Произошла ошибка при регистрации. Пожалуйста, попробуйте позже.");
			}
		} finally {
			setIsLoading(false);
		}
	}

	return (
		<SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
			<Stack.Screen options={{ headerShown: false }} />
			<View className="flex-1 gap-4 web:m-4">
				<H1 className="self-start">Регистрация</H1>
				{success && (
					<View className="bg-green-500/20 p-4 rounded-lg">
						<Text className="text-green-500 font-medium">
							Регистрация успешна! Мы отправили письмо с подтверждением на ваш email.
							Пожалуйста, проверьте почту и перейдите по ссылке для подтверждения аккаунта.
						</Text>
					</View>
				)}
				{error && (
					<View className="bg-red-500/20 p-4 rounded-lg">
						<Text className="text-red-500 font-medium">
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
						<FormField
							control={form.control}
							name="confirmPassword"
							render={({ field }) => (
								<FormInput
									label="Подтверждение пароля"
									placeholder="Подтвердите пароль"
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
					<Text>Зарегистрироваться</Text>
				)}
			</Button>
		</SafeAreaView>
	);
}

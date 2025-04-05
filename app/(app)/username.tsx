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

const formSchema = z.object({
  username: z
    .string()
    .min(3, "Username должен быть не менее 3 символов.")
    .max(20, "Username должен быть не более 20 символов.")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username может содержать только буквы, цифры и нижнее подчеркивание."
    ),
});

export default function Username() {
  const router = useRouter();
  const { updateUserData } = useSupabase();
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setError(null);
    try {
      await updateUserData({ username: data.username });
      router.replace("/(app)/avatar");
    } catch (error: Error | any) {
      console.log(error.message);
      if (error.message === "Этот username уже занят") {
        setError("Этот username уже занят. Пожалуйста, выберите другой.");
      }
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-4 web:m-4">
        <H1 className="self-start">Выберите Username</H1>
        <Muted className="mb-4">
          Выберите username для вашего аккаунта. Вы сможете изменить его позже.
        </Muted>

        {error && (
          <View className="bg-yellow-500/20 p-4 rounded-lg">
            <Text className="text-yellow-500 font-medium">{error}</Text>
          </View>
        )}

        <Form {...form}>
          <View className="gap-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormInput
                  label="Username"
                  placeholder="Введите username"
                  autoCapitalize="none"
                  autoCorrect={false}
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
        disabled={form.formState.isSubmitting}
        className="web:m-4"
      >
        {form.formState.isSubmitting ? (
          <ActivityIndicator size="small" color="white" />
        ) : (
          <Text>Продолжить</Text>
        )}
      </Button>
    </SafeAreaView>
  );
}

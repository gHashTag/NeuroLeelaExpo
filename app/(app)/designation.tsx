import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { View, ActivityIndicator, useWindowDimensions } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";
import { Card } from "@/components/ui/card";

const formSchema = z.object({
  designation: z
    .string()
    .min(2, "Ваше намерение должно содержать не менее 2 символов.")
    .max(50, "Ваше намерение должно содержать не более 50 символов."),
});

export default function Designation() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const { session, updateUserData } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designation: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    try {
      await updateUserData({
        designation: data.designation,
      });
      router.replace("/(app)/(protected)/gamescreen");
    } catch (error) {
      console.error(error);
      setError("❌ Не удалось сохранить ваше намерение. Пожалуйста, попробуйте позже.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center px-4 py-6" style={{ minHeight: height }}>
        <Card className="w-full max-w-md mx-auto p-6 rounded-2xl">
          <View className="gap-4 mb-6">
            <H1 className="text-center text-2xl font-light tracking-wide text-foreground mb-2">Ваше Намерение в Игре Лила</H1>
            <Muted className="text-center mb-6">
              Игра Лила — это древний путь самопознания, ведущий к Космическому Сознанию. Сформулируйте ваше духовное 
              намерение, с которым вы вступаете в эту священную игру. Помните, что ваши желания и намерения становятся семенами кармы, 
              определяющими ваш путь через 72 плана бытия.
            </Muted>

            <Form {...form}>
              <View className="gap-4">
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormInput
                      label="Ваше духовное намерение"
                      autoCapitalize="sentences"
                      autoCorrect={false}
                      className="min-h-[100px]"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholder="Например: «Обрести внутреннюю гармонию» или «Познать истинную природу своего Я»"
                      {...field}
                    />
                  )}
                />
              </View>
            </Form>
            
            {error && (
              <Text className="text-red-500 text-center mt-2">{error}</Text>
            )}
          </View>

          <View className="flex-row gap-4 mt-4">
            <Button
              size={isMobile ? "default" : "lg"}
              variant="secondary"
              onPress={() => router.replace("/(app)/(protected)/gamescreen")}
              className="flex-1 bg-secondary text-secondary-foreground hover:bg-accent transition-all duration-300 rounded-xl border border-border"
            >
              <Text className="font-light tracking-wide text-secondary-foreground text-center">
                Начать без намерения
              </Text>
            </Button>
            <Button
              size={isMobile ? "default" : "lg"}
              variant="default"
              onPress={form.handleSubmit(onSubmit)}
              disabled={isLoading}
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 rounded-xl border border-border"
            >
              {isLoading ? 
                <ActivityIndicator size="small" color="white" /> : 
                <Text className="font-light tracking-wide text-primary-foreground text-center">
                  Начать путешествие
                </Text>
              }
            </Button>
          </View>
        </Card>
      </View>
    </SafeAreaView>
  );
}

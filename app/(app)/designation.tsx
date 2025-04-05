import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { View, ActivityIndicator } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormInput } from "@/components/ui/form";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";

const formSchema = z.object({
  designation: z
    .string()
    .min(2, "Designation must be at least 2 characters.")
    .max(50, "Designation must be less than 50 characters."),
});

export default function Designation() {
  const router = useRouter();
  const { session, updateUserData } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designation: "",
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await updateUserData({
        designation: data.designation,
      });
      router.replace("/(app)/(protected)/gamescreen");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-4 web:m-4">
        <H1 className="self-start">Ваши намерения</H1>
        <Muted className="mb-4">
          Расскажите, что привело вас к нам? Это поможет нам лучше понять ваши цели и сделать ваш
          опыт более персонализированным.
        </Muted>

        <Form {...form}>
          <View className="gap-4">
            <FormField
              control={form.control}
              name="designation"
              render={({ field }) => (
                <FormInput
                  label="Ваши цели"
                  autoCapitalize="sentences"
                  autoCorrect={false}
                  {...field}
                />
              )}
            />
          </View>
        </Form>
      </View>

      <View className="flex-row gap-4 web:m-4">
        <Button
          size="default"
          variant="outline"
          onPress={() => router.replace("/(app)/(protected)/gamescreen")}
          className="flex-1"
        >
          <Text>Пропустить</Text>
        </Button>
        <Button
          size="default"
          variant="default"
          onPress={form.handleSubmit(onSubmit)}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? <ActivityIndicator size="small" /> : <Text>Продолжить</Text>}
        </Button>
      </View>
    </SafeAreaView>
  );
}

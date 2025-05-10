import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { View, ActivityIndicator, useWindowDimensions, Alert, Pressable } from "react-native";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { MaterialIcons } from "@expo/vector-icons";

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
});

export default function Designation() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const { session, updateUserData } = useSupabase();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      designation: "",
    },
  });

  // Функция для очистки поля ввода
  const clearInput = () => {
    form.setValue("designation", "");
    setError(null);
  };
  
  // Функция для предотвращения слишком длинной вставки случайного текста
  const handlePaste = (text: string) => {
    const maxDisplayLength = 500; // Для предупреждения при визуальном отображении очень длинного текста
    
    if (text.length > maxDisplayLength) {
      // Просто предупреждаем о длинном тексте, но не ограничиваем
      console.log(`Вставлен длинный текст (${text.length} символов)`);
    }
    
    return text; // Возвращаем текст без изменений
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    console.log("Отправка формы с данными:", data);
    console.log("Значение намерения:", data.designation, "Длина:", data.designation.length);
    
    setIsLoading(true);
    setError(null);
    setIsSubmitting(true);
    
    if (!data.designation || data.designation.trim().length < 2) {
      setError("Ваше намерение слишком короткое. Должно быть не менее 2 символов.");
      setIsLoading(false);
      setIsSubmitting(false);
      return;
    }
    
    try {
      console.log("Сохраняем намерение в Supabase:", data.designation);
      
      await updateUserData({
        designation: data.designation.trim(),
      });
      
      console.log("Намерение успешно сохранено, переходим на игровой экран");
      router.replace("/(app)/(protected)/gamescreen");
    } catch (error) {
      console.error("Ошибка при сохранении намерения:", error);
      setError(`❌ Не удалось сохранить ваше намерение: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`);
      setIsSubmitting(false);
    } finally {
      setIsLoading(false);
    }
  }

  const handleDebugPress = () => {
    const currentValue = form.getValues().designation;
    Alert.alert(
      "Отладочная информация",
      `Текущее значение: "${currentValue}"\nДлина: ${currentValue.length}\nОшибки формы: ${JSON.stringify(form.formState.errors)}`
    );
  };

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
              <View className="gap-4 relative">
                <FormField
                  control={form.control}
                  name="designation"
                  render={({ field }) => (
                    <FormInput
                      label="Ваше духовное намерение"
                      autoCapitalize="sentences"
                      autoCorrect={false}
                      className="min-h-[100px] pr-10"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      placeholder="Например: «Обрести внутреннюю гармонию» или «Познать истинную природу своего Я»"
                      name={field.name}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={field.onChange}
                      onChangeText={(text) => {
                        field.onChange(text);
                      }}
                      onPaste={(e) => {
                        const pastedText = e.nativeEvent.data;
                        if (pastedText) {
                          const processedText = handlePaste(pastedText);
                          field.onChange(processedText);
                        }
                      }}
                    />
                  )}
                />
                {form.watch("designation") && (
                  <Pressable 
                    onPress={clearInput}
                    className="absolute right-3 top-11 z-10"
                  >
                    <MaterialIcons name="cancel" size={22} color="#757575" />
                  </Pressable>
                )}
              </View>
            </Form>
            
            {error && (
              <Text className="text-red-500 text-center mt-2">{error}</Text>
            )}
            
            {/* Отладочная кнопка - только для разработки */}
            {__DEV__ && (
              <Button variant="outline" onPress={handleDebugPress} className="mt-2">
                <Text>Проверить данные формы</Text>
              </Button>
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
              disabled={isLoading || isSubmitting}
              className="flex-1 bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 rounded-xl border border-border"
            >
              {isLoading || isSubmitting ? 
                <View className="flex-row items-center">
                  <ActivityIndicator size="small" color="white" style={{ marginRight: 8 }}/>
                  <Text className="font-light tracking-wide text-primary-foreground text-center">Сохраняем...</Text>
                </View> : 
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

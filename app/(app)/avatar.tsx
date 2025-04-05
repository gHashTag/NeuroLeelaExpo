import { useRouter, Stack } from "expo-router";
import React, { useState } from "react";
import { View, Image, TouchableOpacity, ActivityIndicator } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";

export default function Avatar() {
  const router = useRouter();
  const { session, uploadAvatar } = useSupabase();
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      // Оптимизируем изображение перед загрузкой
      const optimizedImage = await ImageManipulator.manipulateAsync(
        result.assets[0].uri,
        [{ resize: { width: 400, height: 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      setImage(optimizedImage.uri);
    }
  };

  const handleContinue = async () => {
    setIsLoading(true);
    try {
      if (image) {
        await uploadAvatar(image);
      }
      router.replace("/(app)/designation");
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background p-4" edges={["bottom"]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 gap-4 web:m-4">
        <H1 className="self-start">Выберите аватар</H1>
        <Muted className="mb-4">
          Добавьте фотографию профиля, чтобы другие пользователи могли узнать вас. Вы можете
          пропустить этот шаг и добавить фото позже.
        </Muted>

        <View className="items-center justify-center py-8">
          <TouchableOpacity
            onPress={pickImage}
            className="w-32 h-32 rounded-full bg-gray-100 items-center justify-center overflow-hidden"
          >
            {image ? (
              <Image source={{ uri: image }} className="w-full h-full" resizeMode="cover" />
            ) : (
              <Text className="text-gray-400">Нажмите, чтобы выбрать</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View className="flex-row gap-4 web:m-4">
        <Button
          size="default"
          variant="outline"
          onPress={() => router.replace("/(app)/designation")}
          className="flex-1"
        >
          <Text>Пропустить</Text>
        </Button>
        <Button
          size="default"
          variant="default"
          onPress={handleContinue}
          disabled={!image || isLoading}
          className="flex-1"
        >
          {isLoading ? <ActivityIndicator size="small" /> : <Text>Продолжить</Text>}
        </Button>
      </View>
    </SafeAreaView>
  );
}

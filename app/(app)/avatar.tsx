import { useRouter, Stack } from "expo-router";
import React, { useState, useRef, useEffect } from "react";
import { View, Image, TouchableOpacity, Platform, useWindowDimensions, Animated } from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { useSupabase } from "@/context/supabase-provider";

export default function Avatar() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { session, uploadAvatar } = useSupabase();
  const [image, setImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const avatarScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 12,
        friction: 8,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const animateButton = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const animateAvatar = () => {
    Animated.sequence([
      Animated.timing(avatarScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(avatarScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const pickImage = async () => {
    try {
      animateAvatar();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
        allowsMultipleSelection: false,
        base64: false,
      });

      if (!result.canceled) {
        console.log('🖼️ Изображение выбрано:', result.assets[0]);
        
        // Определяем размер для финальной оптимизации
        const finalSize = Platform.OS === 'web' ? 800 : 400;

        // Сначала обрезаем до квадрата
        const cropResult = await ImageManipulator.manipulateAsync(
          result.assets[0].uri,
          [
            { 
              crop: {
                originX: 0,
                originY: 0,
                width: result.assets[0].width,
                height: result.assets[0].width,
              }
            }
          ],
          { 
            compress: 1,
            format: ImageManipulator.SaveFormat.JPEG
          }
        );

        console.log('✂️ Изображение обрезано до квадрата');

        // Затем оптимизируем размер
        const optimizedImage = await ImageManipulator.manipulateAsync(
          cropResult.uri,
          [
            { resize: { 
              width: finalSize,
              height: finalSize 
            }}
          ],
          { 
            compress: 0.9,
            format: ImageManipulator.SaveFormat.JPEG,
            base64: false
          }
        );

        console.log('✨ Изображение оптимизировано:', {
          width: finalSize,
          height: finalSize,
          uri: optimizedImage.uri
        });

        setImage(optimizedImage.uri);
        setError(null);
      }
    } catch (err: any) {
      console.error('❌ Ошибка при выборе изображения:', err);
      setError('❌ Не удалось загрузить изображение. Пожалуйста, попробуйте другое фото.');
    }
  };

  const handleContinue = async () => {
    setLoading(true);
    animateButton();
    try {
      if (image) {
        await uploadAvatar(image);
      }
      router.replace("/(app)/designation");
    } catch (err: any) {
      console.error('❌ Ошибка при загрузке аватара:', err);
      setError('❌ Не удалось сохранить аватар. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = (children: React.ReactNode) => {
    const containerClass = `
      w-full max-w-md 
      ${Platform.OS === 'web' ? 'web:max-w-xl' : ''} 
      bg-white/20 
      backdrop-blur-md 
      ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} 
      p-6 
      web:p-12 
      shadow-2xl 
      border 
      border-white/30
      relative
      overflow-hidden
    `.trim();

    const decorativeElements = Platform.OS === 'web' && (
      <>
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-blue-50/30 rounded-full blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-purple-50/30 rounded-full blur-3xl" />
      </>
    );

    if (Platform.OS === 'web') {
      return (
        <BlurView
          intensity={10}
          tint="light"
          className={containerClass}
        >
          {decorativeElements}
          {children}
        </BlurView>
      );
    }

    return (
      <View className={containerClass}>
        {children}
      </View>
    );
  };

  const renderAvatarContent = () => {
    if (image) {
      return (
        <Image 
          source={{ uri: image }} 
          className="w-full h-full" 
          resizeMode="cover" 
        />
      );
    }

    return (
      <View className="flex items-center justify-center w-full h-full bg-white/30">
        <Ionicons 
          name="camera-outline" 
          size={32} 
          color="#666"
          style={{ marginBottom: 8 }}
        />
        <View className="px-4">
          <Text className="text-neutral-600 font-medium text-center">
            Выбрать фото
          </Text>
        </View>
      </View>
    );
  };

  return (
    <LinearGradient
      colors={["#f8f9fa", "#f1f3f5", "#e9ecef"]}
      className="flex-1 items-center justify-center"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView className="flex-1 w-full items-center justify-center">
        <Animated.View 
          className="flex flex-1 w-full items-center justify-center px-4 web:px-0"
          style={{
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }}
        >
          {renderContent(
            <View className="flex items-center space-y-8 relative z-10 w-full">
              <View className="space-y-2 w-full">
                <H1 className={`
                  text-center 
                  ${isMobile ? 'text-2xl' : 'text-3xl'} 
                  font-light 
                  tracking-wide 
                  text-neutral-800
                  mb-4
                `}>
                  Выберите аватар
                </H1>

                <Text className={`
                  text-center
                  ${isMobile ? 'text-sm' : 'text-base'}
                  text-neutral-600
                  mb-8
                `}>
                  Добавьте фотографию профиля, чтобы другие пользователи могли узнать вас. Вы можете
                  пропустить этот шаг и добавить фото позже.
                </Text>

                {error && (
                  <View className="bg-red-500/10 p-4 rounded-xl mb-4">
                    <Text className="text-red-500 text-center">{error}</Text>
                  </View>
                )}

                <View className="items-center justify-center py-8">
                  <Animated.View style={{ transform: [{ scale: avatarScale }] }}>
                    <TouchableOpacity
                      onPress={pickImage}
                      className={`
                        w-32 h-32 
                        rounded-full 
                        bg-white/40
                        border-2
                        border-white/50
                        items-center 
                        justify-center 
                        overflow-hidden
                        shadow-lg
                      `}
                    >
                      {renderAvatarContent()}
                    </TouchableOpacity>
                  </Animated.View>
                </View>
              </View>

              <View className="w-full space-y-4">
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Button
                    size={isMobile ? "default" : "lg"}
                    variant="default"
                    onPress={handleContinue}
                    disabled={loading || !image}
                    className={`
                      w-full
                      min-w-[280px]
                      ${loading ? 'opacity-70' : ''}
                      bg-neutral-900/90 
                      hover:bg-neutral-800 
                      transform 
                      hover:translate-y-[-2px] 
                      transition-all 
                      duration-300 
                      shadow-lg 
                      ${isMobile ? 'rounded-xl' : 'rounded-2xl'} 
                      border 
                      border-white/10
                      backdrop-blur-sm
                      relative
                      overflow-hidden
                    `}
                  >
                    <View className="w-full flex items-center justify-center">
                      <Text className={`
                        ${isMobile ? 'text-sm' : 'text-base'} 
                        font-light 
                        tracking-widest 
                        text-neutral-100
                        text-center
                        min-w-[200px]
                      `}>
                        {loading ? 'СОХРАНЕНИЕ...' : 'ПРОДОЛЖИТЬ'}
                      </Text>
                    </View>
                  </Button>
                </Animated.View>

                <Button
                  size={isMobile ? "default" : "lg"}
                  variant="secondary"
                  onPress={() => router.replace("/(app)/designation")}
                  className={`
                    w-full
                    min-w-[280px]
                    bg-white/40 
                    hover:bg-white/60 
                    transform 
                    hover:translate-y-[-2px] 
                    transition-all 
                    duration-300 
                    ${isMobile ? 'rounded-xl' : 'rounded-2xl'} 
                    border 
                    border-white/50
                    backdrop-blur-sm
                    relative
                    overflow-hidden
                  `}
                >
                  <View className="w-full flex items-center justify-center">
                    <Text className={`
                      ${isMobile ? 'text-sm' : 'text-base'} 
                      font-light 
                      tracking-widest 
                      text-neutral-700
                      text-center
                      min-w-[200px]
                    `}>
                      ПРОПУСТИТЬ
                    </Text>
                  </View>
                </Button>
              </View>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </LinearGradient>
  );
}

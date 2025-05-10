import React, { useEffect, useState, useRef } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions } from 'react-native';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { useSupabase } from '../../context/supabase-provider';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Animated } from 'react-native';

export default function Avatar() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  
  const { uploadAvatar, userData, updateUserData, getAvatarUrl } = useSupabase();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);

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

  const pickImage = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🎯 Запускаем выбор изображения...');
      
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled) {
        console.log('❌ Выбор изображения отменен');
        return;
      }

      const imageUri = result.assets[0].uri;
      console.log('✅ Изображение выбрано:', imageUri);

      console.log('🔄 Обрабатываем изображение...');
      const processedImage = await ImageManipulator.manipulateAsync(
        imageUri,
        [{ resize: { width: Platform.OS === 'web' ? 800 : 400 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      console.log('✅ Изображение обработано:', processedImage.uri);

      const ipfsHash = await uploadAvatar(processedImage.uri);
      if (!ipfsHash) {
        throw new Error('Не удалось загрузить изображение. Пожалуйста, проверьте подключение и попробуйте снова.');
      }
      console.log('✅ Изображение загружено в IPFS:', ipfsHash);

      const avatarUrl = getAvatarUrl(ipfsHash);
      if (!avatarUrl) {
        throw new Error('Не удалось сформировать URL аватара');
      }

      await updateUserData({
        pinata_avatar_id: ipfsHash,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      });

      console.log('✅ Профиль успешно обновлен');
      setAvatarUri(avatarUrl);
      animateButton();
    } catch (error: any) {
      console.error('❌ Ошибка при обновлении аватара:', error);
      if (error.message.includes('401')) {
        setError('Ошибка авторизации при загрузке изображения. Пожалуйста, попробуйте позже.');
      } else {
        setError(error.message || 'Произошла ошибка при обновлении аватара');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleContinue = () => {
    if (avatarUri) {
      router.push('/(app)/designation');
    }
  };

  const renderContent = (children: React.ReactNode) => {
    const containerClass = `
      w-full max-w-md 
      ${Platform.OS === 'web' ? 'web:max-w-xl' : ''} 
      bg-white/10
      backdrop-blur-xl
      ${isMobile ? 'rounded-3xl' : 'rounded-[2.5rem]'}
      p-8
      web:p-12
      shadow-2xl
      border
      border-white/20
      relative
      overflow-hidden
    `.trim();

    const decorativeElements = Platform.OS === 'web' && (
      <>
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-200/20 rounded-full blur-3xl animate-pulse" />
      </>
    );

    if (Platform.OS === 'web') {
      return (
        <BlurView
          intensity={20}
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

  return (
    <LinearGradient
      colors={["#f1f5f9", "#e2e8f0", "#cbd5e1"]}
      className="flex-1 items-center justify-center"
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <SafeAreaView className="flex flex-1 w-full items-center justify-center">
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
                  ${isMobile ? 'text-3xl' : 'text-4xl'} 
                  font-extralight
                  tracking-wider
                  text-neutral-800
                  mb-6
                `}>
                  Добавьте фото профиля
                </H1>

                <Muted className={`
                  text-center 
                  ${isMobile ? 'text-base' : 'text-lg'} 
                  text-neutral-600 
                  leading-relaxed 
                  max-w-sm 
                  mx-auto 
                  font-light 
                  tracking-wide
                  mb-8
                `}>
                  Загрузите фотографию, которая будет отображаться в вашем профиле
                </Muted>

                <View className="items-center space-y-8">
                  <TouchableOpacity 
                    onPress={pickImage}
                    disabled={loading}
                    className={`
                      relative rounded-full 
                      overflow-hidden 
                      bg-gradient-to-br from-white/60 to-white/40
                      border-4 border-white/60 
                      shadow-2xl
                      transform transition-transform duration-300
                      hover:scale-105
                      active:scale-95
                    `}
                    style={{ width: isMobile ? 180 : 220, height: isMobile ? 180 : 220 }}
                  >
                    {avatarUri ? (
                      <Image
                        source={{ uri: avatarUri }}
                        style={{ width: '100%', height: '100%' }}
                        className="rounded-full"
                        contentFit="cover"
                        transition={300}
                      />
                    ) : (
                      <View className="w-full h-full items-center justify-center">
                        <MaterialIcons 
                          name="add-a-photo" 
                          size={isMobile ? 56 : 72} 
                          color="rgba(0,0,0,0.3)" 
                        />
                        <Text className="mt-3 text-base text-neutral-500 font-light tracking-wide">
                          Нажмите для выбора
                        </Text>
                      </View>
                    )}
                    
                    {loading && (
                      <View className="absolute inset-0 bg-black/40 backdrop-blur-sm items-center justify-center">
                        <ActivityIndicator size="large" color="#fff" />
                      </View>
                    )}
                  </TouchableOpacity>

                  {error && (
                    <View className="w-full p-6 bg-red-50/80 backdrop-blur-sm rounded-2xl border border-red-200/50">
                      <Text className="text-center text-red-600 font-light tracking-wide">
                        {error}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              <View className="w-full space-y-4">
                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Button
                    size={isMobile ? "default" : "lg"}
                    variant="default"
                    className={`
                      w-full
                      min-w-[280px]
                      ${loading ? 'opacity-70' : ''}
                      bg-gradient-to-br from-neutral-900 to-neutral-800
                      hover:from-neutral-800 hover:to-neutral-700
                      transform 
                      hover:translate-y-[-2px] 
                      transition-all 
                      duration-300 
                      shadow-xl
                      ${isMobile ? 'rounded-2xl' : 'rounded-2xl'} 
                      border 
                      border-white/10
                      backdrop-blur-sm
                      relative
                      overflow-hidden
                      py-6
                    `}
                    onPress={handleContinue}
                    disabled={!avatarUri || loading}
                  >
                    <View className="w-full flex items-center justify-center">
                      <Text className={`
                        ${isMobile ? 'text-base' : 'text-lg'} 
                        font-light 
                        tracking-[0.2em]
                        text-neutral-100
                        text-center
                        min-w-[200px]
                      `}>
                        {loading ? 'ЗАГРУЗКА...' : 'ПРОДОЛЖИТЬ'}
                      </Text>
                    </View>
                  </Button>
                </Animated.View>

                <Button
                  size={isMobile ? "default" : "lg"}
                  variant="secondary"
                  className={`
                    w-full
                    min-w-[280px]
                    bg-gradient-to-br from-white/50 to-white/30
                    hover:from-white/60 hover:to-white/40
                    transform 
                    hover:translate-y-[-2px] 
                    transition-all 
                    duration-300 
                    ${isMobile ? 'rounded-2xl' : 'rounded-2xl'} 
                    border 
                    border-white/40
                    backdrop-blur-sm
                    relative
                    overflow-hidden
                    shadow-lg
                    py-6
                  `}
                  onPress={() => router.push('/(app)/designation')}
                >
                  <View className="w-full flex items-center justify-center">
                    <Text className={`
                      ${isMobile ? 'text-base' : 'text-lg'} 
                      font-light 
                      tracking-[0.2em]
                      text-neutral-600
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

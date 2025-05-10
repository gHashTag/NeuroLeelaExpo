import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { View, Animated, Platform, useWindowDimensions, ImageBackground } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { TextInput } from "@components/ui/text-input";
import { supabase } from "@/lib/supabase";

// 🛠️ DEV MODE constants
const DEV_MODE = process.env.NODE_ENV === 'development';
const DEV_EMAIL = 'raoffonom@icloud.com';
const DEV_PASSWORD = '1234567890';

export default function SignInScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [email, setEmail] = useState(DEV_MODE ? DEV_EMAIL : "");
  const [password, setPassword] = useState(DEV_MODE ? DEV_PASSWORD : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (DEV_MODE) {
      console.log('🛠️ Dev mode: форма автоматически заполнена тестовыми данными', {
        email: DEV_EMAIL,
        password: DEV_PASSWORD
      });
    }

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

  const validateForm = () => {
    if (!email) {
      setError('❌ Пожалуйста, введите email');
      return false;
    }
    if (!email.includes('@')) {
      setError('❌ Пожалуйста, введите корректный email');
      return false;
    }
    if (!password) {
      setError('❌ Пожалуйста, введите пароль');
      return false;
    }
    return true;
  };

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

  const handleSignIn = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      animateButton();
      
      console.log('🚀 Начинаем процесс входа...', { email });

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        console.error('❌ Ошибка при входе:', signInError.message);
        throw signInError;
      }

      if (data?.user) {
        console.log('✅ Успешный вход:', {
          id: data.user.id,
          email: data.user.email
        });
        
        // Проверяем данные пользователя
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('username, pinata_avatar_id, designation')
          .eq('user_id', data.user.id)
          .single();
        
        if (userError) {
          console.error('❌ Ошибка при получении данных пользователя:', userError);
          throw userError;
        }

        // Перенаправляем в зависимости от заполненности профиля
        if (!userData?.username) {
          router.replace('/(app)/username');
        } else if (!userData?.pinata_avatar_id) {
          router.replace('/(app)/avatar');
        } else if (!userData?.designation) {
          router.replace('/(app)/designation');
        } else {
          router.replace('/(app)/(protected)/gamescreen');
        }
      } else {
        throw new Error('Не удалось войти в систему');
      }
      
    } catch (err: any) {
      console.error('❌ Ошибка:', err.message);
      
      if (err.message.includes('Invalid login credentials')) {
        setError('❌ Неверный email или пароль');
      } else if (err.message.includes('Email not confirmed')) {
        setError('❌ Email не подтвержден. Пожалуйста, проверьте почту и подтвердите регистрацию.');
      } else {
        setError(`❌ Произошла ошибка при входе.\n\n⚠️ Пожалуйста, попробуйте позже или обратитесь в поддержку.\n\n🔍 Ошибка: ${err.message}`);
      }
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

  const inputClassName = `
    w-full
    bg-white/40
    border
    border-white/50
    rounded-xl
    px-4
    py-3
    text-neutral-800
    placeholder:text-neutral-500
    focus:border-blue-300
    focus:bg-white/60
    transition-all
    duration-300
  `.trim();

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
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
              <View className="flex items-center mb-2">
                <Image
                  source={require("@/assets/icons/512.png")}
                  style={{ width: 72, height: 72, marginBottom: 8 }}
                  resizeMode="contain"
                />
              </View>
              <View className="space-y-2 w-full">
                <H1 className={`
                  text-center 
                  ${isMobile ? 'text-2xl' : 'text-3xl'} 
                  font-light 
                  tracking-wide 
                  text-neutral-800
                  mb-8
                `}>
                  Вход
                </H1>
                <View className="space-y-6 w-full">
                  <TextInput
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className={inputClassName}
                  />
                  <TextInput
                    placeholder="Пароль"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                    className={inputClassName}
                  />
                </View>
              </View>

              <View className="w-full space-y-4 mt-4">
                {error && (
                  <Text className="text-red-500 text-center mb-4">
                    {error}
                  </Text>
                )}
                
                {successMessage && (
                  <Text className="text-green-600 text-center mb-4">
                    {successMessage}
                  </Text>
                )}

                <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                  <Button
                    size={isMobile ? "default" : "lg"}
                    variant="default"
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
                    onPress={handleSignIn}
                    disabled={loading}
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
                        {loading ? 'ВХОД...' : 'ВОЙТИ'}
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
                  onPress={() => router.push("/sign-up")}
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
                      РЕГИСТРАЦИЯ
                    </Text>
                  </View>
                </Button>
              </View>
            </View>
          )}
        </Animated.View>
      </SafeAreaView>
    </ImageBackground>
  );
}

import { useRouter } from "expo-router";
import React, { useEffect, useState, useRef } from "react";
import { View, Animated, Platform, useWindowDimensions, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { TextInput } from "@components/ui/text-input";
import { supabase } from "@/lib/supabase";

// 🛠️ DEV MODE constants
const DEV_MODE = process.env.NODE_ENV === 'development';
const DEV_EMAIL = 'raoffonom@icloud.com';
const DEV_PASSWORD = '1234567890';

export default function SignUpScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const scaleAnim = React.useRef(new Animated.Value(0.95)).current;
  const buttonWidth = useRef(0);
  const buttonScale = useRef(new Animated.Value(1)).current;

  const [email, setEmail] = useState(DEV_MODE ? DEV_EMAIL : "");
  const [password, setPassword] = useState(DEV_MODE ? DEV_PASSWORD : "");
  const [confirmPassword, setConfirmPassword] = useState(DEV_MODE ? DEV_PASSWORD : "");
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
    if (password.length < 6) {
      setError('❌ Пароль должен содержать минимум 6 символов');
      return false;
    }
    if (password !== confirmPassword) {
      setError('❌ Пароли не совпадают');
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

  const handleSignUp = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      
      if (!validateForm()) {
        return;
      }

      setLoading(true);
      animateButton();
      
      console.log('🚀 Начинаем процесс регистрации...', { email });

      // Пробуем зарегистрировать пользователя
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: Platform.select({
            web: `${window.location.origin}/auth/callback`,
            default: 'neuroleela://auth/callback',
          }),
          data: {
            username: email.split('@')[0],
          }
        },
  });

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          console.log('👤 Пользователь уже существует, отправляем письмо повторно');
          
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email: email,
            options: {
              emailRedirectTo: Platform.select({
                web: `${window.location.origin}/auth/callback`,
                default: 'neuroleela://auth/callback',
              })
            }
          });

          if (resendError) {
            if (resendError.message.includes('Email already confirmed')) {
              throw new Error('USER_ALREADY_CONFIRMED');
            }
            console.error('❌ Ошибка при повторной отправке письма:', resendError.message);
            throw resendError;
          }

          setSuccessMessage('✨ Письмо для подтверждения отправлено повторно!\n\n🔍 Пожалуйста, проверьте папку "Входящие" и "Спам".');
          return;
        }
        
        console.error('❌ Ошибка при регистрации:', signUpError.message);
        throw signUpError;
      }

      if (data?.user) {
        console.log('✅ Пользователь создан:', {
          id: data.user.id,
          email: data.user.email,
          confirmed: data.user.confirmed_at
        });
        
        setSuccessMessage(`✨ Добро пожаловать в NeuroLeela!\n\n📧 Письмо для подтверждения отправлено на ${email}\n\n🔍 Пожалуйста, проверьте папку "Входящие" и "Спам"\n\n⏳ Если письмо не пришло в течение 5 минут, нажмите кнопку "ЗАРЕГИСТРИРОВАТЬСЯ" еще раз.`);
      } else {
        throw new Error('Не удалось создать пользователя');
      }
      
    } catch (err: any) {
      console.error('❌ Ошибка:', err.message);
      
      if (err.message === 'USER_ALREADY_CONFIRMED') {
        setError('❌ Этот email уже зарегистрирован и подтвержден.\n\n👉 Пожалуйста, войдите в систему или воспользуйтесь восстановлением пароля.');
      } else if (err.message.includes('valid email')) {
        setError('❌ Пожалуйста, введите корректный email адрес.');
      } else if (err.message.includes('password')) {
        setError('❌ Пароль должен содержать минимум 6 символов.');
      } else {
        setError(`❌ Произошла ошибка при регистрации.\n\n⚠️ Пожалуйста, попробуйте позже или обратитесь в поддержку.\n\n🔍 Ошибка: ${err.message}`);
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
    <LinearGradient
      colors={["#f8f9fa", "#f1f3f5", "#e9ecef"]}
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
                  ${isMobile ? 'text-2xl' : 'text-3xl'} 
                  font-light 
                  tracking-wide 
                  text-neutral-800
                  mb-8
                `}>
                  Регистрация
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

                  <TextInput
                    placeholder="Подтверждение пароля"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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
                    onPress={handleSignUp}
                    disabled={loading}
                    onLayout={(e) => buttonWidth.current = e.nativeEvent.layout.width}
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
                        {loading ? 'ОТПРАВКА ПИСЬМА...' : 'ЗАРЕГИСТРИРОВАТЬСЯ'}
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
                  onPress={() => router.push("/sign-in")}
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
                      ВОЙТИ
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

const styles = StyleSheet.create({
  successMessage: {
    color: '#4CAF50',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  errorMessage: {
    color: '#F44336',
    marginTop: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  button: {
    marginTop: 24,
    minWidth: 200,
  },
});

import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Platform, useWindowDimensions } from "react-native";
import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { TextInput } from "@components/ui/text-input";
import { supabase } from "@/lib/supabase";

const DEV_MODE = process.env.NODE_ENV === 'development';
const DEV_EMAIL = 'raoffonom@icloud.com';
const DEV_PASSWORD = '1234567890';

export default function SignInScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const [email, setEmail] = useState(DEV_MODE ? DEV_EMAIL : "");
  const [password, setPassword] = useState(DEV_MODE ? DEV_PASSWORD : "");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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

  const handleSignIn = async () => {
    try {
      setError(null);
      setSuccessMessage(null);
      if (!validateForm()) return;
      setLoading(true);
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('❌ Неверный email или пароль');
        return;
      }
      if (data?.user) {
        const { data: userData } = await supabase
          .from('users')
          .select('username, pinata_avatar_id, designation')
          .eq('user_id', data.user.id)
          .single();
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
        setError('Не удалось войти в систему');
      }
    } catch (err: any) {
      setError('❌ Произошла ошибка при входе. Попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  const inputClassName = `
    w-full
    bg-white
    border
    border-neutral-200
    rounded-xl
    px-4
    py-3
    text-neutral-800
    placeholder:text-neutral-400
    focus:border-blue-300
    focus:bg-white
    transition-all
    duration-300
  `.trim();

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <SafeAreaView className="flex flex-1 w-full items-center justify-center">
        <View className="flex flex-1 w-full items-center justify-center px-4 web:px-0">
          <View className="flex flex-col items-center justify-center w-full max-w-md space-y-8 py-12 mx-auto">
            <Image
              source={require("@/assets/icons/512.png")}
              style={{ width: 80, height: 80, marginBottom: 8 }}
              resizeMode="contain"
            />
            <H1 className={`text-center ${isMobile ? 'text-2xl' : 'text-3xl'} font-light tracking-wide text-neutral-800 mb-4`}>
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
            <View className="w-full space-y-4 mt-4">
              {error && (
                <Text className="text-red-500 text-center mb-2">{error}</Text>
              )}
              {successMessage && (
                <Text className="text-green-600 text-center mb-2">{successMessage}</Text>
              )}
              <Button
                size={isMobile ? "default" : "lg"}
                variant="default"
                className={`w-full min-w-[280px] ${loading ? 'opacity-70' : ''} bg-neutral-900 hover:bg-neutral-800 transition-all duration-300 shadow-lg rounded-xl border border-neutral-200 relative overflow-hidden`}
                onPress={handleSignIn}
                disabled={loading}
              >
                <View className="w-full flex items-center justify-center">
                  <Text className={`${isMobile ? 'text-sm' : 'text-base'} font-light tracking-widest text-neutral-100 text-center min-w-[200px]`}>
                    {loading ? 'ВХОД...' : 'ВОЙТИ'}
                  </Text>
                </View>
              </Button>
              <Button
                size={isMobile ? "default" : "lg"}
                variant="secondary"
                className={`w-full min-w-[280px] bg-white hover:bg-neutral-100 transition-all duration-300 rounded-xl border border-neutral-200 relative overflow-hidden`}
                onPress={() => router.push("/sign-up")}
              >
                <View className="w-full flex items-center justify-center">
                  <Text className={`${isMobile ? 'text-sm' : 'text-base'} font-light tracking-widest text-neutral-700 text-center min-w-[200px]`}>
                    РЕГИСТРАЦИЯ
                  </Text>
                </View>
              </Button>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </View>
  );
}

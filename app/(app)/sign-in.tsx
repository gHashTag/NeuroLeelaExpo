import { useRouter } from "expo-router";
import React, { useState } from "react";
import { View, Image, Platform, useWindowDimensions } from "react-native";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Text } from "@/components/ui/text";
import { H1 } from "@/components/ui/typography";
import { supabase } from "@/lib/supabase";

const DEV_MODE = process.env.NODE_ENV === 'development';
const DEV_EMAIL = 'raoffonom@icloud.com';
const DEV_PASSWORD = '1234567890';

export default function SignInScreen() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();
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

  return (
    <View className="flex-1 items-center justify-center bg-background" style={{ minHeight: height }}>
      <Card className="w-full max-w-sm mx-auto flex flex-col items-center justify-center gap-6 p-8">
        <Image
          source={require('@/assets/icon.jpg')}
          style={{ width: 80, height: 80, borderRadius: 24, marginBottom: 8 }}
          resizeMode="cover"
        />
        <H1 className="text-center text-2xl font-light tracking-wide text-foreground mb-2">Вход</H1>
        <View className="space-y-4 w-full mb-2">
          <Input
            placeholder="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <Input
            placeholder="Пароль"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>
        {error && (
          <Text className="text-red-500 text-center mb-2">{error}</Text>
        )}
        {successMessage && (
          <Text className="text-green-600 text-center mb-2">{successMessage}</Text>
        )}
        <Button
          size={isMobile ? "default" : "lg"}
          variant="default"
          className="w-full min-w-[200px] bg-primary text-primary-foreground hover:opacity-90 transition-all duration-300 rounded-xl border border-border mb-2"
          onPress={handleSignIn}
          disabled={loading}
        >
          <Text className="text-base font-light tracking-widest text-primary-foreground text-center">
            {loading ? 'ВХОД...' : 'ВОЙТИ'}
          </Text>
        </Button>
        <Button
          size={isMobile ? "default" : "lg"}
          variant="secondary"
          className="w-full min-w-[200px] bg-secondary text-secondary-foreground hover:bg-accent transition-all duration-300 rounded-xl border border-border"
          onPress={() => router.push("/sign-up")}
        >
          <Text className="text-base font-light tracking-widest text-secondary-foreground text-center">
            РЕГИСТРАЦИЯ
          </Text>
        </Button>
      </Card>
    </View>
  );
}

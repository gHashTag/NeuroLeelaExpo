import React, { useState } from 'react';
import { View, TouchableOpacity, ActivityIndicator, Platform, useWindowDimensions, ScrollView } from 'react-native';
import { Image } from 'expo-image';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";
import { Card } from "@/components/ui/card";
import { pickImage } from '@/lib/avatar-helpers';
import { useSupabase } from '@/context/supabase-provider';
import { PINATA } from '@/constants';

export default function Avatar() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const { uploadAvatar, getAvatarUrl, session, userData, updateUserData } = useSupabase();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    console.log(message);
    setLogs(prev => [...prev, `${new Date().toISOString().slice(11, 19)}: ${message}`]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const handlePickImage = async () => {
    try {
      setLoading(true);
      setError(null);
      clearLogs();
      
      addLog('Начинаем загрузку аватара...');
      addLog(`Сессия активна: ${!!session}`);
      addLog(`Данные пользователя: ${JSON.stringify(userData || {})}`);
      
      // Создаем объект с функциями для передачи в pickImage
      const supabaseFunctions = {
        uploadAvatar,
        updateUserData,
        getAvatarUrl
      };
      
      // Use the pickImage helper with Supabase functions
      await pickImage(
        supabaseFunctions,
        // Success callback
        (avatarUrl) => {
          addLog(`✅ Аватар успешно загружен: ${avatarUrl}`);
          setAvatarUri(avatarUrl);
        },
        // Error callback
        (error) => {
          addLog(`❌ Ошибка загрузки: ${error.message}`);
          if (error.message.includes('401')) {
            setError('Ошибка авторизации при загрузке изображения. Пожалуйста, попробуйте позже.');
          } else {
            setError(error.message || 'Произошла ошибка при обновлении аватара');
          }
        }
      );
    } catch (error: any) {
      const errorMessage = error.message || 'Неизвестная ошибка';
      addLog(`❌ Ошибка при обновлении аватара: ${errorMessage}`);
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

  const testPinataConnection = async () => {
    try {
      setLoading(true);
      clearLogs();
      addLog('Тестируем соединение с Pinata...');
      
      // Проверяем наличие JWT токена
      addLog(`JWT токен существует: ${!!PINATA.JWT}`);
      if (PINATA.JWT) {
        addLog(`JWT токен длина: ${PINATA.JWT.length}`);
        addLog(`JWT токен первые 20 символов: ${PINATA.JWT.substring(0, 20)}...`);
      }
      
      // Проверяем наличие Gateway URL
      addLog(`Gateway URL: ${PINATA.GATEWAY_URL || 'не задан'}`);
      
      // Проверяем соединение с Pinata
      const response = await fetch('https://api.pinata.cloud/data/testAuthentication', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${PINATA.JWT}`,
        },
      });
      
      const responseText = await response.text();
      addLog(`Ответ от Pinata (статус ${response.status}): ${responseText}`);
      
      if (response.ok) {
        addLog('✅ Соединение с Pinata установлено успешно!');
      } else {
        addLog(`❌ Ошибка соединения с Pinata: ${response.status} ${responseText}`);
        setError(`Ошибка соединения с Pinata: ${response.status} ${responseText}`);
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Неизвестная ошибка';
      addLog(`❌ Ошибка при тестировании соединения: ${errorMessage}`);
      setError(`Ошибка при тестировании соединения: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-background w-full items-center justify-center p-4">
      <ScrollView className="w-full">
        <Card className="w-full max-w-sm mx-auto p-6 web:p-8 mb-4">
          <View className="flex items-center space-y-6 w-full">
            <View className="space-y-2 w-full">
              <H1 className="text-center text-2xl web:text-3xl font-medium text-foreground mb-2">
                Добавьте фото профиля
              </H1>

              <Muted className="text-center text-base text-muted-foreground leading-relaxed max-w-sm mx-auto mb-6">
                Загрузите фотографию, которая будет отображаться в вашем профиле
              </Muted>

              <View className="items-center space-y-6">
                <TouchableOpacity 
                  onPress={handlePickImage}
                  disabled={loading}
                  className="relative rounded-full overflow-hidden bg-muted border border-border"
                  style={{ width: isMobile ? 140 : 160, height: isMobile ? 140 : 160 }}
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
                        size={isMobile ? 40 : 48} 
                        color="rgba(0,0,0,0.4)" 
                      />
                      <Text className="mt-2 text-sm text-muted-foreground">
                        Нажмите для выбора
                      </Text>
                    </View>
                  )}
                  
                  {loading && (
                    <View className="absolute inset-0 flex items-center justify-center bg-background/70 rounded-full">
                      <ActivityIndicator color="#666" size="large" />
                    </View>
                  )}
                </TouchableOpacity>
                
                {error && (
                  <View className="bg-destructive/10 p-4 rounded-lg border border-destructive/20 w-full">
                    <Text className="text-destructive text-center text-sm">
                      {error}
                    </Text>
                  </View>
                )}

                <Button
                  size={isMobile ? "default" : "lg"}
                  variant={avatarUri ? "default" : "secondary"}
                  className="w-full rounded-lg mt-4"
                  onPress={avatarUri ? handleContinue : handlePickImage}
                  disabled={loading}
                >
                  <Text 
                    className={`
                      text-base font-medium
                      ${avatarUri ? "text-primary-foreground" : "text-secondary-foreground"}
                    `}
                  >
                    {loading 
                      ? "Загрузка..." 
                      : avatarUri 
                        ? "Продолжить" 
                        : "Выбрать фото"}
                  </Text>
                </Button>

                <Button
                  size={isMobile ? "default" : "lg"}
                  variant="outline"
                  className="w-full rounded-lg"
                  onPress={testPinataConnection}
                  disabled={loading}
                >
                  <Text className="text-base font-medium text-primary">
                    Проверить соединение с Pinata
                  </Text>
                </Button>
              </View>
            </View>
          </View>
        </Card>

        {logs.length > 0 && (
          <Card className="w-full max-w-sm mx-auto p-6 web:p-8 mb-4">
            <View className="space-y-2 w-full">
              <H1 className="text-center text-lg web:text-xl font-medium text-foreground mb-2">
                Диагностические логи
              </H1>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full mb-2" 
                onPress={clearLogs}
              >
                <Text>Очистить логи</Text>
              </Button>
              <View className="bg-muted p-4 rounded-lg">
                {logs.map((log, index) => (
                  <Text 
                    key={index} 
                    className="text-xs mb-1"
                    style={{
                      color: log.includes('❌') ? 'red' : log.includes('✅') ? 'green' : 'gray'
                    }}
                  >
                    {log}
                  </Text>
                ))}
              </View>
            </View>
          </Card>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

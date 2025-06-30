import React, { useState, useEffect } from "react";
import { View, Text, Image, useWindowDimensions, ImageBackground, Platform } from "react-native";
import { router } from "expo-router";
import { Ionicons } from '@expo/vector-icons';
import { useSupabase } from "@/context/supabase-provider";
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';
import { InngestEventService } from '@/services/InngestEventService';
import { GameMessageService } from '@/services/GameMessageService';

// Новая дизайн-система
import { 
  Button, 
  Card, 
  GameCard, 
  StatsCard, 
  Container, 
  Flex, 
  ResponsiveLayout 
} from '@/components/ui/design-system';

// Существующие компоненты
import { Display, GameBoard, PlayerInfoConsolidated } from "@components/ui/index";
import { ChatBot } from '@/components/chat/ChatBot';

const ModernGameScreen: React.FC = () => {
  const { width: windowWidth } = useWindowDimensions();
  const { userData } = useSupabase();
  const isMobile = windowWidth < 768;
  
  return (
    <View className="flex-1 bg-gradient-to-br from-purple-400 via-pink-500 to-red-500">
      <View className="flex-1 items-center justify-center p-6">
        <GameCard title="🕉️ Современный NeuroLeela" className="max-w-md">
          <Flex direction="col" gap={16}>
            <Text className="text-lg text-gray-700 text-center">
              Новая дизайн-система с NativeWind готова!
            </Text>
            
            <Button 
              onPress={() => router.push('/gamescreen')}
              variant="primary"
              size="lg"
              fullWidth
            >
              Вернуться к игре
            </Button>
            
            <Button 
              onPress={() => router.push('/nativewind-test')}
              variant="outline"
              size="md"
              fullWidth
            >
              Тест дизайн-системы
            </Button>
          </Flex>
        </GameCard>
      </View>
    </View>
  );
};

export default ModernGameScreen;

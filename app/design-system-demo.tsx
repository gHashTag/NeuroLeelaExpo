import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { 
  Button, 
  Card, 
  GameCard, 
  StatsCard, 
  Container, 
  Flex, 
  ResponsiveLayout 
} from '@/components/ui/design-system';

export default function DesignSystemDemo() {
  return (
    <ScrollView className="flex-1 bg-gradient-to-br from-purple-50 to-pink-50">
      <ResponsiveLayout>
        <Container maxWidth="2xl" className="py-8">
          {/* Header */}
          <Card className="mb-8 text-center">
            <Text className="text-3xl font-bold text-gradient mb-4">
              🕉️ NeuroLeela Design System
            </Text>
            <Text className="text-lg text-gray-600 leading-relaxed">
              Современная дизайн-система на базе NativeWind и Tailwind CSS
            </Text>
          </Card>

          {/* Buttons */}
          <Card title="Кнопки" className="mb-8">
            <Flex direction="col" gap={16}>
              <Flex direction="row" gap={12} wrap>
                <Button variant="primary" size="sm">Primary Small</Button>
                <Button variant="secondary" size="sm">Secondary Small</Button>
                <Button variant="outline" size="sm">Outline Small</Button>
                <Button variant="ghost" size="sm">Ghost Small</Button>
              </Flex>
              
              <Flex direction="row" gap={12} wrap>
                <Button variant="primary" size="md">Primary Medium</Button>
                <Button variant="secondary" size="md">Secondary Medium</Button>
                <Button variant="outline" size="md">Outline Medium</Button>
              </Flex>
              
              <Flex direction="row" gap={12} wrap>
                <Button variant="primary" size="lg" 
                  icon={<Ionicons name="play" size={24} color="white" />}>
                  Large with Icon
                </Button>
                <Button variant="destructive" size="lg">Destructive Large</Button>
              </Flex>
              
              <Button variant="primary" size="xl" fullWidth>
                Full Width Extra Large
              </Button>
            </Flex>
          </Card>

          {/* Cards */}
          <Card title="Карточки" className="mb-8">
            <Flex direction="col" gap={16}>
              <Flex direction="row" gap={12} wrap>
                <Card variant="default" size="sm" className="flex-1 min-w-[200px]">
                  <Text className="font-semibold">Default Card</Text>
                  <Text className="text-gray-600">Basic card style</Text>
                </Card>
                
                <Card variant="elevated" size="sm" className="flex-1 min-w-[200px]">
                  <Text className="font-semibold">Elevated Card</Text>
                  <Text className="text-gray-600">With shadow</Text>
                </Card>
              </Flex>
              
              <Flex direction="row" gap={12} wrap>
                <Card variant="outlined" size="md" className="flex-1 min-w-[200px]">
                  <Text className="font-semibold">Outlined Card</Text>
                  <Text className="text-gray-600">With colored border</Text>
                </Card>
                
                <Card variant="glass" size="md" className="flex-1 min-w-[200px]">
                  <Text className="font-semibold">Glass Card</Text>
                  <Text className="text-gray-600">Glassmorphism effect</Text>
                </Card>
              </Flex>
              
              <GameCard title="Game Card" subtitle="Specialized for game UI">
                <Text className="text-gray-700">
                  Этот тип карточки специально разработан для игрового интерфейса
                </Text>
              </GameCard>
            </Flex>
          </Card>

          {/* Stats Cards */}
          <Card title="Статистика" className="mb-8">
            <Flex direction="row" gap={12} wrap>
              <StatsCard
                title="Уровень"
                value={68}
                subtitle="Космическое сознание"
                icon={<Ionicons name="star" size={20} color="#8B5CF6" />}
                trend="up"
                className="flex-1 min-w-[150px]"
              />
              
              <StatsCard
                title="Опыт"
                value="1,337"
                subtitle="Духовных очков"
                icon={<Ionicons name="trophy" size={20} color="#8B5CF6" />}
                trend="up"
                className="flex-1 min-w-[150px]"
              />
              
              <StatsCard
                title="Время"
                value="2ч 15м"
                subtitle="В медитации"
                icon={<Ionicons name="time" size={20} color="#8B5CF6" />}
                trend="neutral"
                className="flex-1 min-w-[150px]"
              />
            </Flex>
          </Card>

          {/* Layout Examples */}
          <Card title="Адаптивная сетка" className="mb-8">
            <Flex direction="col" gap={16}>
              <Text className="text-gray-600">
                Responsive Flex layout с автоматической адаптацией
              </Text>
              
              <Flex direction="row" gap={8} wrap>
                {[1, 2, 3, 4, 5, 6].map(num => (
                  <View key={num} className="bg-purple-100 p-4 rounded-lg flex-1 min-w-[100px]">
                    <Text className="text-center font-semibold text-purple-700">
                      Item {num}
                    </Text>
                  </View>
                ))}
              </Flex>
            </Flex>
          </Card>

          {/* Navigation */}
          <Card>
            <Flex direction="col" gap={16}>
              <Text className="text-xl font-bold text-center text-gray-800">
                Навигация
              </Text>
              
              <Flex direction="row" gap={12} justify="center" wrap>
                <Button 
                  variant="outline"
                  onPress={() => router.push('/nativewind-test')}
                  icon={<Ionicons name="flask" size={20} color="#8B5CF6" />}
                >
                  NativeWind Test
                </Button>
                
                <Button 
                  variant="outline"
                  onPress={() => router.push('/gamescreen-modern')}
                  icon={<Ionicons name="game-controller" size={20} color="#8B5CF6" />}
                >
                  Modern Game
                </Button>
                
                <Button 
                  variant="primary"
                  onPress={() => router.push('/gamescreen')}
                  icon={<Ionicons name="home" size={20} color="white" />}
                >
                  Основная игра
                </Button>
              </Flex>
            </Flex>
          </Card>
        </Container>
      </ResponsiveLayout>
    </ScrollView>
  );
}

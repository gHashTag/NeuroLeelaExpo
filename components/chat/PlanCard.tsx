import React from 'react';
import { View, Text } from 'react-native';

interface PlanInfo {
  name: string;
  description: string;
  element: string;
  color: string;
}

interface PlanCardProps {
  planNumber: number;
  planInfo: PlanInfo;
  isCurrentPosition?: boolean;
  timestamp?: string;
}

export const PlanCard: React.FC<PlanCardProps> = ({ 
  planNumber, 
  planInfo, 
  isCurrentPosition = false 
}) => {
  const getColorClasses = (color: string) => {
    const colorMap = {
      green: 'bg-green-100 border-green-300',
      purple: 'bg-purple-100 border-purple-300',
      blue: 'bg-blue-100 border-blue-300',
      gold: 'bg-yellow-100 border-yellow-300',
      violet: 'bg-violet-100 border-violet-300',
      red: 'bg-red-100 border-red-300',
      brown: 'bg-amber-100 border-amber-300',
      gray: 'bg-gray-100 border-gray-300',
      pink: 'bg-pink-100 border-pink-300',
      orange: 'bg-orange-100 border-orange-300',
      yellow: 'bg-yellow-100 border-yellow-300',
      black: 'bg-gray-800 border-gray-600',
      white: 'bg-white border-gray-200',
      clear: 'bg-blue-50 border-blue-200'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 border-gray-300';
  };

  const getTextColorClasses = (color: string) => {
    const colorMap = {
      green: 'text-green-800',
      purple: 'text-purple-800',
      blue: 'text-blue-800',
      gold: 'text-yellow-800',
      violet: 'text-violet-800',
      red: 'text-red-800',
      brown: 'text-amber-800',
      gray: 'text-gray-800',
      pink: 'text-pink-800',
      orange: 'text-orange-800',
      yellow: 'text-yellow-800',
      black: 'text-white',
      white: 'text-gray-800',
      clear: 'text-blue-800'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-800';
  };

  const getElementColors = (color: string) => {
    const colorMap = {
      green: 'text-emerald-600',
      purple: 'text-purple-600',
      blue: 'text-blue-600',
      gold: 'text-amber-500',
      violet: 'text-violet-600',
      red: 'text-rose-600',
      brown: 'text-amber-700',
      gray: 'text-slate-600',
      pink: 'text-pink-600',
      orange: 'text-orange-600',
      yellow: 'text-yellow-600',
      black: 'text-gray-800',
      white: 'text-gray-100',
      clear: 'text-cyan-600'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-600';
  };

  const getAccentGradient = (color: string) => {
    const gradientMap = {
      green: 'from-emerald-400/20 to-emerald-600/20',
      purple: 'from-purple-400/20 to-purple-600/20',
      blue: 'from-blue-400/20 to-blue-600/20',
      gold: 'from-amber-400/20 to-amber-600/20',
      violet: 'from-violet-400/20 to-violet-600/20',
      red: 'from-rose-400/20 to-rose-600/20',
      brown: 'from-amber-500/20 to-amber-700/20',
      gray: 'from-slate-400/20 to-slate-600/20',
      pink: 'from-pink-400/20 to-pink-600/20',
      orange: 'from-orange-400/20 to-orange-600/20',
      yellow: 'from-yellow-400/20 to-yellow-600/20',
      black: 'from-gray-600/20 to-gray-800/20',
      white: 'from-gray-100/20 to-gray-300/20',
      clear: 'from-cyan-400/20 to-cyan-600/20'
    };
    return gradientMap[color as keyof typeof gradientMap] || 'from-gray-400/20 to-gray-600/20';
  };

  return (
    <View className={`
      glass-card rounded-3xl p-6 m-3 shadow-pearl
      ${isCurrentPosition ? 'pearl-glow ring-2 ring-purple-400/50' : ''}
      animate-fade-in
    `}>
      {/* Заголовок карточки с элементом */}
      <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center">
          <View className={`
            w-16 h-16 rounded-2xl glass-message items-center justify-center mr-4
            bg-gradient-to-br ${getAccentGradient(planInfo.color)}
            animate-pearl-float
          `}>
            <Text className="text-3xl">{planInfo.element}</Text>
          </View>
          <View>
            <Text className="text-lg font-bold text-gray-800">
              План {planNumber}
            </Text>
            <Text className={`text-sm font-medium ${getElementColors(planInfo.color)}`}>
              {planInfo.color === 'gold' ? 'Божественный' : 
               planInfo.color === 'violet' ? 'Высший' :
               planInfo.color === 'blue' ? 'Мудрость' :
               planInfo.color === 'green' ? 'Рост' :
               planInfo.color === 'red' ? 'Сила' : 'Духовный'}
            </Text>
          </View>
        </View>
        {isCurrentPosition && (
          <View className="glass-button rounded-full px-4 py-2 pearl-glow">
            <Text className="text-purple-800 text-xs font-bold">✨ Вы здесь</Text>
          </View>
        )}
      </View>

      {/* Название плана */}
      <Text className="text-xl font-bold mb-3 text-gray-800 leading-tight">
        {planInfo.name}
      </Text>

      {/* Описание */}
      <Text className="text-base leading-relaxed text-gray-700 font-medium mb-4">
        {planInfo.description}
      </Text>

      {/* Декоративная полоса с градиентом */}
      <View className={`
        h-2 rounded-full glass-message
        bg-gradient-to-r ${getAccentGradient(planInfo.color)}
        shadow-pearl
      `} />
    </View>
  );
}; 
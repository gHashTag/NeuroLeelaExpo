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
      violet: 'bg-violet-100 border-violet-300'
    };
    return colorMap[color as keyof typeof colorMap] || 'bg-gray-100 border-gray-300';
  };

  const getTextColorClasses = (color: string) => {
    const colorMap = {
      green: 'text-green-800',
      purple: 'text-purple-800',
      blue: 'text-blue-800',
      gold: 'text-yellow-800',
      violet: 'text-violet-800'
    };
    return colorMap[color as keyof typeof colorMap] || 'text-gray-800';
  };

  return (
    <View className={`
      rounded-xl p-4 m-2 border-2 shadow-lg
      ${getColorClasses(planInfo.color)}
      ${isCurrentPosition ? 'ring-2 ring-orange-400 ring-opacity-75' : ''}
    `}>
      {/* Заголовок карточки */}
      <View className="flex-row items-center justify-between mb-3">
        <View className="flex-row items-center">
          <Text className="text-2xl mr-2">{planInfo.element}</Text>
          <Text className={`text-lg font-bold ${getTextColorClasses(planInfo.color)}`}>
            План {planNumber}
          </Text>
        </View>
        {isCurrentPosition && (
          <View className="bg-orange-400 rounded-full px-2 py-1">
            <Text className="text-white text-xs font-bold">Вы здесь</Text>
          </View>
        )}
      </View>

      {/* Название плана */}
      <Text className={`text-xl font-semibold mb-2 ${getTextColorClasses(planInfo.color)}`}>
        {planInfo.name}
      </Text>

      {/* Описание */}
      <Text className={`text-sm leading-relaxed ${getTextColorClasses(planInfo.color)} opacity-80`}>
        {planInfo.description}
      </Text>

      {/* Декоративная линия */}
      <View className={`h-1 rounded-full mt-3 ${
        planInfo.color === 'green' ? 'bg-green-300' :
        planInfo.color === 'purple' ? 'bg-purple-300' :
        planInfo.color === 'blue' ? 'bg-blue-300' :
        planInfo.color === 'gold' ? 'bg-yellow-300' :
        planInfo.color === 'violet' ? 'bg-violet-300' : 'bg-gray-300'
      }`} />
    </View>
  );
}; 
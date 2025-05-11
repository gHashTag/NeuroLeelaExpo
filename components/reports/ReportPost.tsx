import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { LinearGradient } from "expo-linear-gradient";

interface ReportPostProps {
  number: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
  planLevel?: number; // Уровень плана (1-8)
}

export const ReportPost = ({ number, content, date, likes, comments, planLevel = 1 }: ReportPostProps) => {
  // Функция для получения цвета в зависимости от уровня плана
  const getPlanColor = () => {
    switch(planLevel) {
      case 1: return "#ef4444"; // red-500 - Муладхара
      case 2: return "#f97316"; // orange-500 - Свадхистана
      case 3: return "#eab308"; // yellow-500 - Манипура
      case 4: return "#22c55e"; // green-500 - Анахата
      case 5: return "#3b82f6"; // blue-500 - Вишудха
      case 6: return "#6366f1"; // indigo-500 - Аджна
      case 7: return "#a855f7"; // purple-500 - Сахасрара
      case 8: return "#ec4899"; // pink-500 - Нирвана
      default: return "#6A0DAD"; // purple-900 (по умолчанию)
    }
  };

  // Функция для получения второго цвета для градиента
  const getSecondaryColor = () => {
    switch(planLevel) {
      case 1: return "#fee2e2"; // red-100
      case 2: return "#ffedd5"; // orange-100
      case 3: return "#fef9c3"; // yellow-100
      case 4: return "#dcfce7"; // green-100
      case 5: return "#dbeafe"; // blue-100
      case 6: return "#e0e7ff"; // indigo-100
      case 7: return "#f3e8ff"; // purple-100
      case 8: return "#fce7f3"; // pink-100
      default: return "#f5f3ff"; // purple-100 (по умолчанию)
    }
  };

  // Функция для получения названия уровня плана
  const getPlanLevelName = () => {
    switch(planLevel) {
      case 1: return "Муладхара";
      case 2: return "Свадхистана";
      case 3: return "Манипура";
      case 4: return "Анахата";
      case 5: return "Вишудха";
      case 6: return "Аджна";
      case 7: return "Сахасрара";
      case 8: return "Нирвана";
      default: return "";
    }
  };

  // Функция для получения иконки чакры
  const getChakraIcon = () => {
    switch(planLevel) {
      case 1: return "meditation"; // Муладхара - основа
      case 2: return "water"; // Свадхистана - вода
      case 3: return "white-balance-sunny"; // Манипура - огонь
      case 4: return "heart-outline"; // Анахата - сердце
      case 5: return "message-outline"; // Вишудха - горло, речь
      case 6: return "eye-outline"; // Аджна - третий глаз
      case 7: return "star-four-points"; // Сахасрара - корона
      case 8: return "shimmer"; // Нирвана - сияние
      default: return "feather";
    }
  };

  // Функция для определения второго декоративного элемента
  const getSecondDecoration = () => {
    switch(planLevel) {
      case 1: return "hexagram-outline"; // Основа
      case 2: return "waves"; // Текучесть
      case 3: return "fire"; // Энергия
      case 4: return "flower-outline"; // Любовь
      case 5: return "butterfly-outline"; // Речь
      case 6: return "crystal-ball"; // Видение
      case 7: return "star-face"; // Просветление
      case 8: return "lighthouse"; // Вечность
      default: return "crystal-ball";
    }
  };

  const planColor = getPlanColor();
  const secondaryColor = getSecondaryColor();
  const planName = getPlanLevelName();
  const chakraIcon = getChakraIcon();
  const secondDecoration = getSecondDecoration();

  return (
    <View className="mb-6 overflow-hidden rounded-lg shadow-sm">
      <LinearGradient
        colors={[secondaryColor, '#ffffff']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        className="p-5 rounded-lg"
      >
        {/* Декоративные элементы */}
        <View className="absolute top-3 right-3 opacity-5 rotate-12">
          <Icon name="crystal-ball" size={60} color={planColor} />
        </View>
        <View className="absolute bottom-3 left-3 opacity-5 -rotate-12">
          <Icon name="feather" size={40} color={planColor} />
        </View>
        <View className="absolute top-1/3 left-1/2 opacity-5">
          <Icon name={secondDecoration} size={50} color={planColor} />
        </View>
        
        {/* Индикатор чакры - тонкая линия градиента сверху */}
        <LinearGradient
          colors={[planColor, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
        />
        
        <View className="flex-row items-start">
          {/* Символ чакры с номером */}
          <View className="relative mr-4">
            <LinearGradient
              colors={[`${planColor}30`, `${secondaryColor}90`]}
              className="w-16 h-16 rounded-full items-center justify-center"
            >
              <View className="items-center justify-center">
                <Icon name={chakraIcon} size={24} color={planColor} />
              </View>
            </LinearGradient>
            <LinearGradient
              colors={[planColor, `${planColor}80`]}
              className="absolute -top-1 -right-1 rounded-full w-7 h-7 items-center justify-center border border-white shadow-sm"
            >
              <Text className="text-xs font-bold text-white">
                {number}
              </Text>
            </LinearGradient>
          </View>

          {/* Контент */}
          <View className="flex-1">
            <View className="flex-row items-center justify-between mb-2">
              <View className="flex-row items-center">
                <Text className="font-bold text-lg text-purple-900">Дневник души</Text>
                <Text className="text-gray-400 text-xs ml-2">{date}</Text>
              </View>
              <TouchableOpacity>
                <Icon name="dots-horizontal" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
            
            {/* Название чакры/плана */}
            <View className="mb-3 flex-row items-center">
              <LinearGradient
                colors={[`${planColor}20`, `${planColor}05`]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                className="rounded-full px-3 py-1 self-start"
              >
                <View className="flex-row items-center">
                  <Icon name={chakraIcon} size={12} color={planColor} style={{ marginRight: 4 }} />
                  <Text style={{ color: planColor }} className="text-xs font-medium">
                    План {number} • {planName}
                  </Text>
                </View>
              </LinearGradient>
            </View>
            
            {/* Духовная цитата */}
            <View className="mb-3 pl-2 border-l-2" style={{ borderColor: `${planColor}50` }}>
              <Text className="text-xs italic text-gray-500">
                {getPlanQuote(planLevel)}
              </Text>
            </View>

            {/* Основной контент */}
            <Text className="text-gray-800 mb-4 leading-5">{content}</Text>

            {/* Кнопки действий с оттенками цвета чакры */}
            <View className="flex-row justify-end space-x-4 border-t border-gray-100 pt-3">
              <TouchableOpacity className="flex-row items-center">
                <Icon name="comment-outline" size={22} color={planColor} opacity={0.5} />
                <Text className="ml-1 text-gray-500 text-sm">{comments}</Text>
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center">
                <Icon name="heart-outline" size={22} color={planColor} opacity={0.5} />
                <Text className="ml-1 text-gray-500 text-sm">{likes}</Text>
              </TouchableOpacity>

              <TouchableOpacity>
                <Icon name="share-variant-outline" size={22} color={planColor} opacity={0.5} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </LinearGradient>
    </View>
  );
};

// Функция для получения духовной цитаты в зависимости от уровня чакры
const getPlanQuote = (planLevel: number) => {
  switch(planLevel) {
    case 1: return "«Корень всей жизни, основа безопасности и стабильности»";
    case 2: return "«Поток эмоций и творчества, танец воды и жизненных сил»";
    case 3: return "«Огонь внутренней силы, трансформация и преобразование»";
    case 4: return "«Центр любви, гармонии и баланса внутреннего и внешнего»";
    case 5: return "«Голос истины, самовыражение и чистая коммуникация»";
    case 6: return "«Око мудрости, интуиция и внутреннее видение»";
    case 7: return "«Венец сознания, единение с высшими силами»";
    case 8: return "«За пределами форм, в вечном блаженстве нирваны»";
    default: return "«Духовный путь - это возвращение к себе истинному»";
  }
};

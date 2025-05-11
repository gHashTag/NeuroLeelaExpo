import React from "react";
import { View, Image, TouchableOpacity } from "react-native";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

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
      case 1: return "#ef4444"; // red-500
      case 2: return "#f97316"; // orange-500
      case 3: return "#eab308"; // yellow-500
      case 4: return "#22c55e"; // green-500
      case 5: return "#3b82f6"; // blue-500
      case 6: return "#6366f1"; // indigo-500
      case 7: return "#a855f7"; // purple-500
      case 8: return "#ec4899"; // pink-500
      default: return "#6A0DAD"; // purple-900 (по умолчанию)
    }
  };

  // Функция для получения названия уровня плана
  const getPlanLevelName = () => {
    switch(planLevel) {
      case 1: return "Физический план";
      case 2: return "Астральный план";
      case 3: return "Небесный план";
      case 4: return "План баланса";
      case 5: return "Человеческий план";
      case 6: return "План аскетизма";
      case 7: return "План сознания";
      case 8: return "Абсолютный план";
      default: return "";
    }
  };

  const planColor = getPlanColor();
  const planName = getPlanLevelName();

  return (
    <View className="mb-6 bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
      {/* Индикатор уровня плана */}
      <View 
        style={{ backgroundColor: planColor, opacity: 0.2 }}
        className="absolute top-0 left-0 right-0 h-1 rounded-t-lg"
      />
      
      <View className="flex-row items-start">
        {/* Аватар с номером */}
        <View className="relative mr-3">
          <Image
            source={require("@/assets/defaultImage/defaultProfileImage.png")}
            className="w-14 h-14 rounded-lg border border-purple-200"
          />
          <View 
            style={{ backgroundColor: planColor }} 
            className="absolute bottom-0 right-0 rounded-full w-6 h-6 items-center justify-center border border-white"
          >
            <Text className="text-xs font-bold text-white">
              {number}
            </Text>
          </View>
        </View>

        {/* Контент */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-1">
            <View className="flex-row items-center">
              <Text className="font-bold text-lg text-purple-900">Anonymous</Text>
              <Text className="text-gray-400 text-xs ml-2 mt-1">{date}</Text>
            </View>
            <TouchableOpacity>
              <Icon name="dots-horizontal" size={20} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
          
          {/* Название плана */}
          <View 
            style={{ backgroundColor: planColor, opacity: 0.1 }} 
            className="rounded-full px-2 py-0.5 self-start mb-2"
          >
            <Text style={{ color: planColor }} className="text-xs font-medium">
              План {number} • {planName}
            </Text>
          </View>
          
          <Text className="text-gray-800 mb-4 leading-5">{content}</Text>

          {/* Кнопки действий */}
          <View className="flex-row justify-end space-x-4 border-t border-gray-100 pt-2">
            <TouchableOpacity className="flex-row items-center">
              <Icon name="comment-outline" size={22} color="#9CA3AF" />
              <Text className="ml-1 text-gray-500 text-sm">{comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <Icon name="heart-outline" size={22} color="#9CA3AF" />
              <Text className="ml-1 text-gray-500 text-sm">{likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Icon name="share-variant-outline" size={22} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

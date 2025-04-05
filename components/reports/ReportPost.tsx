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
}

export const ReportPost = ({ number, content, date, likes, comments }: ReportPostProps) => {
  return (
    <View className="mb-6 bg-white bg-opacity-90 rounded-lg p-4">
      <View className="flex-row items-start">
        {/* Аватар с номером */}
        <View className="relative">
          <Image
            source={require("@/assets/defaultImage/defaultProfileImage.png")}
            className="w-12 h-12 rounded-lg"
          />
          <View className="absolute bottom-0 right-0 bg-white rounded-full w-6 h-6 items-center justify-center border border-purple-200">
            <Text className="text-xs font-bold" style={{ color: "#6A0DAD" }}>
              {number}
            </Text>
          </View>
        </View>

        {/* Контент */}
        <View className="flex-1 ml-3">
          <View className="flex-row items-center mb-1">
            <Text className="font-semibold text-lg">Anonymous</Text>
            <Text className="text-gray-400 text-sm ml-2">{date}</Text>
          </View>
          <Text className="text-gray-800 mb-3">{content}</Text>

          {/* Кнопки действий */}
          <View className="flex-row justify-between">
            <TouchableOpacity>
              <Icon name="dots-horizontal" size={24} color="#9CA3AF" />
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <Icon name="comment-outline" size={24} color="#9CA3AF" />
              <Text className="ml-1 text-gray-400">{comments}</Text>
            </TouchableOpacity>

            <TouchableOpacity className="flex-row items-center">
              <Icon name="heart-outline" size={24} color="#9CA3AF" />
              <Text className="ml-1 text-gray-400">{likes}</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Icon name="link-variant" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
};

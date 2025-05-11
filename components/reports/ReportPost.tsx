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
    <View className="mb-6 bg-white bg-opacity-90 rounded-lg p-4 shadow-md">
      <View className="flex-row items-start">
        {/* Аватар с номером */}
        <View className="relative mr-3">
          <Image
            source={require("@/assets/defaultImage/defaultProfileImage.png")}
            className="w-14 h-14 rounded-lg border border-purple-200"
          />
          <View className="absolute bottom-0 right-0 bg-purple-600 rounded-full w-6 h-6 items-center justify-center border border-white">
            <Text className="text-xs font-bold text-white">
              {number}
            </Text>
          </View>
        </View>

        {/* Контент */}
        <View className="flex-1">
          <View className="flex-row items-center justify-between mb-2">
            <View className="flex-row items-center">
              <Text className="font-bold text-lg text-purple-900">Anonymous</Text>
              <Text className="text-gray-400 text-xs ml-2 mt-1">{date}</Text>
            </View>
            <TouchableOpacity>
              <Icon name="dots-horizontal" size={20} color="#9CA3AF" />
            </TouchableOpacity>
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

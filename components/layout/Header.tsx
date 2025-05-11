import React, { useState } from "react";
import { View, TouchableOpacity, Platform } from "react-native";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { SettingsModal } from "@/components/modals/SettingsModal";

interface HeaderProps {
  title: string;
  onInfoPress?: () => void;
  onBookPress?: () => void;
}

export const Header = ({ title, onInfoPress, onBookPress }: HeaderProps) => {
  const [showSettings, setShowSettings] = useState(false);
  const isWeb = Platform.OS === 'web';

  return (
    <>
      <View className={`py-4 px-5 border-b border-purple-100 flex-row justify-between items-center bg-white bg-opacity-95 shadow-sm ${isWeb ? 'sticky top-0 z-10' : ''}`}>
        <TouchableOpacity onPress={onInfoPress} className="relative">
          <View className="w-10 h-10 bg-purple-100 rounded-md items-center justify-center">
            <Icon name="information" size={22} color="#6A0DAD" />
          </View>
          <View className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full items-center justify-center">
            <Text className="text-[10px] font-bold text-white">1</Text>
          </View>
        </TouchableOpacity>

        <View className="flex items-center">
          <Text className="text-xl font-bold text-purple-900">{title}</Text>
          <View className="h-1 w-10 bg-purple-500 rounded-full mt-1" />
        </View>

        {title === "Profile" ? (
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <View className="w-10 h-10 bg-purple-100 rounded-md items-center justify-center">
              <Icon name="cog" size={22} color="#6A0DAD" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBookPress}>
            <View className="w-10 h-10 bg-purple-100 rounded-md items-center justify-center">
              <Icon name="book-outline" size={22} color="#6A0DAD" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <SettingsModal isVisible={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

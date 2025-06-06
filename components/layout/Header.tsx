import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
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

  return (
    <>
      <View className="p-4 border-b border-gray-200 flex-row justify-between items-center bg-white bg-opacity-90">
        <TouchableOpacity onPress={onInfoPress}>
          <View className="w-10 h-10 bg-blue-100 rounded-md items-center justify-center">
            <Icon name="information" size={24} color="#4B5563" />
          </View>
        </TouchableOpacity>

        <Text className="text-xl font-semibold">{title}</Text>

        {title === "Profile" ? (
          <TouchableOpacity onPress={() => setShowSettings(true)}>
            <View className="w-10 h-10 bg-blue-100 rounded-md items-center justify-center">
              <Icon name="cog" size={24} color="#4B5563" />
            </View>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={onBookPress}>
            <View className="w-10 h-10 bg-blue-100 rounded-md items-center justify-center">
              <Icon name="book-outline" size={24} color="#4B5563" />
            </View>
          </TouchableOpacity>
        )}
      </View>

      <SettingsModal isVisible={showSettings} onClose={() => setShowSettings(false)} />
    </>
  );
};

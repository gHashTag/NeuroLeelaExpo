import React, { useState } from "react";
import { View, TouchableOpacity, Image, ImageSourcePropType } from "react-native";
import { BlurView } from "expo-blur";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { Text } from "@/components/ui/text";
import { SettingsModal } from "@/components/modals/SettingsModal";

interface ProfileHeaderProps {
  username: string;
  number: string;
  avatar?: ImageSourcePropType;
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  username,
  number,
  avatar = require("@/assets/defaultImage/defaultProfileImage.png"),
}) => {
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);

  return (
    <>
      <BlurView intensity={60} tint="light" className="border-b border-gray-200">
        <View className="p-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={() => setIsSettingsModalVisible(true)}>
            <View className="w-10 h-10 bg-blue-100/80 rounded-xl items-center justify-center backdrop-blur-lg">
              <Icon name="cog" size={24} color="#4B5563" />
            </View>
          </TouchableOpacity>

          {/* Профиль пользователя */}
          <View className="items-center flex-row">
            <Text className="text-3xl font-bold mr-3" style={{ color: "#6A0DAD" }}>
              {number}
            </Text>
            <View className="w-10 h-10 rounded-xl overflow-hidden border border-purple-200">
              <Image source={avatar} style={{ width: "100%", height: "100%" }} resizeMode="cover" />
            </View>
            <Text className="text-xl font-semibold ml-3">{username}</Text>
          </View>

          <TouchableOpacity>
            <View className="w-10 h-10 bg-blue-100/80 rounded-xl items-center justify-center backdrop-blur-lg">
              <Icon name="information" size={24} color="#4B5563" />
            </View>
          </TouchableOpacity>
        </View>
      </BlurView>

      <SettingsModal
        isVisible={isSettingsModalVisible}
        onClose={() => setIsSettingsModalVisible(false)}
      />
    </>
  );
};

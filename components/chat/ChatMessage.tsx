import React from "react";
import { View, Image, ActivityIndicator } from "react-native";
import { Text } from "@/components/ui/text";

interface ChatMessageProps {
  content: string;
  timestamp: string;
  isUser: boolean;
  loading?: boolean;
}

export const ChatMessage = ({ content, timestamp, isUser, loading }: ChatMessageProps) => {
  return (
    <View className="mb-4 w-full">
      <View className={`flex-row ${isUser ? "justify-end" : "justify-start"}`}>
        {!isUser && (
          <View className="absolute bottom-0 left-0">
            <Image
              source={require("@/assets/defaultImage/leelaAI.jpg")}
              className="w-10 h-10 rounded-full"
            />
          </View>
        )}
        <View
          className={`rounded-3xl p-3 ${isUser ? "bg-purple-500" : "bg-gray-100 ml-12"}`}
          style={{
            maxWidth: "75%",
            alignSelf: isUser ? "flex-end" : "flex-start",
            flexShrink: 1,
          }}
        >
          {loading ? (
            <ActivityIndicator color="#6A0DAD" />
          ) : (
            <>
              <Text className={isUser ? "text-white" : "text-gray-800"}>{content}</Text>
              <Text className={`text-xs mt-1 ${isUser ? "text-purple-200" : "text-gray-500"}`}>
                {timestamp}
              </Text>
            </>
          )}
        </View>
      </View>
    </View>
  );
};

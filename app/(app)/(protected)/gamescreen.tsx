import React, { useState } from "react";
import { View, ImageBackground } from "react-native";
import { Display, Dice, GameBoard, Space } from "@components/ui/index";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

const GameScreen: React.FC = () => {
  // const [isLoading, setLoading] = useState(false)
  // const { t } = useTranslation()
  // const [account] = useAccount()
  const [lastRoll, setLastRoll] = useState(1);
  const { userData, getAvatarUrl } = useSupabase();

  const { currentPlayer, rollDice, message } = {
    currentPlayer: {
      id: "1",
      fullName: "Player One",
      plan: 1,
      avatar: userData?.pinata_avatar_id
        ? getAvatarUrl(userData.pinata_avatar_id)
        : require("@/assets/defaultImage/defaultProfileImage.png"),
      intention: "Win the game",
      previousPlan: 0,
      isStart: true,
      isFinished: false,
      consecutiveSixes: 0,
      positionBeforeThreeSixes: 0,
      message: "Ready to play",
    },
    // lastRoll: 3,
    rollDice: () => {
      const roll = Math.floor(Math.random() * 6) + 1;
      setLastRoll(roll);
      router.push("/(app)/report");
      return roll;
    },
    message: userData?.designation || "",
  };

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      <View className="flex-1 items-center">
        <Space height={30} />
        <Display title={message} />
        <Space height={20} />
        <GameBoard players={[currentPlayer]} />
        <Space height={10} />
        <View className="bg-white rounded-lg p-2">
          <Dice rollDice={rollDice} lastRoll={lastRoll} size="medium" />
        </View>
        <Space height={300} />
      </View>
    </ImageBackground>
  );
};

export default GameScreen;

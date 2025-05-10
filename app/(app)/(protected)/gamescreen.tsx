import React, { useState } from "react";
import { View, ImageBackground, Platform, StyleSheet, Text, Image, Dimensions } from "react-native";
import { Display, Dice, GameBoard, Space } from "@components/ui/index";
import { router } from "expo-router";
import { useSupabase } from "@/context/supabase-provider";
import { BlurView } from "expo-blur";
// import { useTranslation } from 'react-i18next'
// import { useAccount } from 'store'

// Logo component for the app
const AppLogo = () => (
  <View className="flex-row items-center">
    <View className="w-10 h-10 rounded-full overflow-hidden bg-purple-200 border-2 border-purple-300 shadow-sm">
      <Image 
        source={require('@/assets/icons/1024.png')} 
        className="w-full h-full"
        resizeMode="cover"
      />
    </View>
    <Text className="text-2xl font-bold ml-3 text-purple-800">НейроЛила</Text>
  </View>
);

const GameScreen: React.FC = () => {
  // const [isLoading, setLoading] = useState(false)
  // const { t } = useTranslation()
  // const [account] = useAccount()
  const [lastRoll, setLastRoll] = useState(1);
  const { userData, getAvatarUrl } = useSupabase();
  const isWeb = Platform.OS === 'web';
  const screenHeight = Dimensions.get('window').height;

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

  // Custom header component
  const AppHeader = () => (
    <BlurView intensity={60} tint="light" className="border-b border-gray-200/50 py-4 px-5">
      <View className="flex-row items-center justify-center">
        <AppLogo />
      </View>
    </BlurView>
  );

  const MainContent = () => (
    <View className={`flex-1 items-center ${isWeb ? 'py-8 px-4' : ''}`}>
      {/* Intro message display */}
      <View className={`w-full max-w-lg ${isWeb ? 'mb-8' : 'mb-4'}`}>
        <Display title={message} />
      </View>
      
      {/* Game board container with enhanced styling */}
      <View className={`w-full ${isWeb ? 'max-w-2xl' : ''} bg-white/20 backdrop-blur-md rounded-xl overflow-hidden shadow-lg mb-6`}>
        <GameBoard players={[currentPlayer]} />
      </View>
      
      {/* Dice control with better styling */}
      <View className="bg-white rounded-xl p-4 shadow-md border border-purple-100">
        <Dice rollDice={rollDice} lastRoll={lastRoll} size="medium" />
      </View>
    </View>
  );

  if (isWeb) {
    return (
      <View className="flex-1 bg-purple-50/30">
        <View className="max-w-5xl mx-auto w-full h-full flex-1">
          <AppHeader />
          <MainContent />
        </View>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      className="flex-1"
      resizeMode="cover"
    >
      <AppHeader />
      <MainContent />
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  webContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    maxWidth: 1200,
    marginHorizontal: 'auto',
    width: '100%',
    minHeight: '100vh',
  },
  contentContainer: {
    flex: 1,
    alignItems: 'center',
  },
  webContentContainer: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 20,
  },
  diceContainer: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(229, 231, 235, 0.5)',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  logoText: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 12,
    color: '#6A0DAD',
  }
});

export default GameScreen;

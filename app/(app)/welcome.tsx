import { useRouter } from "expo-router";
import React from "react";
import { View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { Image } from "@/components/image";
import { SafeAreaView } from "@/components/safe-area-view";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { H1, Muted } from "@/components/ui/typography";

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <LinearGradient colors={["#1a1a1a", "#2a1a2a"]} className="flex-1">
      <SafeAreaView className="flex flex-1">
        <View className="flex flex-1 items-center justify-center px-4 web:px-0">
          <View className="w-full max-w-md bg-black/20 backdrop-blur-lg rounded-3xl p-8 web:p-12 shadow-2xl">
            <View className="flex items-center space-y-8">
              <Image
                source={require("@/assets/icon.png")}
                className="w-32 h-32 web:w-40 web:h-40 rounded-3xl shadow-lg transform hover:scale-105 transition-transform duration-300"
                style={{
                  shadowColor: "#6366f1",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 10,
                }}
              />

              <View className="space-y-4">
                <H1 className="text-center text-3xl web:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  Welcome to Leela Chakra!
                </H1>
                <Muted className="text-center text-base web:text-lg text-gray-300 leading-relaxed">
                  Embark on the ancient journey of self-discovery with the mysteries of Leela
                  Chakra.
                </Muted>
              </View>

              <View className="w-full space-y-4 mt-8">
                <Button
                  size="lg"
                  variant="default"
                  className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 transform hover:scale-105 transition-all duration-300 shadow-lg shadow-indigo-500/25"
                  onPress={() => router.push("/sign-up")}
                >
                  <Text className="text-lg font-semibold">Sign Up</Text>
                </Button>

                <Button
                  size="lg"
                  variant="secondary"
                  className="w-full bg-white/10 backdrop-blur-lg hover:bg-white/20 transform hover:scale-105 transition-all duration-300"
                  onPress={() => router.push("/sign-in")}
                >
                  <Text className="text-lg font-semibold">Sign In</Text>
                </Button>
              </View>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </LinearGradient>
  );
}

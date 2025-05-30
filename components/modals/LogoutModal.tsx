import React from "react";
import { Modal, View, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";
import { Text } from "@/components/ui/text";
import { ModalButton } from "@/components/ui/modal-button";
import { useSupabase } from "@/context/supabase-provider";

interface LogoutModalProps {
  isVisible: boolean;
  onClose: () => void;
}

export const LogoutModal: React.FC<LogoutModalProps> = ({ isVisible, onClose }) => {
  const { signOut } = useSupabase();

  return (
    <Modal animationType="fade" transparent={true} visible={isVisible} onRequestClose={onClose}>
      <BlurView intensity={50} tint="light" style={StyleSheet.absoluteFill}>
        <View className="flex-1 justify-center items-center px-4">
          <View
            className="w-[90%] max-w-sm rounded-3xl overflow-hidden bg-white"
            style={{
              shadowColor: "#000",
              shadowOffset: {
                width: 0,
                height: 8,
              },
              shadowOpacity: 0.2,
              shadowRadius: 16,
              elevation: 5,
            }}
          >
            <View className="items-center py-8 px-6">
              <Text className="text-xl font-semibold mb-2 text-gray-800">Выйти из аккаунта?</Text>
              <Text className="text-gray-500 text-center text-base mb-8">
                Вы уверены, что хотите выйти из своего аккаунта?
              </Text>

              <View className="w-full space-y-4">
                <ModalButton onPress={signOut}>Выйти</ModalButton>

                <ModalButton variant="secondary" onPress={onClose}>
                  Отмена
                </ModalButton>
              </View>
            </View>
          </View>
        </View>
      </BlurView>
    </Modal>
  );
};

import React, { useState } from 'react';
import { Modal, View, TouchableOpacity } from 'react-native';
import { Text } from '@/components/ui/text';
import { useSupabase } from '@/context/supabase-provider';

interface SettingsModalProps {
  isVisible: boolean;
  onClose: () => void;
}

interface ConfirmationModalProps {
  isVisible: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal = ({ isVisible, onClose, onConfirm, title, message }: ConfirmationModalProps) => (
  <Modal
    visible={isVisible}
    transparent
    animationType="fade"
  >
    <View className="flex-1 justify-center items-center bg-black/50">
      <View className="bg-white rounded-2xl p-8 w-[95%] max-w-md">
        <Text className="text-xl font-bold mb-2">{title}</Text>
        <Text className="text-gray-600 mb-8">{message}</Text>
        <View className="flex-row justify-end gap-8">
          <TouchableOpacity
            onPress={onClose}
            className="bg-gray-100 px-8 py-3 rounded-xl"
          >
            <Text className="text-gray-800 font-medium text-base">Нет</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={onConfirm}
            className="bg-gray-800 px-8 py-3 rounded-xl"
          >
            <Text className="text-white font-medium text-base">Да</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>
);

export const SettingsModal = ({ isVisible, onClose }: SettingsModalProps) => {
  const { signOut, deleteAccount } = useSupabase();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const handleLogout = async () => {
    await signOut();
    onClose();
  };

  const handleDeleteAccount = async () => {
    await deleteAccount();
    onClose();
  };

  return (
    <>
      <Modal
        visible={isVisible}
        transparent
        animationType="fade"
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white rounded-2xl p-8 w-[95%] max-w-md">
            <Text className="text-2xl font-bold mb-8 text-center">Настройки</Text>
            <View className="space-y-4">
              <TouchableOpacity
                onPress={() => setShowDeleteModal(true)}
                className="bg-red-500 px-6 py-3 rounded-xl mb-2"
              >
                <Text className="text-white text-center font-medium text-lg">Удалить аккаунт</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowLogoutModal(true)}
                className="bg-gray-800 px-6 py-3 rounded-xl mb-2"
              >
                <Text className="text-white text-center font-medium text-lg">Выйти из аккаунта</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={onClose}
                className="px-6 py-3 rounded-xl mb-2"
              >
                <Text className="text-gray-800 text-center font-medium text-lg">Отмена</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <ConfirmationModal
        isVisible={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleLogout}
        title="Выход из аккаунта"
        message="Вы уверены, что хотите выйти из аккаунта?"
      />

      <ConfirmationModal
        isVisible={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        title="Удаление аккаунта"
        message="Вы уверены, что хотите удалить аккаунт? Это действие нельзя отменить."
      />
    </>
  );
}; 
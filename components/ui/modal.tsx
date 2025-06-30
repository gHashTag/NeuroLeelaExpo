import { View, Modal as RNModal, TouchableOpacity } from "react-native";
import { Text } from "./text";
import { Button } from "./button";

type Action = {
  label: string;
  onPress: () => void;
  variant?: "default" | "destructive" | "outline";
};

type ModalProps = {
  visible: boolean;
  onClose: () => void;
  title: string;
  description: string;
  actions: Action[];
};

export function Modal({ visible, onClose, title, description, actions }: ModalProps) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          className="bg-white rounded-lg p-4 m-4 w-full max-w-sm"
          onStartShouldSetResponder={() => true}
        >
          <Text className="text-xl font-bold mb-2">{title}</Text>
          <Text className="text-gray-600 mb-4">{description}</Text>

          <View className="flex-row justify-end gap-2">
            {actions.map((action, index) => (
              <Button key={`modal-action-${action.label}-${index}`} variant={action.variant || "default"} onPress={action.onPress}>
                <Text className={action.variant === "outline" ? "text-primary" : "text-white"}>
                  {action.label}
                </Text>
              </Button>
            ))}
          </View>
        </View>
      </TouchableOpacity>
    </RNModal>
  );
}

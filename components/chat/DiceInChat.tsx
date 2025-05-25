import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface DiceInChatProps {
  onRoll: () => Promise<number>;
  lastRoll: number;
  disabled?: boolean;
  message?: string;
}

export const DiceInChat: React.FC<DiceInChatProps> = ({ 
  onRoll, 
  lastRoll, 
  disabled = false,
  message = "Бросьте кубик для следующего хода"
}) => {
  const getDiceIcon = (value: number) => {
    switch (value) {
      case 1: return "dice-1";
      case 2: return "dice-2";
      case 3: return "dice-3";
      case 4: return "dice-4";
      case 5: return "dice-5";
      case 6: return "dice-6";
      default: return "dice-1";
    }
  };

  return (
    <View className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 m-2 border border-purple-200">
      <Text className="text-center text-gray-700 text-sm mb-3">
        {message}
      </Text>
      
      <View className="items-center">
        <TouchableOpacity
          onPress={onRoll}
          disabled={disabled}
          className={`w-16 h-16 rounded-xl items-center justify-center shadow-lg ${
            disabled 
              ? 'bg-gray-300' 
              : 'bg-gradient-to-br from-purple-500 to-blue-500 active:scale-95'
          }`}
          style={{
            transform: [{ scale: disabled ? 0.9 : 1 }],
          }}
        >
          <Ionicons 
            name={getDiceIcon(lastRoll) as any} 
            size={32} 
            color="white" 
          />
        </TouchableOpacity>
        
        {lastRoll > 0 && (
          <Text className="text-center text-gray-600 text-xs mt-2">
            Последний бросок: {lastRoll}
          </Text>
        )}
      </View>
      
      {disabled && (
        <Text className="text-center text-gray-500 text-xs mt-2">
          📝 Сначала напишите отчет о текущем состоянии
        </Text>
      )}
    </View>
  );
}; 
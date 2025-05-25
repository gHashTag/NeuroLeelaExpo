import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ReportRequestProps {
  planNumber: number;
  planName: string;
  prompt: string;
  onSubmit: (content: string) => void;
  onCancel?: () => void;
}

export const ReportRequest: React.FC<ReportRequestProps> = ({
  planNumber,
  planName,
  prompt,
  onSubmit,
  onCancel
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content.trim());
      setContent('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 m-2 border border-orange-200">
      <View className="flex-row items-center mb-3">
        <View className="w-8 h-8 rounded-full bg-orange-500 items-center justify-center mr-3">
          <Text className="text-white font-bold text-sm">{planNumber}</Text>
        </View>
        <View className="flex-1">
          <Text className="font-medium text-gray-800">📝 Время для отчета!</Text>
          <Text className="text-sm text-gray-600">{planName}</Text>
        </View>
      </View>

      <Text className="text-sm text-gray-700 mb-3 italic">
        {prompt}
      </Text>

      <TextInput
        value={content}
        onChangeText={setContent}
        multiline
        placeholder="Поделитесь своими мыслями и наблюдениями..."
        placeholderTextColor="#9ca3af"
        className="bg-white border border-gray-200 rounded-lg p-3 min-h-[80px] text-gray-800 mb-3"
        style={{
          textAlignVertical: 'top',
          fontFamily: 'Inter, system-ui, sans-serif',
        }}
      />

      <View className="flex-row justify-end space-x-2">
        {onCancel && (
          <TouchableOpacity
            onPress={onCancel}
            disabled={isSubmitting}
            className="px-4 py-2 rounded-lg border border-gray-300"
          >
            <Text className="text-gray-600">Отмена</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!content.trim() || isSubmitting}
          className={`px-4 py-2 rounded-lg flex-row items-center ${
            !content.trim() || isSubmitting 
              ? 'bg-gray-300' 
              : 'bg-gradient-to-r from-orange-500 to-yellow-500'
          }`}
        >
          <Ionicons 
            name={isSubmitting ? "hourglass" : "checkmark"} 
            size={16} 
            color="white" 
            style={{ marginRight: 4 }}
          />
          <Text className="text-white font-medium">
            {isSubmitting ? "Сохранение..." : "Отправить отчет"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}; 
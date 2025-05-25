import React, { useCallback } from 'react';
import { View, Text, ActivityIndicator, TouchableOpacity, StyleSheet } from 'react-native';
import { useApolloDrizzle } from '@/hooks/useApolloDrizzle';

// Array of chakra level descriptions keyed by plan number
// These are simplified descriptions; real ones should be loaded from a data source
const CHAKRA_DESCRIPTIONS: { [key: number]: { chakra: string, description: string } } = {
  // First chakra (Muladhara)
  1: { 
    chakra: "Первая чакра (Муладхара)", 
    description: "Чакра жизненной силы, находится у основания позвоночника. На этом уровне игрок занят вопросами выживания и безопасности."
  },
  // Second chakra (Svadhisthana)
  10: { 
    chakra: "Вторая чакра (Свадхистана)", 
    description: "Чакра творчества и чувственных удовольствий. Центр расположен в области гениталий. Игрок вовлечен в восприятие, приходящее от чувств."
  },
  // Third chakra (Manipura)
  19: { 
    chakra: "Третья чакра (Манипура)", 
    description: "Центр силы, расположенный в области солнечного сплетения. Главная характеристика - необходимость признания своего эго и желание телесного бессмертия."
  },
  // Fourth chakra (Anahata)
  28: { 
    chakra: "Четвертая чакра (Анахата)", 
    description: "Сердечная чакра. Игрок начинает осознавать элементы своей кармы, своего поведения и структуру своей жизни."
  },
  // Fifth chakra (Vishudha)
  37: { 
    chakra: "Пятая чакра (Вишудха)", 
    description: "Чакра знания (джняна), расположена в горле. Игрок полон сострадания и хочет поделиться с другими тем, как ему удалось разрешить элементы его кармы."
  },
  // Sixth chakra (Ajna)
  46: { 
    chakra: "Шестая чакра (Аджна)", 
    description: "Центр управления движением, называемый аджна-чакрой. Игрок на этом уровне не имеет никаких проблем - фактически, он находится за пределами возможности каких-либо проблем."
  },
  // Seventh chakra (Sahasrara)
  55: { 
    chakra: "Седьмая чакра (Сахасрара)", 
    description: "Находится на макушке головы. Непривязанность - главная характеристика. Игрок освобождается от цикла перерождений."
  },
  // Plan of the Absolute (Brahma-loka)
  64: { 
    chakra: "План Абсолюта (Брахма-лока)", 
    description: "Уровень выше всех планов творения. Игрок, достигший этого места, сливается с этой абсолютной силой, этим тонким принципом."
  },
  // Plan of Vaikuntha (Vishnu's abode)
  68: {
    chakra: "План Вайкунтхи",
    description: "Обитель Господа Вишну, хранителя вселенной. Здесь игрок находится в божественном состоянии блаженства и гармонии."
  },
  // Plan of the Absolute (Brahma-loka)
  69: { 
    chakra: "План Абсолюта (Брахма-лока)", 
    description: "Начальная точка игры. С одной стороны находится Рудра-лока, с другой - Брахма-лока. Вместе они образуют триаду Брахмы, Вишну и Шивы в центре верхнего ряда игровой доски."
  },
  // Cosmic Consciousness
  72: { 
    chakra: "Космическое Сознание", 
    description: "Конечная цель игры - достижение Космического Сознания, когда игрок осознает свою истинную природу и единство со всем сущим."
  }
};

// Helper function to get chakra info based on plan position
const getChakraInfo = (position: number) => {
  // Find the nearest lower key in the CHAKRA_DESCRIPTIONS
  const keys = Object.keys(CHAKRA_DESCRIPTIONS).map(Number).sort((a, b) => a - b);
  const nearestKey = keys.reduce((prev, curr) => {
    return (curr <= position && curr > prev) ? curr : prev;
  }, 0);
  
  return CHAKRA_DESCRIPTIONS[nearestKey] || {
    chakra: "Уровень неизвестен",
    description: "Для этого уровня нет описания"
  };
};

export const PlayerInfoConsolidated = () => {
  const { currentPlayer, isLoading, error, movePlayer } = useApolloDrizzle();

  // Safe handler for moving
  const handleMove = useCallback(async (newPosition: number) => {
    try {
      await movePlayer(newPosition);
    } catch (error) {
      console.error('Error moving player:', error);
    }
  }, [movePlayer]);

  if (isLoading) {
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <ActivityIndicator size="small" color="#3B82F6" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-red-500">{error}</Text>
      </View>
    );
  }

  if (!currentPlayer) {
    return (
      <View className="bg-white rounded-lg p-4 shadow-sm">
        <Text className="text-gray-500">Данные игрока не найдены</Text>
      </View>
    );
  }

  // Get chakra information based on current position
  const chakraInfo = getChakraInfo(currentPlayer.plan);
  
  // Calculate highest position
  const highestPosition = currentPlayer.plan > (currentPlayer.previous_plan || 0) 
    ? currentPlayer.plan 
    : (currentPlayer.previous_plan || 0);

  return (
    <View className="bg-white rounded-lg p-2 shadow-sm">
      <Text className="text-base font-medium text-gray-700 mb-2">Путешествие Души</Text>
      
      <View className="space-y-2">
        {/* Current Position Card with Chakra Information */}
        <View className="bg-blue-50 p-2 rounded-lg">
          <View className="flex-row justify-between items-center mb-1">
            <Text className="text-blue-800 text-sm font-medium">План:</Text>
            <View className="bg-blue-500 px-2 py-1 rounded-full">
              <Text className="font-bold text-white text-sm">{currentPlayer.plan}</Text>
            </View>
          </View>
          
          <Text className="text-blue-700 text-xs font-medium mb-1">{chakraInfo.chakra}</Text>
          <Text className="text-blue-600 text-xs">{chakraInfo.description}</Text>
        </View>
        
        {/* Player Stats - Compact */}
        <View className="flex-row justify-between">
          <View className="bg-gray-50 px-2 py-2 rounded-lg flex-1 mr-1">
            <Text className="text-gray-500 text-xs mb-1">Наивысшая</Text>
            <Text className="text-gray-700 text-sm font-medium">{highestPosition}</Text>
          </View>
          
          <View className="bg-gray-50 px-2 py-2 rounded-lg flex-1 ml-1">
            <Text className="text-gray-500 text-xs mb-1">Предыдущая</Text>
            <Text className="text-gray-700 text-sm font-medium">{currentPlayer.previous_plan || 0}</Text>
          </View>
        </View>
        
        {/* Player Message - if available, make compact */}
        {currentPlayer.message && (
          <View className="bg-gray-50 p-2 rounded-lg">
            <Text className="text-gray-600 text-xs mb-0.5">Сообщение:</Text>
            <Text className="text-gray-700 text-xs">{currentPlayer.message}</Text>
          </View>
        )}
        
        {/* Movement Actions */}
        <View className="pt-1">
          <Text className="text-gray-600 text-xs mb-1">Действия:</Text>
          <View className="flex-row space-x-2">
            <TouchableOpacity 
              onPress={() => handleMove(currentPlayer.plan + 1)}
              className="bg-blue-500 flex-1 rounded-lg shadow-sm"
            >
              <Text className="text-white font-medium py-1 text-center text-xs">
                Шаг вперед
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              onPress={() => handleMove(1)}
              className="bg-gray-500 flex-1 rounded-lg shadow-sm"
            >
              <Text className="text-white font-medium py-1 text-center text-xs">
                В начало
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}; 
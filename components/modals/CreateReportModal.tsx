import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Image, Modal as RNModal, Alert } from "react-native";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { LinearGradient } from "expo-linear-gradient";

interface CreateReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  currentPlanNumber: number; // Добавлено: текущий номер плана игрока
}

interface PlanInfo {
  level: number;
  name: string;
  color: string;
  chakraName: string;
  icon: string;
  description: string;
  prompt: string;
  secondDecoration: string;
}

export const CreateReportModal = ({ isVisible, onClose, onSuccess, currentPlanNumber }: CreateReportModalProps) => {
  const { user } = useSupabase();
  
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Обновление информации о плане на основе текущей позиции игрока
  useEffect(() => {
    if (currentPlanNumber) {
      const num = currentPlanNumber;
      if (num >= 1 && num <= 72) {
        const planLevel = Math.ceil(num / 9); // Определяем уровень (1-8)
        
        // Определяем название, цвет и описание плана на основе уровня
        const planInfo = getPlanInfo(planLevel, num);
        setPlanInfo(planInfo);
      }
    }
  }, [currentPlanNumber]);

  // Функция для получения полной информации о плане
  const getPlanInfo = (level: number, num: number): PlanInfo => {
    let name, color, chakraName, icon, description, prompt, secondDecoration;
    
    switch(level) {
      case 1: // 1-9
        name = "Физический план";
        chakraName = "Муладхара";
        color = "#ef4444"; // red-500
        icon = "meditation";
        secondDecoration = "hexagram-outline";
        description = "Муладхара чакра - корневой центр, отвечающий за выживание, стабильность и безопасность.";
        prompt = "Опишите физические ощущения и материальные наблюдения в этой точке вашего путешествия...";
        break;
      case 2: // 10-18
        name = "Астральный план";
        chakraName = "Свадхистана";
        color = "#f97316"; // orange-500
        icon = "water";
        secondDecoration = "waves";
        description = "Свадхистана чакра - центр творчества, эмоций и чувственности.";
        prompt = "Какие эмоции и творческие порывы вы испытываете на этом астральном уровне?";
        break;
      case 3: // 19-27
        name = "Небесный план";
        chakraName = "Манипура";
        color = "#eab308"; // yellow-500
        icon = "white-balance-sunny";
        secondDecoration = "fire";
        description = "Манипура чакра - центр личной силы, трансформации и энергии.";
        prompt = "Как проявляется ваша внутренняя сила и воля в этой точке путешествия?";
        break;
      case 4: // 28-36
        name = "План баланса";
        chakraName = "Анахата";
        color = "#22c55e"; // green-500
        icon = "heart-outline";
        secondDecoration = "flower-outline";
        description = "Анахата чакра - сердечный центр, источник любви, сострадания и гармонии.";
        prompt = "Как вы ощущаете равновесие между материальным и духовным на этом плане? Что говорит ваше сердце?";
        break;
      case 5: // 37-45
        name = "Человеческий план";
        chakraName = "Вишудха";
        color = "#3b82f6"; // blue-500
        icon = "message-outline";
        secondDecoration = "butterfly-outline";
        description = "Вишудха чакра - горловой центр, связанный с самовыражением и истинным голосом души.";
        prompt = "Какую истину вы готовы выразить на этом уровне? Что открывается вам в чистом общении?";
        break;
      case 6: // 46-54
        name = "План аскетизма";
        chakraName = "Аджна";
        color = "#6366f1"; // indigo-500
        icon = "eye-outline";
        secondDecoration = "crystal-ball";
        description = "Аджна чакра - третий глаз, центр интуиции, мудрости и духовного видения.";
        prompt = "Что открывается вашему внутреннему взору? Какие духовные прозрения вы получаете?";
        break;
      case 7: // 55-63
        name = "План сознания";
        chakraName = "Сахасрара";
        color = "#a855f7"; // purple-500
        icon = "star-four-points";
        secondDecoration = "star-face";
        description = "Сахасрара чакра - коронный центр, связь с высшим сознанием и божественной мудростью.";
        prompt = "Как изменилось ваше сознание на этом высоком плане? Опишите ощущение связи с высшими силами...";
        break;
      case 8: // 64-72
        name = "Абсолютный план";
        chakraName = "Нирвана";
        color = "#ec4899"; // pink-500
        icon = "shimmer";
        secondDecoration = "lighthouse";
        description = "Нирвана - состояние за пределами обычного восприятия, блаженство единения с абсолютом.";
        prompt = "Опишите переживание единства с Абсолютом и вневременную мудрость, открывшуюся вам...";
        break;
      default:
        name = "Неизвестный план";
        chakraName = "";
        color = "#6A0DAD"; // purple-900
        icon = "feather";
        secondDecoration = "crystal-ball";
        description = "План духовного путешествия.";
        prompt = "Опишите свой опыт и размышления в этой точке путешествия...";
    }
    
    return {
      level,
      name,
      color,
      chakraName,
      icon,
      description,
      prompt,
      secondDecoration
    };
  };

  // Получение второго цвета для градиента
  const getSecondaryColor = (color: string) => {
    switch(color) {
      case "#ef4444": return "#fee2e2"; // red-100
      case "#f97316": return "#ffedd5"; // orange-100
      case "#eab308": return "#fef9c3"; // yellow-100
      case "#22c55e": return "#dcfce7"; // green-100
      case "#3b82f6": return "#dbeafe"; // blue-100
      case "#6366f1": return "#e0e7ff"; // indigo-100
      case "#a855f7": return "#f3e8ff"; // purple-100
      case "#ec4899": return "#fce7f3"; // pink-100
      default: return "#f5f3ff"; // purple-100
    }
  };

  // Отправка отчета в базу данных
  const handleSubmit = async () => {
    if (!user || !content.trim() || !currentPlanNumber) {
      Alert.alert(
        "Ошибка", 
        "Пожалуйста, введите содержание отчета", 
        [{ text: "OK" }]
      );
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          plan_number: currentPlanNumber,
          content: content.trim(),
          likes: 0,
          comments: 0
        });
      
      if (error) {
        console.error("Ошибка при создании отчета:", error);
        Alert.alert(
          "Ошибка", 
          "Не удалось сохранить отчет. Пожалуйста, попробуйте позже.", 
          [{ text: "OK" }]
        );
      } else {
        setContent("");
        Alert.alert(
          "Успешно", 
          "Ваш отчет сохранен", 
          [{ text: "OK", onPress: () => {
            onSuccess();
            onClose();
          }}]
        );
      }
    } catch (error) {
      console.error("Ошибка в handleSubmit:", error);
      Alert.alert(
        "Ошибка", 
        "Произошла техническая ошибка. Пожалуйста, попробуйте позже.", 
        [{ text: "OK" }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!planInfo) return null;

  const secondaryColor = getSecondaryColor(planInfo.color);

  return (
    <RNModal
      visible={isVisible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/30">
        <View className="w-[90%] max-w-md bg-white rounded-xl overflow-hidden">
          <LinearGradient
            colors={[planInfo.color, secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-4"
          >
            <View className="flex-row justify-between items-center mb-2">
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-white/20 items-center justify-center mr-3">
                  <Icon name={planInfo.icon as any} size={24} color="white" />
                </View>
                <View>
                  <Text className="text-white text-lg font-bold">{planInfo.chakraName}</Text>
                  <Text className="text-white/90 text-xs">{planInfo.name}</Text>
                </View>
              </View>
              
              <View className="flex-row items-center">
                <View className="h-8 w-8 rounded-full bg-white/80 items-center justify-center mr-1">
                  <Text className="text-sm font-bold" style={{ color: planInfo.color }}>
                    {currentPlanNumber}
                  </Text>
                </View>
                <TouchableOpacity onPress={onClose} className="h-8 w-8 rounded-full bg-white/20 items-center justify-center">
                  <Icon name="close" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            <View className="relative">
              <Text className="text-white/90 text-sm mb-3">
                {planInfo.description}
              </Text>
              
              {/* Декоративные элементы */}
              <View className="absolute top-5 right-5 opacity-5 rotate-12">
                <Icon name="crystal-ball" size={60} color={planInfo.color} />
              </View>
              <View className="absolute bottom-5 left-5 opacity-5 -rotate-12">
                <Icon name={planInfo.secondDecoration as any} size={60} color={planInfo.color} />
              </View>
            </View>
          </LinearGradient>

          <View className="p-4">
            <ScrollView className="max-h-[200px] mb-4">
              <View className="relative">
                <TextInput
                  value={content}
                  onChangeText={(text) => {
                    setContent(text);
                    setShowPlaceholder(!text);
                  }}
                  multiline
                  className="min-h-[120px] border border-gray-200 rounded-lg p-3 text-gray-800"
                  onFocus={() => setShowPlaceholder(false)}
                  onBlur={() => setShowPlaceholder(!content)}
                  placeholder="Опишите свои мысли и наблюдения..."
                />
                
                {showPlaceholder && (
                  <View className="absolute top-3 left-3 right-3">
                    <Text className="text-gray-400 leading-5">
                      {planInfo.prompt}
                    </Text>
                  </View>
                )}
              </View>
            </ScrollView>
            
            <View className="flex-row justify-end">
              <TouchableOpacity 
                onPress={onClose}
                disabled={isSubmitting}
                className="py-2 px-4 rounded-lg mr-2 border border-gray-200"
              >
                <Text className="text-gray-700">Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={!content.trim() || isSubmitting}
                className={`py-2 px-4 rounded-lg ${
                  !content.trim() || isSubmitting 
                    ? 'bg-gray-300' 
                    : 'bg-gradient-to-r from-purple-500 to-indigo-600'
                }`}
              >
                <Text className="text-white font-medium">
                  {isSubmitting ? "Сохранение..." : "Сохранить"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </RNModal>
  );
}; 
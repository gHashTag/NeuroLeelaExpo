import React, { useState, useEffect } from "react";
import { View, TouchableOpacity, TextInput, ScrollView, Image, Modal as RNModal } from "react-native";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { useSupabase } from "@/context/supabase-provider";
import { supabase } from "@/config/supabase";
import { LinearGradient } from "expo-linear-gradient";

interface CreateReportModalProps {
  isVisible: boolean;
  onClose: () => void;
  onSuccess: () => void;
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

export const CreateReportModal = ({ isVisible, onClose, onSuccess }: CreateReportModalProps) => {
  const { user } = useSupabase();
  
  const [planNumber, setPlanNumber] = useState("1");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [planInfo, setPlanInfo] = useState<PlanInfo | null>(null);
  const [showPlaceholder, setShowPlaceholder] = useState(true);

  // Обновление информации о плане при изменении номера плана
  useEffect(() => {
    if (planNumber) {
      const num = parseInt(planNumber);
      if (!isNaN(num) && num >= 1 && num <= 72) {
        const planLevel = Math.ceil(num / 9); // Определяем уровень (1-8)
        
        // Определяем название, цвет и описание плана на основе уровня
        const planInfo = getPlanInfo(planLevel, num);
        setPlanInfo(planInfo);
      }
    }
  }, [planNumber]);

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
    if (!user || !content.trim() || !planNumber) return;
    
    try {
      setIsSubmitting(true);
      const planNum = parseInt(planNumber);
      
      if (isNaN(planNum) || planNum < 1 || planNum > 72) {
        console.error("Неверный номер плана");
        return;
      }
      
      const { error } = await supabase
        .from("reports")
        .insert({
          user_id: user.id,
          plan_number: planNum,
          content: content.trim(),
        });
      
      if (error) {
        console.error("Ошибка при создании отчета:", error);
      } else {
        setContent("");
        setPlanNumber("1");
        onSuccess();
      }
    } catch (error) {
      console.error("Ошибка в handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!planInfo) return null;

  const secondaryColor = getSecondaryColor(planInfo.color);

  return (
    <RNModal visible={isVisible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        className="flex-1 justify-center items-center bg-black/50"
        activeOpacity={1}
        onPress={onClose}
      >
        <View
          className="bg-white rounded-lg m-4 w-full max-w-lg"
          onStartShouldSetResponder={() => true}
        >
          <LinearGradient
            colors={['#ffffff', secondaryColor]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            className="p-5 rounded-2xl shadow-lg"
          >
            {/* Декоративные элементы */}
            <View className="absolute top-5 right-5 opacity-5 rotate-12">
              <Icon name="crystal-ball" size={60} color={planInfo.color} />
            </View>
            <View className="absolute bottom-5 left-5 opacity-5 -rotate-12">
              <Icon name="feather" size={40} color={planInfo.color} />
            </View>
            <View className="absolute top-1/3 right-10 opacity-5">
              <Icon name="star" size={50} color={planInfo.color} />
            </View>
            
            {/* Тонкая линия градиента сверху */}
            <LinearGradient
              colors={[planInfo.color, 'transparent']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="absolute top-0 left-0 right-0 h-1 rounded-t-2xl"
            />
            
            <View className="flex-row justify-between items-center mb-4">
              <View className="flex-row items-center">
                <LinearGradient
                  colors={[`${planInfo.color}30`, `${secondaryColor}90`]}
                  className="w-12 h-12 rounded-full items-center justify-center mr-3"
                >
                  <Icon name="meditation" size={24} color={planInfo.color} />
                </LinearGradient>
                <View>
                  <Text className="text-xl font-bold text-gray-800">Духовный опыт</Text>
                  <View className="flex-row items-center mt-1">
                    <Text style={{ color: planInfo.color }} className="text-xs font-medium">
                      План {planNumber} • {planInfo.chakraName}
                    </Text>
                  </View>
                </View>
              </View>
              <TouchableOpacity onPress={onClose}>
                <Icon name="close" size={24} color="#9CA3AF" />
              </TouchableOpacity>
            </View>

            {/* Блок для ввода номера плана */}
            <View className="mb-4">
              <Text className="mb-2 text-sm font-medium text-gray-700">Номер плана (1-72)</Text>
              <View className="flex-row items-center">
                <TextInput
                  className="bg-white py-2 px-3 border border-gray-200 rounded-lg flex-1 text-gray-800"
                  placeholder="Введите номер плана (1-72)"
                  keyboardType="number-pad"
                  value={planNumber}
                  onChangeText={setPlanNumber}
                  maxLength={2}
                />
              </View>
            </View>

            {/* Информация о плане/чакре */}
            <View 
              className="mb-4 p-3 rounded-lg"
              style={{ backgroundColor: `${secondaryColor}` }}
            >
              <View className="flex-row items-center mb-2">
                <Icon name="meditation" size={16} color={planInfo.color} />
                <Text className="ml-2 font-semibold" style={{ color: planInfo.color }}>
                  {planInfo.chakraName} • {planInfo.name}
                </Text>
              </View>
              <Text className="text-gray-600 text-sm mb-2">
                {planInfo.description}
              </Text>
              <Text className="text-sm italic text-gray-500">
                {planInfo.prompt}
              </Text>
            </View>
            
            {/* Поле для ввода контента */}
            <TextInput
              className="bg-white p-4 rounded-lg border border-gray-200 min-h-[120px] text-gray-800 mb-4"
              multiline
              placeholder={showPlaceholder ? planInfo.prompt : ""}
              placeholderTextColor="#9CA3AF"
              value={content}
              onChangeText={setContent}
              onFocus={() => setShowPlaceholder(false)}
              onBlur={() => setShowPlaceholder(content.length === 0)}
              textAlignVertical="top"
            />

            {/* Кнопка отправки */}
            <View className="flex-row justify-end">
              <TouchableOpacity 
                onPress={handleSubmit}
                disabled={isSubmitting || !content.trim()}
              >
                <LinearGradient
                  colors={content.trim() ? [planInfo.color, `${planInfo.color}80`] : ['#D1D5DB', '#E5E7EB']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="py-3 px-6 rounded-full"
                >
                  <Text className="text-white font-bold">
                    {isSubmitting ? "Отправка..." : "Сохранить опыт"}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      </TouchableOpacity>
    </RNModal>
  );
}; 
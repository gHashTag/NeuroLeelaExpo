import React, { useState, useEffect, useRef } from "react";
import { View, ScrollView, ImageBackground, TouchableOpacity, RefreshControl, Image, ActivityIndicator } from "react-native";
import { Header } from "@/components/layout/Header";
import { ReportPost } from "@/components/reports/ReportPost";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { CreateReportModal } from "@/components/modals/CreateReportModal";
import { supabase } from "@/config/supabase";
import { useSupabase } from "@/context/supabase-provider";
import { useGameState } from "@/context/game-state-provider";
import { LinearGradient } from "expo-linear-gradient";
import { Feather } from "@expo/vector-icons";

interface Post {
  id: string;
  plan_number: number;
  content: string;
  created_at: string;
  likes: number;
  comments: number;
}

export default function Reports() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isRulesVisible, setIsRulesVisible] = useState(false);
  const [reportsPosts, setReportsPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState("all");
  const { user } = useSupabase();
  const { currentPlayer, loading: gameStateLoading } = useGameState();

  const fetchReports = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      let query = supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });
      
      // Применяем фильтр по диапазону планов, если он выбран
      if (selectedFilter !== "all") {
        const [min, max] = selectedFilter.split("-").map(Number);
        query = query.gte("plan_number", min).lte("plan_number", max);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Ошибка при загрузке отчетов:", error);
        return;
      }

      if (data) {
        setReportsPosts(data as Post[]);
      }
    } catch (error) {
      console.error("Ошибка при загрузке отчетов:", error);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchReports();
  };

  useEffect(() => {
    fetchReports();
  }, [user, selectedFilter]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return "сегодня";
    } else if (diffDays === 1) {
      return "вчера";
    } else if (diffDays <= 7) {
      return `${diffDays} дн. назад`;
    } else {
      return date.toLocaleDateString("ru-RU");
    }
  };

  const filterOptions = [
    { value: "all", label: "Все планы" },
    { value: "1-9", label: "1-9 (Физический план)" },
    { value: "10-18", label: "10-18 (Астральный план)" },
    { value: "19-27", label: "19-27 (Небесный план)" },
    { value: "28-36", label: "28-36 (План баланса)" },
    { value: "37-45", label: "37-45 (Человеческий план)" },
    { value: "46-54", label: "46-54 (План аскетизма)" },
    { value: "55-63", label: "55-63 (План сознания)" },
    { value: "64-72", label: "64-72 (Абсолютный план)" },
  ];

  // Чакры и их цвета для фильтров
  const chakraFilters = [
    { id: "all", label: "Все планы", icon: "mandala", color: "#6A0DAD" },
    { id: "1-9", label: "Муладхара (1-9)", icon: "meditation", color: "#ef4444" },
    { id: "10-18", label: "Свадхистана (10-18)", icon: "water", color: "#f97316" },
    { id: "19-27", label: "Манипура (19-27)", icon: "white-balance-sunny", color: "#eab308" },
    { id: "28-36", label: "Анахата (28-36)", icon: "heart-outline", color: "#22c55e" },
    { id: "37-45", label: "Вишудха (37-45)", icon: "microphone", color: "#3b82f6" },
    { id: "46-54", label: "Аджна (46-54)", icon: "eye-outline", color: "#6366f1" },
    { id: "55-63", label: "Сахасрара (55-63)", icon: "star-face", color: "#a855f7" },
    { id: "64-72", label: "Нирвана (64-72)", icon: "shimmer", color: "#ec4899" },
  ];

  // Функция для определения уровня плана по номеру
  const getPlanLevel = (planNumber: number) => {
    return Math.ceil(planNumber / 9);
  };

  // Функция для получения диапазона плана по его номеру
  const getPlanRange = (planNumber: number) => {
    const level = getPlanLevel(planNumber);
    const min = (level - 1) * 9 + 1;
    const max = level * 9;
    return `${min}-${max}`;
  };

  // Обработка успешного создания отчета
  const handleReportSuccess = () => {
    setIsModalVisible(false);
    fetchReports();
  };

  // Определяем, может ли пользователь создать отчет о текущем положении
  const canCreateReport = !gameStateLoading && currentPlayer && currentPlayer.plan > 0;

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 w-full">
        <Header title="Отчеты о планах" onInfoPress={() => setIsRulesVisible(!isRulesVisible)} onBookPress={() => {}} />

        {/* Введение и описание */}
        <View className="bg-white bg-opacity-80 mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <View className="flex-row items-center mb-2">
            <Icon name="book-open-variant" size={22} color="#6A0DAD" className="mr-2" />
            <Text className="text-lg font-bold text-purple-900">Дневник духовного пути</Text>
          </View>
          
          <Text className="text-gray-700 text-sm mb-3">
            В игре Лила (72 поля духовного развития) после каждого хода игрок должен размышлять о значении плана, на который он попал, и записывать свои мысли и наблюдения. Так формируется осознанность пути.
          </Text>
          
          {isRulesVisible && (
            <View className="bg-purple-50 p-3 rounded-lg mb-3 border-l-4 border-purple-400">
              <Text className="text-sm text-gray-700 italic mb-2">
                "Каждая ячейка имеет свое описание, характеризующее текущее положение игрока и его жизненную ситуацию. Игрок должен описать свои переживания этой ситуации и свои мысли после каждого хода."
              </Text>
              <Text className="text-xs text-gray-500">— из правил игры Лила</Text>
              
              <View className="mt-3 flex-row">
                <View className="flex-1 border-r border-gray-300 pr-2">
                  <Text className="text-xs font-bold text-purple-900 mb-1">Цель отчетов:</Text>
                  <Text className="text-xs text-gray-700">
                    • Осознать текущий план
                    • Закрепить духовный опыт
                    • Отследить свой путь
                  </Text>
                </View>
                <View className="flex-1 pl-2">
                  <Text className="text-xs font-bold text-purple-900 mb-1">Рекомендации:</Text>
                  <Text className="text-xs text-gray-700">
                    • Будьте искренни
                    • Отразите связь с вашей жизнью
                    • Пишите сразу после хода
                  </Text>
                </View>
              </View>
            </View>
          )}
          
          <View className="flex-row items-center flex-wrap">
            <TouchableOpacity 
              className="flex-row items-center bg-purple-100 py-1.5 px-3 rounded-full mr-2 mb-2"
              onPress={() => setIsRulesVisible(!isRulesVisible)}
            >
              <Icon name={isRulesVisible ? "chevron-up" : "chevron-down"} size={16} color="#6A0DAD" />
              <Text className="text-xs text-purple-900 ml-1">{isRulesVisible ? "Скрыть пояснения" : "Пояснения"}</Text>
            </TouchableOpacity>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row"
            >
              {filterOptions.map((option) => (
                <TouchableOpacity 
                  key={option.value}
                  className={`flex-row items-center py-1.5 px-3 rounded-full mr-2 ${selectedFilter === option.value ? 'bg-purple-600' : 'bg-purple-100'}`}
                  onPress={() => setSelectedFilter(option.value)}
                >
                  <Text className={`text-xs ${selectedFilter === option.value ? 'text-white' : 'text-purple-900'}`}>{option.label}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Информация о текущем плане и кнопка создания отчета */}
        {canCreateReport && (
          <View className="bg-white bg-opacity-80 mx-4 mt-3 p-4 rounded-lg shadow-sm">
            <View className="flex-row justify-between items-center">
              <View className="flex-row items-center">
                <View 
                  className="w-10 h-10 rounded-full items-center justify-center mr-3"
                  style={{ backgroundColor: chakraFilters[getPlanLevel(currentPlayer.plan)].color + '20' }}
                >
                  <Text className="font-bold" style={{ color: chakraFilters[getPlanLevel(currentPlayer.plan)].color }}>
                    {currentPlayer.plan}
                  </Text>
                </View>
                <View>
                  <Text className="text-sm font-bold text-gray-800">Ваш текущий план:</Text>
                  <Text className="text-xs text-gray-600">{chakraFilters[getPlanLevel(currentPlayer.plan)].label.split(' ')[0]}</Text>
                </View>
              </View>
              
              <TouchableOpacity 
                className="bg-gradient-to-r from-purple-500 to-indigo-600 py-2 px-4 rounded-lg"
                onPress={() => setIsModalVisible(true)}
              >
                <Text className="text-white text-sm font-medium">Написать отчет</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Визуальное представление 8 уровней */}
        <View className="flex-row justify-center items-center mx-4 my-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((level) => (
            <View 
              key={level} 
              className={`h-2 flex-1 mx-0.5 rounded-full ${
                (level === 1 && (selectedFilter === "1-9" || selectedFilter === "all")) ? "bg-red-500" : 
                (level === 2 && (selectedFilter === "10-18" || selectedFilter === "all")) ? "bg-orange-500" : 
                (level === 3 && (selectedFilter === "19-27" || selectedFilter === "all")) ? "bg-yellow-500" : 
                (level === 4 && (selectedFilter === "28-36" || selectedFilter === "all")) ? "bg-green-500" : 
                (level === 5 && (selectedFilter === "37-45" || selectedFilter === "all")) ? "bg-blue-500" : 
                (level === 6 && (selectedFilter === "46-54" || selectedFilter === "all")) ? "bg-indigo-500" : 
                (level === 7 && (selectedFilter === "55-63" || selectedFilter === "all")) ? "bg-purple-500" : 
                (level === 8 && (selectedFilter === "64-72" || selectedFilter === "all")) ? "bg-pink-500" : 
                "bg-gray-300"
              }`}
            />
          ))}
        </View>

        <ScrollView 
          className="flex-1 px-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {isLoading && reportsPosts.length === 0 ? (
            <View className="items-center justify-center py-10">
              <ActivityIndicator size="large" color="#6A0DAD" />
              <Text className="text-purple-900 mt-4">Загрузка отчетов...</Text>
            </View>
          ) : reportsPosts.length === 0 ? (
            <View className="items-center justify-center py-10">
              <Icon name="playlist-remove" size={60} color="#6A0DAD" style={{opacity: 0.5}} />
              <Text className="text-gray-500 mt-4 text-center">
                Отчетов по выбранным планам пока нет{'\n'}
                Будьте первым, кто поделится опытом!
              </Text>
            </View>
          ) : (
            reportsPosts.map((post) => (
              <ReportPost
                key={post.id}
                number={post.plan_number.toString().padStart(2, '0')}
                content={post.content}
                date={formatDate(post.created_at)}
                likes={post.likes}
                comments={post.comments}
                planLevel={Math.ceil(post.plan_number / 9)}
              />
            ))
          )}

          {/* Создать новый отчет (плавающая кнопка) */}
          <View className="h-20" />
        </ScrollView>

        {/* Плавающая кнопка для создания отчета */}
        {canCreateReport && (
          <TouchableOpacity
            className="absolute right-6 bottom-6 bg-purple-600 w-14 h-14 rounded-full items-center justify-center shadow-lg"
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="pencil-plus" size={24} color="white" />
          </TouchableOpacity>
        )}

        {/* Модальное окно создания отчета */}
        {canCreateReport && (
          <CreateReportModal
            isVisible={isModalVisible}
            onClose={() => setIsModalVisible(false)}
            onSuccess={handleReportSuccess}
            currentPlanNumber={currentPlayer.plan}
          />
        )}
      </View>
    </ImageBackground>
  );
}

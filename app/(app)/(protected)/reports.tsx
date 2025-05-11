import React, { useState, useEffect } from "react";
import { View, ScrollView, ImageBackground, TouchableOpacity, RefreshControl } from "react-native";
import { Header } from "@/components/layout/Header";
import { ReportPost } from "@/components/reports/ReportPost";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";
import { CreateReportModal } from "@/components/modals/CreateReportModal";
import { supabase } from "@/config/supabase";

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
  const [reportsPosts, setReportsPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchReports = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("reports")
        .select("*")
        .order("created_at", { ascending: false });

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
  }, []);

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

  return (
    <ImageBackground
      source={require("@/assets/icons/BG.png")}
      style={{ flex: 1, width: "100%" }}
      resizeMode="cover"
      className="flex-1"
    >
      <View className="flex-1 w-full">
        <Header title="Отчеты о планах" onInfoPress={() => {}} onBookPress={() => {}} />

        {/* Введение и описание */}
        <View className="bg-white bg-opacity-80 mx-4 mt-4 p-4 rounded-lg shadow-sm">
          <Text className="text-lg font-bold text-purple-900 mb-2">Сообщения о планах игры Лила</Text>
          <Text className="text-gray-700 text-sm mb-3">
            Здесь собраны наблюдения и размышления игроков о различных планах духовного развития. Каждое сообщение относится к определенному плану и содержит его описание.
          </Text>
          
          <View className="flex-row items-center">
            <TouchableOpacity className="flex-row items-center bg-purple-100 py-1.5 px-3 rounded-full mr-2">
              <Icon name="filter-variant" size={16} color="#6A0DAD" />
              <Text className="text-xs text-purple-900 ml-1">Фильтры</Text>
            </TouchableOpacity>
            
            <TouchableOpacity className="flex-row items-center bg-purple-100 py-1.5 px-3 rounded-full">
              <Icon name="sort" size={16} color="#6A0DAD" />
              <Text className="text-xs text-purple-900 ml-1">Сортировка</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView 
          className="flex-1 px-4 mt-4"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {reportsPosts.map((post) => (
            <ReportPost
              key={post.id}
              number={post.plan_number.toString().padStart(2, '0')}
              content={post.content}
              date={formatDate(post.created_at)}
              likes={post.likes}
              comments={post.comments}
            />
          ))}

          {/* Создать новый пост */}
          <TouchableOpacity 
            className="mb-6 bg-purple-50 bg-opacity-90 rounded-lg p-4 shadow-sm border border-dashed border-purple-200 items-center"
            onPress={() => setIsModalVisible(true)}
          >
            <Icon name="plus-circle-outline" size={28} color="#6A0DAD" />
            <Text className="text-purple-900 mt-2 font-medium">Поделиться своим опытом</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <CreateReportModal 
        isVisible={isModalVisible} 
        onClose={() => setIsModalVisible(false)} 
        onSuccess={fetchReports}
      />
    </ImageBackground>
  );
}

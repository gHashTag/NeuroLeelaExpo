import React from "react";
import { View, ScrollView, ImageBackground, TouchableOpacity } from "react-native";
import { Header } from "@/components/layout/Header";
import { ReportPost } from "@/components/reports/ReportPost";
import { Text } from "@/components/ui/text";
import Icon from "@expo/vector-icons/MaterialCommunityIcons";

interface Post {
  id: string;
  number: string;
  content: string;
  date: string;
  likes: number;
  comments: number;
}

export default function Reports() {
  const reportsPosts: Post[] = [
    {
      id: "1",
      number: "09",
      content:
        "кама-лока - это план желаний. Однако все желания исходят из чувственной природы человека, поэтому этот план еще называют чувственным планом. Он напрямую связан с неведением, отсутствием знания.",
      date: "today",
      likes: 2,
      comments: 1,
    },
    {
      id: "2",
      number: "07",
      content:
        "На этом поле игрок оказывается окончательно запутавшимся в сетях своих собственных игр. Плохое окружение, в котором он находится, является проявлением дурных желаний.\n\nСемь - это число писателей и художников, которые при отсутствии развития пребывают в ложной гордости и известны тем, что строят воздушные замки и всегда волнуются о будущем. Они не любят ходить проторенными путями и имеют весьма специфические представления о религии. Они склонны к созданию своей собственной религии и проводят жизнь в развлечениях.",
      date: "yesterday",
      likes: 5,
      comments: 3,
    },
    {
      id: "3",
      number: "12",
      content:
        "Двенадцатый план - это план благотворительности, предполагающий бескорыстные поступки, направленные на благо других. На этом плане человек осознает, что отдавать важнее, чем получать, и что истинное счастье возможно лишь в служении другим.",
      date: "3 days ago",
      likes: 7,
      comments: 2,
    },
  ];

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

        <ScrollView className="flex-1 px-4 mt-4">
          {reportsPosts.map((post) => (
            <ReportPost
              key={post.id}
              number={post.number}
              content={post.content}
              date={post.date}
              likes={post.likes}
              comments={post.comments}
            />
          ))}

          {/* Создать новый пост */}
          <TouchableOpacity className="mb-6 bg-purple-50 bg-opacity-90 rounded-lg p-4 shadow-sm border border-dashed border-purple-200 items-center">
            <Icon name="plus-circle-outline" size={28} color="#6A0DAD" />
            <Text className="text-purple-900 mt-2 font-medium">Поделиться своим опытом</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

import React from "react";
import { View, ScrollView, ImageBackground } from "react-native";
import { Header } from "@/components/layout/Header";
import { ReportPost } from "@/components/reports/ReportPost";

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
      likes: 0,
      comments: 0,
    },
    {
      id: "2",
      number: "07",
      content:
        "На этом поле игрок оказывается окончательно запутавшимся в сетях своих собственных игр. Плохое окружение, в котором он находится, является проявлением дурных желаний.\n\nСемь - это число писателей и художников, которые при отсутствии развития пребывают в ложной гордости и известны тем, что строят воздушные замки и всегда волнуются о будущем. Они не любят ходить проторенными путями и имеют весьма специфические представления о религии. Они склонны к созданию своей собственной религии и проводят жизнь в развлечениях.",
      date: "yesterday",
      likes: 0,
      comments: 0,
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
        <Header title="Reports on plans" onInfoPress={() => {}} onBookPress={() => {}} />

        <ScrollView className="flex-1 px-4">
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
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

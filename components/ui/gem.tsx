import React from "react";
import { View, Image, Pressable, StyleSheet } from "react-native";
import { gray, transparent } from "@constants/index";
import { ms } from "react-native-size-matters";
import { GemT } from "../../types/index";
import { Text } from "@components/ui/text";
import { H4 } from "./typography";

interface GemProps {
  player?: GemT;
  planNumber: number;
  onPress?: () => void;
}

const Gem: React.FC<GemProps> = ({ player, planNumber, onPress }) => {
  let source;

  if (player?.avatar) {
    if (typeof player.avatar === "string" && player.avatar !== "") {
      source = { uri: player.avatar };
    } else if (typeof player.avatar === "number") {
      source = player.avatar;
    }
  }

  const isNumberVisible = !player && planNumber !== 68;

  return (
    <Pressable onPress={onPress}>
      <View style={styles.container} testID="gem-container">
        {isNumberVisible ? (
          <View style={[styles.circle, styles.gems]} testID="gem-number">
            <H4 style={{ color: gray }}>{planNumber.toString()}</H4>
          </View>
        ) : (
          <View style={styles.imgStyle}>
            {source && <Image style={styles.gems} source={source} testID="player-gem-image" />}
          </View>
        )}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  circle: {
    alignItems: "center",
    backgroundColor: transparent,
    borderRadius: ms(44) / 2,
    height: ms(44),
    justifyContent: "center",
    width: ms(44),
  },
  container: {
    alignItems: "center",
    justifyContent: "center",
  },
  gems: {
    borderRadius: ms(42, 0.5) / 2,
    height: ms(42, 0.5),
    width: ms(42, 0.5),
  },
  imgStyle: {
    position: "absolute",
  },
});

export { Gem };

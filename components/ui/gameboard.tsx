import React, { useMemo } from "react";
import { Image, View, useColorScheme, StyleSheet, Platform } from "react-native";
import { NeomorphFlexView } from "@components/ui/NeomorphFlexView";
import { H, W } from "@constants/dimensions";
import { ms, mvs, s } from "react-native-size-matters";
import { GameBoardProps, GemT } from "../../types/index";
import { GameBoardImage } from "@/assets/gameboard/index";
import { Gem } from "@components/ui/gem";

const marginTop = H - W > 350 ? 20 : 0;

// Функция для безопасного получения размеров изображения на разных платформах
const getImageDimensions = (image: any) => {
  // Значения по умолчанию, если не удается определить размер
  const defaultDimensions = { width: 279, height: 248 };
  
  try {
    if (Platform.OS === 'web') {
      // В веб-версии мы не можем использовать resolveAssetSource
      // Используем фиксированные соотношения сторон для веб
      return defaultDimensions;
    } else {
      // На нативных платформах используем стандартный метод
      const dimensions = Image.resolveAssetSource(image);
      return dimensions || defaultDimensions;
    }
  } catch (error) {
    console.warn('Ошибка при определении размеров изображения:', error);
    return defaultDimensions;
  }
};

function GameBoard({ players }: GameBoardProps) {
  const scheme = useColorScheme();

  const imgObj = useMemo(() => {
    const image = GameBoardImage.find((x) => x.title === scheme)?.path;
    if (image) {
      const dimensions = getImageDimensions(image);
      const aspect = dimensions.width / dimensions.height;
      return { image, aspect };
    } else {
      return { image: "", aspect: 1 };
    }
  }, [scheme]);

  const getPlayer = (b: number): GemT | undefined => {
    const player = players.find((pl) => pl.plan.toString() === b.toString());
    return player
      ? {
          id: player.id,
          plan: player.plan,
          avatar: player.avatar,
        }
      : undefined;
  };

  return (
    <View style={styles.container}>
      <View style={[styles.imageContainer, { width: curImageHeight * imgObj.aspect }]}>
        <Image source={imgObj.image} style={styles.bgImage} resizeMode="cover" />
        <View style={styles.gameBoardContainer}>
          <View style={styles.sub}>
            {rows.map((a, i) => (
              <View style={styles.row} key={i}>
                {a.map((b, index) => (
                  <View key={index} style={styles.box} testID={`gem-${getPlayer(b)?.id}`}>
                    <Gem player={getPlayer(b)} planNumber={b} />
                  </View>
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const imageHeight = s(248) + s(32);
const maxImageHeight = ms(248, 0.5) + s(32);
const imageTopMargin = Math.min(ms(27, 0.5), s(27));
const curImageHeight = Math.min(maxImageHeight, imageHeight) + imageTopMargin;

const imageWidth = s(279) + s(18);
const maxImageWidth = ms(279, 0.5) + s(18);
const curImageWidth = imageWidth >= maxImageWidth ? maxImageWidth : imageWidth;

const rows = [
  [72, 71, 70, 69, 68, 67, 66, 65, 64],
  [55, 56, 57, 58, 59, 60, 61, 62, 63],
  [54, 53, 52, 51, 50, 49, 48, 47, 46],
  [37, 38, 39, 40, 41, 42, 43, 44, 45],
  [36, 35, 34, 33, 32, 31, 30, 29, 28],
  [19, 20, 21, 22, 23, 24, 25, 26, 27],
  [18, 17, 16, 15, 14, 13, 12, 11, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9],
];

const styles = StyleSheet.create({
  bgImage: {
    height: "100%",
    position: "absolute",
    top: mvs(33, 1.6) - imageTopMargin,
    width: "95%",
    borderRadius: 10,
  },
  box: {
    alignItems: "center",
    borderRadius: s(31) / 2,
    height: s(31),
    justifyContent: "center",
    marginHorizontal: s(1),
    marginVertical: s(2),
    maxHeight: ms(31, 0.5),
    maxWidth: ms(31, 0.5),
    width: s(31),
  },
  container: {
    alignItems: "center",
    paddingHorizontal: s(20),
    paddingVertical: s(6),
    width: "90%",
  },
  gameBoardContainer: {
    height: curImageHeight,
    marginTop,
    width: curImageWidth,
  },
  imageContainer: {
    alignItems: "center",
    alignSelf: "center",
    bottom: 30,
    height: curImageHeight,
  },
  row: {
    flexDirection: "row",
  },
  sub: {
    marginTop: imageTopMargin,
  },
});

export { GameBoard };

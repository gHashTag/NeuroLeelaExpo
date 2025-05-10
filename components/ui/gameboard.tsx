import React, { useMemo } from "react";
import { Image, View, StyleSheet, Platform } from "react-native";
import { H, W } from "@constants/dimensions";
import { GameBoardProps, GemT } from "../../types/index";
import { GameBoardImage } from "@/assets/gameboard/index";
import { Gem } from "@components/ui/gem";

// Размеры игрового поля
const cellSize = 44; // Увеличенный размер ячейки
const cellMargin = 2.5; // Отступ между ячейками
const rowMargin = 2.5; // Отступ между рядами

// Рассчитываем полную ширину игрового поля
const boardWidth = 9 * (cellSize + 2 * cellMargin);
const boardHeight = 8 * (cellSize + 2 * rowMargin);

// Финальные размеры контейнера
const curImageWidth = boardWidth + 20; 
const curImageHeight = boardHeight + 20;

// Строки игрового поля
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

// Функция для безопасного получения размеров изображения на разных платформах
const getImageDimensions = (image: any) => {
  const defaultDimensions = { width: 279, height: 248 };
  
  try {
    if (Platform.OS === 'web') {
      return defaultDimensions;
    } else {
      const dimensions = Image.resolveAssetSource(image);
      return dimensions || defaultDimensions;
    }
  } catch (error) {
    console.warn('Ошибка при определении размеров изображения:', error);
    return defaultDimensions;
  }
};

function GameBoard({ players }: GameBoardProps) {
  // Force light theme
  const scheme = "light";

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

  // Условия стилей для веб-версии
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.mainContainer, isWeb && styles.webMainContainer]}>
      <View 
        style={[
          styles.imageContainer, 
          { width: curImageWidth },
          isWeb && styles.webImageContainer
        ]}
      >
        <Image 
          source={imgObj.image} 
          style={[styles.bgImage, isWeb && styles.webBgImage]} 
          resizeMode="contain" 
        />
        
        <View style={styles.boardOverlay} />
        
        <View style={styles.boardWrapper}>
          {rows.map((a, i) => (
            <View style={styles.row} key={i}>
              {a.map((b, index) => {
                const player = getPlayer(b);
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.cell, 
                      player && styles.activeCell
                    ]} 
                    testID={`gem-${player?.id}`}
                  >
                    <Gem player={player} planNumber={b} />
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  bgImage: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    borderRadius: 16,
    opacity: 0.7,
  },
  boardOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    borderRadius: 16,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    height: curImageHeight,
    position: 'relative',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  boardWrapper: {
    width: boardWidth,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: rowMargin / 2,
  },
  cell: {
    width: cellSize,
    height: cellSize,
    borderRadius: cellSize / 2,
    marginHorizontal: cellMargin,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  activeCell: {
    backgroundColor: 'rgba(142, 36, 170, 0.15)',
    borderWidth: 2.5,
    borderColor: 'rgba(142, 36, 170, 0.85)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 2,
  },
  // Веб-специфичные стили
  webMainContainer: {
    paddingVertical: 10,
  },
  webImageContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  webBgImage: {
    borderRadius: 16,
  },
});

export { GameBoard };

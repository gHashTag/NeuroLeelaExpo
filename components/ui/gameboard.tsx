import React, { useMemo } from "react";
import { Image, View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { GameBoardProps, GemT } from "../../types/index";
import { GameBoardImage } from "@/assets/gameboard/index";
import { Gem } from "@components/ui/gem";

function GameBoard({ players }: GameBoardProps) {
  // Используем размер окна для адаптивности
  const { width: windowWidth } = useWindowDimensions();
  
  // Вычисляем размеры ячеек в зависимости от размера экрана
  const getCellSize = () => {
    if (windowWidth > 1400) return 44; // Большие экраны
    if (windowWidth > 1024) return 40; // Средние экраны
    if (windowWidth > 768) return 38;  // Маленькие экраны
    if (windowWidth > 480) return 35;  // Планшеты
    return 32;                          // Мобильные устройства
  };
  
  // Устанавливаем размеры игрового поля
  const cellSize = getCellSize();
  const cellMargin = Math.max(2, cellSize * 0.05); // Масштабируем отступы согласно размеру ячейки
  const rowMargin = cellMargin;
  
  // Рассчитываем полную ширину игрового поля
  const boardWidth = 9 * (cellSize + 2 * cellMargin);
  const boardHeight = 8 * (cellSize + 2 * rowMargin);
  
  // Финальные размеры контейнера
  const curImageWidth = boardWidth + 20;
  const curImageHeight = boardHeight + 20;

  // Force light theme
  const scheme = "light";

  const imgObj = useMemo(() => {
    const image = GameBoardImage.find((x) => x.title === scheme)?.path;
    if (image) {
      const dimensions = { width: 279, height: 248 };
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

  // Условия стилей для веб-версии
  const isWeb = Platform.OS === 'web';

  return (
    <View style={[styles.mainContainer, isWeb && styles.webMainContainer]}>
      <View 
        style={[
          styles.imageContainer, 
          { width: curImageWidth, height: curImageHeight },
          isWeb && styles.webImageContainer
        ]}
      >
        <Image 
          source={imgObj.image} 
          style={[styles.bgImage, isWeb && styles.webBgImage]} 
          resizeMode="cover"
        />
        
        <View style={styles.boardWrapper}>
          {rows.map((a, i) => (
            <View style={[styles.row, { marginVertical: rowMargin / 2 }]} key={i}>
              {a.map((b, index) => {
                const player = getPlayer(b);
                return (
                  <View 
                    key={index} 
                    style={[
                      styles.cell, 
                      { 
                        width: cellSize, 
                        height: cellSize, 
                        borderRadius: cellSize / 2,
                        marginHorizontal: cellMargin,
                        backgroundColor: player ? 'rgba(142, 36, 170, 0.5)' : 'rgba(0, 0, 0, 0.15)'
                      },
                      player && styles.activeCell
                    ]} 
                    testID={`gem-${player?.id}`}
                  >
                    <Gem player={player} planNumber={b} cellSize={cellSize} />
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
    zIndex: -1,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cell: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  activeCell: {
    backgroundColor: 'rgba(142, 36, 170, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 4,
    zIndex: 2,
  },
  // Веб-специфичные стили
  webMainContainer: {
    paddingVertical: 10,
  },
  webImageContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 20,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  webBgImage: {
    borderRadius: 16,
  },
});

export { GameBoard };

import React, { useMemo, useEffect } from "react";
import { Image, View, StyleSheet, Platform, useWindowDimensions } from "react-native";
import { GameBoardProps, GemT } from "../../types/index";
import { GameBoardImage } from "@/assets/gameboard/index";
import { Gem } from "@components/ui/gem";

function GameBoard({ players, customScale }: GameBoardProps & { customScale?: number }) {
  // Добавляем логирование для диагностики
  console.log('🎯 [GameBoard] Компонент рендерится');
  console.log('🎯 [GameBoard] Получены players:', players);
  console.log('🎯 [GameBoard] Количество игроков:', players?.length || 0);
  
  // Отслеживаем изменения players
  useEffect(() => {
    console.log('🔥 [GameBoard] players ИЗМЕНИЛИСЬ!');
    console.log('🔥 [GameBoard] Новые players:', players);
    if (players && players.length > 0) {
      const player = players[0];
      console.log('🔥 [GameBoard] Первый игрок - план:', player.plan, 'id:', player.id);
    }
  }, [players]);
  
  // Используем размер окна для адаптивности
  const { width: windowWidth } = useWindowDimensions();
  
  // Вычисляем размеры ячеек в зависимости от размера экрана
  const getCellSize = () => {
    if (windowWidth > 1400) return 40; // Большие экраны - уменьшено с 44
    if (windowWidth > 1024) return 36; // Средние экраны - уменьшено с 40
    if (windowWidth > 768) return 32;  // Маленькие экраны - уменьшено с 38
    if (windowWidth > 480) return 28;  // Планшеты - уменьшено с 35
    return 26;                          // Мобильные устройства - уменьшено с 32
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

  // Применяем пользовательское масштабирование, если оно предоставлено
  const scale = customScale || 1;

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
    // Логирование для диагностики поиска
    if (players && players.length > 0) {
      console.log(`🎯 [GameBoard] getPlayer: Ищем игрока на позиции ${b}`);
      console.log(`🎯 [GameBoard] getPlayer: Доступные игроки:`, players.map(p => ({ id: p.id, plan: p.plan, type: typeof p.plan })));
    }
    
    // Исправляем сравнение - приводим оба значения к числу
    const player = players.find((pl) => Number(pl.plan) === Number(b));
    
    // Логирование для диагностики
    if (player) {
      console.log(`🎯 [GameBoard] getPlayer: Найден игрок на позиции ${b}:`, player);
    } else if (players && players.length > 0) {
      console.log(`🎯 [GameBoard] getPlayer: Игрок НЕ найден на позиции ${b}`);
    }
    
    return player
      ? {
          id: player.id,
          plan: Number(player.plan), // Приводим к числу
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
          { 
            width: curImageWidth * scale, 
            height: curImageHeight * scale 
          },
          isWeb && styles.webImageContainer
        ]}
      >
        <Image 
          source={imgObj.image} 
          style={[styles.bgImage, isWeb && styles.webBgImage]} 
          resizeMode="cover"
        />
        
        <View style={[styles.boardWrapper, { transform: scale !== 1 ? [{ scale }] : [] }]}>
          {rows.map((a, i) => (
            <View style={[styles.row, { marginVertical: rowMargin / 2 }]} key={`row-${i}`}>
              {a.map((b, index) => {
                const player = getPlayer(b);
                return (
                  <View 
                    key={`cell-${b}-${i}-${index}`} 
                    style={[
                      styles.cell, 
                      { 
                        width: cellSize, 
                        height: cellSize, 
                        borderRadius: cellSize / 2,
                        marginHorizontal: cellMargin,
                        backgroundColor: 'transparent'
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
    padding: 2,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : undefined,
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
    opacity: 0.8,
    zIndex: -1,
  },
  imageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: Platform.OS === 'web' ? 'transparent' : 'transparent',
    borderRadius: 0,
    overflow: 'visible',
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  boardWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    backgroundColor: Platform.OS === 'web' ? 'transparent' : 'transparent',
    borderRadius: 0,
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
    borderWidth: 0,
    borderColor: 'transparent'
  },
  activeCell: {
    backgroundColor: 'rgba(142, 36, 170, 0.7)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.9)',
    ...(Platform.OS === 'web' ? {
      boxShadow: '0px 2px 3px rgba(0, 0, 0, 0.5)',
    } : {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.5,
      shadowRadius: 3,
    }),
    elevation: 4,
    zIndex: 2,
  },
  // Веб-специфичные стили
  webMainContainer: {
    paddingVertical: 5,
  },
  webImageContainer: {
    backgroundColor: 'transparent',
    borderRadius: 0,
  },
  webBgImage: {
    borderRadius: 16,
  },
});

export { GameBoard };

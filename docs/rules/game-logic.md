# Логика игры НейроЛила

## Основные принципы

НейроЛила — это игра на пути духовного развития, основанная на древней индийской игре Лила. Игровое поле представляет собой путь через различные планы сознания, где игрок может двигаться вперед или назад в зависимости от бросков кубика и особых позиций на поле.

## Правила движения

1. **Начало игры**: 
   - Игрок начинает с позиции 68 (позиция победы).
   - Для входа в игру необходимо выбросить 6 на кубике.
   - После выбрасывания 6 игрок перемещается на позицию 6 и начинает путь.
   - Пока не выброшена 6, игрок остается на стартовой позиции 68.

2. **Броски кубика**: При каждом ходе игрок бросает шестигранный кубик (значения от 1 до 6).
3. **Обычное движение**: Игрок перемещается вперед на количество клеток, равное значению кубика.
4. **Максимальная позиция**: Максимальная позиция на поле — 72.

## Особые позиции

### Стрелы (Arrow 🏹)
- Если игрок попадает на позицию со стрелой, он перемещается вверх на указанную позицию.
- Позиции со стрелами: 10→23, 17→69, 20→32, 22→60, 27→41, 28→50, 37→66, 45→67, 46→62, 54→68.

### Змеи (Snake 🐍)
- Если игрок попадает на позицию со змеей, он перемещается вниз на указанную позицию.
- Позиции со змеями: 12→8, 16→4, 24→7, 29→6, 44→9, 52→35, 55→3, 61→13, 63→2, 72→51.

## Специальные правила

### Победа (Win 🕉)
- Победа достигается при попадании на позицию 68.
- После победы игрок может перезапустить игру, только если выбросит 6.
- Если после победы выпало значение, отличное от 6, игрок остается на победной позиции.

### Три шестерки подряд
- Если игрок выбрасывает три шестерки подряд, он возвращается на позицию, с которой начал эту серию.
- При этом счетчик последовательных шестерок сбрасывается.

### Превышение лимита поля
- Если при броске кубика игрок должен переместиться за пределы поля (позиция > 72), он остается на месте.

## Реализация

Логика игры реализована в файле `services/GameService.ts` через функциональный подход с несколькими основными функциями:

1. **processGameStep**: Основная функция обработки хода игрока.
2. **handleConsecutiveSixes**: Функция для обработки последовательных шестерок.
3. **getDirectionAndPosition**: Функция для определения направления и конечной позиции игрока в зависимости от правил игры.
4. **validatePosition**: Вспомогательная функция для проверки корректности позиции.

## Интеграция с UI

Игровая логика интегрирована с пользовательским интерфейсом через компонент `Dice` и функцию `rollDice` в `gamescreen.tsx`. UI обновляется с использованием Apollo Client и реактивных переменных в `apollo-drizzle-client.ts`.

## Тестирование

Логика игры покрыта юнит-тестами в файле `services/GameService.test.ts`, которые проверяют корректность работы основных функций и правил игры. 

# Правила игры НейроЛила

## Основные правила

1. **Цель игры**: Достичь Космического Сознания, продвигаясь по игровому полю от начальной точки до финальной позиции (68).

2. **Начало игры**: 
   - Игрок начинает с позиции 68 (Космическое Сознание).
   - Для начала игры необходимо выбросить 6 на кубике.
   - После выпадения 6, игрок переходит на позицию 6 и начинает свой путь.
   - Если на кубике выпадает любое другое число, игрок остается на позиции 68 и ждет следующего хода.

3. **Ход игры**:
   - Игрок бросает кубик и перемещается на количество клеток, соответствующее выпавшему числу.
   - Если игрок достигает клетки со "змеей" (🐍), он опускается вниз по змее на определенное количество позиций.
   - Если игрок достигает клетки со "стрелой" (🏹), он поднимается по стреле на определенное количество позиций.

4. **Особые правила**:
   - **Три шестерки подряд**: Если игрок выбрасывает три 6 подряд, он возвращается в позицию, с которой начал эту серию бросков.
   - **Превышение предела**: Если сумма текущей позиции и выпавшего числа превышает 72 (максимальное число на поле), игрок остается на месте.
   - **Достижение победы**: Если игрок достигает позиции 68, игра считается выигранной. Для начала новой игры необходимо снова выбросить 6.

## Специальные позиции

### Змеи (🐍)
Змеи перемещают игрока вниз:
- с 12 на 8
- с 16 на 4
- с 24 на 7
- с 29 на 6
- с 44 на 9
- с 52 на 35
- с 55 на 3
- с 61 на 13
- с 63 на 2
- с 72 на 51

### Стрелы (🏹)
Стрелы перемещают игрока вверх:
- с 10 на 23
- с 17 на 69
- с 20 на 32
- с 22 на 60
- с 27 на 41
- с 28 на 50
- с 37 на 66
- с 45 на 67
- с 46 на 62
- с 54 на 68 (Победа!)

## Духовное значение игры

НейроЛила – это адаптация древней игры Лила, "Игры Самопознания". Каждая позиция на доске соответствует определенному состоянию сознания и духовному уроку. Продвижение по доске символизирует духовную эволюцию человека, где змеи представляют препятствия, страсти и привязанности, а стрелы - добродетели и хорошие качества, помогающие подняться выше. 
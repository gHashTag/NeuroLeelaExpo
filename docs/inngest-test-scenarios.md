# 🧪 Тестовые Сценарии Inngest Функций

## 📋 Базовые Тесты

### 1. Инициализация игрока (game.player.init)
```json
{
  "data": {
    "userId": "test-user-123"
  }
}
```

### 2. Бросок кубика - Начало игры (game.dice.roll)
```json
{
  "data": {
    "userId": "test-user-123",
    "roll": 6,
    "timestamp": 1751220000000
  }
}
```

### 3. Бросок кубика - Обычный ход (game.dice.roll)  
```json
{
  "data": {
    "userId": "test-user-123",
    "roll": 4,
    "timestamp": 1751220060000
  }
}
```

### 4. Обновление состояния (game.player.update)
```json
{
  "data": {
    "userId": "test-user-123",
    "gameStep": {
      "loka": 15,
      "previous_loka": 9,
      "direction": "Шаг 🚶🏼",
      "consecutive_sixes": 0,
      "position_before_three_sixes": 0,
      "is_finished": false
    }
  }
}
```

### 5. Обработка отчета (game.report.process)
```json
{
  "data": {
    "userId": "test-user-123",
    "report": {
      "plan": 15,
      "reflection": "Интересный опыт самопознания",
      "insights": ["Терпение", "Мудрость"],
      "rating": 5
    }
  }
}
```

## 🎯 Расширенные Тест-Кейсы

### Сценарий А: Три шестерки подряд
```json
{
  "data": {
    "userId": "player-snake-test",
    "roll": 6,
    "gameStep": {
      "consecutive_sixes": 2,
      "position_before_three_sixes": 20,
      "loka": 32
    }
  }
}
```

### Сценарий Б: Победа (лока 68)
```json
{
  "data": {
    "userId": "player-victory-test", 
    "gameStep": {
      "loka": 68,
      "is_finished": true,
      "direction": "Победа 🕉"
    }
  }
}
```

### Сценарий В: Стрела (переход вперед)
```json
{
  "data": {
    "userId": "player-arrow-test",
    "gameStep": {
      "loka": 31,
      "previous_loka": 9,
      "direction": "Стрела 🏹"
    }
  }
}
```

### Сценарий Г: Змея (переход назад)
```json
{
  "data": {
    "userId": "player-snake-test",
    "gameStep": {
      "loka": 6,
      "previous_loka": 16,
      "direction": "Змея 🐍"
    }
  }
}
```

## 📊 Тестирование Ошибок

### Невалидные данные
```json
{
  "data": {
    "userId": "",
    "roll": 0
  }
}
```

### Отсутствующие поля
```json
{
  "data": {
    "roll": 3
  }
}
```

## 🎮 Полный Игровой Цикл

1. **Инициализация** → `game.player.init`
2. **Начало игры** → `game.dice.roll` (roll: 6)  
3. **Ход в игре** → `game.dice.roll` (roll: 1-5)
4. **Обновление** → `game.player.update`
5. **Отчет** → `game.report.process`
6. **Повтор** → Шаги 2-5

## ✅ Проверочный Список

- [ ] Все 4 функции отвечают успешно
- [ ] Логи появляются в консоли сервера
- [ ] JSON данные корректно парсятся
- [ ] Timestamp обрабатывается правильно  
- [ ] userId передается во всех функциях
- [ ] Функции возвращают ожидаемую структуру 
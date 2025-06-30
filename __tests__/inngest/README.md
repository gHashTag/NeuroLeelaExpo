# 🧪 Тестирование Inngest Функций

## 📚 Обзор
Комплексные тесты для всех Inngest функций NeuroLeela проекта.

## 🛠️ Тестовый Стек
- **@inngest/test** - Официальный тестовый фреймворк
- **Vitest** - Быстрый тестовый раннер
- **Jest-совместимые моки** - Для изоляции

## 🚀 Запуск Тестов

### Все Inngest тесты:
```bash
bun run test:inngest
```

### В режиме watch:
```bash
bun run test:inngest:watch
```

## 📁 Структура
```
__tests__/inngest/
├── setup.ts                           # Общие моки
├── processDiceRoll.basic.test.ts      # Тесты броска кубика
├── processReport.test.ts              # Тесты отчетов
├── playerStateHandler.test.ts         # Тесты состояния
└── README.md                          # Документация
```

## 🎯 Покрытые Функции

### processDiceRoll - Обработка Броска Кубика
- ✅ Начало игры (бросок 6)
- ✅ Ожидание начала (не-6)
- ✅ Проверка шагов выполнения
- ✅ Обработка ошибок

### processReport - Обработка Отчетов
- ✅ Сохранение отчета
- ✅ Разблокировка кубика
- ✅ События обновления состояния
- ✅ Обработка ошибок

### playerStateHandler - Управление Состоянием
- ✅ updatePlayerState - Обновление Apollo
- ✅ initializePlayer - Создание игрока
- ✅ Обработка существующих игроков
- ✅ Ошибки создания/обновления

## 🎭 Паттерн Тестирования

```typescript
import { InngestTestEngine } from '@inngest/test';

const { result } = await testEngine.execute({
  events: [{ name: 'my.event', data: { userId: 'test' } }],
  steps: [
    {
      id: 'my-step',
      handler: () => ({ success: true })
    }
  ]
});

expect((result as any).success).toBe(true);
``` 
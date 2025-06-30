# 🕉️ NeuroLeela NativeWind Design System

## Введение

NeuroLeela теперь использует современную дизайн-систему на базе **NativeWind** (Tailwind CSS для React Native), которая обеспечивает:

- ✨ **Универсальные стили** - одинаково работают на iOS, Android и Web
- 📱 **Адаптивный дизайн** - автоматическая подстройка под размер экрана  
- 🎨 **Современная эстетика** - градиенты, glassmorphism, плавные анимации
- 🚀 **Высокая производительность** - стили компилируются во время сборки
- 🔧 **Простота разработки** - IntelliSense поддержка, быстрое прототипирование

## Архитектура

```
components/ui/design-system/
├── Button.tsx          # Универсальная кнопка с вариантами
├── Card.tsx            # Карточки (обычные и игровые)
├── Layout.tsx          # Адаптивные контейнеры и сетки
└── index.ts            # Экспорт всех компонентов
```

## Основные компоненты

### Button
```tsx
import { Button } from '@/components/ui/design-system';

// Варианты кнопок
<Button variant="primary">Главная кнопка</Button>
<Button variant="outline">Контурная кнопка</Button>
<Button variant="ghost">Прозрачная кнопка</Button>

// Размеры
<Button size="sm">Маленькая</Button>
<Button size="lg">Большая</Button>

// С иконкой
<Button icon={<Icon />}>С иконкой</Button>

// Полная ширина
<Button fullWidth>На всю ширину</Button>
```

### Card
```tsx
import { Card, GameCard, StatsCard } from '@/components/ui/design-system';

// Обычная карточка
<Card title="Заголовок" subtitle="Подзаголовок">
  Содержимое
</Card>

// Игровая карточка (с эффектами)
<GameCard glowing>
  Игровой контент
</GameCard>

// Карточка статистики
<StatsCard 
  title="Уровень"
  value={68}
  subtitle="Космическое сознание"
  trend="up"
/>
```

### Layout
```tsx
import { Container, Flex, ResponsiveLayout } from '@/components/ui/design-system';

// Адаптивный контейнер
<Container maxWidth="xl" padding>
  <ResponsiveLayout>
    // Автоматические отступы под размер экрана
  </ResponsiveLayout>
</Container>

// Flex layout
<Flex direction="row" justify="between" align="center" gap={16}>
  <Button>Кнопка 1</Button>
  <Button>Кнопка 2</Button>
</Flex>
```

## Цветовая палитра

Система использует семантические CSS-переменные:

```css
:root {
  --primary: 222.2 47.4% 11.2%;
  --secondary: 210 40% 96.1%;
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;
  /* ... и другие */
}
```

## Адаптивность

### Брейкпоинты
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: > 1024px

### Адаптивные классы
```tsx
// Responsive padding
className="p-2 md:p-4 lg:p-6"

// Responsive flex direction  
className="flex-col md:flex-row"

// Responsive grid
className="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
```

## Кастомные утилиты

### Градиенты
```tsx
className="gradient-purple"     // Фиолетовый градиент
className="gradient-cosmic"     // Космический градиент
className="text-gradient"       // Градиентный текст
```

### Эффекты
```tsx
className="glass"               // Glassmorphism эффект
className="shadow-glow"         // Свечение
className="animate-fade-in"     // Плавное появление
className="animate-slide-up"    // Скольжение вверх
```

### Safe Area (для мобильных)
```tsx
className="pt-safe pb-safe"     // Отступы под вырезы экрана
```

## Примеры использования

### Игровой экран
```tsx
<ResponsiveLayout>
  <Flex direction={isMobile ? "col" : "row"} gap={24}>
    {/* Левая часть - игровое поле */}
    <View className="flex-1">
      <GameCard title="Игровое поле" glowing>
        <GameBoard />
      </GameCard>
    </View>
    
    {/* Правая часть - чат */}
    <View className="w-80 xl:w-96">
      <GameCard title="Духовный наставник">
        <ChatBot />
      </GameCard>
    </View>
  </Flex>
</ResponsiveLayout>
```

### Статистика игрока
```tsx
<Flex direction="row" gap={12} wrap>
  <StatsCard
    title="План"
    value={currentPlayer.plan}
    subtitle="Текущая позиция"
    icon={<Ionicons name="location" size={16} color="#8B5CF6" />}
    trend="up"
  />
  <StatsCard
    title="Статус"
    value={currentPlayer.isFinished ? "Готов" : "В игре"}
    subtitle={currentPlayer.needsReport ? "Нужен отчет" : "Можно играть"}
    trend={currentPlayer.needsReport ? "down" : "up"}
  />
</Flex>
```

## Демо-страницы

- `/nativewind-test` - Тестирование базовых возможностей
- `/design-system-demo` - Полная демонстрация компонентов
- `/gamescreen-modern` - Современная версия игрового экрана

## Настройка

### Зависимости
```json
{
  "nativewind": "^4.1.23",
  "tailwindcss": "^3.4.17",
  "react-native-reanimated": "~3.17.4",
  "react-native-safe-area-context": "5.4.0"
}
```

### Конфигурация
- `tailwind.config.js` - настройки Tailwind
- `babel.config.js` - Babel preset для NativeWind
- `metro.config.js` - Metro bundler с NativeWind
- `global.css` - глобальные стили и кастомные утилиты

## Преимущества

### До (StyleSheet):
```tsx
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  }
});

<View style={styles.container}>
```

### После (NativeWind):
```tsx
<View className="flex-1 p-4 bg-white rounded-lg shadow-md">
```

### Результат:
- ✅ **90% меньше кода**
- ✅ **Автоматическая адаптивность**
- ✅ **Консистентность дизайна**
- ✅ **Быстрое прототипирование**
- ✅ **IntelliSense поддержка**

## Лучшие практики

1. **Используйте семантические компоненты**: `<GameCard>` вместо `<Card variant="glass">`
2. **Думайте mobile-first**: начинайте дизайн с мобильных экранов
3. **Переиспользуйте стили**: выносите повторяющиеся классы в переменные
4. **Тестируйте на всех платформах**: iOS, Android, Web
5. **Следуйте дизайн-токенам**: используйте переменные цветов из темы

## Будущие улучшения

- 🌙 **Dark mode** - автоматическое переключение тем
- 🎭 **Анимации** - более сложные переходы с Reanimated
- 🎨 **Кастомные темы** - возможность менять цветовые схемы
- ♿ **Accessibility** - улучшенная поддержка accessibility
- 📊 **Design tokens** - централизованная система токенов

---

*Дизайн-система NeuroLeela построена с любовью и духовностью 🕉️* 
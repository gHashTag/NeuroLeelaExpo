// Основные компоненты дизайн-системы
export { Button } from './Button';
export { Card, GameCard, StatsCard } from './Card';
export { Container, Flex, ResponsiveLayout } from './Layout';

// Утилиты для работы с темой
export const theme = {
  colors: {
    primary: 'bg-purple-600',
    secondary: 'bg-gray-100',
    success: 'bg-green-500',
    warning: 'bg-yellow-500',
    danger: 'bg-red-500',
    info: 'bg-blue-500'
  },
  spacing: {
    xs: 'p-1',
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6',
    xl: 'p-8'
  },
  borderRadius: {
    sm: 'rounded-lg',
    md: 'rounded-xl',
    lg: 'rounded-2xl',
    xl: 'rounded-3xl'
  },
  shadows: {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  }
} as const;

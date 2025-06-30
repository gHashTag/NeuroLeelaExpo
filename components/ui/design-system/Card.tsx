import React from 'react';
import { View, Text, ViewStyle } from 'react-native';
import { cn } from '@/lib/utils';

type CardVariant = 'default' | 'elevated' | 'outlined' | 'glass';
type CardSize = 'sm' | 'md' | 'lg';

interface CardProps {
  variant?: CardVariant;
  size?: CardSize;
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
}

const cardVariants = {
  default: 'bg-white border border-gray-200',
  elevated: 'bg-white shadow-xl border border-gray-100',
  outlined: 'bg-white border-2 border-purple-200',
  glass: 'bg-white/80 backdrop-blur-md border border-white/30'
};

const cardSizes = {
  sm: 'p-4 rounded-xl',
  md: 'p-6 rounded-2xl', 
  lg: 'p-8 rounded-3xl'
};

export function Card({
  variant = 'default',
  size = 'md',
  children,
  className,
  title,
  subtitle,
  headerAction
}: CardProps) {
  return (
    <View className={cn(
      cardVariants[variant],
      cardSizes[size],
      className
    )}>
      {(title || subtitle || headerAction) && (
        <View className="mb-4">
          <View className="flex-row items-center justify-between mb-2">
            {title && (
              <Text className="text-xl font-bold text-gray-900">
                {title}
              </Text>
            )}
            {headerAction}
          </View>
          {subtitle && (
            <Text className="text-sm text-gray-600 leading-relaxed">
              {subtitle}
            </Text>
          )}
        </View>
      )}
      {children}
    </View>
  );
}

// Специализированные карточки для игры
export function GameCard({
  children,
  className,
  glowing = false,
  ...props
}: CardProps & { glowing?: boolean }) {
  return (
    <Card
      variant="glass"
      className={cn(
        'bg-gradient-to-br from-white/95 to-white/80',
        glowing && 'shadow-purple-200/50 shadow-2xl border-purple-300/50',
        className
      )}
      {...props}
    >
      {children}
    </Card>
  );
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  className
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  className?: string;
}) {
  const trendColors = {
    up: 'text-green-600',
    down: 'text-red-600',
    neutral: 'text-gray-600'
  };

  return (
    <Card 
      variant="elevated" 
      size="sm"
      className={cn('min-w-[120px]', className)}
    >
      <View className="flex-row items-center justify-between mb-3">
        <Text className="text-sm font-medium text-gray-600">{title}</Text>
        {icon && (
          <View className="w-8 h-8 bg-purple-100 rounded-lg items-center justify-center">
            {icon}
          </View>
        )}
      </View>
      
      <Text className="text-2xl font-bold text-gray-900 mb-1">
        {value}
      </Text>
      
      {subtitle && (
        <Text className={cn(
          'text-xs font-medium',
          trend ? trendColors[trend] : 'text-gray-500'
        )}>
          {subtitle}
        </Text>
      )}
    </Card>
  );
} 
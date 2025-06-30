import React from 'react';
import { Pressable, Text, View, ViewStyle, TextStyle } from 'react-native';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'destructive' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg' | 'xl';

interface ButtonProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

const buttonVariants = {
  primary: 'bg-gradient-to-r from-purple-600 to-purple-700 active:from-purple-700 active:to-purple-800 shadow-lg active:shadow-xl',
  secondary: 'bg-gray-100 active:bg-gray-200 border border-gray-200',
  destructive: 'bg-gradient-to-r from-red-500 to-red-600 active:from-red-600 active:to-red-700 shadow-lg',
  ghost: 'active:bg-gray-100',
  outline: 'border-2 border-purple-600 bg-white active:bg-purple-50'
};

const buttonSizes = {
  sm: {
    container: 'px-3 py-2 rounded-lg',
    text: 'text-sm font-medium',
    icon: 'w-4 h-4'
  },
  md: {
    container: 'px-4 py-3 rounded-xl',
    text: 'text-base font-semibold',
    icon: 'w-5 h-5'
  },
  lg: {
    container: 'px-6 py-4 rounded-2xl',
    text: 'text-lg font-bold',
    icon: 'w-6 h-6'
  },
  xl: {
    container: 'px-8 py-5 rounded-3xl',
    text: 'text-xl font-bold',
    icon: 'w-7 h-7'
  }
};

const textColors = {
  primary: 'text-white',
  secondary: 'text-gray-700',
  destructive: 'text-white',
  ghost: 'text-gray-700',
  outline: 'text-purple-600'
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  onPress,
  disabled = false,
  loading = false,
  className,
  icon,
  fullWidth = false
}: ButtonProps) {
  const sizeConfig = buttonSizes[size];
  
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      className={cn(
        // Base styles
        'transition-all duration-200 items-center justify-center',
        // Variant styles
        buttonVariants[variant],
        // Size styles
        sizeConfig.container,
        // Full width
        fullWidth && 'w-full',
        // Disabled state
        (disabled || loading) && 'opacity-50',
        // Custom className
        className
      )}
    >
      <View className={cn(
        'flex-row items-center justify-center',
        icon && 'space-x-2'
      )}>
        {icon && (
          <View className={sizeConfig.icon}>
            {icon}
          </View>
        )}
        
        {loading ? (
          <View className="flex-row items-center space-x-2">
            <View className={cn(
              'animate-spin rounded-full border-2 border-transparent',
              variant === 'primary' || variant === 'destructive' 
                ? 'border-t-white' 
                : 'border-t-gray-400',
              sizeConfig.icon
            )} />
            <Text className={cn(
              sizeConfig.text,
              textColors[variant]
            )}>
              Загрузка...
            </Text>
          </View>
        ) : (
          <Text className={cn(
            sizeConfig.text,
            textColors[variant]
          )}>
            {children}
          </Text>
        )}
      </View>
    </Pressable>
  );
} 
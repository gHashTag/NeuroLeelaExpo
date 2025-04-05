import React from 'react';
import { View, Text, ViewStyle, TextStyle, Animated } from 'react-native';

interface ToastProps {
  title: string;
  variant?: 'success' | 'error' | 'info';
  className?: string;
  titleClassName?: string;
}

export const Toast: React.FC<ToastProps> = ({
  title,
  variant = 'info',
  className = '',
  titleClassName = '',
}) => {
  return (
    <Animated.View
      className={`
        p-4 
        rounded-xl 
        shadow-sm
        ${variant === 'error' ? 'bg-red-50' : ''}
        ${variant === 'success' ? 'bg-green-50' : ''}
        ${variant === 'info' ? 'bg-blue-50' : ''}
        ${className}
      `}
    >
      <Text
        className={`
          text-base
          ${variant === 'error' ? 'text-red-600' : ''}
          ${variant === 'success' ? 'text-green-600' : ''}
          ${variant === 'info' ? 'text-blue-600' : ''}
          ${titleClassName}
        `}
      >
        {title}
      </Text>
    </Animated.View>
  );
}; 
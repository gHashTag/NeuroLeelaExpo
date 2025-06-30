import React from 'react';
import { View, useWindowDimensions, Platform } from 'react-native';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  padding?: boolean;
}

export function Container({
  children,
  className,
  maxWidth = 'full',
  padding = true
}: ContainerProps) {
  const maxWidths = {
    sm: 'max-w-sm',
    md: 'max-w-md', 
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full'
  };

  return (
    <View
      className={cn(
        'mx-auto w-full',
        maxWidths[maxWidth],
        padding && 'px-4 sm:px-6 lg:px-8',
        Platform.OS === 'web' ? 'glass' : '',
        className
      )}
      style={Platform.OS === 'web' ? { backgroundColor: 'transparent' } : {}}
    >
      {children}
    </View>
  );
}

interface FlexProps {
  children: React.ReactNode;
  className?: string;
  direction?: 'row' | 'col';
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'between' | 'around';
  wrap?: boolean;
  gap?: number;
}

export function Flex({
  children,
  className,
  direction = 'row',
  align = 'center',
  justify = 'start',
  wrap = false,
  gap = 4
}: FlexProps) {
  const alignItems = {
    start: 'items-start',
    center: 'items-center', 
    end: 'items-end',
    stretch: 'items-stretch'
  };

  const justifyContent = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around'
  };

  return (
    <View 
      className={cn(
        'flex',
        direction === 'row' ? 'flex-row' : 'flex-col',
        alignItems[align],
        justifyContent[justify],
        wrap && 'flex-wrap',
        className
      )}
      style={{ gap }}
    >
      {children}
    </View>
  );
}

export function ResponsiveLayout({ 
  children, 
  className 
}: { 
  children: React.ReactNode; 
  className?: string; 
}) {
  const { width, height } = useWindowDimensions();
  const isMobile = width < 768;
  const isTablet = width >= 768 && width < 1024;
  
  return (
    <View className={cn(
      'flex-1',
      isMobile ? 'p-2' : isTablet ? 'p-4' : 'p-6',
      Platform.OS === 'web' ? 'glass' : '',
      className
    )}
    style={Platform.OS === 'web' ? { backgroundColor: 'transparent' } : {}}
    >
      {children}
    </View>
  );
}

import React from 'react';
import { TouchableOpacity, TouchableOpacityProps } from 'react-native';
import { Text } from './text';
import { cn } from '@/lib/utils';

interface ModalButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'destructive';
  children: React.ReactNode;
}

export const ModalButton: React.FC<ModalButtonProps> = ({ 
  variant = 'primary',
  children,
  className,
  ...props 
}) => {
  return (
    <TouchableOpacity
      className={cn(
        'py-3 px-4 rounded-xl items-center justify-center',
        variant === 'primary' && 'bg-purple-600',
        variant === 'secondary' && 'bg-transparent',
        variant === 'destructive' && 'bg-red-500',
        className
      )}
      {...props}
    >
      {children}
    </TouchableOpacity>
  );
}; 
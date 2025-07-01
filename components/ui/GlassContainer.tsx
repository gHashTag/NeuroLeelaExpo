import React from 'react';
import { View, StyleProp, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';

interface GlassContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const GlassContainer: React.FC<GlassContainerProps> = ({ children, style }) => {
  if (Platform.OS === 'web') {
    // @ts-ignore - className is not in the type definition but works on web
    return (
      <View style={style} className="glass-card">
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={100} tint="light" style={style}>
      {children}
    </BlurView>
  );
}; 
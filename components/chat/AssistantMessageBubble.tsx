import React from 'react';
import { View, Platform, StyleProp, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

interface AssistantMessageBubbleProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export const AssistantMessageBubble: React.FC<AssistantMessageBubbleProps> = ({ children, style }) => {
  if (Platform.OS === 'web') {
    // @ts-ignore - className is not in the type definition but works on web
    return (
      <View style={style} className="glass-card">
        {children}
      </View>
    );
  }

  return (
    <BlurView intensity={50} tint="light" style={style}>
      {children}
    </BlurView>
  );
}; 
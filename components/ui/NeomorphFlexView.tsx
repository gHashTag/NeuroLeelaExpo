import React from 'react';
import { View, ViewStyle, StyleSheet } from 'react-native';
import { useTheme } from '@react-navigation/native';
import { black, lightGray } from '@constants/colors';

interface NeomorphFlexViewProps {
  children: React.ReactNode;
  viewStyle?: ViewStyle;
  borderRadius?: number;
  marginHorizontal?: number;
}

const NeomorphFlexView: React.FC<NeomorphFlexViewProps> = ({
  children,
  viewStyle,
  borderRadius = 40,
  marginHorizontal = 40,
}) => {
  const { dark } = useTheme();
  const backgroundColor = dark ? black : lightGray;

  return (
    <View
      style={{
        ...styles.container,
        ...viewStyle,
        backgroundColor,
        borderRadius,
        marginHorizontal,
      }}
    >
      <View style={{ ...viewStyle, borderRadius }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    shadowRadius: 5,
  },
});

export { NeomorphFlexView };
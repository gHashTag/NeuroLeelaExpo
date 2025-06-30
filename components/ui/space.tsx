import React, { memo } from "react";
import { Platform } from "react-native";
import { View } from "react-native";
import { s } from "react-native-size-matters";

interface SpaceT {
  height?: number | string;
  width?: number | string;
  backgroundColor?: string;
}

const Space = memo<SpaceT>(({ height, width, backgroundColor }) => {
  return (
    <View
      testID="space-component"
      style={{
        backgroundColor: Platform.OS === 'web' ? (backgroundColor || 'transparent') : backgroundColor,
        height: s(Number(height)) || 0,
        width: s(Number(width)) || 0,
      }}
    />
  );
});

export { Space };

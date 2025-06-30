import { cssInterop } from "nativewind";
import { SafeAreaView as RNSafeAreaView } from "react-native-safe-area-context";
import { Platform } from "react-native";
import React from "react";

const StyledSafeAreaView = React.forwardRef((props: any, ref) => {
  // Принудительно прозрачный фон для web
  const style = Platform.OS === 'web'
    ? [{ backgroundColor: 'transparent' }, props.style].filter(Boolean)
    : props.style;
  return <RNSafeAreaView ref={ref} {...props} style={style} />;
});

export { StyledSafeAreaView as SafeAreaView };

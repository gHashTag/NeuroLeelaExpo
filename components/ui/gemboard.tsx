import React from "react";
import { View, StyleSheet } from "react-native";
import { s, ms } from "react-native-size-matters";

interface GemBoardProps {
  children?: React.ReactNode;
}

export const GemBoard: React.FC<GemBoardProps> = ({ children }) => {
  return (
    <View style={styles.box}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    alignItems: "center",
    borderRadius: s(28) / 2,
    height: s(28),
    justifyContent: "center",
    marginHorizontal: s(0.5),
    marginVertical: s(1),
    maxHeight: ms(28, 0.5),
    maxWidth: ms(28, 0.5),
    width: s(28),
  },
}); 
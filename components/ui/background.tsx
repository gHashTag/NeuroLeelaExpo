import React, { ReactNode } from "react";
import { Platform, ScrollView, StyleSheet, View } from "react-native";
import { W } from "@constants/dimensions";
import { useGlobalBackground } from "@hooks/useGlobalBackground";

interface BackgroundProps {
  children: ReactNode;
  isScrollView?: boolean;
  isFlatList?: boolean;
}

const Background: React.FC<BackgroundProps> = ({
  children,
  isScrollView = false,
  isFlatList = false,
}) => {
  const backgroundStyle = useGlobalBackground();
  const isWeb = Platform.OS === 'web';

  if (isScrollView) {
    return (
      <View style={[backgroundStyle, styles.flatlistStyle, isWeb && styles.webContainer]}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollViewContent,
            isWeb && styles.webScrollViewContent
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    );
  }

  if (isFlatList) {
    return (
      <View style={[
        backgroundStyle, 
        styles.flatlistStyle, 
        isWeb && styles.webContainer
      ]}>
        {children}
      </View>
    );
  }

  return (
    <View style={[
      backgroundStyle, 
      styles.container, 
      isWeb && styles.webContainer
    ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-start",
  },
  flatlistStyle: {
    alignItems: "center",
    flex: 1,
  },
  scrollViewContent: {
    alignItems: "center",
    flexGrow: 1,
    justifyContent: "flex-start",
    width: W,
  },
  // Web-specific styles
  webContainer: {
    width: '100%',
    maxWidth: 1200,
    marginHorizontal: 'auto',
  },
  webScrollViewContent: {
    width: '100%',
    maxWidth: 800,
    paddingHorizontal: 16,
  }
});

export { Background };

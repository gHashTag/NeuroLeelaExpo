import React, { ReactNode } from 'react'

import { ScrollView, StyleSheet, View } from 'react-native'

import { W } from '@constants/dimensions'
import { useGlobalBackground } from '@hooks/useGlobalBackground'

interface BackgroundProps {
  children: ReactNode
  isScrollView?: boolean
  isFlatList?: boolean
}

const Background: React.FC<BackgroundProps> = ({
  children,
  isScrollView = false,
  isFlatList = false,
}) => {
  const backgroundStyle = useGlobalBackground()

  if (isScrollView) {
    return (
      <View style={[backgroundStyle, styles.flatlistStyle]}>
        <ScrollView
          contentContainerStyle={styles.scrollViewContent}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      </View>
    )
  }

  if (isFlatList) {
    return (
      <View style={[backgroundStyle, styles.flatlistStyle]}>{children}</View>
    )
  }

  return <View style={[backgroundStyle, styles.container]}>{children}</View>
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  flatlistStyle: {
    alignItems: 'center',
  },
  scrollViewContent: {
    alignItems: 'center',
    flexGrow: 1,
    justifyContent: 'flex-start',
    width: W,
  },
})

export { Background }

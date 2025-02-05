import React from 'react'

import { StyleSheet, View } from 'react-native'

import { H3 } from '@components/ui/typography'
import { W } from '@constants/dimensions'
import { s } from 'react-native-size-matters'

interface DisplayProps {
  title: string | undefined
  onColor?: string
  height?: number
  width?: number
}

const Display: React.FC<DisplayProps> = ({
  title = ' ',
  onColor,
  height = s(120),
  width = W - 40,
}) => {
  return (
    <View style={{ ...styles.container, height, width }}>
      <H3 style={[styles.dateStyle, { color: onColor }]}>{title}</H3>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: s(20),
    paddingVertical: s(6),
    boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
  },
  dateStyle: {
    lineHeight: s(20),
    paddingRight: 10,
    textAlign: 'center',
  },
})

export { Display }

import { Dimensions, Platform } from 'react-native'

export const win = Dimensions.get('window')
export const W = win.width
export const H = win.height
export const imgH = Math.round((W * 9) / 16)
export const isIos = Platform.OS === 'ios'

import { black, lightGray } from '@constants/colors'
import { useColorScheme } from 'react-native'

const useGlobalBackground = () => {
  const isDarkMode = useColorScheme() === 'dark'
  const backgroundColor = isDarkMode ? black : lightGray

  const backgroundStyle = [{ backgroundColor }]

  return backgroundStyle
}

export { useGlobalBackground }

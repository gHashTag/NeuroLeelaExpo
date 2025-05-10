import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'NeuroLeelaExpo',
  slug: 'NeuroLeelaExpo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  assetBundlePatterns: [
    '**/*'
  ],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.neuroleela.expo'
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    package: 'com.neuroleela.expo'
  },
  web: {
    favicon: './assets/favicon.png'
  },
  owner: 'neuroleela',
  extra: {
    eas: {
      projectId: 'your-project-id'
    },
    supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
    supabaseServiceKey: process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY,
    pinataJwt: process.env.EXPO_PUBLIC_PINATA_JWT,
    pinataGatewayUrl: process.env.EXPO_PUBLIC_PINATA_GATEWAY_URL,
    pinataSecretKey: process.env.EXPO_PUBLIC_PINATA_SECRET_KEY,
    pinataApiKey: process.env.EXPO_PUBLIC_PINATA_API_KEY,
  },
  plugins: [
    'expo-router'
  ]
}); 
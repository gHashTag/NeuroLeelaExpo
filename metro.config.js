const { getDefaultConfig } = require('@expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const defaultConfig = getDefaultConfig(__dirname);

const config = {
  ...defaultConfig,
  // Увеличиваем таймаут для медленных соединений
  server: {
    ...defaultConfig.server,
    port: 8081,
    enhanceMiddleware: (middleware) => {
      return (req, res, next) => {
        // Увеличиваем таймаут до 30 секунд
        req.setTimeout(30000);
        return middleware(req, res, next);
      };
    },
  },
  // Оптимизируем обработку ассетов
  transformer: {
    ...defaultConfig.transformer,
    assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  },
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [
      ...defaultConfig.resolver.sourceExts,
      'jsx',
      'tsx',
      'ts',
    ],
    assetExts: [
      ...defaultConfig.resolver.assetExts,
      'db',
      'mp3',
      'ttf',
      'obj',
      'png',
      'jpg',
    ],
    // Add path aliases to match tsconfig.json and support @core
    extraNodeModules: {
      '@': __dirname,
      '@core': __dirname + '/core',
      '@components': __dirname + '/components',
      '@constants': __dirname + '/constants',
      '@hooks': __dirname + '/hooks',
    },
  },
  // Оптимизируем сборку
  maxWorkers: 4,
};

module.exports = withNativeWind(config, { input: './global.css' });

import { vi, beforeEach, afterEach } from 'vitest';

// Мокинг React Native для тестов Inngest функций
vi.mock('react-native', () => ({
  NativeModules: {
    BlobModule: {
      BLOB_URI_SCHEME: 'content',
      addNetworkingHandler: vi.fn(),
      addWebSocketHandler: vi.fn(),
    },
  },
  Platform: {
    OS: 'ios',
    Version: '15.0',
    select: vi.fn((obj) => obj.ios || obj.default),
  },
  Dimensions: {
    get: vi.fn(() => ({ width: 375, height: 812 })),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  AppState: {
    currentState: 'active',
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  },
  Alert: {
    alert: vi.fn(),
  },
}));

// Мокинг react-native-url-polyfill
vi.mock('react-native-url-polyfill', () => ({}));

// Мокинг Expo модулей
vi.mock('expo-constants', () => ({
  default: {
    executionEnvironment: 'standalone',
    appOwnership: 'standalone',
  },
}));

vi.mock('expo-sqlite', () => ({
  openDatabase: vi.fn(),
}));

// Мокинг Apollo Client для изоляции тестов
vi.mock('@apollo/client', () => ({
  ApolloClient: vi.fn(),
  InMemoryCache: vi.fn(),
  gql: vi.fn((query) => query),
  useQuery: vi.fn(),
  useMutation: vi.fn(),
  createHttpLink: vi.fn()
}));

// Мокинг Supabase клиента
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      getUser: vi.fn()
    },
    from: vi.fn(() => ({
      insert: vi.fn(),
      update: vi.fn(),
      select: vi.fn(),
      eq: vi.fn()
    }))
  }))
}));

// Мокинг драйвера базы данных
vi.mock('@neondatabase/serverless', () => ({
  Pool: vi.fn(() => ({
    query: vi.fn(),
    end: vi.fn()
  })),
  neon: vi.fn(() => vi.fn())
}));

// Мокинг AI SDK
vi.mock('ai', () => ({
  generateObject: vi.fn(),
  openai: vi.fn()
}));

// Мокинг внешних сервисов
vi.mock('../../services/GameService', () => ({
  GameService: {
    processGameStep: vi.fn(),
    validatePlayerPosition: vi.fn(),
    getQuestionAndChakra: vi.fn(),
    markReportCompleted: vi.fn()
  }
}));

// Глобальные моки для переменных окружения
vi.stubGlobal('process', {
  env: {
    EXPO_PUBLIC_DATABASE_URL: 'test://localhost/test',
    EXPO_PUBLIC_OPENROUTER_API_KEY: 'test-api-key',
    EXPO_PUBLIC_DEEPSEEK_API_KEY: 'test-deepseek-key'
  }
});

// Мокинг консоли для чистого вывода тестов
const originalConsole = console;
beforeEach(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {});
  vi.spyOn(console, 'warn').mockImplementation(() => {});
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
}); 
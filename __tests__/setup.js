import { vi } from 'vitest';

// Mock для компонентов react-native
vi.mock('react-native', () => {
  return {
    Platform: {
      OS: 'web',
      select: (obj) => obj.web || obj.default,
    },
    View: 'View',
    Text: 'Text',
    TextInput: 'TextInput',
    TouchableOpacity: 'TouchableOpacity',
    ActivityIndicator: 'ActivityIndicator',
    Animated: {
      View: 'Animated.View',
      timing: vi.fn(),
      spring: vi.fn(),
      Value: vi.fn(() => ({
        setValue: vi.fn(),
        interpolate: vi.fn(),
      })),
      parallel: vi.fn(() => ({ start: vi.fn() })),
      sequence: vi.fn(() => ({ start: vi.fn() })),
    },
    Image: 'Image',
    StyleSheet: {
      create: (styles) => styles,
    },
  };
});

// Mock для expo-router
vi.mock('expo-router', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  })),
}));

// Mock для react-native-toast-message
vi.mock('react-native-toast-message', () => ({
  default: {
    show: vi.fn(),
  },
}));

// Другие глобальные моки
global.fetch = vi.fn(); 
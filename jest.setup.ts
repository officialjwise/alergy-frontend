import { jest } from '@jest/globals';
import { setUpTests } from 'react-native-reanimated';

setUpTests();

// In-memory MMKV replacement for tests.
jest.mock('react-native-mmkv', () => {
  const store = new Map<string, string | number | boolean>();
  const instance = {
    set: (key: string, value: string | number | boolean) => store.set(key, value),
    getString: (key: string) => {
      const v = store.get(key);
      return typeof v === 'string' ? v : undefined;
    },
    getNumber: (key: string) => {
      const v = store.get(key);
      return typeof v === 'number' ? v : undefined;
    },
    getBoolean: (key: string) => {
      const v = store.get(key);
      return typeof v === 'boolean' ? v : undefined;
    },
    contains: (key: string) => store.has(key),
    remove: (key: string) => store.delete(key),
    getAllKeys: () => Array.from(store.keys()),
    clearAll: () => store.clear(),
  };
  return { createMMKV: () => instance };
});

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  selectionAsync: jest.fn(() => Promise.resolve()),
  notificationAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

jest.mock('expo-localization', () => ({
  getLocales: () => [{ languageCode: 'en', languageTag: 'en-US' }],
}));

jest.mock('@react-native-community/netinfo', () => ({
  __esModule: true,
  default: {
    addEventListener: () => () => undefined,
    fetch: () => Promise.resolve({ isConnected: true }),
  },
}));

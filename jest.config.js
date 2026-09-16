/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-expo',
  // Lets react-native-worklets resolve its JS implementation instead of the native module.
  resolver: 'react-native-worklets/jest/resolver',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  testPathIgnorePatterns: ['/node_modules/', '/ios/', '/android/', '/.expo/'],
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/react-native|native-base|react-native-svg|@gorhom/.*|@shopify/.*|zustand|i18next|react-i18next|react-native-worklets|react-native-reanimated)',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: ['src/**/*.{ts,tsx}', '!src/**/*.d.ts', '!src/mocks/**'],
};

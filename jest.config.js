module.exports = {
  preset: 'jest-expo',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['@testing-library/jest-native/extend-expect', '<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(@react-native|react-native|expo(nent)?|@expo(nent)?|@expo-google-fonts|expo-asset|expo-font|expo-router)/)'
  ],
  collectCoverageFrom: [
    'components/**/*.tsx',
    'lib/**/*.ts'
  ],
  coverageThreshold: {
    global: {
      branches: 60,
      functions: 60,
      lines: 60,
      statements: 60,
    },
  },
};

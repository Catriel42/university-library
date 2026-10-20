import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  moduleNameMapper: {
    '^@university-library/shared$': '<rootDir>/../shared/src/index.ts',
    '^@/lib/api$': '<rootDir>/src/test/mocks/api.ts',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^(\\..*)\\.jsx?$': '$1',
    '\\.(css|less|scss|sass)$': '<rootDir>/src/test/mocks/styleMock.ts',
  },
  transform: {
    '^.+\\.(ts|tsx)$': [
      'ts-jest',
      {
        tsconfig: {
          target: 'ES2022',
          module: 'CommonJS',
          jsx: 'react-jsx',
          moduleResolution: 'node',
          esModuleInterop: true,
          allowSyntheticDefaultImports: true,
          skipLibCheck: true,
          types: ['jest', '@testing-library/jest-dom', 'node'],
        },
      },
    ],
  },
  testMatch: ['<rootDir>/src/**/*.test.(ts|tsx)'],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
};

export default config;

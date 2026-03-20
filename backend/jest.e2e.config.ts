import type { Config } from 'jest'

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/e2e/**/*.test.ts'],
  clearMocks: true,
  transform: {
    '^.+\\.ts$': ['ts-jest', { diagnostics: false }],
  },
  testTimeout: 15000,
}

export default config

// NEW FILE: /jest.config.js
// Jest configuration for running integration tests

module.exports = {
    testEnvironment: 'node',
    roots: ['<rootDir>/tests'],
    testMatch: ['**/*.test.ts'],
    transform: {
      '^.+\\.tsx?$': 'ts-jest'
    },
    moduleNameMapper: {
      '^@/(.*)$': '<rootDir>/$1'
    },
    setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
    collectCoverageFrom: [
      'services/**/*.ts',
      '!services/**/*.d.ts'
    ],
    coveragePathIgnorePatterns: [
      '/node_modules/',
      '/dist/'
    ],
    globals: {
      'ts-jest': {
        tsconfig: 'tsconfig.json'
      }
    }
  };
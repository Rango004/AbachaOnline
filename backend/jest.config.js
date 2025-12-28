module.exports = {
  testEnvironment: 'node',
  coverageDirectory: 'coverage',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/server.js', // Exclude server entry point
    '!**/node_modules/**'
  ],
  testMatch: [
    '**/tests/**/*.test.js'
  ],
  verbose: true,
  testTimeout: 10000, // 10 seconds for database operations
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js']
};

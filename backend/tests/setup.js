/**
 * Jest Test Setup
 * Global configuration for all tests
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.DB_DIALECT = 'sqlite';
process.env.DB_STORAGE = ':memory:'; // Use in-memory SQLite for tests
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '1d';

// Extend Jest timeout for database operations
jest.setTimeout(10000);

// Suppress console logs during tests (optional)
// global.console = {
//   ...console,
//   log: jest.fn(),
//   debug: jest.fn(),
//   info: jest.fn(),
//   warn: jest.fn(),
// };

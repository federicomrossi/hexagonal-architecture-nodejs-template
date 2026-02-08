import { jest } from '@jest/globals';

beforeEach(() => {
  jest.clearAllMocks();
});

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret-key';
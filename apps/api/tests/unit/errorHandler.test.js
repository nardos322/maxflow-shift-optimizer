import { describe, test, expect, vi, afterEach } from 'vitest';
import errorHandler from '../../src/middlewares/errorHandler.js';
import { UnauthorizedError } from '../../src/lib/errors.js';

function createMockRes() {
  return {
    status: vi.fn().mockReturnThis(),
    json: vi.fn().mockReturnThis(),
  };
}

describe('errorHandler', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('sanitizes 500 message in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = createMockRes();

    try {
      errorHandler(new Error('DB connection failed at 10.0.0.5'), {}, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'INTERNAL_ERROR',
          error:
            'Ocurrió un error interno inesperado. Por favor contacte a soporte.',
          factible: false,
        })
      );
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });

  test('keeps controlled error message for 4xx in production', () => {
    const originalNodeEnv = process.env.NODE_ENV;
    process.env.NODE_ENV = 'production';
    const res = createMockRes();
    const err = new UnauthorizedError('Token inválido');

    try {
      errorHandler(err, {}, res, vi.fn());

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          code: 'UNAUTHORIZED',
          error: 'Token inválido',
        })
      );
    } finally {
      process.env.NODE_ENV = originalNodeEnv;
    }
  });
});

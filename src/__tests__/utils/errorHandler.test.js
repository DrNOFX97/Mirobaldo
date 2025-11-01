/**
 * Error Handler Tests
 * Tests standardized error handling utilities
 */

const {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  asyncHandler,
  withErrorHandling,
  serializeError,
  createValidationError,
  getErrorResponse
} = require('../../utils/errorHandler');

describe('Error Classes', () => {
  describe('AppError', () => {
    it('should create AppError with default values', () => {
      const error = new AppError('Test error');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error.errorCode).toBe('INTERNAL_ERROR');
      expect(error.timestamp).toBeDefined();
    });

    it('should create AppError with custom status code', () => {
      const error = new AppError('Test', 400, 'CUSTOM_ERROR');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('CUSTOM_ERROR');
    });

    it('should be an instance of Error', () => {
      const error = new AppError('Test');
      expect(error instanceof Error).toBe(true);
    });
  });

  describe('ValidationError', () => {
    it('should create ValidationError', () => {
      const error = new ValidationError('Invalid input', 'email');
      expect(error.statusCode).toBe(400);
      expect(error.errorCode).toBe('VALIDATION_ERROR');
      expect(error.field).toBe('email');
    });

    it('should work without field', () => {
      const error = new ValidationError('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.field).toBeNull();
    });
  });

  describe('NotFoundError', () => {
    it('should create NotFoundError', () => {
      const error = new NotFoundError('User', '123');
      expect(error.statusCode).toBe(404);
      expect(error.errorCode).toBe('NOT_FOUND');
      expect(error.message).toContain('User');
      expect(error.message).toContain('123');
    });
  });

  describe('UnauthorizedError', () => {
    it('should create UnauthorizedError', () => {
      const error = new UnauthorizedError();
      expect(error.statusCode).toBe(401);
      expect(error.errorCode).toBe('UNAUTHORIZED');
    });

    it('should use custom message', () => {
      const error = new UnauthorizedError('Token expired');
      expect(error.message).toBe('Token expired');
    });
  });

  describe('ForbiddenError', () => {
    it('should create ForbiddenError', () => {
      const error = new ForbiddenError();
      expect(error.statusCode).toBe(403);
      expect(error.errorCode).toBe('FORBIDDEN');
    });
  });

  describe('ConflictError', () => {
    it('should create ConflictError', () => {
      const error = new ConflictError('Email already exists', 'User');
      expect(error.statusCode).toBe(409);
      expect(error.errorCode).toBe('CONFLICT');
      expect(error.resource).toBe('User');
    });
  });
});

describe('Error Utilities', () => {
  describe('serializeError', () => {
    it('should serialize Error objects', () => {
      const error = new Error('Test error');
      const serialized = serializeError(error);

      expect(serialized.message).toBe('Test error');
      expect(serialized.stack).toBeDefined();
      expect(serialized.name).toBe('Error');
    });

    it('should serialize AppError objects', () => {
      const error = new AppError('App error', 400, 'CUSTOM');
      const serialized = serializeError(error);

      expect(serialized.statusCode).toBe(400);
      expect(serialized.errorCode).toBe('CUSTOM');
    });

    it('should serialize plain objects', () => {
      const obj = { code: 'ERR_001', message: 'Error' };
      const serialized = serializeError(obj);

      expect(serialized).toBe(obj);
    });

    it('should convert strings to objects', () => {
      const serialized = serializeError('Error string');
      expect(serialized).toEqual({ message: 'Error string' });
    });
  });

  describe('createValidationError', () => {
    it('should create validation error from array', () => {
      const errors = [
        { field: 'email', message: 'Invalid email' },
        { field: 'password', message: 'Too short' }
      ];

      const error = createValidationError(errors);
      expect(error instanceof ValidationError).toBe(true);
      expect(error.message).toContain('email');
      expect(error.message).toContain('password');
    });

    it('should handle empty array', () => {
      const error = createValidationError([]);
      expect(error instanceof ValidationError).toBe(true);
    });
  });

  describe('getErrorResponse', () => {
    it('should return error response object', () => {
      const error = new AppError('Test', 400, 'TEST_ERROR');
      const response = getErrorResponse(error);

      expect(response.code).toBe('TEST_ERROR');
      expect(response.message).toBe('Test');
      expect(response.timestamp).toBeDefined();
    });

    it('should include stack in development', () => {
      process.env.NODE_ENV = 'development';
      const error = new AppError('Test', 400, 'TEST_ERROR');
      const response = getErrorResponse(error, true);

      expect(response.stack).toBeDefined();

      process.env.NODE_ENV = 'test';
    });

    it('should not include stack in production', () => {
      process.env.NODE_ENV = 'production';
      const error = new AppError('Test', 400, 'TEST_ERROR');
      const response = getErrorResponse(error, true);

      expect(response.stack).toBeUndefined();

      process.env.NODE_ENV = 'test';
    });

    it('should handle missing fields', () => {
      const error = { message: 'Only message' };
      const response = getErrorResponse(error);

      expect(response.code).toBe('INTERNAL_ERROR');
      expect(response.message).toBe('Only message');
    });
  });
});

describe('Async Utilities', () => {
  describe('asyncHandler', () => {
    it('should wrap async functions', () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrapped = asyncHandler(mockFn);

      expect(typeof wrapped).toBe('function');
      expect(wrapped.length).toBe(3); // req, res, next
    });

    it('should call original function', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const wrapped = asyncHandler(mockFn);

      const req = {};
      const res = {};
      const next = jest.fn();

      await wrapped(req, res, next);

      expect(mockFn).toHaveBeenCalledWith(req, res, next);
    });

    it('should pass errors to next', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(mockFn);

      const req = {};
      const res = {};
      const next = jest.fn();

      await wrapped(req, res, next);

      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe('withErrorHandling', () => {
    it('should execute function successfully', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');
      const result = await withErrorHandling('TestSource', mockFn);

      expect(result).toBe('result');
      expect(mockFn).toHaveBeenCalled();
    });

    it('should pass context data', async () => {
      const mockFn = jest.fn().mockResolvedValue('result');
      const context = { userId: '123' };

      await withErrorHandling('TestSource', mockFn, context);

      expect(mockFn).toHaveBeenCalled();
    });

    it('should handle errors', async () => {
      const error = new Error('Operation failed');
      const mockFn = jest.fn().mockRejectedValue(error);

      await expect(withErrorHandling('TestSource', mockFn)).rejects.toThrow(error);
    });
  });
});

describe('Error Response Status Codes', () => {
  it('should have correct HTTP status codes', () => {
    expect(new AppError('', 500).statusCode).toBe(500);
    expect(new ValidationError('').statusCode).toBe(400);
    expect(new NotFoundError('', '').statusCode).toBe(404);
    expect(new UnauthorizedError().statusCode).toBe(401);
    expect(new ForbiddenError().statusCode).toBe(403);
    expect(new ConflictError('').statusCode).toBe(409);
  });
});

describe('Error Code Classification', () => {
  it('should have unique error codes', () => {
    const codes = [
      new AppError('').errorCode,
      new ValidationError('').errorCode,
      new NotFoundError('', '').errorCode,
      new UnauthorizedError().errorCode,
      new ForbiddenError().errorCode,
      new ConflictError('').errorCode
    ];

    expect(new Set(codes).size).toBe(codes.length);
  });
});

describe('Error Inheritance', () => {
  it('all error types should extend AppError', () => {
    expect(new ValidationError('') instanceof AppError).toBe(true);
    expect(new NotFoundError('', '') instanceof AppError).toBe(true);
    expect(new UnauthorizedError() instanceof AppError).toBe(true);
    expect(new ForbiddenError() instanceof AppError).toBe(true);
    expect(new ConflictError('') instanceof AppError).toBe(true);
  });

  it('all error types should extend Error', () => {
    expect(new AppError('') instanceof Error).toBe(true);
    expect(new ValidationError('') instanceof Error).toBe(true);
    expect(new NotFoundError('', '') instanceof Error).toBe(true);
  });
});

/**
 * Standardized Error Handling Utility
 * Provides consistent error handling patterns across the application
 */

const { getInstance: getLogger } = require('../services/logger');

class AppError extends Error {
  constructor(message, statusCode = 500, errorCode = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.timestamp = new Date().toISOString();
  }
}

class ValidationError extends AppError {
  constructor(message, field = null) {
    super(message, 400, 'VALIDATION_ERROR');
    this.field = field;
  }
}

class NotFoundError extends AppError {
  constructor(resource, identifier) {
    const message = `${resource} not found: ${identifier}`;
    super(message, 404, 'NOT_FOUND');
    this.resource = resource;
    this.identifier = identifier;
  }
}

class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized access') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

class ForbiddenError extends AppError {
  constructor(message = 'Access forbidden') {
    super(message, 403, 'FORBIDDEN');
  }
}

class ConflictError extends AppError {
  constructor(message, resource = null) {
    super(message, 409, 'CONFLICT');
    this.resource = resource;
  }
}

/**
 * Error Handler for Express middleware
 */
function errorMiddleware(err, req, res, next) {
  const logger = getLogger();
  const loggerChild = logger.createChild('ErrorHandler');

  // Default error properties
  let error = {
    statusCode: 500,
    errorCode: 'INTERNAL_ERROR',
    message: 'Internal Server Error',
    timestamp: new Date().toISOString()
  };

  // Handle specific error types
  if (err instanceof AppError) {
    error = {
      statusCode: err.statusCode,
      errorCode: err.errorCode,
      message: err.message,
      timestamp: err.timestamp
    };

    // Add field info for validation errors
    if (err instanceof ValidationError && err.field) {
      error.field = err.field;
    }
  } else if (err instanceof SyntaxError) {
    error = {
      statusCode: 400,
      errorCode: 'JSON_PARSE_ERROR',
      message: 'Invalid JSON in request body',
      timestamp: new Date().toISOString()
    };
  } else if (err.message) {
    error.message = err.message;
  }

  // Log error
  loggerChild.error(
    `${err.statusCode || 500} ${req.method} ${req.path}`,
    err instanceof Error ? err : new Error(JSON.stringify(err))
  );

  // Send response
  res.status(error.statusCode).json({
    error: {
      code: error.errorCode,
      message: error.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
}

/**
 * Async route wrapper to catch errors
 */
function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Try-catch wrapper with logging
 */
async function withErrorHandling(source, fn, context = {}) {
  const logger = getLogger();
  const loggerChild = logger.createChild(source);

  try {
    loggerChild.debug(`Starting operation`, context);
    const result = await fn();
    loggerChild.debug(`Operation completed successfully`);
    return result;
  } catch (error) {
    loggerChild.error(`Operation failed`, error);
    throw error;
  }
}

/**
 * Safe error serialization
 */
function serializeError(error) {
  if (error instanceof Error) {
    return {
      message: error.message,
      stack: error.stack,
      name: error.name,
      ...(error.statusCode && { statusCode: error.statusCode }),
      ...(error.errorCode && { errorCode: error.errorCode })
    };
  }

  if (typeof error === 'object') {
    return error;
  }

  return { message: String(error) };
}

/**
 * Validation error factory
 */
function createValidationError(errors) {
  const message = errors
    .map(e => `${e.field}: ${e.message}`)
    .join('; ');

  return new ValidationError(message);
}

/**
 * Get error response object
 */
function getErrorResponse(error, includeStack = false) {
  const response = {
    code: error.errorCode || 'INTERNAL_ERROR',
    message: error.message || 'Internal Server Error',
    timestamp: error.timestamp || new Date().toISOString()
  };

  if (includeStack && process.env.NODE_ENV === 'development') {
    response.stack = error.stack;
  }

  return response;
}

module.exports = {
  // Error classes
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,

  // Middleware
  errorMiddleware,
  asyncHandler,

  // Utilities
  withErrorHandling,
  serializeError,
  createValidationError,
  getErrorResponse
};

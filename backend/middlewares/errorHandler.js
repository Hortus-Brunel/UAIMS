const { errorResponse } = require('../utils/response');
const logger = require('../config/logger');

/**
 * Global Express error-handling middleware.
 * Must be registered LAST in the middleware chain (4 parameters).
 *
 * Catches any uncaught error passed via next(err) and returns a clean JSON response.
 * Sensitive details are hidden from the client in production.
 */
function errorHandler(err, req, res, next) {
  // Log the full error stack internally
  logger.error(`${req.method} ${req.originalUrl} → ${err.message}`, { stack: err.stack });

  // Multer / File upload errors
  if (err.code === 'LIMIT_FILE_SIZE') {
    return errorResponse(res, 'File is too large. Maximum allowed size is 10MB.', [], 413);
  }

  // JWT errors (if not caught by auth middleware)
  if (err.name === 'JsonWebTokenError') {
    return errorResponse(res, 'Invalid token.', [], 401);
  }

  if (err.name === 'TokenExpiredError') {
    return errorResponse(res, 'Token expired. Please log in again.', [], 401);
  }

  // Prisma known request errors
  if (err.code === 'P2002') {
    const field = err.meta?.target?.join(', ') || 'field';
    return errorResponse(res, `A record with this ${field} already exists.`, [], 409);
  }

  if (err.code === 'P2025') {
    return errorResponse(res, 'Record not found.', [], 404);
  }

  // Generic fallback
  const statusCode = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === 'production'
      ? 'An internal server error occurred. Please try again later.'
      : err.message || 'Internal server error.';

  return errorResponse(res, message, [], statusCode);
}

module.exports = errorHandler;

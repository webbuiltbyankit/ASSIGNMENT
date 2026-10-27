import crypto from 'crypto';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

export function errorHandler(err, req, res, next) {
  const requestId = req.headers['x-request-id'] || crypto.randomUUID();
  const statusCode = err.status || err.statusCode || 500;

  // Handle Mongoose Duplicate Key Error (11000)
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return res.status(409).json({
      success: false,
      error: {
        code: 'ERR_DUPLICATE_ENTRY',
        message: `An entry with this ${field} already exists.`,
        requestId,
      },
    });
  }

  // Handle Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const details = {};
    for (const [key, val] of Object.entries(err.errors || {})) {
      details[key] = val.message;
    }
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_VALIDATION_FAILED',
        message: 'Database schema validation failed.',
        details,
        requestId,
      },
    });
  }

  // Handle Mongoose CastError (invalid ObjectId)
  if (err.name === 'CastError') {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_INVALID_ID',
        message: `Invalid format for identifier: ${err.value}`,
        requestId,
      },
    });
  }

  // Handle JSON Syntax Error in request body
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'ERR_MALFORMED_JSON',
        message: 'The request body contained invalid JSON syntax.',
        requestId,
      },
    });
  }

  // General Error Logging
  logger.error(err.message || 'Internal Server Error', err, {
    requestId,
    method: req.method,
    path: req.originalUrl,
  });

  return res.status(statusCode).json({
    success: false,
    error: {
      code: err.code || (statusCode >= 500 ? 'ERR_INTERNAL_SERVER' : 'ERR_REQUEST_FAILED'),
      message: statusCode >= 500 && env.isProduction
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'An error occurred processing your request.',
      requestId,
      ...(env.isProduction ? {} : { stack: err.stack }),
    },
  });
}

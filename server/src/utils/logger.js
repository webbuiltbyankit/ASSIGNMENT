import { env } from '../config/env.js';

const SENSITIVE_KEYS = new Set([
  'password',
  'passwordhash',
  'confirmpassword',
  'token',
  'jwt',
  'secret',
  'cookie',
  'authorization',
  'cloudinary_api_secret',
]);

/**
 * Recursively redacts sensitive keys from log payloads
 */
export function sanitizeLogData(obj) {
  if (!obj || typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitizeLogData);
  }

  const sanitized = {};
  for (const [key, value] of Object.entries(obj)) {
    if (SENSITIVE_KEYS.has(key.toLowerCase())) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      sanitized[key] = sanitizeLogData(value);
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

export const logger = {
  info(message, meta = {}) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'INFO',
      message,
      ...sanitizeLogData(meta),
    }));
  },

  warn(message, meta = {}) {
    console.warn(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'WARN',
      message,
      ...sanitizeLogData(meta),
    }));
  },

  error(message, error = {}, meta = {}) {
    const errorDetails = error instanceof Error ? {
      name: error.name,
      message: error.message,
      ...(env.isProduction ? {} : { stack: error.stack }),
    } : error;

    console.error(JSON.stringify({
      timestamp: new Date().toISOString(),
      level: 'ERROR',
      message,
      error: errorDetails,
      ...sanitizeLogData(meta),
    }));
  },

  audit(event, { actorId = null, role = null, ip = null, outcome, target = null, requestId = null } = {}) {
    console.log(JSON.stringify({
      timestamp: new Date().toISOString(),
      type: 'AUDIT_LOG',
      event,
      actorId,
      role,
      ip: ip ? ip.replace(/\.\d+$/, '.xxx') : null, // Partial IP mask
      outcome,
      target,
      requestId,
    }));
  },
};

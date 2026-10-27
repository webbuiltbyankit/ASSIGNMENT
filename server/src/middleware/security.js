import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

/**
 * Helmet Security Headers Configuration
 */
export const helmetMiddleware = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: [
        "'self'",
        'data:',
        'blob:',
        'https://res.cloudinary.com',
        'https://images.unsplash.com',
      ],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      fontSrc: ["'self'", 'https://fonts.gstatic.com'],
      connectSrc: ["'self'", env.FRONTEND_ORIGIN],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: env.isProduction ? [] : null,
    },
  },
  crossOriginEmbedderPolicy: false,
});

/**
 * CORS Middleware
 */
export const corsMiddleware = cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl, or same-origin server proxy)
    if (!origin) return callback(null, true);
    if (origin === env.FRONTEND_ORIGIN || origin.startsWith('http://localhost:')) {
      return callback(null, true);
    }
    return callback(new Error('Cross-Origin Request Blocked by CORS Policy'), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
});

/**
 * Rate Limiter for Authentication (Prompt 28)
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: env.isTest ? 1000 : 20, // 20 attempts per IP per 15 min in production/dev
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: {
      code: 'ERR_TOO_MANY_REQUESTS',
      message: 'Too many login or registration attempts. Please wait 15 minutes before retrying.',
    },
  },
  handler: (req, res, next, options) => {
    logger.warn('Auth Rate limit exceeded', { ip: req.ip, path: req.path });
    res.status(429).json(options.message);
  },
});

/**
 * Anti-CSRF Origin Check for state-changing requests (Prompt 37)
 */
export function csrfProtection(req, res, next) {
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];
  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Check Origin or Referer header on state-changing requests
  const origin = req.headers.origin;
  const referer = req.headers.referer;

  if (origin) {
    if (origin === env.FRONTEND_ORIGIN || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      return next();
    }
    logger.audit('CSRF_BLOCKED', { origin, target: req.originalUrl, outcome: 'REJECTED' });
    return res.status(403).json({
      success: false,
      error: {
        code: 'ERR_CSRF_INVALID_ORIGIN',
        message: 'Cross-site request blocked.',
      },
    });
  }

  // In development, non-browser clients (curl/tests) may not send origin
  next();
}

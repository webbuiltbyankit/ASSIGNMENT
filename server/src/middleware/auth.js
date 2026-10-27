import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import { logger } from '../utils/logger.js';

const COOKIE_NAME = 'forme_session';

/**
 * Extracts session token from signed/unsigned cookies or Bearer header
 */
function extractToken(req) {
  if (req.cookies && req.cookies[COOKIE_NAME]) {
    return req.cookies[COOKIE_NAME];
  }
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  return null;
}

/**
 * Optional Auth Middleware: parses token if present, does not reject anonymous visitors
 */
export async function optionalAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      req.user = null;
      return next();
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      req.user = null;
      return next();
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name || null,
    };
    next();
  } catch (err) {
    req.user = null;
    next();
  }
}

/**
 * Require Authentication Middleware: rejects unauthenticated requests with 401
 */
export async function requireAuth(req, res, next) {
  const token = extractToken(req);
  if (!token) {
    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_UNAUTHORIZED',
        message: 'Authentication required. Please sign in.',
      },
    });
  }

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    if (!decoded || !decoded.userId) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_INVALID_SESSION',
          message: 'Session token invalid or expired.',
        },
      });
    }

    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_ACCOUNT_NOT_FOUND',
          message: 'Account associated with this session no longer exists.',
        },
      });
    }

    req.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name || null,
    };
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_SESSION_EXPIRED',
          message: 'Your session has expired. Please sign in again.',
        },
      });
    }

    return res.status(401).json({
      success: false,
      error: {
        code: 'ERR_INVALID_TOKEN',
        message: 'Invalid session authentication.',
      },
    });
  }
}

/**
 * Role-Based Access Control Middleware: checks user role, returns 403 if unauthorized
 */
export function requireRole(requiredRole) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: {
          code: 'ERR_UNAUTHORIZED',
          message: 'Authentication required.',
        },
      });
    }

    if (req.user.role !== requiredRole) {
      logger.audit('RBAC_DENIAL', {
        actorId: req.user.id,
        role: req.user.role,
        target: req.originalUrl,
        outcome: 'DENIED',
      });

      return res.status(403).json({
        success: false,
        error: {
          code: 'ERR_FORBIDDEN',
          message: `Administrative privileges required to perform this action.`,
        },
      });
    }

    next();
  };
}

/**
 * Creates and sets secure HttpOnly cookie on response
 */
export function setAuthCookie(res, user) {
  const token = jwt.sign(
    { userId: user._id || user.id, role: user.role },
    env.JWT_SECRET,
    { expiresIn: `${env.SESSION_EXPIRY_DAYS}d` }
  );

  const isProduction = env.isProduction;
  const sameSite = isProduction ? (process.env.COOKIE_SAME_SITE || 'none') : 'lax';

  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProduction, // HTTPS required when sameSite is 'none'
    sameSite,
    maxAge: env.SESSION_EXPIRY_DAYS * 24 * 60 * 60 * 1000,
    path: '/',
  });

  return token;
}

/**
 * Clears authentication cookie
 */
export function clearAuthCookie(res) {
  const isProduction = env.isProduction;
  const sameSite = isProduction ? (process.env.COOKIE_SAME_SITE || 'none') : 'lax';

  res.clearCookie(COOKIE_NAME, {
    httpOnly: true,
    secure: isProduction,
    sameSite,
    path: '/',
  });
}

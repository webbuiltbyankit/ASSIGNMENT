import express from 'express';
import { authController } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, registerSchema, loginSchema } from '../middleware/validation.js';
import { authRateLimiter, csrfProtection } from '../middleware/security.js';

const router = express.Router();

// POST /api/auth/register
router.post(
  '/register',
  authRateLimiter,
  csrfProtection,
  validate(registerSchema, 'body'),
  authController.register
);

// POST /api/auth/login
router.post(
  '/login',
  authRateLimiter,
  csrfProtection,
  validate(loginSchema, 'body'),
  authController.login
);

// GET /api/auth/me
router.get('/me', requireAuth, authController.getMe);

// POST /api/auth/logout
router.post('/logout', csrfProtection, authController.logout);

export default router;

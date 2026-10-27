import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { setAuthCookie, clearAuthCookie } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

export const authController = {
  /**
   * Register customer (Prompt 23)
   */
  async register(req, res, next) {
    try {
      const { email, password, name } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Check if user already exists
      const existing = await User.findOne({ email: normalizedEmail });
      if (existing) {
        logger.audit('REGISTER_FAILED', { outcome: 'DUPLICATE_EMAIL', ip: req.ip });
        return res.status(409).json({
          success: false,
          error: {
            code: 'ERR_EMAIL_EXISTS',
            message: 'An account with this email address already exists.',
          },
        });
      }

      // Hash password securely (salt rounds = 10)
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);

      // Explicit role default: all public signups are customers (prevent role escalation)
      const newUser = await User.create({
        email: normalizedEmail,
        passwordHash,
        name: name ? name.trim() : undefined,
        role: 'customer',
      });

      // Set HttpOnly session cookie
      setAuthCookie(res, newUser);

      logger.audit('REGISTER_SUCCESS', {
        actorId: newUser._id.toString(),
        role: newUser.role,
        outcome: 'SUCCESS',
        ip: req.ip,
      });

      return res.status(201).json({
        success: true,
        user: newUser.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Login credentials verification (Prompt 24)
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const normalizedEmail = email.toLowerCase().trim();

      // Explicitly select passwordHash
      const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');
      if (!user) {
        logger.audit('LOGIN_FAILED', { outcome: 'USER_NOT_FOUND', ip: req.ip });
        // Return uniform non-revealing error
        return res.status(401).json({
          success: false,
          error: {
            code: 'ERR_INVALID_CREDENTIALS',
            message: 'Invalid email address or password.',
          },
        });
      }

      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        logger.audit('LOGIN_FAILED', { actorId: user._id.toString(), outcome: 'BAD_PASSWORD', ip: req.ip });
        return res.status(401).json({
          success: false,
          error: {
            code: 'ERR_INVALID_CREDENTIALS',
            message: 'Invalid email address or password.',
          },
        });
      }

      setAuthCookie(res, user);

      logger.audit('LOGIN_SUCCESS', {
        actorId: user._id.toString(),
        role: user.role,
        outcome: 'SUCCESS',
        ip: req.ip,
      });

      return res.status(200).json({
        success: true,
        user: user.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get current authenticated user profile (Prompt 26)
   */
  async getMe(req, res) {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  },

  /**
   * Logout user and invalidate cookie (Prompt 26)
   */
  async logout(req, res) {
    if (req.user) {
      logger.audit('LOGOUT', { actorId: req.user.id, outcome: 'SUCCESS' });
    }
    clearAuthCookie(res);
    return res.status(200).json({
      success: true,
      message: 'Successfully signed out.',
    });
  },
};

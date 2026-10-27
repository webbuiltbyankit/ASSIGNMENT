import express from 'express';
import { cartController } from '../controllers/cartController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { validate, cartQuoteSchema } from '../middleware/validation.js';
import { csrfProtection } from '../middleware/security.js';

const router = express.Router();

// POST /api/cart/quote - Authoritative server quotation (anonymous or authenticated)
router.post(
  '/quote',
  validate(cartQuoteSchema, 'body'),
  cartController.getQuote
);

// GET /api/cart - Fetch authenticated customer cart
router.get('/', requireAuth, cartController.getCart);

// PUT /api/cart - Update authenticated customer cart
router.put('/', requireAuth, csrfProtection, cartController.updateCart);

export default router;

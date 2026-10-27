import express from 'express';
import { catalogController } from '../controllers/catalogController.js';

const router = express.Router();

// GET /api/products
router.get('/', catalogController.getProducts);

// GET /api/products/:slug
router.get('/:slug', catalogController.getProductBySlug);

export default router;

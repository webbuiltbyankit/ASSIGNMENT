import express from 'express';
import { catalogController } from '../controllers/catalogController.js';

const router = express.Router();

// GET /api/categories
router.get('/', catalogController.getCategories);

export default router;

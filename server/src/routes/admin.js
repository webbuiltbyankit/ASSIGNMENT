import express from 'express';
import multer from 'multer';
import { adminController } from '../controllers/adminController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, productCreateSchema } from '../middleware/validation.js';
import { csrfProtection } from '../middleware/security.js';

const router = express.Router();

// Enforce authentication & admin role across ALL /api/admin routes
router.use(requireAuth);
router.use(requireRole('admin'));

// Multer memory storage configuration for secure bounded uploads (Prompt 51)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1,
  },
});

// Diagnostic Admin Verification (Prompt 29)
router.get('/ping', adminController.ping);

// Admin Product Routes (Prompts 45, 46, 47, 48, 49)
router.get('/products', adminController.listProducts);
router.get('/products/:id', adminController.getProductById);
router.post(
  '/products',
  csrfProtection,
  validate(productCreateSchema, 'body'),
  adminController.createProduct
);
router.patch('/products/:id', csrfProtection, adminController.updateProduct);
router.delete('/products/:id', csrfProtection, adminController.deleteProduct);

// Admin Image Upload Endpoint (Prompt 51)
router.post(
  '/uploads/images',
  csrfProtection,
  upload.single('image'),
  adminController.uploadImage
);

// Admin Category Routes (Prompt 58)
router.post('/categories', csrfProtection, adminController.createCategory);
router.patch('/categories/:slug', csrfProtection, adminController.updateCategory);

export default router;

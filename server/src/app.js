import express from 'express';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import { helmetMiddleware, corsMiddleware } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/auth.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import cartRoutes from './routes/cart.js';
import adminRoutes from './routes/admin.js';

export const app = express();

// Set reverse-proxy trust for Render / Vercel proxy headers (Prompt 21 & 72)
if (env.TRUST_PROXY) {
  app.set('trust proxy', 1);
}

// Security & Header Protection
app.use(helmetMiddleware);
app.use(corsMiddleware);

// Cookie & Body Parsing
app.use(cookieParser(env.COOKIE_SECRET));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

// Health Check Endpoint (Prompt 21)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: env.NODE_ENV,
    version: '1.0.0',
  });
});

// Mount API Route Namespaces
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminRoutes);

// Catch-all 404 handler for API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'ERR_ENDPOINT_NOT_FOUND',
      message: `API endpoint ${req.method} ${req.originalUrl} does not exist.`,
    },
  });
});

// Centralized Error Handling Middleware (Prompt 71)
app.use(errorHandler);

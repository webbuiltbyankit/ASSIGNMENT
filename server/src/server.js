import { app } from './app.js';
import { env } from './config/env.js';
import { connectDB, disconnectDB } from './config/database.js';
import { logger } from './utils/logger.js';

async function bootstrap() {
  logger.info('Starting FORME Clothing API Server...', { env: env.NODE_ENV, port: env.PORT });

  // Connect to MongoDB
  await connectDB();

  const server = app.listen(env.PORT, () => {
    logger.info(`FORME Server listening on http://localhost:${env.PORT}`);
    logger.info(`Health check available at http://localhost:${env.PORT}/api/health`);
  });

  // Graceful shutdown
  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down server gracefully...`);
    server.close(async () => {
      await disconnectDB();
      logger.info('HTTP server closed.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

bootstrap().catch((err) => {
  logger.error('Fatal server bootstrap error:', err);
  process.exit(1);
});

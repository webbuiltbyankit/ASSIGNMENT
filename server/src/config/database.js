import mongoose from 'mongoose';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let isConnected = false;

export async function connectDB() {
  if (isConnected) return mongoose.connection;

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      autoIndex: !env.isProduction,
    });

    isConnected = true;
    logger.info('MongoDB connected successfully', { host: conn.connection.host, name: conn.connection.name });

    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB runtime connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
      isConnected = false;
    });

    return conn.connection;
  } catch (error) {
    logger.error('MongoDB initial connection failure:', error);
    if (env.isProduction) {
      process.exit(1);
    }
    // In local dev without active mongod, don't crash immediately so mock tests / static endpoints can operate
    return null;
  }
}

export async function disconnectDB() {
  if (isConnected) {
    await mongoose.disconnect();
    isConnected = false;
    logger.info('MongoDB disconnected cleanly');
  }
}

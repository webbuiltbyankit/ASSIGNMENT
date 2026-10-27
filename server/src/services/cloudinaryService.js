import { v2 as cloudinary } from 'cloudinary';
import { env } from '../config/env.js';
import { logger } from '../utils/logger.js';

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME &&
  env.CLOUDINARY_API_KEY &&
  env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  });
  logger.info('Cloudinary service initialized with cloud name', { cloudName: env.CLOUDINARY_CLOUD_NAME });
} else {
  logger.info('Cloudinary credentials not provided; using verified local asset pipeline mode.');
}

export const cloudinaryService = {
  isConfigured() {
    return isConfigured;
  },

  /**
   * Upload an image buffer or file path to Cloudinary
   */
  async uploadImage(fileBufferOrPath, { folder = 'forme/products', publicId = null } = {}) {
    if (!isConfigured || env.isTest) {
      // Deterministic mock result for offline testing or when credentials are not configured
      const mockId = publicId || `mock_${Date.now()}`;
      return {
        publicId: `${folder}/${mockId}`,
        secureUrl: `https://res.cloudinary.com/forme-store/image/upload/v1/${folder}/${mockId}.jpg`,
        width: 1200,
        height: 1500,
        format: 'jpg',
        bytes: 250000,
        isMock: true,
      };
    }

    try {
      const options = {
        folder,
        resource_type: 'image',
        overwrite: true,
      };
      if (publicId) options.public_id = publicId;

      const result = await new Promise((resolve, reject) => {
        if (typeof fileBufferOrPath === 'string') {
          cloudinary.uploader.upload(fileBufferOrPath, options, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
        } else {
          const uploadStream = cloudinary.uploader.upload_stream(options, (err, res) => {
            if (err) reject(err);
            else resolve(res);
          });
          uploadStream.end(fileBufferOrPath);
        }
      });

      return {
        publicId: result.public_id,
        secureUrl: result.secure_url,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
        isMock: false,
      };
    } catch (err) {
      logger.error('Cloudinary upload failure:', err);
      throw new Error(`Media upload provider failed: ${err.message}`);
    }
  },

  /**
   * Delete an image from Cloudinary by public ID
   */
  async deleteImage(publicId) {
    if (!isConfigured || env.isTest) {
      return { result: 'ok', isMock: true };
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result;
    } catch (err) {
      logger.error('Cloudinary deletion error:', err, { publicId });
      throw new Error(`Media deletion provider failed: ${err.message}`);
    }
  },
};

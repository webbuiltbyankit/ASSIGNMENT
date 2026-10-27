import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';
import { cloudinaryService } from '../services/cloudinaryService.js';
import { logger } from '../utils/logger.js';

export const adminController = {
  /**
   * Diagnostic admin ping (Prompt 29)
   */
  async ping(req, res) {
    return res.status(200).json({
      success: true,
      message: 'Admin authorization verified.',
      user: req.user,
      timestamp: new Date().toISOString(),
    });
  },

  /**
   * Admin Product Listing (Prompt 46)
   */
  async listProducts(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 20,
        search,
        collection,
        category,
        active,
      } = req.query;

      const numPage = Math.max(1, parseInt(page, 10) || 1);
      const numPageSize = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 20));

      const filter = {};
      if (collection && collection !== 'all') filter.collection = collection.toLowerCase();
      if (category && category !== 'all') filter.category = category.toLowerCase();
      if (active !== undefined && active !== 'all') filter.active = active === 'true';

      if (search && typeof search === 'string') {
        const trimmed = search.trim();
        if (trimmed.length > 0) {
          const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          filter.$or = [
            { name: { $regex: escaped, $options: 'i' } },
            { slug: { $regex: escaped, $options: 'i' } },
            { color: { $regex: escaped, $options: 'i' } },
          ];
        }
      }

      const total = await Product.countDocuments(filter);
      const raw = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip((numPage - 1) * numPageSize)
        .limit(numPageSize);

      const items = raw.map((p) => p.toAdminJSON());

      return res.status(200).json({
        success: true,
        items,
        total,
        page: numPage,
        pageSize: numPageSize,
        totalPages: Math.ceil(total / numPageSize) || 1,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Admin Single Product Read (Prompt 47)
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      let product;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      } else {
        product = await Product.findOne({ slug: id.toLowerCase().trim() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ERR_PRODUCT_NOT_FOUND',
            message: `Product record not found for: ${id}`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        product: product.toAdminJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Create Product (Prompt 45)
   */
  async createProduct(req, res, next) {
    try {
      const {
        name,
        slug,
        description,
        price,
        collection,
        category,
        color,
        fabric,
        care,
        sizes,
        images,
        active,
        featured,
      } = req.body;

      // Check duplicate slug
      const existingSlug = await Product.findOne({ slug: slug.toLowerCase().trim() });
      if (existingSlug) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ERR_DUPLICATE_SLUG',
            message: `A product with slug "${slug}" already exists.`,
          },
        });
      }

      // Check category exists (Prompt 48)
      const catRecord = await Category.findOne({ slug: category.toLowerCase().trim() });
      if (!catRecord) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_INVALID_CATEGORY',
            message: `Category "${category}" is not recognized in taxonomy.`,
          },
        });
      }

      const pricePaise = Math.round(Number(price) * 100);

      const newProduct = await Product.create({
        name: name.trim(),
        slug: slug.toLowerCase().trim(),
        description: description.trim(),
        pricePaise,
        collection,
        category: category.toLowerCase().trim(),
        color: color ? color.trim() : undefined,
        fabric: fabric ? fabric.trim() : undefined,
        care: care ? care.trim() : undefined,
        sizes: sizes || [],
        images: images || [],
        coverImage: images?.[0]?.assetId || null,
        active: active !== false,
        featured: Boolean(featured),
      });

      logger.audit('ADMIN_PRODUCT_CREATED', {
        actorId: req.user.id,
        target: newProduct.slug,
        outcome: 'SUCCESS',
      });

      return res.status(201).json({
        success: true,
        product: newProduct.toAdminJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Safe Product Update (Prompt 48)
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;

      let product;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      } else {
        product = await Product.findOne({ slug: id.toLowerCase().trim() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ERR_PRODUCT_NOT_FOUND',
            message: `Product not found: ${id}`,
          },
        });
      }

      // Check category if updating category
      if (updates.category) {
        const catRecord = await Category.findOne({ slug: updates.category.toLowerCase().trim() });
        if (!catRecord) {
          return res.status(400).json({
            success: false,
            error: {
              code: 'ERR_INVALID_CATEGORY',
              message: `Category "${updates.category}" not found in taxonomy.`,
            },
          });
        }
        product.category = updates.category.toLowerCase().trim();
      }

      // If price updated, convert to paise
      if (updates.price !== undefined) {
        product.pricePaise = Math.round(Number(updates.price) * 100);
      }

      if (updates.name) product.name = updates.name.trim();
      if (updates.description) product.description = updates.description.trim();
      if (updates.collection) product.collection = updates.collection;
      if (updates.color !== undefined) product.color = updates.color;
      if (updates.fabric !== undefined) product.fabric = updates.fabric;
      if (updates.care !== undefined) product.care = updates.care;
      if (updates.sizes !== undefined) product.sizes = updates.sizes;
      if (updates.images !== undefined) product.images = updates.images;
      if (updates.active !== undefined) product.active = Boolean(updates.active);
      if (updates.featured !== undefined) product.featured = Boolean(updates.featured);

      await product.save();

      logger.audit('ADMIN_PRODUCT_UPDATED', {
        actorId: req.user.id,
        target: product.slug,
        outcome: 'SUCCESS',
      });

      return res.status(200).json({
        success: true,
        product: product.toAdminJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Safe Product Deletion / Archive (Prompt 49)
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      let product;
      if (mongoose.Types.ObjectId.isValid(id)) {
        product = await Product.findById(id);
      } else {
        product = await Product.findOne({ slug: id.toLowerCase().trim() });
      }

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ERR_PRODUCT_NOT_FOUND',
            message: `Product not found: ${id}`,
          },
        });
      }

      // Soft-delete / archive to preserve cart line references (Prompt 49)
      product.active = false;
      await product.save();

      logger.audit('ADMIN_PRODUCT_ARCHIVED', {
        actorId: req.user.id,
        target: product.slug,
        outcome: 'SUCCESS',
      });

      return res.status(200).json({
        success: true,
        message: `Product "${product.name}" archived successfully.`,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Upload image to Cloudinary (Prompt 51)
   */
  async uploadImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_MISSING_FILE',
            message: 'No image file uploaded in request.',
          },
        });
      }

      // Allowed MIME types
      const allowedMimes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'ERR_UNSUPPORTED_FORMAT',
            message: 'Only JPEG, PNG, and WebP images are permitted.',
          },
        });
      }

      // Upload via Cloudinary service
      const uploadResult = await cloudinaryService.uploadImage(req.file.buffer, {
        folder: 'forme/products',
      });

      logger.audit('ADMIN_IMAGE_UPLOADED', {
        actorId: req.user.id,
        target: uploadResult.publicId,
        outcome: 'SUCCESS',
      });

      return res.status(201).json({
        success: true,
        asset: uploadResult,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Category Management (Prompt 58)
   */
  async createCategory(req, res, next) {
    try {
      const { name, slug, description, displayOrder } = req.body;
      const normalizedSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').trim();

      const existing = await Category.findOne({ slug: normalizedSlug });
      if (existing) {
        return res.status(409).json({
          success: false,
          error: {
            code: 'ERR_DUPLICATE_CATEGORY',
            message: `Category slug "${normalizedSlug}" already exists.`,
          },
        });
      }

      const cat = await Category.create({
        name: name.trim(),
        slug: normalizedSlug,
        description: description ? description.trim() : undefined,
        displayOrder: Number(displayOrder) || 0,
      });

      return res.status(201).json({
        success: true,
        category: cat.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  async updateCategory(req, res, next) {
    try {
      const { slug } = req.params;
      const { name, description, displayOrder, active } = req.body;

      const cat = await Category.findOne({ slug: slug.toLowerCase().trim() });
      if (!cat) {
        return res.status(404).json({
          success: false,
          error: { code: 'ERR_CATEGORY_NOT_FOUND', message: 'Category not found.' },
        });
      }

      if (name) cat.name = name.trim();
      if (description !== undefined) cat.description = description.trim();
      if (displayOrder !== undefined) cat.displayOrder = Number(displayOrder);
      if (active !== undefined) cat.active = Boolean(active);

      await cat.save();

      return res.status(200).json({
        success: true,
        category: cat.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  },
};

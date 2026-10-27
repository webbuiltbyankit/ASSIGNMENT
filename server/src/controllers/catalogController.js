import { Product } from '../models/Product.js';
import { Category } from '../models/Category.js';

export const catalogController = {
  /**
   * Public Catalog Listing with search, filtering, sorting, and pagination (Prompts 63, 64, 65)
   */
  async getProducts(req, res, next) {
    try {
      const {
        page = 1,
        pageSize = 12,
        collection,
        category,
        sort = 'featured',
        q,
        inStock,
        size,
      } = req.query;

      const numPage = Math.max(1, parseInt(page, 10) || 1);
      const numPageSize = Math.min(50, Math.max(1, parseInt(pageSize, 10) || 12));

      // Build database filter
      const filter = { active: true };

      if (collection && ['men', 'women'].includes(collection.toLowerCase())) {
        filter.collection = collection.toLowerCase();
      }

      if (category && category !== 'all') {
        filter.category = category.toLowerCase().trim();
      }

      // Safe Regex search (escapes special characters) (Prompt 64)
      if (q && typeof q === 'string') {
        const trimmed = q.trim();
        if (trimmed.length > 0) {
          const escaped = trimmed.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          filter.$or = [
            { name: { $regex: escaped, $options: 'i' } },
            { description: { $regex: escaped, $options: 'i' } },
            { color: { $regex: escaped, $options: 'i' } },
            { fabric: { $regex: escaped, $options: 'i' } },
          ];
        }
      }

      if (inStock === 'true') {
        filter['sizes.stock'] = { $gt: 0 };
      }

      if (size && typeof size === 'string') {
        filter.sizes = {
          $elemMatch: {
            size: size.toUpperCase().trim(),
            stock: { $gt: 0 },
          },
        };
      }

      // Determine Sort Criteria
      let sortCriteria = {};
      switch (sort) {
        case 'newest':
          sortCriteria = { createdAt: -1, _id: -1 };
          break;
        case 'priceAsc':
          sortCriteria = { pricePaise: 1, _id: 1 };
          break;
        case 'priceDesc':
          sortCriteria = { pricePaise: -1, _id: -1 };
          break;
        case 'featured':
        default:
          sortCriteria = { featured: -1, createdAt: -1, _id: -1 };
          break;
      }

      const total = await Product.countDocuments(filter);
      const rawProducts = await Product.find(filter)
        .sort(sortCriteria)
        .skip((numPage - 1) * numPageSize)
        .limit(numPageSize);

      const items = rawProducts.map((p) => p.toPublicJSON());

      return res.status(200).json({
        success: true,
        items,
        total,
        page: numPage,
        pageSize: numPageSize,
        totalPages: Math.ceil(total / numPageSize) || 1,
        filters: {
          collection: collection || null,
          category: category || null,
          sort,
          q: q || null,
        },
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Public Product Details by Slug (Prompt 63 & 66)
   */
  async getProductBySlug(req, res, next) {
    try {
      const { slug } = req.params;
      const product = await Product.findOne({ slug: slug.toLowerCase().trim(), active: true });

      if (!product) {
        return res.status(404).json({
          success: false,
          error: {
            code: 'ERR_PRODUCT_NOT_FOUND',
            message: `No active product found matching slug: ${slug}`,
          },
        });
      }

      return res.status(200).json({
        success: true,
        product: product.toPublicJSON(),
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Public Active Categories List (Prompt 44)
   */
  async getCategories(req, res, next) {
    try {
      const categories = await Category.find({ active: true }).sort({ displayOrder: 1, name: 1 });
      return res.status(200).json({
        success: true,
        categories: categories.map((c) => c.toPublicJSON()),
      });
    } catch (err) {
      next(err);
    }
  },
};

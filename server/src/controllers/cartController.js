import mongoose from 'mongoose';
import { Product } from '../models/Product.js';
import { Cart } from '../models/Cart.js';

export const cartController = {
  /**
   * Authoritative Cart Quote Calculation (Prompt 68)
   * Validates each requested line item against live MongoDB product records & stock.
   */
  async getQuote(req, res, next) {
    try {
      const { lines = [] } = req.body;

      const validLines = [];
      const unavailableLines = [];
      let totalPaise = 0;

      for (const line of lines) {
        // Find product by ObjectId or slug/id
        let product;
        if (mongoose.Types.ObjectId.isValid(line.productId)) {
          product = await Product.findById(line.productId);
        } else {
          product = await Product.findOne({
            $or: [{ slug: line.productId }, { id: line.productId }],
          });
        }

        if (!product || !product.active) {
          unavailableLines.push({
            productId: line.productId,
            variantId: line.variantId,
            reason: 'Product is archived or no longer available',
          });
          continue;
        }

        // Find the variant
        const variant = product.sizes?.find(
          (s) => s.variantId === line.variantId || s.size === line.variantId
        );

        if (!variant) {
          unavailableLines.push({
            productId: line.productId,
            variantId: line.variantId,
            title: product.name,
            reason: 'Requested size is no longer available',
          });
          continue;
        }

        if (variant.stock <= 0) {
          unavailableLines.push({
            productId: line.productId,
            variantId: line.variantId,
            title: product.name,
            size: variant.size,
            reason: 'Requested size is out of stock',
          });
          continue;
        }

        // Bound quantity by stock
        const grantedQuantity = Math.min(line.quantity, variant.stock, 10);
        const unitPricePaise = product.pricePaise;
        const lineTotalPaise = unitPricePaise * grantedQuantity;
        totalPaise += lineTotalPaise;

        validLines.push({
          productId: product._id.toString(),
          productSlug: product.slug,
          variantId: variant.variantId,
          title: product.name,
          color: product.color || null,
          size: variant.size,
          quantity: grantedQuantity,
          availableStock: variant.stock,
          unitPricePaise,
          unitPriceINR: Math.round(unitPricePaise / 100),
          lineTotalPaise,
          lineTotalINR: Math.round(lineTotalPaise / 100),
          thumbnail: product.coverImage || product.images?.[0]?.secureUrl || null,
        });
      }

      return res.status(200).json({
        success: true,
        currency: 'INR',
        totalPaise,
        totalINR: Math.round(totalPaise / 100),
        itemCount: validLines.reduce((sum, l) => sum + l.quantity, 0),
        validLines,
        unavailableLines,
        hasUnavailable: unavailableLines.length > 0,
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Get authenticated user's cart (Prompt 67 & 69)
   */
  async getCart(req, res, next) {
    try {
      const cart = await Cart.findOne({ userId: req.user.id });
      return res.status(200).json({
        success: true,
        cart: cart ? cart.lines : [],
      });
    } catch (err) {
      next(err);
    }
  },

  /**
   * Synchronize authenticated user's cart (Prompt 67 & 69)
   */
  async updateCart(req, res, next) {
    try {
      const { lines = [] } = req.body;

      // Filter and validate line structure
      const cleanLines = lines
        .filter((l) => l.productId && l.variantId && l.quantity > 0)
        .map((l) => ({
          lineId: `${l.productId}_${l.variantId}`,
          productId: l.productId,
          variantId: l.variantId,
          size: l.size || 'M',
          quantity: Math.min(l.quantity, 10),
        }));

      const cart = await Cart.findOneAndUpdate(
        { userId: req.user.id },
        { lines: cleanLines },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return res.status(200).json({
        success: true,
        cart: cart.lines,
      });
    } catch (err) {
      next(err);
    }
  },
};

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';

describe('Authoritative Cart Quote Calculation Suite (Prompt 68)', () => {
  let testProduct = null;

  beforeAll(async () => {
    await connectDB();
    await Category.findOneAndUpdate(
      { slug: 'shirts' },
      { name: 'Shirts', slug: 'shirts', active: true },
      { upsert: true }
    );

    // Create a deterministic test product: Price = 3890 INR (389000 paise)
    testProduct = await Product.findOneAndUpdate(
      { slug: 'test-quote-linen-shirt' },
      {
        name: 'Test Linen Shirt',
        slug: 'test-quote-linen-shirt',
        description: 'Test garment for quote calculations',
        pricePaise: 389000,
        collection: 'men',
        category: 'shirts',
        sizes: [
          { variantId: 'test_var_m', size: 'M', stock: 10 },
          { variantId: 'test_var_l', size: 'L', stock: 0 }, // Out of stock
        ],
        active: true,
      },
      { upsert: true, new: true }
    );
  });

  afterAll(async () => {
    if (testProduct) {
      await Product.findByIdAndDelete(testProduct._id);
    }
    await disconnectDB();
  });

  it('Calculates correct subtotal in integer paise and rupees', async () => {
    const res = await request(app)
      .post('/api/cart/quote')
      .send({
        lines: [
          {
            productId: testProduct._id.toString(),
            variantId: 'test_var_m',
            quantity: 2,
            // Tampered price attempt:
            claimedPrice: 10,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.currency).toBe('INR');
    // 2 x 389000 paise = 778000 paise
    expect(res.body.totalPaise).toBe(778000);
    expect(res.body.totalINR).toBe(7780);
    expect(res.body.validLines).toHaveLength(1);
    expect(res.body.validLines[0].unitPriceINR).toBe(3890);
    expect(res.body.unavailableLines).toHaveLength(0);
  });

  it('Flags out-of-stock sizes as unavailable', async () => {
    const res = await request(app)
      .post('/api/cart/quote')
      .send({
        lines: [
          {
            productId: testProduct._id.toString(),
            variantId: 'test_var_l', // stock = 0
            quantity: 1,
          },
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.hasUnavailable).toBe(true);
    expect(res.body.unavailableLines).toHaveLength(1);
    expect(res.body.unavailableLines[0].reason).toContain('out of stock');
    expect(res.body.totalINR).toBe(0);
  });
});

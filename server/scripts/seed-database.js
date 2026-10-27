import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB, disconnectDB } from '../src/config/database.js';
import { Product } from '../src/models/Product.js';
import { Category } from '../src/models/Category.js';
import { logger } from '../src/utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

async function seedDatabase() {
  console.log('--- FORME Database Seeding Routine ---');
  await connectDB();

  // 1. Read Blueprint and Manifest
  const blueprintPath = path.join(rootDir, 'data/catalog-blueprint.json');
  const manifestPath = path.join(rootDir, 'asset-manifest.json');

  const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // Build asset lookup map
  const assetMap = new Map();
  for (const asset of manifest.assets) {
    assetMap.set(asset.assetId, asset);
  }

  // 2. Seed Categories
  console.log(`Seeding ${blueprint.categories.length} clothing categories...`);
  for (let i = 0; i < blueprint.categories.length; i++) {
    const cat = blueprint.categories[i];
    await Category.findOneAndUpdate(
      { slug: cat.slug },
      {
        name: cat.name,
        slug: cat.slug,
        description: cat.description,
        displayOrder: i + 1,
        active: true,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }
  console.log('✓ Categories seeded successfully.');

  // 3. Seed 20 Clothing Products
  console.log(`Seeding exactly ${blueprint.products.length} products...`);
  for (const item of blueprint.products) {
    const frontAsset = assetMap.get(item.imageShotPlan.front.assetId);
    const angleAsset = assetMap.get(item.imageShotPlan.angle.assetId);
    const detailAsset = assetMap.get(item.imageShotPlan.detail.assetId);

    const images = [
      {
        assetId: item.imageShotPlan.front.assetId,
        secureUrl: frontAsset?.deliveryUrl || frontAsset?.localPath || null,
        publicId: frontAsset?.cloudinaryPublicId || null,
        alt: `${item.name} in ${item.color} - Frontal Silhouette`,
        role: 'primary',
        view: 'front',
        width: frontAsset?.dimensions?.width || 800,
        height: frontAsset?.dimensions?.height || 1000,
      },
      {
        assetId: item.imageShotPlan.angle.assetId,
        secureUrl: angleAsset?.deliveryUrl || angleAsset?.localPath || null,
        publicId: angleAsset?.cloudinaryPublicId || null,
        alt: `${item.name} in ${item.color} - Movement and Drape`,
        role: 'gallery',
        view: 'angle',
        width: angleAsset?.dimensions?.width || 800,
        height: angleAsset?.dimensions?.height || 1000,
      },
      {
        assetId: item.imageShotPlan.detail.assetId,
        secureUrl: detailAsset?.deliveryUrl || detailAsset?.localPath || null,
        publicId: detailAsset?.cloudinaryPublicId || null,
        alt: `${item.name} - ${item.fabric} Fabric Texture & Seams`,
        role: 'gallery',
        view: 'detail',
        width: detailAsset?.dimensions?.width || 800,
        height: detailAsset?.dimensions?.height || 1000,
      },
    ];

    const pricePaise = Math.round(item.price * 100);

    await Product.findOneAndUpdate(
      { slug: item.slug },
      {
        name: item.name,
        slug: item.slug,
        description: item.description,
        pricePaise,
        collection: item.collection,
        category: item.category,
        color: item.color,
        fabric: item.fabric,
        care: item.care,
        active: item.active !== false,
        featured: Boolean(item.featured),
        sizes: item.sizes,
        images,
        coverImage: item.imageShotPlan.front.assetId,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
  }

  const finalProductCount = await Product.countDocuments();
  console.log(`✓ Verified ${finalProductCount} products in MongoDB.`);
  console.log('Seeding completed successfully.');

  await disconnectDB();
}

seedDatabase().catch((err) => {
  console.error('Fatal seed database error:', err);
  process.exit(1);
});

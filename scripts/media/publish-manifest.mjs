import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

// Load environment
dotenv.config({ path: path.join(rootDir, 'server/.env') });

const {
  CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET,
} = process.env;

async function publishManifest() {
  console.log('--- FORME Cloudinary Asset Publisher ---');

  if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    console.log('NOTICE: Cloudinary credentials not detected in server/.env.');
    console.log('The application operates with 100% verified local media masters.');
    console.log('To publish assets to Cloudinary:');
    console.log('1. Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET in server/.env');
    console.log('2. Re-run: node scripts/media/publish-manifest.mjs');
    return;
  }

  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });

  const manifestPath = path.join(rootDir, 'asset-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  console.log(`Publishing ${manifest.assets.length} assets to Cloudinary cloud: ${CLOUDINARY_CLOUD_NAME}...`);

  let publishedCount = 0;
  for (const asset of manifest.assets) {
    if (asset.cloudinaryPublicId && asset.deliveryUrl?.startsWith('https://res.cloudinary.com')) {
      continue;
    }

    const localFilePath = path.join(rootDir, 'client/public', asset.localPath);
    if (!fs.existsSync(localFilePath)) {
      console.warn(`Local file missing: ${localFilePath}`);
      continue;
    }

    try {
      const folder = asset.role === 'catalog'
        ? `forme/catalog/${asset.productSlug || 'misc'}`
        : `forme/${asset.role}`;

      const res = await cloudinary.uploader.upload(localFilePath, {
        folder,
        public_id: asset.assetId,
        overwrite: true,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      });

      asset.cloudinaryPublicId = res.public_id;
      asset.deliveryUrl = res.secure_url;
      publishedCount++;
      console.log(`✓ Uploaded [${asset.assetId}] -> ${res.secure_url}`);
    } catch (uploadErr) {
      console.error(`Failed to upload ${asset.assetId}:`, uploadErr.message);
    }
  }

  // Save updated manifest
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(rootDir, 'client/src/assets/asset-manifest.json'),
    JSON.stringify(manifest, null, 2)
  );

  console.log(`\nSuccessfully published ${publishedCount} assets to Cloudinary.`);
}

publishManifest().catch((err) => {
  console.error('Publisher encountered fatal error:', err);
});

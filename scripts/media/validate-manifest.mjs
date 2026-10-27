import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

function validateManifest() {
  const manifestPath = path.join(rootDir, 'asset-manifest.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('FAIL: asset-manifest.json does not exist');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  console.log(`Checking FORME Asset Manifest v${data.version}...`);

  // Check fallback asset
  if (!data.fallback || !data.fallback.localPath) {
    console.error('FAIL: Fallback asset definition missing in manifest');
    process.exit(1);
  }

  const clientFallback = path.join(rootDir, 'client/public', data.fallback.localPath);
  if (!fs.existsSync(clientFallback)) {
    console.error(`FAIL: Fallback file does not exist at ${clientFallback}`);
    process.exit(1);
  }
  console.log(`✓ Checked-in fallback asset verified: ${data.fallback.localPath}`);

  // Check registered assets
  let validAssets = 0;
  for (const asset of data.assets) {
    if (!asset.assetId || !asset.role || !asset.dimensions) {
      console.error(`FAIL: Asset invalid format:`, asset);
      process.exit(1);
    }

    // Verify local file exists
    const publicPath = path.join(rootDir, 'client/public', asset.localPath);
    if (!fs.existsSync(publicPath)) {
      console.warn(`WARN: Local asset file missing at: ${publicPath}`);
    } else {
      validAssets++;
    }
  }

  console.log(`✓ Validated ${validAssets} local assets present in client bundle.`);
  console.log('✓ Manifest schema and fallback validation successful.');
}

validateManifest();

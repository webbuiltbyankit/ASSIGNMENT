import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const clientDist = path.join(rootDir, 'client', 'dist');
const rootDist = path.join(rootDir, 'dist');

if (fs.existsSync(clientDist)) {
  fs.cpSync(clientDist, rootDist, { recursive: true, force: true });
  console.log('✓ Successfully synchronized client/dist to root dist for deployment compatibility.');
} else {
  console.warn('Warning: client/dist does not exist. Run npm run build:client first.');
}

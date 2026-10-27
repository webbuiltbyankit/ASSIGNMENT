import manifest from '../assets/asset-manifest.json';

const FALLBACK_URL = manifest.fallback?.localPath || '/fallback-image.svg';

/**
 * Maps assetId to manifest entry for O(1) lookup
 */
const assetMap = new Map();
if (manifest.assets && Array.isArray(manifest.assets)) {
  for (const asset of manifest.assets) {
    if (asset.assetId) {
      assetMap.set(asset.assetId, asset);
    }
  }
}

/**
 * Resolves an image source safely.
 * @param {string | object} input - assetId string, URL string, or image object from DB/manifest
 * @returns {string} Safe absolute or public relative image URL
 */
export function resolveImageUrl(input) {
  if (!input) {
    return FALLBACK_URL;
  }

  // If input is an object with secureUrl or deliveryUrl
  if (typeof input === 'object') {
    if (input.secureUrl) return input.secureUrl;
    if (input.deliveryUrl) return input.deliveryUrl;
    if (input.localPath) return input.localPath;
    if (input.url) return input.url;
    if (input.assetId) {
      return resolveImageUrl(input.assetId);
    }
    return FALLBACK_URL;
  }

  // If input is already an absolute HTTP/HTTPS URL
  if (typeof input === 'string') {
    if (input.startsWith('http://') || input.startsWith('https://')) {
      return input;
    }

    // If input is an explicit local path
    if (input.startsWith('/')) {
      return input;
    }

    // Check if it's an assetId in manifest
    const entry = assetMap.get(input);
    if (entry) {
      return entry.deliveryUrl || entry.localPath || FALLBACK_URL;
    }
  }

  return FALLBACK_URL;
}

/**
 * Gets full manifest metadata for an asset ID
 * @param {string} assetId
 * @returns {object | null}
 */
export function getManifestAsset(assetId) {
  return assetMap.get(assetId) || null;
}

/**
 * Returns the verified fallback URL
 */
export function getFallbackImageUrl() {
  return FALLBACK_URL;
}

/**
 * Handles image load errors gracefully by swapping to fallback
 * and preventing repeated infinite onError loops.
 */
export function handleImageError(e) {
  const target = e.currentTarget;
  if (!target.dataset.hasFallenBack) {
    target.dataset.hasFallenBack = 'true';
    target.src = FALLBACK_URL;
  }
}

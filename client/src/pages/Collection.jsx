import React from 'react';
import { useParams } from 'react-router-dom';
import { ShopPage } from './Shop';
import { resolveImageUrl, handleImageError } from '../services/imageResolver';

const COLLECTION_CONFIG = {
  men: {
    title: 'Men’s Collection',
    subtitle: 'Understated essentials: breathable linen camp shirts, heavy organic cotton jersey tees, 13.5oz selvedge denim, and structured canvas chore jackets.',
    assetId: 'col-men-01',
    alt: 'FORME Menswear Collection',
  },
  women: {
    title: 'Women’s Collection',
    subtitle: 'Effortless fluid silhouettes: tiered washed linen midi dresses, crisp cotton poplin shirts, wide-leg pleated trousers, and unlined draped trenches.',
    assetId: 'col-women-01',
    alt: 'FORME Womenswear Collection',
  },
};

export function CollectionPage({ collection: propCollection }) {
  const { collection: paramCollection } = useParams();
  const currentCollection = propCollection || paramCollection || 'men';
  const config = COLLECTION_CONFIG[currentCollection] || COLLECTION_CONFIG.men;

  const bannerSrc = resolveImageUrl(config.assetId);

  return (
    <div>
      {/* Curated Collection Header Banner */}
      <section
        style={{
          backgroundColor: 'var(--bg-secondary)',
          borderBottom: '1px solid var(--border-light)',
          padding: 'var(--space-2xl) 0',
        }}
        aria-label={`${config.title} Banner`}
      >
        <div className="container" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xl)', alignItems: 'center' }}>
          <div style={{ maxWidth: '680px' }}>
            <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-taupe)', display: 'block', marginBottom: 'var(--space-xs)' }}>
              Curated Wardrobe
            </span>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-display)', marginBottom: 'var(--space-sm)' }}>
              {config.title}
            </h1>
            <p style={{ fontSize: 'var(--text-md)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              {config.subtitle}
            </p>
          </div>
        </div>
      </section>

      {/* Render Product Listing Scoped to this Collection */}
      <ShopPage
        collectionFilter={currentCollection}
        pageTitle={`${config.title} Garments`}
        pageSubtitle=""
      />
    </div>
  );
}

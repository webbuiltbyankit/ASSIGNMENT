import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

const COLLECTIONS_CONFIG = [
  {
    id: 'men',
    title: 'Men’s Collection',
    description: 'Understated camp shirts, heavyweight tees, and architectural twill chore jackets.',
    link: '/collections/men',
    assetId: 'col-men-01',
    alt: 'Men in relaxed linen shirt and tailored sand trousers',
  },
  {
    id: 'women',
    title: 'Women’s Collection',
    description: 'Tiered linen midi dresses, draped trench coats, and crisp poplin tailoring.',
    link: '/collections/women',
    assetId: 'col-women-01',
    alt: 'Women in fluid sand linen wrap dress',
  },
];

export function CollectionDiscovery() {
  return (
    <section className="container" aria-label="Gender Collections Discovery" style={{ paddingBottom: 'var(--space-2xl)' }}>
      <div className="forme-collection-panels">
        {COLLECTIONS_CONFIG.map((col) => {
          const imgSrc = resolveImageUrl(col.assetId);
          return (
            <Link
              key={col.id}
              to={col.link}
              className="forme-collection-panel"
              aria-label={`Explore ${col.title}`}
            >
              <div className="forme-collection-panel__media">
                <img
                  src={imgSrc}
                  alt={col.alt}
                  className="forme-collection-panel__img"
                  loading="lazy"
                  onError={handleImageError}
                />
                <div className="forme-collection-panel__overlay">
                  <h3 className="forme-collection-panel__title">{col.title}</h3>
                  <p className="forme-collection-panel__desc">{col.description}</p>
                  <span className="forme-collection-panel__cta">
                    <span>Explore Collection</span>
                    <ArrowRight size={14} />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

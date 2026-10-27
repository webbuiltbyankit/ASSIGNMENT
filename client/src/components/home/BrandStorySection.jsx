import React from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading, Button } from '../common';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

const STORY_PILLARS = [
  {
    assetId: 'story-textile-01',
    title: 'Textile Integrity',
    desc: 'Pure European washed linen, 240 GSM organic cotton jersey, and durable selvedge denim selected for honest hand-feel.',
  },
  {
    assetId: 'story-craft-01',
    title: 'Considered Construction',
    desc: 'Reinforced stress points, clean single-needle seams, natural horn buttons, and timeless tailoring that outlives fast trends.',
  },
  {
    assetId: 'story-folded-01',
    title: 'Wardrobe Cohesion',
    desc: 'A restrained, harmonic palette of warm ivory, sand, charcoal, and taupe designed to seamlessly interchange.',
  },
];

export function BrandStorySection() {
  return (
    <section style={{ backgroundColor: 'var(--bg-secondary)', padding: 'var(--space-4xl) 0', borderTop: '1px solid var(--border-light)' }}>
      <div className="container">
        <SectionHeading
          eyebrow="The Philosophy"
          title="Designed for Your Everyday"
          subtitle="We believe in clothing as a quiet foundation. Garments that drape naturally, move without friction, and mature with character through years of wear."
          align="center"
        />

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-xl)',
            marginTop: 'var(--space-2xl)',
          }}
        >
          {STORY_PILLARS.map((pillar, idx) => (
            <div
              key={idx}
              style={{
                display: 'flex',
                flexDirection: 'column',
                backgroundColor: 'var(--bg-card)',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-subtle)',
              }}
            >
              <div style={{ aspectRatio: '4/3', width: '100%', overflow: 'hidden' }}>
                <img
                  src={resolveImageUrl(pillar.assetId)}
                  alt={pillar.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  loading="lazy"
                  onError={handleImageError}
                />
              </div>
              <div style={{ padding: 'var(--space-lg)', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xs)' }}>
                  {pillar.title}
                </h3>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                  {pillar.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function PromoBanner() {
  return (
    <aside className="forme-promo-banner" aria-label="Seasonal Announcement">
      <div className="container forme-promo-banner__inner">
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'var(--color-taupe)', display: 'block', marginBottom: 'var(--space-2xs)' }}>
          Limited Edition Capsule
        </span>
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-xs)' }}>
          Natural Washed Linen & Architectural Outerwear
        </h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', marginBottom: 'var(--space-md)' }}>
          Discover transitional essentials designed for layered comfort and quiet ease.
        </p>
        <Link to="/shop">
          <Button variant="outline" size="sm">
            Explore Capsule
          </Button>
        </Link>
      </div>
    </aside>
  );
}

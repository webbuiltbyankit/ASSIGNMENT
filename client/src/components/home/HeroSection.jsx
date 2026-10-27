import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

export function HeroSection({
  headline = 'Wear what moves you',
  subtext = 'Considered silhouettes, tactile natural fabrics, and everyday essentials crafted with quiet confidence.',
  primaryCtaLabel = 'Shop The Collection',
  primaryCtaLink = '/shop',
  secondaryCtaLabel = 'Men’s Essentials',
  secondaryCtaLink = '/collections/men',
  desktopAssetId = 'hero-desktop-01',
  mobileAssetId = 'hero-mobile-01',
}) {
  const desktopSrc = resolveImageUrl(desktopAssetId);
  const mobileSrc = resolveImageUrl(mobileAssetId);

  return (
    <section className="forme-hero" aria-label="Featured Collection Announcement">
      <div className="container" style={{ padding: 0, maxWidth: '100%' }}>
        <div className="forme-hero__container">
          {/* Editorial Content Column */}
          <div className="forme-hero__content">
            <span className="forme-hero__eyebrow">Edition 01 / Natural Tailoring</span>
            <h1 className="forme-hero__headline">{headline}</h1>
            <p className="forme-hero__subtext">{subtext}</p>
            <div className="forme-hero__actions">
              <Link to={primaryCtaLink}>
                <Button variant="primary" size="lg">
                  {primaryCtaLabel}
                </Button>
              </Link>
              <Link to={secondaryCtaLink}>
                <Button variant="secondary" size="lg">
                  {secondaryCtaLabel}
                </Button>
              </Link>
            </div>
          </div>

          {/* Art-Directed Responsive Media Column */}
          <div className="forme-hero__media">
            <picture className="forme-hero__picture">
              <source media="(max-width: 767px)" srcSet={mobileSrc} />
              <source media="(min-width: 768px)" srcSet={desktopSrc} />
              <img
                src={desktopSrc}
                alt="Model in neutral washed linen everyday clothing by FORME"
                className="forme-hero__img"
                loading="eager"
                onError={handleImageError}
              />
            </picture>
          </div>
        </div>
      </div>
    </section>
  );
}

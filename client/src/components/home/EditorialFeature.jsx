import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../common';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

export function EditorialFeature({
  eyebrow,
  title,
  description,
  buttonLabel,
  buttonLink,
  assetId,
  altText,
  reverse = false,
}) {
  const imgSrc = resolveImageUrl(assetId);

  return (
    <section className="forme-editorial-feature">
      <div className="container">
        <div
          className={`forme-editorial-feature__grid ${
            reverse ? 'forme-editorial-feature__grid--reverse' : ''
          }`}
        >
          {/* Media Column */}
          <div className="forme-editorial-feature__media">
            <img
              src={imgSrc}
              alt={altText || title}
              className="forme-editorial-feature__img"
              loading="lazy"
              onError={handleImageError}
            />
          </div>

          {/* Text Content Column */}
          <div className="forme-editorial-feature__content">
            {eyebrow && <span className="forme-heading__eyebrow">{eyebrow}</span>}
            <h2 className="forme-heading__title" style={{ fontSize: 'var(--text-3xl)', marginBottom: 'var(--space-md)' }}>
              {title}
            </h2>
            <p className="forme-heading__subtitle" style={{ fontSize: 'var(--text-base)', marginBottom: 'var(--space-xl)', maxWidth: '520px' }}>
              {description}
            </p>
            {buttonLabel && buttonLink && (
              <div>
                <Link to={buttonLink}>
                  <Button variant="outline" size="md">
                    {buttonLabel}
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

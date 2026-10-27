import React from 'react';
import { Link } from 'react-router-dom';
import { Price, Badge } from '../common';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

export function ProductCard({ product }) {
  if (!product) return null;

  const primaryImage = product.images?.[0] || product.coverImage;
  const alternateImage = product.images?.[1] || null;

  const primarySrc = resolveImageUrl(primaryImage);
  const alternateSrc = alternateImage ? resolveImageUrl(alternateImage) : null;

  const isSoldOut = !product.inStock || product.totalStock === 0;

  return (
    <article className="forme-product-card">
      <Link
        to={`/products/${product.slug}`}
        className="forme-product-card__link"
        aria-label={`View details for ${product.name}, price ${product.price} rupees`}
      >
        <div className="forme-product-card__media">
          {/* Status Badges */}
          <div className="forme-product-card__badges">
            {isSoldOut ? (
              <Badge variant="out-of-stock">Sold Out</Badge>
            ) : product.featured ? (
              <Badge variant="featured">Featured</Badge>
            ) : null}
          </div>

          {/* Primary View */}
          <img
            src={primarySrc}
            alt={product.images?.[0]?.alt || `${product.name} in ${product.color}`}
            className="forme-product-card__img forme-product-card__img--primary"
            loading="lazy"
            onError={handleImageError}
          />

          {/* Secondary Hover View (if available) */}
          {alternateSrc && (
            <img
              src={alternateSrc}
              alt=""
              aria-hidden="true"
              className="forme-product-card__img forme-product-card__img--hover"
              loading="lazy"
              onError={handleImageError}
            />
          )}
        </div>

        <div className="forme-product-card__info">
          <span className="forme-product-card__category">{product.category}</span>
          <h3 className="forme-product-card__title">{product.name}</h3>

          <div className="forme-product-card__details">
            <Price amount={product.price} />
            {product.color && (
              <span className="forme-product-card__color">{product.color}</span>
            )}
          </div>
        </div>
      </Link>
    </article>
  );
}

import React, { useState, useEffect } from 'react';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

export function ProductGallery({ images = [], productName = 'Product' }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset index if images change
  useEffect(() => {
    setSelectedIndex(0);
  }, [images]);

  if (!images || images.length === 0) {
    return (
      <div className="forme-gallery">
        <div className="forme-gallery__main">
          <img
            src="/fallback-image.svg"
            alt={productName}
            className="forme-gallery__main-img"
          />
        </div>
      </div>
    );
  }

  const currentImage = images[selectedIndex] || images[0];
  const mainSrc = resolveImageUrl(currentImage);

  const handleKeyDown = (e, index) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setSelectedIndex(index);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % images.length);
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="forme-gallery" role="region" aria-label="Product Image Gallery">
      {/* Thumbnail Controls */}
      {images.length > 1 && (
        <div className="forme-gallery__thumbs" role="tablist" aria-label="Product views">
          {images.map((img, idx) => {
            const thumbSrc = resolveImageUrl(img);
            const isSelected = idx === selectedIndex;
            const viewLabel = img.view ? `${img.view.charAt(0).toUpperCase() + img.view.slice(1)} view` : `View ${idx + 1}`;

            return (
              <button
                key={img.assetId || idx}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`${productName} - ${viewLabel}`}
                className={`forme-gallery__thumb-btn ${
                  isSelected ? 'forme-gallery__thumb-btn--active' : ''
                }`}
                onClick={() => setSelectedIndex(idx)}
                onKeyDown={(e) => handleKeyDown(e, idx)}
              >
                <img
                  src={thumbSrc}
                  alt=""
                  aria-hidden="true"
                  className="forme-gallery__thumb-img"
                  onError={handleImageError}
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Main Image Display */}
      <div className="forme-gallery__main">
        <img
          src={mainSrc}
          alt={currentImage.alt || `${productName} view`}
          className="forme-gallery__main-img"
          onError={handleImageError}
        />
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Upload, Star, Trash2, ArrowUp, ArrowDown } from 'lucide-react';
import { Button } from '../common';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

export function ProductImageManager({
  images = [],
  onChange,
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const handleFileSelect = async (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploadError('');
    setIsUploading(true);

    try {
      const newEntries = [];
      for (const file of files) {
        if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
          throw new Error('Only JPEG, PNG and WebP images are supported.');
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error('Image size exceeds 5MB limit.');
        }

        // Create local object URL for preview
        const previewUrl = URL.createObjectURL(file);
        newEntries.push({
          assetId: `custom_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          secureUrl: previewUrl,
          deliveryUrl: previewUrl,
          alt: file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
          role: images.length === 0 && newEntries.length === 0 ? 'primary' : 'gallery',
          view: 'custom',
          isLocalUpload: true,
          file,
        });
      }

      onChange([...images, ...newEntries]);
    } catch (err) {
      console.error('File upload validation failed:', err);
      setUploadError(err.message || 'Failed to select image.');
    } finally {
      setIsUploading(false);
      e.target.value = '';
    }
  };

  const handleSetPrimary = (index) => {
    const updated = images.map((img, idx) => ({
      ...img,
      role: idx === index ? 'primary' : 'gallery',
    }));
    // Move designated primary to position 0
    const primary = updated.splice(index, 1)[0];
    updated.unshift(primary);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    const item = updated.splice(index, 1)[0];
    updated.splice(newIndex, 0, item);
    onChange(updated);
  };

  const handleRemove = (index) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>
            Product Photography & Gallery
          </strong>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Designate primary cover photo and reorder gallery views.
          </span>
        </div>

        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-xs)',
            padding: '0.45rem 0.85rem',
            fontSize: 'var(--text-xs)',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          <Upload size={14} />
          <span>Upload Image</span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
            disabled={isUploading}
          />
        </label>
      </div>

      {uploadError && (
        <span style={{ color: 'var(--color-error)', fontSize: 'var(--text-xs)' }}>
          {uploadError}
        </span>
      )}

      {/* Image Thumbnails List */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 'var(--space-md)' }}>
        {images.map((img, idx) => {
          const isPrimary = img.role === 'primary' || idx === 0;
          const displayUrl = resolveImageUrl(img);

          return (
            <div
              key={img.assetId || idx}
              style={{
                position: 'relative',
                border: isPrimary ? '2px solid var(--color-charcoal)' : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-xs)',
                overflow: 'hidden',
                backgroundColor: 'var(--bg-secondary)',
              }}
            >
              <div style={{ aspectRatio: '4/5', width: '100%', overflow: 'hidden' }}>
                <img
                  src={displayUrl}
                  alt={img.alt || 'Product thumbnail'}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={handleImageError}
                />
              </div>

              {isPrimary && (
                <div
                  style={{
                    position: 'absolute',
                    top: 6,
                    left: 6,
                    backgroundColor: 'var(--color-charcoal)',
                    color: 'var(--color-warm-ivory)',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    padding: '2px 6px',
                    borderRadius: '2px',
                    letterSpacing: '0.06em',
                    textTransform: 'uppercase',
                  }}
                >
                  Primary
                </div>
              )}

              {/* Action bar under image */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '4px 6px',
                  backgroundColor: '#FFFFFF',
                  borderTop: '1px solid var(--border-light)',
                }}
              >
                {!isPrimary && (
                  <button
                    type="button"
                    onClick={() => handleSetPrimary(idx)}
                    title="Make Primary Cover"
                    style={{ color: 'var(--text-muted)', padding: '2px' }}
                    aria-label="Set as primary"
                  >
                    <Star size={14} />
                  </button>
                )}

                <div style={{ display: 'flex', gap: '2px', marginLeft: 'auto' }}>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, -1)}
                    disabled={idx === 0}
                    style={{ color: 'var(--text-muted)', padding: '2px', opacity: idx === 0 ? 0.3 : 1 }}
                    aria-label="Move left"
                  >
                    <ArrowUp size={14} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMove(idx, 1)}
                    disabled={idx === images.length - 1}
                    style={{ color: 'var(--text-muted)', padding: '2px', opacity: idx === images.length - 1 ? 0.3 : 1 }}
                    aria-label="Move right"
                  >
                    <ArrowDown size={14} style={{ transform: 'rotate(-90deg)' }} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRemove(idx)}
                    style={{ color: 'var(--color-error)', padding: '2px' }}
                    aria-label="Remove image"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

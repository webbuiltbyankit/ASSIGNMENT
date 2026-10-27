import React, { useState } from 'react';
import { Button } from '../common';
import { AlertCircle, Check, Minus, Plus } from 'lucide-react';

export function SizeSelector({
  product,
  sizes = [],
  onAddToCart,
  isAdding = false,
}) {
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSelectSize = (variant) => {
    if (variant.stock <= 0) return;
    setSelectedVariant(variant);
    setErrorMessage('');
    // Ensure quantity doesn't exceed new variant stock
    if (quantity > variant.stock) {
      setQuantity(1);
    }
  };

  const handleIncrement = () => {
    if (!selectedVariant) return;
    const maxStock = Math.min(selectedVariant.stock, 10);
    if (quantity < maxStock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedVariant) {
      setErrorMessage('Please select a size before adding to bag.');
      return;
    }

    if (selectedVariant.stock <= 0) {
      setErrorMessage('This size is currently sold out.');
      return;
    }

    onAddToCart({
      product,
      variantId: selectedVariant.variantId,
      size: selectedVariant.size,
      quantity,
    });
  };

  const isOutOfStock = sizes.length === 0 || sizes.every((s) => s.stock <= 0);

  return (
    <form onSubmit={handleSubmit} className="forme-size-section" aria-label="Purchase Options">
      {/* Size Selection Header */}
      <div className="forme-size-header">
        <label className="forme-size-header__label" id="size-label">
          Select Size: {selectedVariant ? <span style={{ color: 'var(--color-charcoal)' }}>{selectedVariant.size}</span> : <span style={{ color: 'var(--text-muted)' }}>Required</span>}
        </label>
        {selectedVariant && (
          <span style={{ fontSize: 'var(--text-xs)', color: selectedVariant.stock <= 3 ? 'var(--color-warning)' : 'var(--color-success)', fontWeight: 500 }}>
            {selectedVariant.stock <= 3 ? `Only ${selectedVariant.stock} left in stock` : 'In Stock'}
          </span>
        )}
      </div>

      {/* Size Buttons Grid */}
      <div className="forme-size-grid" role="radiogroup" aria-labelledby="size-label">
        {sizes.map((v) => {
          const isSelected = selectedVariant?.variantId === v.variantId;
          const isAvailable = v.stock > 0;

          return (
            <button
              key={v.variantId || v.size}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={!isAvailable}
              aria-disabled={!isAvailable}
              aria-label={`Size ${v.size}, ${isAvailable ? `${v.stock} in stock` : 'Sold out'}`}
              className={`forme-size-btn ${isSelected ? 'forme-size-btn--selected' : ''}`}
              onClick={() => handleSelectSize(v)}
            >
              <span>{v.size}</span>
            </button>
          );
        })}
      </div>

      {/* Validation Error Message */}
      {errorMessage && (
        <div
          role="alert"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-xs)',
            color: 'var(--color-error)',
            fontSize: 'var(--text-xs)',
            marginTop: 'var(--space-2xs)',
          }}
        >
          <AlertCircle size={14} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Quantity & Add to Cart Controls */}
      <div className="forme-quantity-row">
        <div className="forme-qty-picker" aria-label="Quantity Picker">
          <button
            type="button"
            className="forme-qty-picker__btn"
            onClick={handleDecrement}
            disabled={quantity <= 1}
            aria-label="Decrease quantity"
          >
            <Minus size={14} />
          </button>
          <span className="forme-qty-picker__val" aria-live="polite">
            {quantity}
          </span>
          <button
            type="button"
            className="forme-qty-picker__btn"
            onClick={handleIncrement}
            disabled={!selectedVariant || quantity >= Math.min(selectedVariant.stock, 10)}
            aria-label="Increase quantity"
          >
            <Plus size={14} />
          </button>
        </div>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          disabled={isOutOfStock}
          isLoading={isAdding}
        >
          {isOutOfStock ? 'Sold Out' : 'Add to Shopping Bag'}
        </Button>
      </div>
    </form>
  );
}

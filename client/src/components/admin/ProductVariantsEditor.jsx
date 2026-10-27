import React from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { Button } from '../common';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL'];

export function ProductVariantsEditor({
  variants = [],
  onChange,
}) {
  const handleStockChange = (index, val) => {
    const num = Math.max(0, parseInt(val, 10) || 0);
    const updated = [...variants];
    updated[index] = { ...updated[index], stock: num };
    onChange(updated);
  };

  const handleSizeChange = (index, newSize) => {
    const trimmed = newSize.trim().toUpperCase();
    const updated = [...variants];
    updated[index] = { ...updated[index], size: trimmed };
    onChange(updated);
  };

  const handleAddVariant = (sizeLabel = '') => {
    const nextSize = sizeLabel || DEFAULT_SIZES.find((s) => !variants.some((v) => v.size === s)) || 'ONE SIZE';
    const newVariant = {
      variantId: `var_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      size: nextSize,
      stock: 5,
    };
    onChange([...variants, newVariant]);
  };

  const handleRemoveVariant = (index) => {
    if (variants.length <= 1) return;
    onChange(variants.filter((_, idx) => idx !== index));
  };

  const totalStock = variants.reduce((sum, v) => sum + (v.stock || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>
            Size Variants & Authoritative Stock
          </strong>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
            Total Computed Inventory: <strong>{totalStock} units</strong>
          </span>
        </div>

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => handleAddVariant()}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={14} />
          <span>Add Size</span>
        </Button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)' }}>
        {variants.map((v, idx) => (
          <div
            key={v.variantId || idx}
            style={{
              display: 'grid',
              gridTemplateColumns: '120px 140px 1fr auto',
              gap: 'var(--space-sm)',
              alignItems: 'center',
              backgroundColor: '#FAF8F5',
              padding: 'var(--space-xs) var(--space-md)',
              borderRadius: 'var(--radius-xs)',
              border: '1px solid var(--border-light)',
            }}
          >
            <div>
              <label className="sr-only">Size Label</label>
              <input
                type="text"
                className="forme-input"
                style={{ height: '36px', fontSize: 'var(--text-xs)', fontWeight: 600, textAlign: 'center' }}
                value={v.size}
                onChange={(e) => handleSizeChange(idx, e.target.value)}
                placeholder="Size (e.g. M)"
              />
            </div>

            <div>
              <label className="sr-only">Stock Quantity</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <input
                  type="number"
                  min="0"
                  className="forme-input"
                  style={{ height: '36px', fontSize: 'var(--text-xs)' }}
                  value={v.stock}
                  onChange={(e) => handleStockChange(idx, e.target.value)}
                />
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>qty</span>
              </div>
            </div>

            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              SKU Ref: <code style={{ fontSize: '0.75rem' }}>{v.variantId || 'auto'}</code>
            </div>

            <button
              type="button"
              onClick={() => handleRemoveVariant(idx)}
              disabled={variants.length <= 1}
              style={{
                color: variants.length <= 1 ? 'var(--border-strong)' : 'var(--color-error)',
                cursor: variants.length <= 1 ? 'not-allowed' : 'pointer',
                padding: '6px',
              }}
              aria-label={`Remove ${v.size} size variant`}
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

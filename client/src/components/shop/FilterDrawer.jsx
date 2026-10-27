import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '../common';
import { FilterControls } from './FilterSidebar';

export function FilterDrawer({
  isOpen,
  onClose,
  categories = [],
  activeFilters,
  onApplyFilters,
  onClearFilters,
}) {
  const [draftFilters, setDraftFilters] = useState(activeFilters);

  useEffect(() => {
    setDraftFilters(activeFilters);
  }, [activeFilters, isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDraftChange = (key, val) => {
    setDraftFilters((prev) => ({
      ...prev,
      [key]: val,
    }));
  };

  const handleApply = () => {
    onApplyFilters(draftFilters);
    onClose();
  };

  const handleClear = () => {
    onClearFilters();
    onClose();
  };

  return (
    <div
      className="forme-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Filter Products"
    >
      <div
        className="forme-mobile-drawer"
        style={{ left: 'auto', right: 0, animation: 'slideInRight 0.24s cubic-bezier(0.16, 1, 0.3, 1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="forme-drawer__header">
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Filter Products
          </span>
          <button
            type="button"
            className="forme-action-btn"
            onClick={onClose}
            aria-label="Close filters drawer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="forme-drawer__nav" style={{ padding: 'var(--space-lg)' }}>
          <FilterControls
            categories={categories}
            activeFilters={draftFilters}
            onFilterChange={handleDraftChange}
          />
        </div>

        <div className="forme-drawer__footer" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
          <Button variant="secondary" size="md" onClick={handleClear}>
            Clear All
          </Button>
          <Button variant="primary" size="md" onClick={handleApply}>
            Apply Filters
          </Button>
        </div>
      </div>
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X } from 'lucide-react';
import { Button } from '../common';

export function SearchModal({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      setSearchTerm('');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const query = searchTerm.trim();
    if (!query) return;
    onClose();
    navigate(`/shop?q=${encodeURIComponent(query)}`);
  };

  return (
    <div
      className="forme-drawer-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Search Catalog"
      style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '10vh' }}
    >
      <div
        style={{
          backgroundColor: 'var(--bg-primary)',
          width: '92%',
          maxWidth: '640px',
          borderRadius: 'var(--radius-sm)',
          boxShadow: 'var(--shadow-elevated)',
          padding: 'var(--space-xl)',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-lg)' }}>
          <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--color-taupe)' }}>
            Search FORME Collection
          </span>
          <button
            onClick={onClose}
            className="forme-action-btn"
            aria-label="Close search dialog"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)', borderBottom: '2px solid var(--color-charcoal)', paddingBottom: 'var(--space-xs)' }}>
            <Search size={22} color="var(--text-muted)" aria-hidden="true" />
            <label htmlFor="modal-search-input" className="sr-only">Search products</label>
            <input
              id="modal-search-input"
              ref={inputRef}
              type="search"
              placeholder="Search by garment, fabric, or color (e.g. linen shirt, denim)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                border: 'none',
                background: 'transparent',
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-md)',
                color: 'var(--text-primary)',
                outline: 'none',
              }}
            />
            {searchTerm && (
              <button
                type="button"
                onClick={() => setSearchTerm('')}
                style={{ color: 'var(--text-muted)', padding: '4px' }}
                aria-label="Clear search input"
              >
                <X size={16} />
              </button>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'var(--space-lg)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Press Enter to view catalog results
            </span>
            <Button type="submit" size="sm">Search</Button>
          </div>
        </form>
      </div>
    </div>
  );
}

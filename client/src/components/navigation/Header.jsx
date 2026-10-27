import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Search, ShoppingBag, User, Menu, X, ArrowRight, Shield } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { SearchModal } from './SearchModal';

export function Header() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount } = useCart();
  const { user, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  // Close drawer on route change
  useEffect(() => {
    setIsDrawerOpen(false);
  }, [location.pathname]);

  // Lock scroll when drawer open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Escape key handler for drawer
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  return (
    <>
      <div className="forme-header-wrapper">
        <header className="forme-header" role="banner">
          <div className="container forme-header__inner">
            {/* Mobile Menu Button */}
            <button
              type="button"
              className="forme-mobile-menu-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open mobile navigation menu"
              aria-expanded={isDrawerOpen}
            >
              <Menu size={24} />
            </button>

            {/* Brand Wordmark */}
            <Link to="/" className="forme-brand-logo" aria-label="FORME Homepage">
              <span className="forme-brand-logo__text">FORME</span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="forme-nav-desktop" aria-label="Main Navigation">
              <NavLink
                to="/shop"
                className={({ isActive }) =>
                  `forme-nav-desktop__link ${isActive ? 'active' : ''}`
                }
              >
                Shop All
              </NavLink>
              <NavLink
                to="/collections/men"
                className={({ isActive }) =>
                  `forme-nav-desktop__link ${isActive ? 'active' : ''}`
                }
              >
                Men
              </NavLink>
              <NavLink
                to="/collections/women"
                className={({ isActive }) =>
                  `forme-nav-desktop__link ${isActive ? 'active' : ''}`
                }
              >
                Women
              </NavLink>
            </nav>

            {/* Header Actions */}
            <div className="forme-header-actions">
              {/* Search Trigger */}
              <button
                type="button"
                className="forme-action-btn"
                onClick={() => setIsSearchOpen(true)}
                aria-label="Open search dialog"
              >
                <Search size={20} />
              </button>

              {/* Admin Quick Link if authenticated admin */}
              {isAdmin && (
                <Link
                  to="/admin"
                  className="forme-action-btn"
                  title="Admin Dashboard"
                  aria-label="Admin Dashboard"
                  style={{ color: 'var(--color-taupe)' }}
                >
                  <Shield size={20} />
                </Link>
              )}

              {/* Account Action */}
              <Link
                to={isAuthenticated ? '/account' : '/account/login'}
                className="forme-action-btn"
                aria-label={isAuthenticated ? `Account (${user?.name || user?.email})` : 'Log in to your account'}
                title={isAuthenticated ? user?.email : 'Account'}
              >
                <User size={20} />
              </Link>

              {/* Shopping Bag / Cart */}
              <Link
                to="/cart"
                className="forme-action-btn"
                aria-label={`Shopping Bag, ${itemCount} items`}
              >
                <ShoppingBag size={20} />
                {itemCount > 0 && (
                  <span className="forme-cart-badge" aria-hidden="true">
                    {itemCount}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </header>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div
          className="forme-drawer-overlay"
          onClick={() => setIsDrawerOpen(false)}
          aria-hidden="true"
        >
          <div
            className="forme-mobile-drawer"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation Menu"
          >
            <div className="forme-drawer__header">
              <span className="forme-brand-logo__text" style={{ fontSize: '1.4rem' }}>FORME</span>
              <button
                type="button"
                className="forme-action-btn"
                onClick={() => setIsDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={22} />
              </button>
            </div>

            <nav className="forme-drawer__nav" aria-label="Mobile Navigation">
              <Link to="/shop" className="forme-drawer__link">
                <span>Shop All</span>
                <ArrowRight size={18} color="var(--color-taupe)" />
              </Link>
              <Link to="/collections/men" className="forme-drawer__link">
                <span>Men's Collection</span>
                <ArrowRight size={18} color="var(--color-taupe)" />
              </Link>
              <Link to="/collections/women" className="forme-drawer__link">
                <span>Women's Collection</span>
                <ArrowRight size={18} color="var(--color-taupe)" />
              </Link>
              <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: 'var(--space-md) 0' }} />
              {isAdmin && (
                <Link to="/admin" className="forme-drawer__link" style={{ color: 'var(--color-taupe)' }}>
                  <span>Admin Dashboard</span>
                  <Shield size={18} />
                </Link>
              )}
              <Link to={isAuthenticated ? '/account' : '/account/login'} className="forme-drawer__link">
                <span>{isAuthenticated ? 'My Account' : 'Sign In / Register'}</span>
                <User size={18} />
              </Link>
              <Link to="/cart" className="forme-drawer__link">
                <span>Shopping Bag ({itemCount})</span>
                <ShoppingBag size={18} />
              </Link>
            </nav>

            <div className="forme-drawer__footer">
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                Modern Everyday Wear
              </span>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                Delivery across India • All prices in INR
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
    </>
  );
}

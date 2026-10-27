import React, { useState } from 'react';
import { NavLink, Link, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Package, Tag, ArrowLeft, LogOut, Menu, X, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navLinks = [
    { to: '/admin', end: true, label: 'Overview', icon: LayoutDashboard },
    { to: '/admin/products', label: 'Products & Stock', icon: Package },
    { to: '/admin/categories', label: 'Categories Taxonomy', icon: Tag },
  ];

  return (
    <div className="forme-admin-layout">
      {/* Sidebar for Desktop */}
      <aside className="forme-admin-sidebar" aria-label="Admin Navigation">
        <div className="forme-admin-sidebar__brand">
          <div>
            <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', fontWeight: 600, letterSpacing: '0.12em', color: 'var(--color-warm-ivory)' }}>
              FORME
            </span>
            <span style={{ fontSize: '0.65rem', display: 'block', color: 'var(--color-sand)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Operations Console
            </span>
          </div>
        </div>

        <nav className="forme-admin-sidebar__nav">
          {navLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `forme-admin-nav-item ${isActive ? 'active' : ''}`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="forme-admin-sidebar__footer">
          <Link
            to="/"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: '#B5ACA1',
              fontSize: 'var(--text-xs)',
              textDecoration: 'none',
              padding: '6px 0',
            }}
          >
            <ArrowLeft size={14} />
            <span>Return to Storefront</span>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--color-error-border)',
              fontSize: 'var(--text-xs)',
              padding: '6px 0',
              textAlign: 'left',
              cursor: 'pointer',
            }}
          >
            <LogOut size={14} />
            <span>Sign Out ({user?.email})</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Area */}
      <div className="forme-admin-main">
        {/* Top Header */}
        <header className="forme-admin-topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <button
              type="button"
              className="forme-action-btn"
              style={{ display: 'flex' }}
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open Admin Menu"
            >
              <Menu size={20} />
            </button>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
              Console / Administrator Mode
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              Logged in: <strong>{user?.name || user?.email}</strong>
            </span>
            <Link
              to="/"
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--color-charcoal)',
                textDecoration: 'underline',
              }}
            >
              View Live Store
            </Link>
          </div>
        </header>

        {/* Content Outlet */}
        <main className="forme-admin-content">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Drawer */}
      {mobileMenuOpen && (
        <div
          className="forme-drawer-overlay"
          onClick={() => setMobileMenuOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="forme-mobile-drawer"
            style={{ backgroundColor: 'var(--color-charcoal)', color: 'var(--color-warm-ivory)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="forme-drawer__header" style={{ borderBottomColor: '#333' }}>
              <span style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', color: 'var(--color-warm-ivory)' }}>
                FORME Console
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                style={{ color: 'var(--color-warm-ivory)' }}
              >
                <X size={20} />
              </button>
            </div>

            <nav className="forme-drawer__nav">
              {navLinks.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={() => setMobileMenuOpen(false)}
                    className="forme-admin-nav-item"
                  >
                    <Icon size={18} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
              <div style={{ height: '1px', backgroundColor: '#333', margin: 'var(--space-md) 0' }} />
              <Link to="/" className="forme-admin-nav-item">
                <ArrowLeft size={18} />
                <span>Return to Store</span>
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}

import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/navigation/Header';
import { Footer } from '../components/navigation/Footer';
import { useCart } from '../context/CartContext';
import { CheckCircle2 } from 'lucide-react';

export function StorefrontLayout() {
  const { toastMessage } = useCart();

  return (
    <>
      {/* Skip to Main Content Link for Keyboard Accessibility */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Global Header */}
      <Header />

      {/* Accessible Live Notification Region for Cart Additions */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          style={{
            position: 'fixed',
            bottom: 'var(--space-xl)',
            right: 'var(--space-xl)',
            backgroundColor: 'var(--color-charcoal)',
            color: 'var(--color-warm-ivory)',
            padding: 'var(--space-md) var(--space-lg)',
            borderRadius: 'var(--radius-xs)',
            boxShadow: 'var(--shadow-elevated)',
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-sm)',
            zIndex: 9000,
            fontSize: 'var(--text-sm)',
            maxWidth: '380px',
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <CheckCircle2 size={18} color="var(--color-sand)" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Content Area */}
      <main
        id="main-content"
        tabIndex="-1"
        style={{ flex: 1, outline: 'none' }}
      >
        <Outlet />
      </main>

      {/* Global Footer */}
      <Footer />
    </>
  );
}

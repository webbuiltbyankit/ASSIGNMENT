import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common';

export function NotFoundPage() {
  return (
    <div
      className="container"
      style={{
        minHeight: '60vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'var(--space-4xl) var(--space-md)',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-sans)',
          fontSize: 'var(--text-xs)',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: 'var(--color-taupe)',
          marginBottom: 'var(--space-xs)',
        }}
      >
        404 — Page Not Found
      </span>
      <h1
        style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 'var(--text-display)',
          marginBottom: 'var(--space-md)',
        }}
      >
        The page you are looking for has moved or does not exist.
      </h1>
      <p
        style={{
          fontSize: 'var(--text-base)',
          color: 'var(--text-secondary)',
          maxWidth: '480px',
          marginBottom: 'var(--space-2xl)',
          lineHeight: '1.6',
        }}
      >
        Please check the URL or return to our clothing collections.
      </p>
      <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
        <Link to="/">
          <Button variant="secondary" size="md">
            Return Home
          </Button>
        </Link>
        <Link to="/shop">
          <Button variant="primary" size="md">
            Explore All Garments
          </Button>
        </Link>
      </div>
    </div>
  );
}

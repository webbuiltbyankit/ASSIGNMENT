import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LoadingState } from '../components/feedback/FeedbackStates';
import { Button } from '../components/common';
import { ShieldAlert } from 'lucide-react';

/**
 * Route guard requiring authenticated user session
 */
export function RequireAuth({ children }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Checking session authentication..." minHeight="60vh" />;
  }

  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/account/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  return children;
}

/**
 * Route guard requiring authenticated user with 'admin' role
 */
export function RequireAdmin({ children }) {
  const { user, isLoading, isAdmin } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <LoadingState message="Verifying administrative credentials..." minHeight="60vh" />;
  }

  if (!user) {
    const returnTo = location.pathname + location.search;
    return <Navigate to={`/account/login?returnTo=${encodeURIComponent(returnTo)}`} replace />;
  }

  if (!isAdmin) {
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
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            backgroundColor: 'var(--color-error-bg)',
            color: 'var(--color-error)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 'var(--space-md)',
          }}
        >
          <ShieldAlert size={28} />
        </div>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-xs)' }}>
          Access Restricted
        </h1>
        <p style={{ color: 'var(--text-secondary)', maxWidth: '440px', marginBottom: 'var(--space-xl)', lineHeight: '1.6' }}>
          This operations dashboard requires store administrator permissions. Your current account ({user.email}) does not have administrative access.
        </p>
        <div style={{ display: 'flex', gap: 'var(--space-md)' }}>
          <Link to="/">
            <Button variant="secondary" size="md">Return to Storefront</Button>
          </Link>
          <Link to="/account">
            <Button variant="outline" size="md">My Account</Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}

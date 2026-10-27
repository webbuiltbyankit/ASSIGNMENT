import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button, Badge } from '../components/common';
import { LogOut, User, Mail, Shield, ShoppingBag, ArrowRight } from 'lucide-react';
import { LoadingState } from '../components/feedback/FeedbackStates';

export function AccountPage() {
  const { user, isLoading, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return <LoadingState message="Loading your account profile..." minHeight="50vh" />;
  }

  if (!user) {
    return (
      <div className="container" style={{ padding: 'var(--space-4xl) var(--space-md)', textAlign: 'center' }}>
        <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-sm)' }}>
          Account Sign In Required
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-xl)' }}>
          Please sign in to view your profile and order settings.
        </p>
        <Link to="/account/login">
          <Button variant="primary">Sign In to Your Account</Button>
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Get user initials for deterministic vector avatar
  const initials = user.name
    ? user.name
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : user.email.slice(0, 2).toUpperCase();

  return (
    <div className="container" style={{ padding: 'var(--space-3xl) var(--space-md) var(--space-4xl)' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto' }}>
        {/* Header with Avatar & Details */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--space-lg)',
            borderBottom: '1px solid var(--border-light)',
            paddingBottom: 'var(--space-2xl)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-lg)' }}>
            {/* Deterministic Vector Initials Avatar */}
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-charcoal)',
                color: 'var(--color-warm-ivory)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-serif)',
                fontSize: '1.4rem',
                fontWeight: 600,
                letterSpacing: '1px',
              }}
              aria-hidden="true"
            >
              {initials}
            </div>

            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)' }}>
                  {user.name || 'Valued Member'}
                </h1>
                <Badge variant={user.role === 'admin' ? 'new' : 'featured'}>
                  {user.role === 'admin' ? 'Administrator' : 'Customer'}
                </Badge>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
                Member since {new Date(user.createdAt || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleLogout}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
          >
            <LogOut size={14} />
            <span>Sign Out</span>
          </Button>
        </div>

        {/* Profile Information Card */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-xl)',
            marginBottom: 'var(--space-2xl)',
          }}
        >
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>
            Account Profile
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                Full Name
              </span>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                {user.name || 'Not provided'}
              </span>
            </div>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                Email Address
              </span>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                {user.email}
              </span>
            </div>

            <div>
              <span style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', display: 'block', marginBottom: '4px' }}>
                Security Role
              </span>
              <span style={{ fontSize: 'var(--text-base)', color: 'var(--text-primary)' }}>
                {user.role}
              </span>
            </div>
          </div>
        </div>

        {/* Admin Navigation Banner if User is Admin */}
        {isAdmin && (
          <div
            style={{
              backgroundColor: 'var(--bg-secondary)',
              border: '1px solid var(--border-strong)',
              borderRadius: 'var(--radius-xs)',
              padding: 'var(--space-lg)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 'var(--space-2xl)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
              <Shield size={24} color="var(--color-taupe)" />
              <div>
                <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'block' }}>
                  Store Operations Console
                </strong>
                <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                  You have administrative privileges to manage products, categories, and inventory.
                </span>
              </div>
            </div>
            <Link to="/admin">
              <Button variant="primary" size="sm">
                Open Admin
                <ArrowRight size={14} />
              </Button>
            </Link>
          </div>
        )}

        {/* Fast Action Shortcuts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
          <Link
            to="/shop"
            style={{
              padding: 'var(--space-lg)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <ShoppingBag size={20} color="var(--color-taupe)" />
            <strong style={{ fontSize: 'var(--text-base)' }}>Browse Garments</strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Explore the latest season editions and essentials.
            </span>
          </Link>

          <Link
            to="/cart"
            style={{
              padding: 'var(--space-lg)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-xs)',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--space-xs)',
              textDecoration: 'none',
              color: 'inherit',
            }}
          >
            <User size={20} color="var(--color-taupe)" />
            <strong style={{ fontSize: 'var(--text-base)' }}>Review Shopping Bag</strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
              Manage selected items, size variants and quotes.
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}

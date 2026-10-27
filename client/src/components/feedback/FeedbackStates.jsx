import React from 'react';
import { Button } from '../common';
import { AlertCircle, CheckCircle2, Inbox, RefreshCw } from 'lucide-react';

export function LoadingState({ message = 'Loading...', minHeight = '240px' }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-2xl) var(--space-md)',
        minHeight,
        gap: 'var(--space-md)',
        color: 'var(--text-muted)',
      }}
      role="status"
      aria-live="polite"
    >
      <div
        style={{
          width: '32px',
          height: '32px',
          border: '2px solid var(--border-light)',
          borderTopColor: 'var(--color-charcoal)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: 'var(--text-sm)', letterSpacing: '0.04em' }}>{message}</p>
      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export function EmptyState({
  title = 'No items found',
  description = 'Try adjusting your search or filters to find what you are looking for.',
  actionLabel,
  onAction,
  icon: Icon = Inbox,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl) var(--space-md)',
        textAlign: 'center',
        gap: 'var(--space-sm)',
        maxWidth: '460px',
        margin: '0 auto',
      }}
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--bg-secondary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-taupe)',
          marginBottom: 'var(--space-xs)',
        }}
        aria-hidden="true"
      >
        <Icon size={24} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <Button variant="secondary" size="sm" onClick={onAction}>
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}

export function ErrorState({
  title = 'Something went wrong',
  message = 'We encountered an error while loading this content. Please try again.',
  onRetry,
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-3xl) var(--space-md)',
        textAlign: 'center',
        gap: 'var(--space-sm)',
        maxWidth: '460px',
        margin: '0 auto',
      }}
      role="alert"
    >
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: 'var(--color-error-bg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-error)',
          marginBottom: 'var(--space-xs)',
        }}
        aria-hidden="true"
      >
        <AlertCircle size={24} />
      </div>
      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', color: 'var(--text-primary)' }}>
        {title}
      </h3>
      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', lineHeight: '1.6' }}>
        {message}
      </p>
      {onRetry && (
        <div style={{ marginTop: 'var(--space-md)' }}>
          <Button variant="outline" size="sm" onClick={onRetry}>
            <RefreshCw size={14} style={{ marginRight: '6px' }} />
            Retry
          </Button>
        </div>
      )}
    </div>
  );
}

export function SuccessFeedback({ message = 'Action completed successfully.' }) {
  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 'var(--space-xs)',
        padding: 'var(--space-xs) var(--space-md)',
        backgroundColor: 'var(--color-success-bg)',
        border: '1px solid var(--color-success-border)',
        borderRadius: 'var(--radius-xs)',
        color: 'var(--color-success)',
        fontSize: 'var(--text-sm)',
        fontWeight: '500',
      }}
      role="status"
    >
      <CheckCircle2 size={16} />
      <span>{message}</span>
    </div>
  );
}

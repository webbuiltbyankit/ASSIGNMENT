import React from 'react';
import { Button } from './index';
import { AlertTriangle } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '60vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 'var(--space-2xl) var(--space-md)',
            textAlign: 'center',
            backgroundColor: 'var(--bg-primary)',
          }}
          role="alert"
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
            <AlertTriangle size={28} />
          </div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-xs)' }}>
            We encountered an unexpected display issue
          </h1>
          <p style={{ maxWidth: '480px', color: 'var(--text-secondary)', marginBottom: 'var(--space-lg)' }}>
            Please refresh the page. If the issue persists, our team has been notified.
          </p>
          <Button variant="primary" onClick={this.handleReset}>
            Reload Storefront
          </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

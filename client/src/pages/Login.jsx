import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField, PasswordField, FormError } from '../components/common/FormComponents';
import { Button } from '../components/common';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Validate returnTo parameter to avoid open redirects
  const rawReturnTo = searchParams.get('returnTo') || '/account';
  const safeReturnTo = rawReturnTo.startsWith('/') && !rawReturnTo.startsWith('//')
    ? rawReturnTo
    : '/account';

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    }
    if (!password) {
      errors.password = 'Password is required';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError('');
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await login({
        email: email.trim(),
        password,
      });
      navigate(safeReturnTo);
    } catch (err) {
      console.error('Login error:', err);
      // Map safe user-facing message
      if (err.status === 401) {
        setGeneralError('Invalid email address or password. Please verify your credentials.');
      } else if (err.status === 429) {
        setGeneralError('Too many unsuccessful attempts. Please wait a few moments before trying again.');
      } else {
        setGeneralError(err.message || 'Unable to sign in. Please verify your connection and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
      <div className="forme-auth-card">
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-taupe)', display: 'block', marginBottom: 'var(--space-2xs)' }}>
          Welcome Back
        </span>
        <h1 className="forme-auth-card__title">Sign In to FORME</h1>
        <p className="forme-auth-card__subtitle">
          Access your saved account details and order history.
        </p>

        <FormError message={generalError} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="login-email"
            label="Email Address"
            type="email"
            placeholder="you@domain.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={fieldErrors.email}
            required
            autoComplete="email"
            disabled={isSubmitting}
          />

          <PasswordField
            id="login-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoComplete="current-password"
            disabled={isSubmitting}
          />

          <div style={{ marginTop: 'var(--space-xl)' }}>
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isSubmitting}
            >
              Sign In
            </Button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <span>New to FORME? </span>
          <Link
            to={`/account/register${safeReturnTo !== '/account' ? `?returnTo=${encodeURIComponent(safeReturnTo)}` : ''}`}
            style={{ color: 'var(--color-charcoal)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Create an account
          </Link>
        </div>
      </div>
    </div>
  );
}

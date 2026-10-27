import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { FormField, PasswordField, FormError, FormSuccess } from '../components/common/FormComponents';
import { Button } from '../components/common';
import { useAuth } from '../context/AuthContext';

export function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/account';

  const validate = () => {
    const errors = {};
    if (!email.trim()) {
      errors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errors.email = 'Please provide a valid email format';
    }

    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters long';
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
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
      await register({
        name: name.trim() || undefined,
        email: email.trim(),
        password,
      });
      navigate(returnTo);
    } catch (err) {
      console.error('Registration failed:', err);
      if (err.details && typeof err.details === 'object') {
        setFieldErrors(err.details);
      } else {
        setGeneralError(err.message || 'Registration failed. Please check your details and try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container" style={{ padding: 'var(--space-2xl) var(--space-md)' }}>
      <div className="forme-auth-card">
        <span style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-xs)', fontWeight: 600, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'var(--color-taupe)', display: 'block', marginBottom: 'var(--space-2xs)' }}>
          Customer Membership
        </span>
        <h1 className="forme-auth-card__title">Create Your FORME Account</h1>
        <p className="forme-auth-card__subtitle">
          Save your wardrobe preferences, view order statuses, and enjoy expedited checkout.
        </p>

        <FormError message={generalError} />

        <form onSubmit={handleSubmit} noValidate>
          <FormField
            id="register-name"
            label="Full Name (Optional)"
            type="text"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            disabled={isSubmitting}
          />

          <FormField
            id="register-email"
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
            id="register-password"
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={fieldErrors.password}
            required
            autoComplete="new-password"
            placeholder="At least 8 characters"
            disabled={isSubmitting}
          />

          <PasswordField
            id="register-confirm-password"
            label="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={fieldErrors.confirmPassword}
            required
            autoComplete="new-password"
            placeholder="Re-enter password"
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
              Create Account
            </Button>
          </div>
        </form>

        <div style={{ marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--border-light)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          <span>Already have an account? </span>
          <Link
            to={`/account/login${returnTo !== '/account' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`}
            style={{ color: 'var(--color-charcoal)', fontWeight: 600, textDecoration: 'underline' }}
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

export function FormField({
  id,
  label,
  type = 'text',
  value,
  onChange,
  error,
  placeholder,
  required = false,
  autoComplete,
  disabled = false,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="forme-form-group">
      {label && (
        <label htmlFor={id} className="forme-label">
          <span>{label}</span>
          {required && <span style={{ color: 'var(--color-taupe)', fontSize: '0.7rem' }}>*Required</span>}
        </label>
      )}
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        disabled={disabled}
        aria-invalid={Boolean(error)}
        aria-describedby={errorId}
        className={`forme-input ${error ? 'forme-input--error' : ''}`}
        {...props}
      />
      {error && (
        <span id={errorId} className="forme-field-error" role="alert">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

export function PasswordField({
  id,
  label = 'Password',
  value,
  onChange,
  error,
  placeholder = '••••••••',
  required = false,
  autoComplete = 'current-password',
  disabled = false,
  ...props
}) {
  const [showPassword, setShowPassword] = useState(false);
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className="forme-form-group">
      {label && (
        <label htmlFor={id} className="forme-label">
          <span>{label}</span>
          {required && <span style={{ color: 'var(--color-taupe)', fontSize: '0.7rem' }}>*Required</span>}
        </label>
      )}
      <div className="forme-input-wrapper">
        <input
          id={id}
          name={id}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={`forme-input ${error ? 'forme-input--error' : ''}`}
          style={{ paddingRight: '44px' }}
          {...props}
        />
        <button
          type="button"
          className="forme-input-action"
          onClick={() => setShowPassword(!showPassword)}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
      {error && (
        <span id={errorId} className="forme-field-error" role="alert">
          <AlertCircle size={12} />
          {error}
        </span>
      )}
    </div>
  );
}

export function FormError({ message }) {
  if (!message) return null;
  return (
    <div className="forme-form-alert forme-form-alert--error" role="alert">
      <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
      <span>{message}</span>
    </div>
  );
}

export function FormSuccess({ message }) {
  if (!message) return null;
  return (
    <div className="forme-form-alert forme-form-alert--success" role="status">
      <CheckCircle2 size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
      <span>{message}</span>
    </div>
  );
}

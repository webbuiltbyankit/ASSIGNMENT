import React from 'react';

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  isLoading = false,
  disabled = false,
  type = 'button',
  onClick,
  className = '',
  ...props
}) {
  const baseClasses = `forme-btn forme-btn--${variant} forme-btn--${size} ${
    fullWidth ? 'forme-btn--full' : ''
  } ${className}`.trim();

  return (
    <button
      type={type}
      className={baseClasses}
      disabled={disabled || isLoading}
      aria-disabled={disabled || isLoading}
      onClick={onClick}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="forme-btn__spinner" aria-hidden="true">●</span>
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export function TextLink({
  children,
  href,
  to,
  variant = 'default',
  className = '',
  onClick,
  ...props
}) {
  const classes = `forme-link ${variant === 'subtle' ? 'forme-link--subtle' : ''} ${className}`.trim();

  if (to) {
    // If used with react-router Link, caller can pass component or we render anchor
    return (
      <a href={to} className={classes} onClick={onClick} {...props}>
        {children}
      </a>
    );
  }

  return (
    <a href={href || '#'} className={classes} onClick={onClick} {...props}>
      {children}
    </a>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = 'center',
  className = '',
}) {
  return (
    <div className={`forme-heading forme-heading--${align} ${className}`}>
      {eyebrow && <span className="forme-heading__eyebrow">{eyebrow}</span>}
      {title && <h2 className="forme-heading__title">{title}</h2>}
      {subtitle && <p className="forme-heading__subtitle">{subtitle}</p>}
    </div>
  );
}

export function Badge({
  children,
  variant = 'neutral',
  className = '',
}) {
  return (
    <span className={`forme-badge forme-badge--${variant} ${className}`}>
      {children}
    </span>
  );
}

export function Price({
  amount, // in INR (can be direct number or paise converted)
  originalAmount,
  className = '',
}) {
  const formatINR = (val) => {
    if (typeof val !== 'number' || isNaN(val)) return '₹0';
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <span className={`forme-price ${className}`}>
      <span className="forme-price__current">{formatINR(amount)}</span>
      {originalAmount && originalAmount > amount && (
        <span className="forme-price__original">{formatINR(originalAmount)}</span>
      )}
    </span>
  );
}

export function Breadcrumb({ items = [], className = '' }) {
  if (!items.length) return null;

  return (
    <nav aria-label="Breadcrumb" className={`forme-breadcrumb ${className}`}>
      <ol style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', listStyle: 'none' }}>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <li key={item.label + index} className={`forme-breadcrumb__item ${isLast ? 'forme-breadcrumb__item--active' : ''}`}>
              {isLast || !item.href ? (
                <span aria-current={isLast ? 'page' : undefined}>{item.label}</span>
              ) : (
                <a href={item.href}>{item.label}</a>
              )}
              {!isLast && <span className="forme-breadcrumb__separator" aria-hidden="true">/</span>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function Divider({ strong = false, className = '' }) {
  return <hr className={`forme-divider ${strong ? 'forme-divider--strong' : ''} ${className}`} />;
}

export function Skeleton({
  variant = 'text',
  width,
  height,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`forme-skeleton forme-skeleton--${variant} ${className}`}
      style={{
        width,
        height,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

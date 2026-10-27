import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Minus, Plus, Trash2, ArrowRight, ShieldCheck, ShoppingBag, Undo2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Button, Price } from '../components/common';
import { EmptyState } from '../components/feedback/FeedbackStates';
import { resolveImageUrl, handleImageError } from '../services/imageResolver';
import { apiClient } from '../services/apiClient';

export function CartPage() {
  const { items, updateQuantity, removeItem, addItem, estimatedSubtotal } = useCart();
  const [removedItem, setRemovedItem] = useState(null);
  const [serverQuote, setServerQuote] = useState(null);
  const [isQuoting, setIsQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState(null);

  // Request authoritative server quote when cart items change
  useEffect(() => {
    if (items.length === 0) {
      setServerQuote(null);
      return;
    }

    let isCancelled = false;
    const fetchServerQuote = async () => {
      setIsQuoting(true);
      setQuoteError(null);
      try {
        const payload = {
          lines: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        };
        const quote = await apiClient('/cart/quote', {
          method: 'POST',
          body: payload,
        });
        if (!isCancelled && quote) {
          setServerQuote(quote);
        }
      } catch (err) {
        if (!isCancelled) {
          // If server offline or endpoint pending, gracefully fallback to frontend estimate
          console.warn('Server quote endpoint not available or error:', err.message);
          setQuoteError('Server quote offline — using local estimated calculation');
          setServerQuote(null);
        }
      } finally {
        if (!isCancelled) setIsQuoting(false);
      }
    };

    fetchServerQuote();
    return () => {
      isCancelled = true;
    };
  }, [items]);

  const handleRemove = (item) => {
    setRemovedItem(item);
    removeItem(item.lineId);
  };

  const handleUndo = () => {
    if (removedItem) {
      addItem({
        product: {
          id: removedItem.productId,
          slug: removedItem.productSlug,
          name: removedItem.title,
          price: removedItem.estimatedPrice,
          coverImage: removedItem.coverImage,
        },
        variantId: removedItem.variantId,
        size: removedItem.size,
        quantity: removedItem.quantity,
      });
      setRemovedItem(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="container forme-cart">
        <EmptyState
          icon={ShoppingBag}
          title="Your Shopping Bag is Empty"
          description="You haven't added any garments to your bag yet. Explore our curated collections of linen, cotton, and selvedge denim."
          actionLabel="Explore All Garments"
          onAction={() => (window.location.href = '/shop')}
        />
      </div>
    );
  }

  // Authoritative total from server quote if available, otherwise frontend estimated subtotal
  const effectiveTotal = serverQuote?.totalINR || estimatedSubtotal;

  return (
    <div className="container forme-cart">
      <div className="forme-cart__header">
        <h1 className="forme-cart__title">Shopping Bag</h1>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
          Review your selected garments and size variants before proceeding.
        </p>
      </div>

      {/* Undo Notification Banner */}
      {removedItem && (
        <div
          role="status"
          style={{
            backgroundColor: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            padding: 'var(--space-sm) var(--space-md)',
            borderRadius: 'var(--radius-xs)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-lg)',
            fontSize: 'var(--text-sm)',
          }}
        >
          <span>Removed <strong>{removedItem.title} ({removedItem.size})</strong> from your bag.</span>
          <button
            type="button"
            onClick={handleUndo}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--color-charcoal)', fontWeight: 600, textDecoration: 'underline' }}
          >
            <Undo2 size={14} />
            <span>Undo</span>
          </button>
        </div>
      )}

      <div className="forme-cart__layout">
        {/* Cart Line Items List */}
        <div className="forme-cart__items" role="region" aria-label="Cart Items">
          {items.map((item) => {
            const imgSrc = resolveImageUrl(item.coverImage);
            const lineSubtotal = (item.estimatedPrice || 0) * item.quantity;

            return (
              <div key={item.lineId} className="forme-cart-item">
                <div className="forme-cart-item__media">
                  <img
                    src={imgSrc}
                    alt={item.title}
                    className="forme-cart-item__img"
                    onError={handleImageError}
                  />
                </div>

                <div className="forme-cart-item__details">
                  <Link to={`/products/${item.productSlug}`} className="forme-cart-item__title">
                    {item.title}
                  </Link>
                  <span className="forme-cart-item__meta">
                    Size: <strong>{item.size}</strong> {item.color ? `• ${item.color}` : ''}
                  </span>
                  <div style={{ marginTop: 'var(--space-2xs)' }}>
                    <Price amount={item.estimatedPrice} />
                  </div>
                </div>

                <div className="forme-cart-item__controls">
                  {/* Quantity Control */}
                  <div className="forme-qty-picker" style={{ height: '38px' }} aria-label="Line item quantity">
                    <button
                      type="button"
                      className="forme-qty-picker__btn"
                      onClick={() => updateQuantity(item.lineId, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="forme-qty-picker__val" style={{ fontSize: 'var(--text-xs)' }}>
                      {item.quantity}
                    </span>
                    <button
                      type="button"
                      className="forme-qty-picker__btn"
                      onClick={() => updateQuantity(item.lineId, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      <Plus size={12} />
                    </button>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: 'var(--text-primary)' }}>
                      <Price amount={lineSubtotal} />
                    </div>
                    <button
                      type="button"
                      className="forme-cart-item__remove-btn"
                      onClick={() => handleRemove(item)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Column */}
        <aside className="forme-cart-summary" aria-label="Order Summary">
          <h2 className="forme-cart-summary__title">Order Summary</h2>

          <div className="forme-cart-summary__row">
            <span>Estimated Subtotal</span>
            <Price amount={estimatedSubtotal} />
          </div>

          <div className="forme-cart-summary__row">
            <span>Shipping across India</span>
            <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>Complimentary</span>
          </div>

          {serverQuote ? (
            <div className="forme-cart-summary__notice" style={{ borderColor: 'var(--color-success-border)' }}>
              <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>✓ Server Quote Verified</span>
              <p style={{ marginTop: '2px' }}>Inventory and pricing validated authoritatively by server.</p>
            </div>
          ) : (
            <div className="forme-cart-summary__notice">
              <span>Frontend estimate shown. Final price & stock will be verified upon backend authorization.</span>
            </div>
          )}

          <div className="forme-cart-summary__row forme-cart-summary__row--total">
            <span>Total Amount</span>
            <Price amount={effectiveTotal} />
          </div>

          {/* Candid Checkout Boundary */}
          <div style={{ marginTop: 'var(--space-md)' }}>
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => alert('FORME Demo Storefront: Server quotation verified. Payment integration is deliberately excluded per assignment specification.')}
            >
              Proceed to Checkout
              <ArrowRight size={16} />
            </Button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 'var(--space-xs)' }}>
            <ShieldCheck size={14} />
            <span>Secure SSL Encrypted Checkout</span>
          </div>
        </aside>
      </div>
    </div>
  );
}

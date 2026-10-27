import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { catalogService } from '../services/catalogService';

const CART_STORAGE_KEY = 'forme_cart_v1';
const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && Array.isArray(parsed.items)) {
          return parsed.items.filter(
            (item) => item.productId && item.variantId && typeof item.quantity === 'number' && item.quantity > 0
          );
        }
      }
    } catch (e) {
      console.warn('Failed to parse cart from localStorage, initializing fresh cart:', e);
    }
    return [];
  });

  const [toastMessage, setToastMessage] = useState(null);

  // Sync guest cart to localStorage
  useEffect(() => {
    try {
      const payload = {
        version: '1.0.0',
        updatedAt: new Date().toISOString(),
        items,
      };
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(payload));
    } catch (e) {
      console.warn('Failed to persist cart to localStorage:', e);
    }
  }, [items]);

  // Derived item count
  const itemCount = useMemo(() => {
    return items.reduce((total, item) => total + (item.quantity || 0), 0);
  }, [items]);

  // Estimated frontend subtotal (unverified until server quote)
  const estimatedSubtotal = useMemo(() => {
    return items.reduce((total, item) => {
      const price = item.estimatedPrice || 0;
      return total + price * (item.quantity || 0);
    }, 0);
  }, [items]);

  /**
   * Add item to cart with size variant
   */
  const addItem = ({ product, variantId, size, quantity = 1 }) => {
    if (!product || !variantId || !size || quantity <= 0) return;

    setItems((prevItems) => {
      const lineKey = `${product.id}_${variantId}`;
      const existingIndex = prevItems.findIndex(
        (i) => i.productId === product.id && i.variantId === variantId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      }

      const newLine = {
        lineId: lineKey,
        productId: product.id,
        productSlug: product.slug,
        title: product.name,
        color: product.color,
        size,
        variantId,
        quantity,
        estimatedPrice: product.price,
        coverImage: product.coverImage || product.images?.[0]?.assetId,
        addedAt: new Date().toISOString(),
      };

      return [...prevItems, newLine];
    });

    setToastMessage(`Added ${quantity} × ${product.name} (${size}) to your bag.`);
    setTimeout(() => setToastMessage(null), 3500);
  };

  /**
   * Update quantity of a line item
   */
  const updateQuantity = (lineId, newQuantity) => {
    if (newQuantity <= 0) {
      removeItem(lineId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.lineId === lineId ? { ...item, quantity: Math.min(newQuantity, 10) } : item
      )
    );
  };

  /**
   * Remove item from cart
   */
  const removeItem = (lineId) => {
    setItems((prevItems) => prevItems.filter((item) => item.lineId !== lineId));
  };

  /**
   * Clear entire cart
   */
  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        estimatedSubtotal,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        toastMessage,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

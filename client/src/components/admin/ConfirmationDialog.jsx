import React, { useEffect } from 'react';
import { Button } from '../common';
import { AlertTriangle } from 'lucide-react';

export function ConfirmationDialog({
  isOpen,
  title = 'Confirm Destructive Action',
  message,
  confirmLabel = 'Delete',
  cancelLabel = 'Cancel',
  onConfirm,
  onCancel,
  isConfirming = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isConfirming) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onCancel, isConfirming]);

  if (!isOpen) return null;

  return (
    <div
      className="forme-modal-backdrop"
      onClick={!isConfirming ? onCancel : undefined}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className="forme-modal-card" onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)', marginBottom: 'var(--space-md)' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-error-bg)',
              color: 'var(--color-error)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AlertTriangle size={20} />
          </div>
          <h2 id="confirm-dialog-title" style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)' }}>
            {title}
          </h2>
        </div>

        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: 'var(--space-xl)' }}>
          {message}
        </p>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)' }}>
          <Button
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelLabel}
          </Button>
          <Button
            variant="primary"
            size="sm"
            style={{ backgroundColor: 'var(--color-error)', borderColor: 'var(--color-error)' }}
            onClick={onConfirm}
            isLoading={isConfirming}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}

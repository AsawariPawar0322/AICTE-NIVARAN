// ==========================================================================
// NIVARAN · Shared Accessible Toast System (Toast.tsx)
// Replaces all blocking browser alert() dialogs (Defect D8)
// ==========================================================================

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Icon } from './Icon';
import styles from './ui.module.css';

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface ToastContextType {
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'info') => {
    const id = `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newToast: ToastItem = { id, type, message };

    setToasts(prev => [...prev, newToast]);

    setTimeout(() => {
      removeToast(id);
    }, 5000);
  }, [removeToast]);

  const success = useCallback((msg: string) => showToast(msg, 'success'), [showToast]);
  const error = useCallback((msg: string) => showToast(msg, 'error'), [showToast]);
  const info = useCallback((msg: string) => showToast(msg, 'info'), [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, success, error, info }}>
      {children}
      <div className={styles.toastContainer} role="region" aria-label="Notifications" aria-live="polite">
        {toasts.map(t => {
          const typeClass =
            t.type === 'success'
              ? styles.toastSuccess
              : t.type === 'error'
              ? styles.toastError
              : styles.toastInfo;

          return (
            <div key={t.id} className={`${styles.toast} ${typeClass}`} role="status">
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                <Icon
                  name={t.type === 'success' ? 'check-circle' : t.type === 'error' ? 'danger' : 'info'}
                  size={18}
                  weight="fill"
                />
                <span>{t.message}</span>
              </div>
              <button
                type="button"
                onClick={() => removeToast(t.id)}
                aria-label="Dismiss notification"
                style={{ color: '#FFFFFF', opacity: 0.7, padding: '2px' }}
              >
                ✕
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return ctx;
}

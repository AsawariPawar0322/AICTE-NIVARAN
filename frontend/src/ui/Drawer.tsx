// ==========================================================================
// NIVARAN · Shared Accessible Side Drawer Component (Drawer.tsx)
// Useful for inspection scorecards ("How is this calculated?") & case filters
// ==========================================================================

import React, { useEffect } from 'react';
import styles from './ui.module.css';

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export const Drawer: React.FC<DrawerProps> = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className={styles.modalBackdrop}
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '100%',
          maxWidth: '460px',
          backgroundColor: 'var(--surface)',
          boxShadow: 'var(--shadow-3)',
          zIndex: 100000,
          display: 'flex',
          flexDirection: 'column',
          padding: 'var(--sp-6)',
          overflowY: 'auto'
        }}
      >
        <div className={styles.modalHeader}>
          <h2 id="drawer-title" className={styles.modalTitle}>
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            style={{
              padding: 'var(--sp-1) var(--sp-2)',
              fontSize: 'var(--fs-xl)',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            ✕
          </button>
        </div>

        <div style={{ flex: 1 }}>{children}</div>
      </div>
    </div>
  );
};

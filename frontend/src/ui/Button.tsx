// ==========================================================================
// NIVARAN · Shared Accessible Button Component (Button.tsx)
// ==========================================================================

import React from 'react';
import styles from './ui.module.css';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline-white' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const variantClass = {
    primary: styles.btnPrimary,
    secondary: styles.btnSecondary,
    'outline-white': styles.btnOutlineWhite,
    ghost: styles.btnGhost,
    danger: styles.btnDanger
  }[variant];

  const sizeClass = {
    sm: styles.btnSm,
    md: styles.btnMd,
    lg: styles.btnLg
  }[size];

  return (
    <button
      className={`${styles.btn} ${variantClass} ${sizeClass} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span aria-hidden="true" style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>
          ⟳
        </span>
      ) : (
        icon
      )}
      <span>{children}</span>
    </button>
  );
};

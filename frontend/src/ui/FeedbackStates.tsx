// ==========================================================================
// NIVARAN · Skeleton, EmptyState & ErrorState UI Components
// ==========================================================================

import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import styles from './ui.module.css';

// ── 1. Skeleton ──
export const Skeleton: React.FC<{
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}> = ({ width = '100%', height = '20px', borderRadius = 'var(--rad-sm)', className = '' }) => {
  return (
    <div
      className={`${styles.skeleton} ${className}`}
      style={{
        width: typeof width === 'number' ? `${width}px` : width,
        height: typeof height === 'number' ? `${height}px` : height,
        borderRadius
      }}
      aria-hidden="true"
    />
  );
};

// ── 2. EmptyState ──
export const EmptyState: React.FC<{
  title: string;
  description: string;
  action?: React.ReactNode;
  iconName?: 'folder' | 'search' | 'info';
  className?: string;
}> = ({ title, description, action, iconName = 'folder', className = '' }) => {
  return (
    <div
      style={{
        padding: 'var(--sp-8) var(--sp-4)',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 'var(--sp-3)',
        backgroundColor: 'var(--surface)',
        borderRadius: 'var(--rad-md)',
        border: '1px solid var(--border)'
      }}
      className={className}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          backgroundColor: 'var(--navy-50)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--navy-700)'
        }}
      >
        <Icon name={iconName} size={32} weight="duotone" />
      </div>

      <h4 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)' }}>{title}</h4>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', maxWidth: '420px' }}>
        {description}
      </p>

      {action && <div style={{ marginTop: 'var(--sp-2)' }}>{action}</div>}
    </div>
  );
};

// ── 3. ErrorState ──
export const ErrorState: React.FC<{
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}> = ({ title = 'Failed to Load Records', message, onRetry, className = '' }) => {
  return (
    <div
      style={{
        padding: 'var(--sp-6)',
        backgroundColor: 'var(--danger-surface)',
        border: '1px solid var(--danger-border)',
        borderRadius: 'var(--rad-md)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        gap: 'var(--sp-3)'
      }}
      className={className}
      role="alert"
    >
      <div style={{ color: 'var(--danger)' }}>
        <Icon name="danger" size={36} weight="fill" />
      </div>
      <h4 style={{ color: 'var(--danger)', fontSize: 'var(--fs-md)' }}>{title}</h4>
      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" onClick={onRetry} icon={<Icon name="refresh" size={14} />}>
          Try Again
        </Button>
      )}
    </div>
  );
};

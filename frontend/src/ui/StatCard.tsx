// ==========================================================================
// NIVARAN · Shared StatCard Component (StatCard.tsx)
// Big number, label, delta, click handler with filtered list routing
// ==========================================================================

import React from 'react';
import styles from './ui.module.css';

interface StatCardProps {
  title: string;
  value: number | string;
  deltaText?: string;
  deltaPositive?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  deltaText,
  deltaPositive = true,
  icon,
  onClick,
  className = ''
}) => {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`${styles.statCard} ${className}`}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className={styles.statCardTitle}>{title}</span>
        {icon && <span style={{ color: 'var(--navy-700)' }}>{icon}</span>}
      </div>

      <div className={styles.statCardValue}>{value}</div>

      {deltaText && (
        <div className={styles.statCardFooter}>
          <span style={{ color: deltaPositive ? 'var(--ok)' : 'var(--danger)', fontWeight: 600 }}>
            {deltaText}
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs previous week</span>
        </div>
      )}
    </div>
  );
};

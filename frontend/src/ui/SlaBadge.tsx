// ==========================================================================
// NIVARAN · Shared SLA Badge (SlaBadge.tsx)
// ==========================================================================

import React from 'react';
import { SlaClock } from '../domain/types';
import { formatSlaLabel, getSlaColorClass } from '../domain/sla';
import { Icon } from './Icon';
import styles from './ui.module.css';

interface SlaBadgeProps {
  clock: SlaClock;
  className?: string;
}

export const SlaBadge: React.FC<SlaBadgeProps> = ({ clock, className = '' }) => {
  const label = formatSlaLabel(clock);
  const color = getSlaColorClass(clock.status);

  return (
    <span
      className={`${styles.slaBadge} ${className}`}
      style={{
        backgroundColor: color.bg,
        color: color.text,
        borderColor: color.border
      }}
    >
      <Icon
        name={clock.status === 'OVERDUE' ? 'warning' : 'clock'}
        size={12}
        weight="bold"
      />
      <span>{label}</span>
    </span>
  );
};

// ==========================================================================
// NIVARAN · Shared Status Chip (StatusChip.tsx)
// ==========================================================================

import React from 'react';
import { StageKey, STAGE_CONFIG } from '../domain/types';
import { Icon } from './Icon';
import styles from './ui.module.css';

interface StatusChipProps {
  stage: StageKey;
  className?: string;
}

export const StatusChip: React.FC<StatusChipProps> = ({ stage, className = '' }) => {
  const meta = STAGE_CONFIG[stage] || { label: stage, step: 1, colorClass: '' };

  let chipClass = styles.chipSubmitted;
  let iconName: 'clock' | 'check-circle' | 'warning' | 'danger' = 'clock';

  switch (stage) {
    case 'SUBMITTED':
      chipClass = styles.chipSubmitted;
      iconName = 'clock';
      break;
    case 'VERIFICATION':
      chipClass = styles.chipVerification;
      iconName = 'clock';
      break;
    case 'ASSIGNED':
      chipClass = styles.chipAssigned;
      iconName = 'clock';
      break;
    case 'UNDER_ACTION':
      chipClass = styles.chipInvestigation;
      iconName = 'clock';
      break;
    case 'RESOLUTION_PROPOSED':
      chipClass = styles.chipProposed;
      iconName = 'warning';
      break;
    case 'AWAITING_CONFIRMATION':
      chipClass = styles.chipConfirmation;
      iconName = 'warning';
      break;
    case 'DISPUTED':
      chipClass = styles.chipDisputed;
      iconName = 'danger';
      break;
    case 'CLOSED':
      chipClass = styles.chipResolved;
      iconName = 'check-circle';
      break;
  }

  return (
    <span className={`${styles.chip} ${chipClass} ${className}`}>
      <Icon name={iconName} size={14} weight="fill" />
      <span>{meta.label}</span>
    </span>
  );
};

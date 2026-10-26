// ==========================================================================
// NIVARAN · SLA Clock & Statutory Timeline Rules (sla.ts)
// ==========================================================================

import { SlaClock } from './types';

export function formatSlaLabel(clock: SlaClock): string {
  if (clock.status === 'PAUSED') {
    return 'Timeline Paused (Pending Response)';
  }
  if (clock.isOverdue || clock.status === 'OVERDUE') {
    const overdue = clock.overdueHours ?? Math.max(1, 72 - clock.hoursRemaining);
    const days = Math.floor(overdue / 24);
    const hours = overdue % 24;
    return days > 0 ? `Overdue by ${days}d ${hours}h` : `Overdue by ${hours}h`;
  }
  if (clock.hoursRemaining <= 24) {
    return `Due in ${clock.hoursRemaining}h`;
  }
  const days = Math.floor(clock.hoursRemaining / 24);
  const hours = clock.hoursRemaining % 24;
  return hours > 0 ? `Due in ${days}d ${hours}h` : `Due in ${days}d`;
}

export function getSlaColorClass(status: SlaClock['status']): {
  bg: string;
  text: string;
  border: string;
} {
  switch (status) {
    case 'OVERDUE':
      return {
        bg: 'var(--danger-surface)',
        text: 'var(--danger)',
        border: 'var(--danger-border)'
      };
    case 'DUE_SOON':
      return {
        bg: 'var(--warn-surface)',
        text: 'var(--warn)',
        border: 'var(--warn-border)'
      };
    case 'PAUSED':
      return {
        bg: 'var(--navy-50)',
        text: 'var(--text-muted)',
        border: 'var(--border)'
      };
    case 'ON_TRACK':
    default:
      return {
        bg: 'var(--ok-surface)',
        text: 'var(--ok)',
        border: 'var(--ok-border)'
      };
  }
}

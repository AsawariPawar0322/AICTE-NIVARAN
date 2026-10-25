import React from 'react';
import { ComplaintStatus, UrgencyLevel } from '../types';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  RotateCw,
  Send,
  HelpCircle,
  XCircle,
  FileText,
  AlertOctagon,
} from 'lucide-react';

interface StatusChipProps {
  status: ComplaintStatus;
  isOverdue?: boolean;
  overdueDays?: number;
  className?: string;
  size?: 'sm' | 'md';
}

export const StatusChip: React.FC<StatusChipProps> = ({
  status,
  isOverdue,
  overdueDays,
  className = '',
  size = 'md',
}) => {
  let bg = 'bg-[#DBEAFE]';
  let text = 'text-[#1D4ED8]';
  let border = 'border-[#93C5FD]';
  let Icon = RotateCw;
  let label = status.replace(/_/g, ' ');

  switch (status) {
    case 'REGISTERED':
      bg = 'bg-[#F3F5F8]';
      text = 'text-[#1A1F2B]';
      border = 'border-[#CBD2DC]';
      Icon = FileText;
      label = 'Registered';
      break;
    case 'UNDER_REVIEW':
      bg = 'bg-[#E6EEF9]';
      text = 'text-[#1F5FBF]';
      border = 'border-[#93C5FD]';
      Icon = RotateCw;
      label = 'Under Review';
      break;
    case 'INFO_REQUESTED':
      bg = 'bg-[#FEF3C7]';
      text = 'text-[#92400E]';
      border = 'border-[#FCD34D]';
      Icon = HelpCircle;
      label = 'Info Requested';
      break;
    case 'ASSIGNED':
      bg = 'bg-[#E0E7FF]';
      text = 'text-[#3730A3]';
      border = 'border-[#C7D2FE]';
      Icon = Send;
      label = 'Assigned';
      break;
    case 'ACTION_IN_PROGRESS':
      bg = 'bg-[#DBEAFE]';
      text = 'text-[#1D4ED8]';
      border = 'border-[#93C5FD]';
      Icon = RotateCw;
      label = 'Action In Progress';
      break;
    case 'ESCALATED':
      bg = 'bg-[#FEE2E2]';
      text = 'text-[#B91C1C]';
      border = 'border-[#FCA5A5]';
      Icon = AlertOctagon;
      label = 'Escalated';
      break;
    case 'RESOLVED':
      bg = 'bg-[#DCFCE7]';
      text = 'text-[#166534]';
      border = 'border-[#86EFAC]';
      Icon = CheckCircle2;
      label = 'Resolved';
      break;
    case 'REJECTED':
      bg = 'bg-[#FEE2E2]';
      text = 'text-[#991B1B]';
      border = 'border-[#F87171]';
      Icon = XCircle;
      label = 'Rejected';
      break;
  }

  const isSmall = size === 'sm';

  return (
    <div className="inline-flex items-center gap-1.5 flex-wrap">
      <span
        className={`inline-flex items-center gap-1.5 font-medium border rounded-full ${bg} ${text} ${border} ${
          isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1'
        } ${className}`}
      >
        <Icon className={isSmall ? 'w-3 h-3' : 'w-3.5 h-3.5'} aria-hidden="true" />
        <span>{label}</span>
      </span>

      {isOverdue && status !== 'RESOLVED' && status !== 'REJECTED' && (
        <span
          className={`inline-flex items-center gap-1 font-semibold border rounded-full bg-[#FEE2E2] text-[#B91C1C] border-[#FCA5A5] ${
            isSmall ? 'text-xs px-2 py-0.5' : 'text-xs px-2 py-1'
          }`}
          title="Mandatory AICTE SLA exceeded"
        >
          <Clock className={isSmall ? 'w-3 h-3 animate-pulse' : 'w-3.5 h-3.5 animate-pulse'} aria-hidden="true" />
          <span>Overdue{overdueDays ? ` by ${overdueDays}d` : ''}</span>
        </span>
      )}
    </div>
  );
};

export const UrgencyBadge: React.FC<{ urgency: UrgencyLevel; size?: 'sm' | 'md' }> = ({
  urgency,
  size = 'md',
}) => {
  let bg = 'bg-[#F3F5F8]';
  let text = 'text-[#4B5565]';
  let border = 'border-[#CBD2DC]';

  if (urgency === 'CRITICAL') {
    bg = 'bg-[#FEE2E2]';
    text = 'text-[#991B1B]';
    border = 'border-[#FCA5A5]';
  } else if (urgency === 'HIGH') {
    bg = 'bg-[#FEF3C7]';
    text = 'text-[#92400E]';
    border = 'border-[#FCD34D]';
  } else if (urgency === 'MEDIUM') {
    bg = 'bg-[#E6EEF9]';
    text = 'text-[#1F5FBF]';
    border = 'border-[#93C5FD]';
  }

  return (
    <span
      className={`inline-flex items-center gap-1 font-medium border rounded ${bg} ${text} ${border} ${
        size === 'sm' ? 'text-[11px] px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
      }`}
    >
      {urgency === 'CRITICAL' && <AlertTriangle className="w-3 h-3 text-[#B91C1C]" aria-hidden="true" />}
      <span>{urgency}</span>
    </span>
  );
};

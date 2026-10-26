// ==========================================================================
// NIVARAN · Shared Docket ID Component with Copy Tooltip (DocketId.tsx)
// ==========================================================================

import React, { useState } from 'react';
import { Icon } from './Icon';
import styles from './ui.module.css';

interface DocketIdProps {
  id: string;
  className?: string;
  style?: React.CSSProperties;
}

export const DocketId: React.FC<DocketIdProps> = ({ id, className = '', style }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <span className={`${styles.docketIdBox} ${className}`} style={style}>
      <span>{id}</span>
      <button
        type="button"
        className={styles.docketCopyBtn}
        onClick={handleCopy}
        aria-label={`Copy Docket ID ${id}`}
        title={copied ? 'Copied!' : 'Copy to clipboard'}
      >
        <Icon name={copied ? 'check' : 'copy'} size={14} />
      </button>
      {copied && (
        <span
          role="status"
          style={{
            position: 'absolute',
            background: 'var(--navy-900)',
            color: '#FFFFFF',
            fontSize: 'var(--fs-xs)',
            padding: '2px 6px',
            borderRadius: 'var(--rad-sm)',
            transform: 'translateY(-24px)',
            whiteSpace: 'nowrap',
            zIndex: 10
          }}
        >
          Copied!
        </span>
      )}
    </span>
  );
};

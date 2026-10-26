// ==========================================================================
// NIVARAN · Shared Form Field Component (Field.tsx)
// Accessible label, hint, character counter, error linkage with aria-describedby
// ==========================================================================

import React, { useId } from 'react';
import styles from './ui.module.css';

export interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  currentLength?: number;
  children: (props: { id: string; ariaDescribedBy?: string; isError: boolean }) => React.ReactNode;
}

export const Field: React.FC<FieldProps> = ({
  label,
  hint,
  error,
  required,
  maxLength,
  currentLength,
  children
}) => {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;

  const ariaDescribedBy = [
    hint ? hintId : '',
    error ? errorId : ''
  ].filter(Boolean).join(' ') || undefined;

  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.fieldLabel}>
        {label}
        {required && <span className={styles.requiredMarker} aria-hidden="true">*</span>}
      </label>

      {hint && (
        <span id={hintId} className={styles.fieldHint}>
          {hint}
        </span>
      )}

      {children({ id, ariaDescribedBy, isError: Boolean(error) })}

      {maxLength !== undefined && currentLength !== undefined && (
        <div className={styles.charCounter} aria-live="polite">
          {currentLength} / {maxLength}
        </div>
      )}

      {error && (
        <div id={errorId} className={styles.errorMessage} role="alert">
          <span aria-hidden="true">⚠</span>
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};

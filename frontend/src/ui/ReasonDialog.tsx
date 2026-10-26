// ==========================================================================
// NIVARAN · Mandatory Reason Action Dialog (ReasonDialog.tsx)
// Enforces minimum 15 characters of administrative rationale for audit events
// ==========================================================================

import React, { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Field } from './Field';
import { validateReason, MIN_REASON_LENGTH } from '../domain/validators';
import styles from './ui.module.css';

interface ReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  confirmVariant?: 'primary' | 'danger';
  placeholder?: string;
}

export const ReasonDialog: React.FC<ReasonDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm Action',
  confirmVariant = 'primary',
  placeholder = 'Provide formal justification (minimum 15 characters)...'
}) => {
  const [reason, setReason] = useState('');
  const [touched, setTouched] = useState(false);

  const validation = validateReason(reason);
  const showError = touched && !validation.isValid;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!validation.isValid) return;
    onConfirm(reason.trim());
    setReason('');
    setTouched(false);
    onClose();
  };

  const handleCancel = () => {
    setReason('');
    setTouched(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCancel}
      title={title}
      footer={
        <>
          <Button variant="ghost" onClick={handleCancel}>
            Cancel
          </Button>
          <Button
            variant={confirmVariant}
            onClick={handleSubmit}
            disabled={!validation.isValid}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit}>
        <p style={{ color: 'var(--text-muted)', marginBottom: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
          {description}
        </p>

        <Field
          label="Administrative Reason / Justification"
          hint={`Mandatory accountability requirement. Must be at least ${MIN_REASON_LENGTH} characters.`}
          error={showError ? validation.error : undefined}
          required
          maxLength={300}
          currentLength={reason.length}
        >
          {({ id, ariaDescribedBy, isError }) => (
            <textarea
              id={id}
              rows={4}
              value={reason}
              onChange={e => {
                setReason(e.target.value);
                if (!touched) setTouched(true);
              }}
              className={`${styles.textarea} ${isError ? styles.inputError : ''}`}
              placeholder={placeholder}
              aria-describedby={ariaDescribedBy}
              required
            />
          )}
        </Field>
      </form>
    </Modal>
  );
};

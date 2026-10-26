// ==========================================================================
// NIVARAN · Screen 7: Citizen Resolution Confirmation (ResolutionConfirmView.tsx)
// Side-by-side ATR evidence comparison, OTP verification, dispute with mandatory reason
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { confirmResolution, disputeResolution } from '../../api/complaints';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { ReasonDialog } from '../../ui/ReasonDialog';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

export const ResolutionConfirmView: React.FC = () => {
  const { selectedComplaintId, complaints, refreshData, navigateToTab } = useApp();
  const { success, error, info } = useToast();

  const [otpCode, setOtpCode] = useState('');
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showDisputeDialog, setShowDisputeDialog] = useState(false);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');

  const complaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  if (!complaint) {
    return (
      <div style={{ maxWidth: '800px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-4)', textAlign: 'center' }}>
        <h3>No complaint selected for confirmation</h3>
        <Button variant="primary" onClick={() => navigateToTab('my-complaints')}>
          Return to My Complaints
        </Button>
      </div>
    );
  }

  const handleConfirmWithOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.length !== 6) {
      error('Please enter a valid 6-digit OTP code.');
      return;
    }

    try {
      confirmResolution(complaint.id, feedback || 'Resolution confirmed via OTP authorization.', rating);
      refreshData();
      setShowOtpModal(false);
      success(`Grievance ${complaint.id} has been formally confirmed and closed with verified audit hash!`);
      navigateToTab('my-complaints');
    } catch (err: any) {
      error(err.message || 'Confirmation failed.');
    }
  };

  const handleDispute = (reason: string) => {
    try {
      disputeResolution(complaint.id, reason);
      refreshData();
      info(`Grievance ${complaint.id} has been escalated to AICTE Higher Bench for independent statutory inquiry.`);
      navigateToTab('my-complaints');
    } catch (err: any) {
      error(err.message || 'Dispute submission failed.');
    }
  };

  const resolution = complaint.resolutionDetails;

  return (
    <div style={{ maxWidth: '1100px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)' }}>
      {/* ── 1. Official Verification Banner ── */}
      <div
        style={{
          backgroundColor: 'var(--navy-900)',
          color: '#FFFFFF',
          borderRadius: 'var(--rad-md)',
          padding: 'var(--sp-5) var(--sp-6)',
          marginBottom: 'var(--sp-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)'
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '4px' }}>
            <span style={{ color: 'var(--india-saffron)', fontWeight: 700, fontSize: 'var(--fs-xs)' }}>
              STAGE 6 · ACTION TAKEN REPORT (ATR) CONFIRMATION
            </span>
          </div>
          <h2 style={{ fontSize: 'var(--fs-2xl)', color: '#FFFFFF', fontWeight: 800 }}>
            The institution claims this grievance is resolved. Please check.
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'rgba(255, 255, 255, 0.85)', marginTop: '4px' }}>
            AICTE policy requires your direct verification before any docket can be closed. Cases are never auto-closed without statutory review.
          </p>
        </div>

        <DocketId id={complaint.id} />
      </div>

      {/* ── 2. Side-by-Side Comparison: Claimed Action vs Evidence Preview ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        {/* Left: Claimed Action Details */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-0)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
            <Icon name="certificate" size={22} color="var(--navy-900)" />
            <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)' }}>
              Institution's Claimed Action
            </h3>
          </div>

          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Target Institution:</span>
            <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--navy-900)' }}>
              {complaint.institutionName}
            </div>
            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              Permanent ID: {complaint.aictePermanentId}
            </div>
          </div>

          <div style={{ marginBottom: 'var(--sp-4)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Original Grievance Summary:</span>
            <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', color: 'var(--text)', marginTop: '2px' }}>
              {complaint.title}
            </div>
          </div>

          <div
            style={{
              backgroundColor: 'var(--navy-50)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-sm)',
              padding: 'var(--sp-4)',
              marginBottom: 'var(--sp-4)'
            }}
          >
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--navy-900)', fontWeight: 700 }}>
              Action Taken Report (ATR) Summary:
            </span>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', marginTop: '4px', lineHeight: 1.5 }}>
              {resolution?.atrSummary || 'The college administration claims all requested refunds have been disbursed.'}
            </p>
          </div>

          {resolution?.refundAmount && (
            <div style={{ marginBottom: 'var(--sp-4)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Claimed Disbursement:</span>
              <div style={{ fontWeight: 700, fontSize: 'var(--fs-lg)', color: 'var(--ok)' }}>
                {resolution.refundAmount}
              </div>
            </div>
          )}

          {resolution?.officialOrderRef && (
            <div>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Official Reference Order:</span>
              <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: 'var(--fs-xs)', fontWeight: 600 }}>
                {resolution.officialOrderRef}
              </div>
            </div>
          )}
        </div>

        {/* Right: Uploaded Evidence Preview & Digest */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-0)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)' }}>
            <Icon name="shield" size={22} color="var(--navy-900)" />
            <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)' }}>
              Attached Resolution Proof Document
            </h3>
          </div>

          {resolution?.proofDocument ? (
            <div>
              <div
                style={{
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rad-sm)',
                  padding: 'var(--sp-4)',
                  backgroundColor: 'var(--navy-50)',
                  marginBottom: 'var(--sp-4)'
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                  {resolution.proofDocument.name}
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Size: {(resolution.proofDocument.size / 1024).toFixed(1)} KB · Date: {resolution.proofDocument.uploadDate}
                </div>
                <div
                  style={{
                    marginTop: 'var(--sp-2)',
                    fontSize: '11px',
                    fontFamily: 'var(--font-family-mono)',
                    backgroundColor: 'var(--surface)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    border: '1px solid var(--border-light)',
                    wordBreak: 'break-all'
                  }}
                >
                  SHA-256: {resolution.proofDocument.sha256Hash}
                </div>
              </div>

              {/* Validator Assessment */}
              <div
                style={{
                  padding: 'var(--sp-4)',
                  borderRadius: 'var(--rad-sm)',
                  backgroundColor:
                    resolution.validatorFindings.status === 'PASS'
                      ? 'var(--ok-surface)'
                      : 'var(--warn-surface)',
                  border: `1px solid ${
                    resolution.validatorFindings.status === 'PASS'
                      ? 'var(--ok-border)'
                      : 'var(--warn-border)'
                  }`
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 'var(--fs-xs)', color: resolution.validatorFindings.status === 'PASS' ? 'var(--ok)' : 'var(--warn)' }}>
                  {resolution.validatorFindings.status === 'PASS'
                    ? '✓ AICTE Validator Assessment: Passed'
                    : '⚠ AICTE Validator Assessment: Flagged with Warnings'}
                </div>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text)', marginTop: '4px' }}>
                  {resolution.validatorFindings.notes}
                </p>
              </div>
            </div>
          ) : (
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
              No document uploaded by institution.
            </p>
          )}

          {/* Policy on No Response */}
          <div style={{ marginTop: 'var(--sp-6)', padding: 'var(--sp-3)', backgroundColor: 'var(--bg)', borderRadius: 'var(--rad-sm)', fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            <strong>Note on statutory timeline:</strong> If no response is provided within 7 days, official reminders are triggered. The case is never auto-closed as satisfied without an audit log entry.
          </div>
        </div>
      </div>

      {/* ── 3. Decision Actions: Confirm (Green) vs Dispute (Orange) ── */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          padding: 'var(--sp-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-4)'
        }}
      >
        <div>
          <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)' }}>
            Has your grievance been genuinely resolved to your satisfaction?
          </h4>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            Confirmation triggers OTP verification and writes an immutable closing block to the tamper-evident log.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <Button
            variant="danger"
            size="md"
            icon={<Icon name="warning" size={18} />}
            onClick={() => setShowDisputeDialog(true)}
          >
            Dispute Resolution
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Icon name="check-circle" size={18} />}
            onClick={() => setShowOtpModal(true)}
          >
            Confirm Resolution (OTP)
          </Button>
        </div>
      </div>

      {/* ── OTP Confirmation Modal ── */}
      {showOtpModal && (
        <div className={styles.modalBackdrop}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h3 className={styles.modalTitle}>Confirm Grievance Closure via OTP</h3>
              <button type="button" onClick={() => setShowOtpModal(false)}>✕</button>
            </div>

            <form onSubmit={handleConfirmWithOtp}>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                A 6-digit OTP has been sent to your registered contact number to legally verify satisfaction and finalize docket closure.
              </p>

              <div style={{ marginBottom: 'var(--sp-4)' }}>
                <label className={styles.fieldLabel} style={{ marginBottom: 'var(--sp-2)', display: 'block' }}>
                  Satisfaction Rating (1 to 5 Stars):
                </label>
                <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 'var(--rad-sm)',
                        backgroundColor: rating >= star ? 'var(--action-tint)' : 'var(--bg)',
                        color: rating >= star ? 'var(--action)' : 'var(--text-muted)',
                        border: `1px solid ${rating >= star ? 'var(--action-border)' : 'var(--border)'}`,
                        fontWeight: 700,
                        cursor: 'pointer'
                      }}
                    >
                      ★ {star}
                    </button>
                  ))}
                </div>
              </div>

              <Field label="Verification Code (OTP)" hint="Demo code: enter 123456" required>
                {({ id, ariaDescribedBy }) => (
                  <input
                    id={id}
                    type="text"
                    maxLength={6}
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value)}
                    placeholder="123456"
                    className={styles.input}
                    aria-describedby={ariaDescribedBy}
                    required
                  />
                )}
              </Field>

              <Field label="Optional Feedback on Redressal">
                {({ id }) => (
                  <textarea
                    id={id}
                    rows={3}
                    value={feedback}
                    onChange={e => setFeedback(e.target.value)}
                    placeholder="Provide any feedback for the AICTE Redressal Bureau..."
                    className={styles.textarea}
                  />
                )}
              </Field>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--sp-3)', marginTop: 'var(--sp-4)' }}>
                <Button variant="ghost" onClick={() => setShowOtpModal(false)}>
                  Cancel
                </Button>
                <Button variant="primary" type="submit" disabled={otpCode.length !== 6}>
                  Authorize & Close Docket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Dispute Reason Dialog ── */}
      <ReasonDialog
        isOpen={showDisputeDialog}
        onClose={() => setShowDisputeDialog(false)}
        onConfirm={handleDispute}
        title="Dispute Claimed Resolution"
        description="Explain why the institution's action is inadequate, incorrect, or unfulfilled. This formal reason will be written to the audit chain and escalated to the AICTE Higher Bench."
        confirmLabel="Escalate & Dispute"
        confirmVariant="danger"
        placeholder="State specific deficiencies (e.g. refund amount short by Rs. 20,000, bank UTR returned invalid, original certificates still withheld)..."
      />
    </div>
  );
};

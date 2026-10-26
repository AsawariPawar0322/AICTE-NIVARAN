// ==========================================================================
// NIVARAN · Screen G: Resolution Proof (ATR) Review (ResolutionProofReviewView.tsx)
// Strongest Demo Screen: Evidence inspector, 5-point checklist, validator findings
// Actions: Request better evidence, Return ATR, Send for complainant confirmation
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { updateComplaintStage } from '../../api/complaints';
import { evaluateAtrQuality } from '../../domain/validators';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { Button } from '../../ui/Button';
import { ReasonDialog } from '../../ui/ReasonDialog';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';

export const ResolutionProofReviewView: React.FC = () => {
  const { complaints, currentUser, refreshData } = useApp();
  const { success, error, info } = useToast();

  // Find complaint in RESOLUTION_PROPOSED or default to Case NIV-2026-1042
  const targetCase =
    complaints.find(c => c.currentStage === 'RESOLUTION_PROPOSED') ||
    complaints.find(c => c.id === 'NIV-2026-1042') ||
    complaints[0];

  const resolution = targetCase.resolutionDetails;

  const [checklist, setChecklist] = useState({
    supportingProofAttached: resolution?.checklist.supportingProofAttached ?? true,
    correspondsToComplaint: resolution?.checklist.correspondsToComplaint ?? true,
    concreteOutcome: resolution?.checklist.concreteOutcome ?? false,
    noBoilerplate: resolution?.checklist.noBoilerplate ?? false,
    noUnresolvedLinkedCases: resolution?.checklist.noUnresolvedLinkedCases ?? false
  });

  const [activeReasonAction, setActiveReasonAction] = useState<{
    type: 'REQUEST_BETTER_PROOF' | 'RETURN_ATR' | 'FORWARD_CITIZEN';
    title: string;
    description: string;
  } | null>(null);

  // Evaluate ATR findings dynamically
  const findings = resolution ? evaluateAtrQuality(targetCase, resolution) : [];

  const handleAction = (reason: string) => {
    if (!activeReasonAction) return;

    try {
      const officerName = currentUser?.name || 'Dr. Ramesh Chandra Verma';
      const officerRole = currentUser?.designation || 'Director, PGRC';

      if (activeReasonAction.type === 'FORWARD_CITIZEN') {
        updateComplaintStage(
          targetCase.id,
          'AWAITING_CONFIRMATION',
          officerName,
          officerRole,
          `ATR Proof validated & forwarded for citizen confirmation: ${reason}`
        );
        success(`Docket ${targetCase.id} sent to complainant for final resolution verification.`);
      } else if (activeReasonAction.type === 'RETURN_ATR') {
        updateComplaintStage(
          targetCase.id,
          'UNDER_ACTION',
          officerName,
          officerRole,
          `ATR Returned for correction: ${reason}`
        );
        info(`Action Taken Report returned to college. Statutory SLA clock running.`);
      } else if (activeReasonAction.type === 'REQUEST_BETTER_PROOF') {
        updateComplaintStage(
          targetCase.id,
          'UNDER_ACTION',
          officerName,
          officerRole,
          `Better evidence demanded (missing UTR): ${reason}`
        );
        info('Notice served to college Finance Bureau demanding verifiable bank transaction receipt.');
      }

      refreshData();
      setActiveReasonAction(null);
    } catch (err: any) {
      error(err.message || 'Action failed.');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* ── 1. Screen Title & Context ── */}
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            backgroundColor: 'var(--action-tint)',
            color: 'var(--action)',
            border: '1px solid var(--action-border)',
            padding: '4px 12px',
            borderRadius: 'var(--rad-full)',
            fontSize: 'var(--fs-xs)',
            fontWeight: 700,
            marginBottom: 'var(--sp-2)'
          }}
        >
          <Icon name="check-circle" size={14} />
          <span>SIH26264 CORE SHOWCASE SCREEN · STAGE 5 AUDIT</span>
        </div>
        <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Action Taken Report (ATR) Quality & Proof Review
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          Enforce evidence integrity before permitting resolution dispatch to citizens. Generic boilerplate and unverified claims are blocked.
        </p>
      </div>

      {/* Target Docket Summary Strip */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          padding: 'var(--sp-4)',
          marginBottom: 'var(--sp-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <DocketId id={targetCase.id} />
          <StatusChip stage={targetCase.currentStage} />
          <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
            {targetCase.title}
          </span>
        </div>
        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          {targetCase.institutionName} (PID: {targetCase.aictePermanentId})
        </span>
      </div>

      {/* ── 2. Two-Column Reviewer Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        {/* Left Column: College ATR Text & Evidence Viewer */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-0)'
          }}
        >
          <h3 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
            1. Institution Reported ATR Statement & Memo
          </h3>

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
              Submitted Action Taken Report:
            </span>
            <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', marginTop: '4px', lineHeight: 1.5 }}>
              "{resolution?.atrSummary || 'The college claims refund has been processed.'}"
            </p>
          </div>

          <div style={{ marginBottom: 'var(--sp-4)', fontSize: 'var(--fs-xs)' }}>
            <div>Claimed Settlement: <strong>{resolution?.refundAmount || '₹64,000 claimed'}</strong></div>
            <div>Order Reference: <strong>{resolution?.officialOrderRef || 'ABC/ACCTS/2026/REF-94'}</strong></div>
            <div>Uploaded: {resolution?.proposedAt || '24 Oct 2026, 03:15 PM'}</div>
          </div>

          {/* Evidence File Inspector */}
          <div
            style={{
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-sm)',
              padding: 'var(--sp-4)',
              backgroundColor: 'var(--surface)',
              marginTop: 'var(--sp-4)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
              <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                {resolution?.proofDocument?.name || 'Attached_Document.pdf'}
              </span>
              <span style={{ fontSize: '11px', color: 'var(--warn)', fontWeight: 700 }}>
                STATUS: SUSPECT PROOF
              </span>
            </div>

            <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
              Size: 420 KB · Type: application/pdf · Uploaded by Registrar
            </div>

            {/* Document Preview Box */}
            <div
              style={{
                height: '140px',
                backgroundColor: 'var(--bg)',
                border: '1px dashed var(--border)',
                borderRadius: 'var(--rad-sm)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 'var(--sp-2)',
                color: 'var(--text-muted)',
                fontSize: 'var(--fs-xs)'
              }}
            >
              <Icon name="certificate" size={28} />
              <span>[Internal Office Ledger Memo Draft Preview]</span>
              <span style={{ color: 'var(--danger)', fontWeight: 600 }}>
                ⚠ Bank NEFT/RTGS UTR Reference Missing
              </span>
            </div>

            <div
              style={{
                marginTop: 'var(--sp-3)',
                fontSize: '11px',
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--navy-900)',
                backgroundColor: 'var(--navy-50)',
                padding: '4px 8px',
                borderRadius: '4px',
                wordBreak: 'break-all'
              }}
            >
              Digest: {resolution?.proofDocument?.sha256Hash || '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
            </div>
          </div>
        </div>

        {/* Right Column: 5-Point Quality Checklist & Automated Validator Findings */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-0)'
          }}
        >
          <h3 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', fontWeight: 700, marginBottom: 'var(--sp-4)' }}>
            2. Statutory 5-Point Quality Checklist
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-6)', fontSize: 'var(--fs-xs)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.supportingProofAttached}
                onChange={e => setChecklist({ ...checklist, supportingProofAttached: e.target.checked })}
                style={{ accentColor: 'var(--ok)', width: '16px', height: '16px' }}
              />
              <span>1. Supporting verification proof attached (receipt/order memo).</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.correspondsToComplaint}
                onChange={e => setChecklist({ ...checklist, correspondsToComplaint: e.target.checked })}
                style={{ accentColor: 'var(--ok)', width: '16px', height: '16px' }}
              />
              <span>2. Proof strictly corresponds to complainant name and Permanent ID.</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.concreteOutcome}
                onChange={e => setChecklist({ ...checklist, concreteOutcome: e.target.checked })}
                style={{ accentColor: 'var(--ok)', width: '16px', height: '16px' }}
              />
              <span>3. Concrete remedial outcome achieved (disbursement/admission restored).</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.noBoilerplate}
                onChange={e => setChecklist({ ...checklist, noBoilerplate: e.target.checked })}
                style={{ accentColor: 'var(--ok)', width: '16px', height: '16px' }}
              />
              <span>4. Free of generic boilerplate phrasing ("matter resolved amicably").</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={checklist.noUnresolvedLinkedCases}
                onChange={e => setChecklist({ ...checklist, noUnresolvedLinkedCases: e.target.checked })}
                style={{ accentColor: 'var(--ok)', width: '16px', height: '16px' }}
              />
              <span>5. No unresolved linked cases or uncoordinated overlap dockets.</span>
            </label>
          </div>

          {/* Automated Validator Findings */}
          <h4 style={{ fontSize: 'var(--fs-sm)', color: 'var(--navy-900)', fontWeight: 700, marginBottom: 'var(--sp-3)' }}>
            Automated Rule-Based Validator Findings
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
            {findings.map((f, i) => (
              <div
                key={i}
                style={{
                  padding: 'var(--sp-3)',
                  borderRadius: 'var(--rad-sm)',
                  backgroundColor: f.severity === 'HIGH' ? 'var(--danger-surface)' : 'var(--warn-surface)',
                  border: `1px solid ${f.severity === 'HIGH' ? 'var(--danger-border)' : 'var(--warn-border)'}`,
                  fontSize: 'var(--fs-xs)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2px' }}>
                  <strong style={{ color: f.severity === 'HIGH' ? 'var(--danger)' : 'var(--warn)' }}>
                    {f.title}
                  </strong>
                  <span style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                    {f.severity}
                  </span>
                </div>
                <p style={{ color: 'var(--text)', margin: 0 }}>{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 3. Consequential Officer Decisions ── */}
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
            Determine Statutory ATR Outcome
          </h4>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            Decisions are recorded in the immutable audit trail with mandatory officer justification.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <Button
            variant="danger"
            size="md"
            icon={<Icon name="danger" size={16} />}
            onClick={() =>
              setActiveReasonAction({
                type: 'RETURN_ATR',
                title: 'Return ATR to College for Correction',
                description: 'State why the ATR is rejected (e.g. boilerplate text without concrete restitution).'
              })
            }
          >
            Return ATR for Correction
          </Button>

          <Button
            variant="secondary"
            size="md"
            icon={<Icon name="warning" size={16} />}
            onClick={() =>
              setActiveReasonAction({
                type: 'REQUEST_BETTER_PROOF',
                title: 'Request Bank UTR Transaction Receipt',
                description: 'Order the institution to attach verified bank statement or NEFT confirmation within 48h.'
              })
            }
          >
            Demand Bank UTR Receipt
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Icon name="check-circle" size={16} />}
            onClick={() =>
              setActiveReasonAction({
                type: 'FORWARD_CITIZEN',
                title: 'Approve & Send for Complainant Confirmation',
                description: 'Confirm that proof satisfies AICTE criteria and is ready for citizen OTP authorization.'
              })
            }
          >
            Send for Citizen Confirmation
          </Button>
        </div>
      </div>

      {/* Mandatory Reason Dialog */}
      {activeReasonAction && (
        <ReasonDialog
          isOpen={true}
          onClose={() => setActiveReasonAction(null)}
          onConfirm={handleAction}
          title={activeReasonAction.title}
          description={activeReasonAction.description}
          confirmLabel="Execute Statutory Action"
        />
      )}
    </div>
  );
};

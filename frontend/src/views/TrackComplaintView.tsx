import React, { useState } from 'react';
import { Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint, StageKey, NewTimelineEvent } from '../types';
import { Icon } from '../components/Icon';
import { Building, DiscordLogo } from '@phosphor-icons/react';

interface TrackComplaintViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaints: Complaint[];
  selectedComplaint?: Complaint | null;
  onUpdateComplaintStage: (caseId: string, newStage: StageKey, feedback?: string, event?: NewTimelineEvent) => void;
  onOpenChatWithComplaint: (complaint: Complaint) => void;
}

const STAGES = [
  { num: 1, key: 'REGISTERED',         short: 'Registered'   },
  { num: 2, key: 'ALLOTTED',           short: 'Allotted'     },
  { num: 3, key: 'INVESTIGATION',      short: 'Investigation' },
  { num: 4, key: 'RESOLUTION_PROPOSED', short: 'ATR Filed'   },
  { num: 5, key: 'PENDING_OTP',        short: 'OTP Required' },
  { num: 6, key: 'RESOLVED',           short: 'Resolved'     },
];

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  lang,
  setActiveTab,
  complaints,
  selectedComplaint,
  onUpdateComplaintStage,
  onOpenChatWithComplaint
}) => {
  const [searchId, setSearchId] = useState(selectedComplaint?.id ?? complaints[0]?.id ?? '');
  // Store only the id so the view always shows the latest complaint from App state
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(
    selectedComplaint?.id ?? complaints[0]?.id
  );
  const activeCase: Complaint = complaints.find(c => c.id === activeCaseId) ?? complaints[0];
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [showEscalationModal, setShowEscalationModal] = useState(false);
  const [escalationReason, setEscalationReason] = useState('');

  const handleLookup = () => {
    const found = complaints.find(c =>
      c.id.trim().toLowerCase() === searchId.trim().toLowerCase()
    );
    if (found) {
      setActiveCaseId(found.id);
      setOtpError('');
    } else {
      alert(`Case "${searchId}" not found.`);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = activeCase?.otpVerification?.generatedOtp ?? '849210';
    if (otpInput.trim() === expected) {
      onUpdateComplaintStage(activeCase.id, 'RESOLVED', 'Verified and accepted via Citizen OTP Gateway.', {
        title: 'Case Formally Disposed & Citizen OTP Verified',
        description: 'Complainant verified satisfaction via 6-digit OTP. AICTE closure certificate generated.',
        actor: activeCase.complainantName,
        role: 'Citizen Verification'
      });
      setOtpError('');
    } else {
      setOtpError(`Invalid OTP. Expected: ${expected}`);
    }
  };

  const handleEscalate = () => {
    if (!escalationReason.trim()) {
      alert('Please provide a reason.');
      return;
    }
    onUpdateComplaintStage(activeCase.id, 'ESCALATED', escalationReason, {
      title: 'Escalated to State Technical Ombudsman',
      description: `Citizen rejected resolution: "${escalationReason}". Referred for judicial review.`,
      actor: 'Citizen Rejection Gateway',
      role: 'Complainant Action'
    });
    setShowEscalationModal(false);
  };

  const isResolved  = activeCase?.currentStage === 'RESOLVED';
  const isOtpPending = activeCase?.currentStage === 'PENDING_OTP';
  const isEscalated = activeCase?.currentStage === 'ESCALATED';

  return (
    <div className="tr-root" id="main-content">
      <div className="container tr-container">

        {/* ── LOOKUP BAR ── */}
        <div className="tr-lookup-card">
          <div className="tr-lookup-left">
            <h3 className="tr-lookup-title">Grievance Tracker</h3>
            <p className="tr-lookup-sub">Enter a case ID to view live stage progress, audit trail, and verify resolution.</p>
          </div>
          <div className="tr-lookup-controls">
            <input
              type="text"
              className="tr-input tr-mono"
              placeholder="AICTE-2026-GRV-84920"
              value={searchId}
              onChange={e => setSearchId(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleLookup(); }}
              aria-label="Case ID to track"
            />
            <button type="button" className="tr-btn-primary" onClick={handleLookup}>
              <Icon e="??" size={15} />
              <span>Track</span>
            </button>
          </div>
        </div>

        {activeCase && (
          <div className="tr-content-grid">
            {/* ── MAIN COLUMN ── */}
            <div className="tr-main">

              {/* Case summary */}
              <div className="tr-card tr-case-card">
                <div className="tr-case-top-row">
                  <div className="tr-case-ids">
                    <code className="tr-case-id">{activeCase.id}</code>
                    <span className="tr-cat-chip">{activeCase.categoryLabel}</span>
                  </div>
                  <span className="tr-sla-pill">
                    <Icon e="??" size={13} />
                    {isResolved ? 'Case Disposed' : `${activeCase.slaHoursRemaining}h SLA`}
                  </span>
                </div>

                <h2 className="tr-case-title">{activeCase.title}</h2>
                <p className="tr-case-inst">
                  Against: <strong>{activeCase.institutionName}</strong>
                  <code className="tr-mono tr-inst-id">({activeCase.aictePermanentId})</code>
                  · Submitted: 16 Aug 2026
                </p>

                {/* 6-stage stepper */}
                <div className="tr-stepper-wrap">
                  <p className="tr-stepper-label">Grievance Lifecycle Progress</p>
                  <div className="tr-stages-row">
                    {STAGES.map((st) => {
                      const isPast    = isResolved || st.num < activeCase.stageNumber;
                      const isCurrent = !isResolved && st.num === activeCase.stageNumber;
                      return (
                        <div key={st.key} className={`tr-stage-node ${isCurrent ? 'tr-stage-current' : isPast ? 'tr-stage-past' : ''}`}>
                          <div className="tr-stage-circle" aria-hidden="true">
                            {isPast ? <Icon e="?" size={13} /> : st.num}
                          </div>
                          <span className="tr-stage-label">{st.short}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* OTP Verification Gate (Stage 5) */}
              {isOtpPending && (
                <div className="tr-card tr-otp-card">
                  <div className="tr-otp-header">
                    <div className="tr-otp-icon-box" aria-hidden="true">
                      <Icon e="??" size={24} />
                    </div>
                    <div>
                      <h3 className="tr-otp-title">Stage 5: Citizen OTP Required</h3>
                      <p className="tr-otp-sub">
                        Institutions cannot close cases unilaterally. Authenticate your OTP to accept the resolution, or reject and escalate.
                      </p>
                    </div>
                  </div>

                  {/* ATR display */}
                  {activeCase.resolutionProposedDetails && (
                    <div className="tr-atr-card">
                      <div className="tr-atr-top-row">
                        <span className="tr-atr-badge">Action Taken Report (ATR) from Registrar</span>
                        <code className="tr-mono tr-atr-ref">{activeCase.resolutionProposedDetails.officialOrderRef}</code>
                      </div>
                      <p className="tr-atr-summary">{activeCase.resolutionProposedDetails.atrSummary}</p>
                      <div className="tr-atr-bottom-row">
                        <span className="tr-atr-refund">
                          Credited: <strong>{activeCase.resolutionProposedDetails.refundAmount}</strong>
                        </span>
                        <span className="tr-atr-time">Uploaded: {activeCase.resolutionProposedDetails.proposedAt}</span>
                      </div>
                    </div>
                  )}

                  {/* OTP form */}
                  <form onSubmit={handleVerifyOtp} className="tr-otp-form">
                    <div className="tr-otp-hint-row">
                      <span>Enter 6-digit OTP sent to <strong>{activeCase.contactMobile}</strong></span>
                      <button
                        type="button"
                        className="tr-autofill-btn"
                        onClick={() => setOtpInput(activeCase.otpVerification?.generatedOtp ?? '849210')}
                      >
                        Auto-fill demo: {activeCase.otpVerification?.generatedOtp ?? '849210'}
                      </button>
                    </div>

                    <div className="tr-otp-input-row">
                      <input
                        type="text"
                        className="tr-input tr-otp-input tr-mono"
                        maxLength={6}
                        placeholder="– – – – – –"
                        value={otpInput}
                        onChange={e => setOtpInput(e.target.value.replace(/\D/g, ''))}
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        aria-label="6-digit OTP"
                      />
                      <button type="submit" className="tr-btn-verify">
                        <Icon e="?" size={16} />
                        <span>Verify &amp; Accept</span>
                      </button>
                    </div>

                    {otpError && (
                      <p className="tr-otp-error" role="alert">
                        <Icon e="??" size={14} /> {otpError}
                      </p>
                    )}

                    <div className="tr-otp-reject-row">
                      <span className="tr-reject-label">Resolution not satisfactory or refund not received?</span>
                      <button
                        type="button"
                        className="tr-btn-escalate"
                        onClick={() => setShowEscalationModal(true)}
                      >
                        <Icon e="??" size={14} />
                        Reject &amp; Escalate to Ombudsman
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Resolution certificate (Stage 6) */}
              {isResolved && (
                <div className="tr-card tr-cert-card">
                  <div className="tr-cert-header">
                    <div className="tr-cert-seal">
                      <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN Seal" className="tr-cert-logo" />
                    </div>
                    <div className="tr-cert-header-text">
                      <h3 className="tr-cert-title">AICTE NIVARAN · Official Resolution Certificate</h3>
                      <code className="tr-mono tr-cert-ref">
                        Ref: CERT-NIVARAN-2026-{activeCase.id.slice(-5)}
                      </code>
                    </div>
                    <button
                      type="button"
                      className="tr-btn-outline"
                      onClick={() => alert('Certificate downloaded as signed PDF.')}
                    >
                      <Icon e="??" size={14} />
                      <span>Download PDF</span>
                    </button>
                  </div>
                  <p className="tr-cert-body">
                    This certifies that grievance <strong>{activeCase.id}</strong> filed by{' '}
                    <strong>{activeCase.complainantName}</strong> against{' '}
                    <strong>{activeCase.institutionName}</strong> has been satisfactorily resolved pursuant to AICTE Redressal Norms.
                  </p>
                  <div className="tr-cert-meta-grid">
                    <div className="tr-cert-field">
                      <span className="tr-cert-label">Closure Date</span>
                      <span>{activeCase.otpVerification?.verifiedAt ?? '24 Oct 2026'}</span>
                    </div>
                    <div className="tr-cert-field">
                      <span className="tr-cert-label">Verification Mode</span>
                      <span>Citizen Mobile OTP</span>
                    </div>
                    <div className="tr-cert-field">
                      <span className="tr-cert-label">Authorised Officer</span>
                      <span>{activeCase.assignedOfficer.name}</span>
                    </div>
                    <div className="tr-cert-field">
                      <span className="tr-cert-label">Digital Seal</span>
                      <span>SHA-256 · GIGW 3.0 Non-Repudiation</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Escalated */}
              {isEscalated && (
                <div className="tr-card tr-escalated-card">
                  <Icon e="??" size={28} />
                  <div>
                    <h3 className="tr-escalated-title">Escalated to State Technical Ombudsman</h3>
                    <p className="tr-escalated-body">
                      You have formally rejected the proposed resolution. The matter is transferred to the AICTE State Ombudsman Office for judicial hearing. A summons has been dispatched to the college management.
                    </p>
                  </div>
                </div>
              )}

              {/* Timeline */}
              <div className="tr-card tr-timeline-card">
                <h3 className="tr-timeline-heading">Case Audit Trail</h3>
                <div className="tr-timeline">
                  {activeCase.timeline.map((evt, idx) => (
                    <div key={evt.id} className="tr-timeline-item">
                      <div className="tr-timeline-marker">
                        <div className="tr-marker-dot" aria-hidden="true" />
                        {idx < activeCase.timeline.length - 1 && (
                          <div className="tr-marker-line" aria-hidden="true" />
                        )}
                      </div>
                      <div className="tr-timeline-content">
                        <div className="tr-evt-header-row">
                          <strong className="tr-evt-title">{evt.title}</strong>
                          <code className="tr-mono tr-evt-time">{evt.timestamp}</code>
                        </div>
                        <p className="tr-evt-desc">{evt.description}</p>
                        <span className="tr-evt-actor">
                          <strong>{evt.actor}</strong> · {evt.role}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ── SIDEBAR ── */}
            <aside className="tr-sidebar">

              {/* Officer card */}
              <div className="tr-card tr-officer-card">
                <span className="tr-side-title">Assigned Officer</span>
                <div className="tr-officer-profile">
                <div className="tr-officer-avatar" aria-hidden="true">
                  <Building size={22} weight="duotone" />
                </div>
                  <div className="tr-officer-info">
                    <strong className="tr-officer-name">{activeCase.assignedOfficer.name}</strong>
                    <span className="tr-officer-role">{activeCase.assignedOfficer.designation}</span>
                    <span className="tr-officer-bureau">{activeCase.assignedOfficer.bureau}</span>
                  </div>
                </div>
                <button
                  type="button"
                  className="tr-btn-primary tr-btn-block"
                  onClick={() => {
                    onOpenChatWithComplaint(activeCase);
                    setActiveTab('chat');
                  }}
                >
                  <Icon e="??" size={15} />
                  <span>Open Direct Chat</span>
                </button>
              </div>

              {/* Evidence vault */}
              <div className="tr-card tr-proofs-card">
                <div className="tr-side-header">
                  <span className="tr-side-title">Evidence Vault</span>
                  <span className="tr-proof-count-pill">{activeCase.evidenceList.length} files</span>
                </div>
                <div className="tr-proofs-list">
                  {activeCase.evidenceList.map(ev => (
                    <div key={ev.id} className="tr-proof-item">
                      <Icon e="??" size={15} className="tr-proof-icon" />
                      <div className="tr-proof-meta">
                        <span className="tr-proof-name">{ev.name}</span>
                        <code className="tr-mono tr-proof-hash" title={ev.sha256Hash}>
                          {ev.sha256Hash.slice(0, 18)}…
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution info */}
              <div className="tr-card tr-inst-card">
                <span className="tr-side-title">Institution</span>
                <strong className="tr-inst-name">{activeCase.institutionName}</strong>
                <div className="tr-inst-meta-rows">
                  <div className="tr-inst-row">
                    <span className="tr-inst-lbl">AICTE ID</span>
                    <code className="tr-mono">{activeCase.aictePermanentId}</code>
                  </div>
                  <div className="tr-inst-row">
                    <span className="tr-inst-lbl">Location</span>
                    <span>{activeCase.city}, {activeCase.state}</span>
                  </div>
                  <div className="tr-inst-row">
                    <span className="tr-inst-lbl">Status</span>
                    <span className="tr-inst-status-chip">
                      <Icon e="?" size={12} />
                      Functional
                    </span>
                  </div>
                </div>
              </div>

              {/* Discord promo */}
              <div className="tr-card tr-discord-card">
                <div className="tr-discord-header">
                  <span className="tr-discord-icon" aria-hidden="true">
                    <DiscordLogo size={22} weight="fill" />
                  </span>
                  <strong className="tr-discord-title">Discuss on Discord Hub</strong>
                </div>
                <p className="tr-discord-desc">
                  Connect with peers and AICTE legal advisors in <code className="tr-discord-channel">#fee-and-scholarships</code>.
                </p>
                <button
                  type="button"
                  className="tr-btn-discord tr-btn-block"
                  onClick={() => setActiveTab('discord')}
                >
                  <span>Launch Discord Channel</span>
                  <Icon e="??" size={13} />
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* ── ESCALATION MODAL ── */}
        {showEscalationModal && (
          <div className="tr-modal-overlay" role="dialog" aria-modal="true" aria-labelledby="tr-modal-title">
            <div className="tr-modal-box">
              <div className="tr-modal-header">
                <Icon e="??" size={24} />
                <h3 id="tr-modal-title">Escalate to State Technical Ombudsman</h3>
              </div>
              <p className="tr-modal-desc">
                If the refund was not disbursed or the ATR is fraudulent, this case will be transferred to the Ombudsman with statutory hearing powers.
              </p>
              <div className="tr-field">
                <label className="tr-label" htmlFor="tr-escalation-reason">Reason for rejection</label>
                <textarea
                  id="tr-escalation-reason"
                  className="tr-input tr-textarea"
                  rows={4}
                  placeholder="e.g. Bank statement confirms ₹44,000 not credited. Order letter not issued by registrar."
                  value={escalationReason}
                  onChange={e => setEscalationReason(e.target.value)}
                />
              </div>
              <div className="tr-modal-actions">
                <button type="button" className="tr-btn-outline" onClick={() => setShowEscalationModal(false)}>
                  Cancel
                </button>
                <button type="button" className="tr-btn-danger" onClick={handleEscalate}>
                  <Icon e="⚖️" size={15} />
                  Confirm Escalation
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        /* ── ROOT ── */
        .tr-root {
          background: var(--color-neutral-100);
          padding: 28px 0 72px;
          min-height: calc(100vh - 160px);
        }
        .tr-container { max-width: 1100px; }

        /* ── LOOKUP ── */
        .tr-lookup-card {
          background: #fff;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg);
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }
        .tr-lookup-title {
          font-size: 1.1rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0 0 3px;
        }
        .tr-lookup-sub {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          margin: 0;
        }
        .tr-lookup-controls {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        /* ── GRID ── */
        .tr-content-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
          align-items: start;
        }
        .tr-main { display: flex; flex-direction: column; gap: 16px; }
        .tr-sidebar { display: flex; flex-direction: column; gap: 14px; position: sticky; top: 68px; }

        /* ── BASE CARD ── */
        .tr-card {
          background: #fff;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg);
          padding: 22px 24px;
          box-shadow: var(--shadow-sm);
        }

        /* ── CASE CARD ── */
        .tr-case-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .tr-case-ids { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
        .tr-case-id {
          font-family: var(--font-mono);
          font-size: 0.85rem;
          font-weight: 700;
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          padding: 3px 9px;
          border-radius: var(--radius-sm);
          color: var(--color-navy-900);
        }
        .tr-cat-chip {
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 9px;
          border-radius: var(--radius-pill);
        }
        .tr-sla-pill {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
        }
        .tr-case-title {
          font-size: 1.2rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0 0 6px;
          line-height: 1.3;
        }
        .tr-case-inst {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          margin: 0 0 20px;
        }
        .tr-mono { font-family: var(--font-mono); }
        .tr-inst-id { font-size: 0.78rem; color: var(--color-neutral-600); margin-left: 3px; }

        /* Stage stepper */
        .tr-stepper-wrap { border-top: 1px solid var(--color-neutral-200); padding-top: 18px; }
        .tr-stepper-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
          margin-bottom: 14px;
        }
        .tr-stages-row {
          display: grid;
          grid-template-columns: repeat(6,1fr);
          gap: 4px;
        }
        .tr-stage-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 6px;
          position: relative;
        }
        .tr-stage-node::before {
          content: '';
          position: absolute;
          top: 14px;
          left: 50%;
          right: -50%;
          height: 2px;
          background: var(--color-neutral-200);
          z-index: 0;
        }
        .tr-stage-node:last-child::before { display: none; }
        .tr-stage-circle {
          width: 28px;
          height: 28px;
          border-radius: 50%;
          background: var(--color-neutral-100);
          border: 2px solid var(--color-neutral-300);
          color: var(--color-neutral-500);
          font-size: 0.75rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          z-index: 1;
          transition: all 0.2s ease;
        }
        .tr-stage-past .tr-stage-circle {
          background: var(--color-brand-blue-600);
          border-color: var(--color-brand-blue-600);
          color: #fff;
        }
        .tr-stage-current .tr-stage-circle {
          background: var(--color-action-600);
          border-color: var(--color-action-600);
          color: #fff;
          box-shadow: 0 0 0 4px rgba(194,87,12,0.18);
        }
        .tr-stage-label {
          font-size: 0.67rem;
          color: var(--color-neutral-500);
          line-height: 1.2;
        }
        .tr-stage-current .tr-stage-label {
          color: var(--color-action-600);
          font-weight: 700;
        }
        .tr-stage-past .tr-stage-label { color: var(--color-brand-blue-600); }

        /* ── OTP CARD ── */
        .tr-otp-card {
          background: #FFFBEB;
          border: 2px solid var(--color-warning-border);
          padding: 24px;
        }
        .tr-otp-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 18px;
        }
        .tr-otp-icon-box {
          width: 48px;
          height: 48px;
          background: #FDE68A;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #92400E;
          flex-shrink: 0;
        }
        .tr-otp-title { font-size: 1.1rem; color: #92400E; margin: 0 0 4px; font-weight: 700; }
        .tr-otp-sub { font-size: 0.8125rem; color: #78350F; margin: 0; line-height: 1.45; }

        .tr-atr-card {
          background: #fff;
          border: 1px solid #FCD34D;
          border-radius: var(--radius-md);
          padding: 14px 16px;
          margin-bottom: 18px;
        }
        .tr-atr-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 8px;
        }
        .tr-atr-badge {
          background: var(--color-success-bg);
          color: var(--color-success-text);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-success-border);
        }
        .tr-atr-ref { font-size: 0.72rem; color: var(--color-neutral-500); }
        .tr-atr-summary { font-size: 0.875rem; color: var(--color-neutral-800); line-height: 1.5; margin: 0 0 8px; }
        .tr-atr-bottom-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; }
        .tr-atr-refund { color: #166534; }
        .tr-atr-refund strong { color: #14532D; font-size: 0.9rem; }
        .tr-atr-time { color: var(--color-neutral-400); font-size: 0.75rem; }

        .tr-otp-form { display: flex; flex-direction: column; gap: 12px; }
        .tr-otp-hint-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 8px;
          font-size: 0.8125rem;
          color: #78350F;
        }
        .tr-autofill-btn {
          background: #FEF3C7;
          border: 1px dashed #D97706;
          color: #92400E;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .tr-otp-input-row { display: flex; align-items: center; gap: 12px; }
        .tr-otp-input {
          max-width: 180px;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 6px;
          text-align: center;
          padding: 10px 12px;
        }
        .tr-btn-verify {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: #166534;
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 11px 20px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 46px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
          white-space: nowrap;
        }
        .tr-btn-verify:hover { background: #14532D; }
        .tr-otp-error {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8rem;
          color: var(--color-danger-text);
          font-weight: 600;
          margin: 0;
        }
        .tr-otp-reject-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          flex-wrap: wrap;
          padding-top: 12px;
          border-top: 1px solid #FDE68A;
        }
        .tr-reject-label { font-size: 0.78rem; color: #78350F; }
        .tr-btn-escalate {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          border: 1px solid var(--color-danger-border);
          color: var(--color-danger-text);
          border-radius: var(--radius-md);
          padding: 7px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
        }
        .tr-btn-escalate:hover { background: var(--color-danger-bg); }

        /* ── CERTIFICATE ── */
        .tr-cert-card {
          background: #F0FDF4;
          border: 2px solid var(--color-success-border);
          padding: 24px;
        }
        .tr-cert-header {
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .tr-cert-seal { flex-shrink: 0; }
        .tr-cert-logo { width: 48px; height: 48px; object-fit: contain; border-radius: 50%; }
        .tr-cert-header-text { flex: 1; min-width: 0; }
        .tr-cert-title { font-size: 1rem; font-weight: 700; color: #14532D; margin: 0 0 4px; }
        .tr-cert-ref { font-size: 0.72rem; color: #166534; }
        .tr-cert-body { font-size: 0.875rem; color: #14532D; line-height: 1.55; margin-bottom: 16px; }
        .tr-cert-meta-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
          background: #fff;
          border: 1px solid var(--color-success-border);
          border-radius: var(--radius-sm);
          padding: 12px;
        }
        .tr-cert-field { display: flex; flex-direction: column; gap: 2px; font-size: 0.8125rem; color: #14532D; }
        .tr-cert-label { font-size: 0.7rem; font-weight: 800; text-transform: uppercase; color: #166534; letter-spacing: 0.3px; }

        /* ── ESCALATED ── */
        .tr-escalated-card {
          background: var(--color-danger-bg);
          border: 2px solid var(--color-danger-border);
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }
        .tr-escalated-card svg { color: var(--color-danger-text); flex-shrink: 0; margin-top: 2px; }
        .tr-escalated-title { font-size: 1.05rem; font-weight: 700; color: var(--color-danger-text); margin: 0 0 6px; }
        .tr-escalated-body { font-size: 0.875rem; color: #7F1D1D; line-height: 1.5; margin: 0; }

        /* ── TIMELINE ── */
        .tr-timeline-heading {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-navy-900);
          margin: 0 0 16px;
          padding-bottom: 12px;
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .tr-timeline { display: flex; flex-direction: column; }
        .tr-timeline-item { display: flex; gap: 14px; }
        .tr-timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          flex-shrink: 0;
          width: 16px;
        }
        .tr-marker-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
          background: var(--color-brand-blue-600);
          margin-top: 5px;
          flex-shrink: 0;
        }
        .tr-marker-line {
          width: 2px;
          flex: 1;
          background: var(--color-neutral-200);
          margin: 4px 0;
          min-height: 20px;
        }
        .tr-timeline-content { padding-bottom: 22px; flex: 1; }
        .tr-evt-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 6px;
          margin-bottom: 4px;
        }
        .tr-evt-title { font-size: 0.9rem; font-weight: 700; color: var(--color-navy-900); }
        .tr-evt-time { font-size: 0.72rem; color: var(--color-neutral-500); }
        .tr-evt-desc { font-size: 0.8125rem; color: var(--color-neutral-700); line-height: 1.45; margin: 0 0 4px; }
        .tr-evt-actor { font-size: 0.72rem; color: var(--color-neutral-500); }

        /* ── SIDEBAR CARDS ── */
        .tr-side-title {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.8px;
          color: var(--color-neutral-500);
          margin-bottom: 12px;
        }
        .tr-side-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }
        .tr-side-header .tr-side-title { margin-bottom: 0; }
        .tr-proof-count-pill {
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--color-neutral-100);
          color: var(--color-neutral-600);
          padding: 2px 7px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-neutral-200);
        }

        .tr-officer-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 14px;
        }
        .tr-officer-avatar {
          width: 40px;
          height: 40px;
          background: var(--color-brand-blue-100);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brand-blue-600);
          flex-shrink: 0;
        }
        .tr-officer-info { min-width: 0; }
        .tr-officer-name { display: block; font-size: 0.875rem; font-weight: 700; color: var(--color-navy-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tr-officer-role { display: block; font-size: 0.75rem; color: var(--color-neutral-600); }
        .tr-officer-bureau { display: block; font-size: 0.72rem; color: var(--color-action-600); font-weight: 700; }

        .tr-proofs-list { display: flex; flex-direction: column; gap: 6px; }
        .tr-proof-item {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-sm);
          padding: 8px 10px;
        }
        .tr-proof-icon { color: var(--color-brand-blue-600); flex-shrink: 0; margin-top: 1px; }
        .tr-proof-meta { min-width: 0; }
        .tr-proof-name { display: block; font-size: 0.78rem; font-weight: 600; color: var(--color-navy-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .tr-proof-hash { display: block; font-size: 0.65rem; color: var(--color-neutral-500); margin-top: 2px; }

        .tr-inst-name { display: block; font-size: 0.9rem; font-weight: 700; color: var(--color-navy-900); margin-bottom: 12px; }
        .tr-inst-meta-rows { display: flex; flex-direction: column; gap: 6px; }
        .tr-inst-row { display: flex; align-items: center; justify-content: space-between; font-size: 0.78rem; }
        .tr-inst-lbl { color: var(--color-neutral-500); font-weight: 600; }
        .tr-inst-status-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--color-success-bg);
          color: var(--color-success-text);
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-pill);
        }

        .tr-discord-card { background: #2B2D31; border-color: #1E1F22; }
        .tr-discord-header { display: flex; align-items: center; gap: 8px; margin-bottom: 8px; }
        .tr-discord-icon { font-size: 1.1rem; }
        .tr-discord-title { font-size: 0.9rem; font-weight: 700; color: #fff; }
        .tr-discord-desc { font-size: 0.78rem; color: #949BA4; margin: 0 0 12px; line-height: 1.4; }
        .tr-discord-channel { background: #1E1F22; color: #F0B232; padding: 1px 4px; border-radius: 2px; font-size: 0.72rem; }

        /* Shared buttons */
        .tr-input {
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 9px 12px;
          font-size: 0.875rem;
          font-family: var(--font-sans);
          color: var(--color-neutral-900);
          background: #fff;
          outline: none;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }
        .tr-input:focus { border-color: var(--color-brand-blue-600); box-shadow: 0 0 0 3px rgba(31,95,191,0.1); }
        .tr-textarea { resize: vertical; min-height: 90px; line-height: 1.5; }
        .tr-field { display: flex; flex-direction: column; gap: 5px; margin-bottom: 12px; }
        .tr-label { font-size: 0.8125rem; font-weight: 700; color: var(--color-neutral-700); }

        .tr-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--color-action-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 9px 16px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
          white-space: nowrap;
        }
        .tr-btn-primary:hover { background: var(--color-action-700); }
        .tr-btn-block { width: 100%; justify-content: center; }
        .tr-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: transparent;
          color: var(--color-neutral-700);
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 8px 14px;
          font-size: 0.825rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 36px;
          font-family: var(--font-sans);
          transition: border-color 0.15s ease;
          white-space: nowrap;
        }
        .tr-btn-outline:hover { border-color: var(--color-navy-900); color: var(--color-navy-900); }
        .tr-btn-discord {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #5865F2;
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 8px 14px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 36px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
        }
        .tr-btn-discord:hover { background: #4752C4; }
        .tr-btn-danger {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: var(--color-danger-text);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 9px 16px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
        }
        .tr-btn-danger:hover { background: #991B1B; }

        /* ── MODAL ── */
        .tr-modal-overlay {
          position: fixed;
          inset: 0;
          background: rgba(11,42,91,0.4);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 16px;
        }
        .tr-modal-box {
          background: #fff;
          border-radius: var(--radius-lg);
          padding: 28px;
          max-width: 500px;
          width: 100%;
          box-shadow: var(--shadow-modal);
        }
        .tr-modal-header {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .tr-modal-header svg { color: var(--color-danger-text); flex-shrink: 0; }
        .tr-modal-header h3 { font-size: 1.1rem; font-weight: 700; color: var(--color-navy-900); margin: 0; }
        .tr-modal-desc { font-size: 0.875rem; color: var(--color-neutral-600); line-height: 1.5; margin: 0 0 16px; }
        .tr-modal-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .tr-content-grid { grid-template-columns: 1fr; }
          .tr-sidebar { position: static; }
        }
        @media (max-width: 600px) {
          .tr-stages-row { grid-template-columns: repeat(3,1fr); }
          .tr-cert-meta-grid { grid-template-columns: 1fr; }
          .tr-lookup-card { flex-direction: column; align-items: flex-start; }
          .tr-lookup-controls { width: 100%; }
        }
      `}</style>
    </div>
  );
};

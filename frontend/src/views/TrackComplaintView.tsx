import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint, StageKey, NewTimelineEvent } from '../types';
import { 
  Search, 
  KeyRound, 
  ShieldCheck, 
  CheckCircle2, 
  Clock, 
  Building2, 
  FileText, 
  AlertCircle, 
  Download, 
  ExternalLink,
  MessageSquare,
  ShieldAlert,
  Send,
  HelpCircle,
  QrCode
} from 'lucide-react';

interface TrackComplaintViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaints: Complaint[];
  selectedComplaint?: Complaint | null;
  onUpdateComplaintStage: (caseId: string, newStage: StageKey, feedback?: string, event?: NewTimelineEvent) => void;
  onOpenChatWithComplaint: (complaint: Complaint) => void;
}

export const TrackComplaintView: React.FC<TrackComplaintViewProps> = ({
  lang,
  setActiveTab,
  complaints,
  selectedComplaint,
  onUpdateComplaintStage,
  onOpenChatWithComplaint
}) => {
  const t = translations[lang];

  // Default to the first complaint or selected
  const [searchId, setSearchId] = useState(
    selectedComplaint ? selectedComplaint.id : (complaints[0]?.id || 'AICTE-2026-GRV-84920')
  );
  // Store only the id so the view always shows the latest complaint from App state
  const [activeCaseId, setActiveCaseId] = useState<string | undefined>(
    selectedComplaint?.id || complaints[0]?.id
  );
  const activeCase = complaints.find(c => c.id === activeCaseId) || complaints[0];

  // OTP Form State
  const [otpInput, setOtpInput] = useState('');
  const [otpError, setOtpError] = useState('');
  const [otpSuccess, setOtpSuccess] = useState(false);
  const [dissatisfiedReason, setDissatisfiedReason] = useState('');
  const [showEscalationModal, setShowEscalationModal] = useState(false);

  const handleLookup = () => {
    const found = complaints.find(c => c.id.trim().toLowerCase() === searchId.trim().toLowerCase());
    if (found) {
      setActiveCaseId(found.id);
      setOtpError('');
      setOtpSuccess(false);
    } else {
      alert(`Case ID "${searchId}" not found in current session.`);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeCase) return;

    const expectedOtp = activeCase.otpVerification?.generatedOtp || '849210';
    if (otpInput.trim() === expectedOtp) {
      setOtpSuccess(true);
      setOtpError('');
      onUpdateComplaintStage(activeCase.id, 'RESOLVED', 'Complainant verified OTP closure. Resolution accepted.', {
        title: 'Case Formally Disposed & Citizen OTP Verified',
        description: 'Complainant verified satisfaction via 6-digit OTP. AICTE closure certificate generated.',
        actor: activeCase.complainantName,
        role: 'Citizen Verification'
      });
    } else {
      setOtpError(`Invalid OTP. Please enter the 6-digit code (${expectedOtp}) sent to your mobile.`);
    }
  };

  const handleEscalateToOmbudsman = () => {
    if (!activeCase) return;
    if (!dissatisfiedReason.trim()) {
      alert('Please specify the reason for dissatisfaction before escalating to the Ombudsman.');
      return;
    }
    onUpdateComplaintStage(activeCase.id, 'ESCALATED', dissatisfiedReason, {
      title: 'Escalated to State Technical Ombudsman',
      description: `Citizen rejected resolution with remarks: "${dissatisfiedReason}". Case reopened for judicial scrutiny.`,
      actor: 'Citizen Rejection Gateway',
      role: 'Complainant Action'
    });
    setShowEscalationModal(false);
  };

  const stagesList = [
    { num: 1, key: 'REGISTERED', label: '1. Registered & Hashed' },
    { num: 2, key: 'ALLOTTED', label: '2. Bureau Allotment' },
    { num: 3, key: 'INVESTIGATION', label: '3. Inquiry & Evidence' },
    { num: 4, key: 'RESOLUTION_PROPOSED', label: '4. ATR Resolution' },
    { num: 5, key: 'PENDING_OTP', label: '5. Citizen OTP Verify' },
    { num: 6, key: 'RESOLVED', label: '6. Formally Disposed' },
  ];

  return (
    <div className="tracking-page-container" id="main-content">
      <div className="container">
        {/* Lookup Bar */}
        <div className="tracking-lookup-bar card">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3>AICTE Multi-Stage Grievance Tracker</h3>
              <p className="lookup-sub">Enter Complaint ID to view live progress, cryptographic audit trail, and verify resolution.</p>
            </div>

            <div className="lookup-input-group flex items-center gap-2">
              <input
                type="text"
                className="input-control mono"
                placeholder="AICTE-2026-GRV-84920"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
              />
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleLookup}
              >
                <Search size={16} />
                <span>Track Case</span>
              </button>
            </div>
          </div>
        </div>

        {activeCase && (
          <div className="case-content-grid grid grid-cols-3 gap-6 mt-4">
            {/* Left 2 Columns: Stages Timeline & OTP Verification Form */}
            <div className="case-main-column col-span-2">
              {/* Header Box */}
              <div className="card case-summary-card">
                <div className="case-header-row flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <code className="case-id-badge mono">{activeCase.id}</code>
                    <span className="status-chip chip-info">{activeCase.categoryLabel}</span>
                  </div>
                  <div className="sla-pill flex items-center gap-1">
                    <Clock size={14} />
                    <span>
                      {activeCase.currentStage === 'RESOLVED' 
                        ? 'Case Disposed & Verified' 
                        : `${activeCase.slaHoursRemaining} Hours SLA Remaining`}
                    </span>
                  </div>
                </div>

                <h2 className="case-subject-title">{activeCase.title}</h2>
                <p className="case-inst-text">
                  Against: <strong>{activeCase.institutionName}</strong> (<code className="mono">{activeCase.aictePermanentId}</code>) · Submitted: 16 Aug 2026
                </p>

                {/* 6-Stage Progress Stepper Bar */}
                <div className="visual-stages-stepper">
                  <span className="stages-title">Grievance Progression Lifecycle (GIGW 3.0 Enforced):</span>
                  <div className="stages-timeline-nodes">
                    {stagesList.map((st) => {
                      const isPast = st.num < activeCase.stageNumber || activeCase.currentStage === 'RESOLVED';
                      const isCurrent = st.num === activeCase.stageNumber && activeCase.currentStage !== 'RESOLVED';
                      return (
                        <div 
                          key={st.key}
                          className={`stage-node ${isCurrent ? 'stage-current' : ''} ${isPast ? 'stage-past' : ''}`}
                        >
                          <div className="node-icon-circle">
                            {isPast ? '✓' : st.num}
                          </div>
                          <span className="node-label">{st.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* CRITICAL FEATURE: STAGE 5 CITIZEN OTP ACKNOWLEDGMENT GATE */}
              {activeCase.currentStage === 'PENDING_OTP' && (
                <div className="card otp-acknowledgment-card">
                  <div className="otp-card-head flex items-center gap-3">
                    <div className="key-icon-box">
                      <KeyRound size={28} className="text-warning-bold" />
                    </div>
                    <div>
                      <h3 className="otp-title">Stage 5: Citizen OTP Acknowledgment Required for Closure</h3>
                      <p className="otp-sub">
                        Institutions cannot close complaints without citizen verification. Please authenticate if the refund/resolution was executed.
                      </p>
                    </div>
                  </div>

                  {/* Resolution Report Submitted by Institute */}
                  {activeCase.resolutionProposedDetails && (
                    <div className="atr-display-card">
                      <div className="atr-badge-line flex items-center justify-between">
                        <span className="atr-badge">Action Taken Report (ATR) from Registrar</span>
                        <span className="atr-order mono">Ref: {activeCase.resolutionProposedDetails.officialOrderRef}</span>
                      </div>
                      <p className="atr-summary-p">{activeCase.resolutionProposedDetails.atrSummary}</p>
                      <div className="atr-figures flex items-center justify-between">
                        <span className="atr-stat">
                          Credited Amount: <strong>{activeCase.resolutionProposedDetails.refundAmount}</strong>
                        </span>
                        <span className="atr-time">Uploaded: {activeCase.resolutionProposedDetails.proposedAt}</span>
                      </div>
                    </div>
                  )}

                  {/* Interactive OTP Verification Form */}
                  <form onSubmit={handleVerifyOtp} className="otp-verify-form">
                    <div className="otp-demo-hint flex items-center justify-between">
                      <span className="hint-label">
                        Enter 6-Digit OTP sent to {activeCase.contactMobile}:
                      </span>
                      <button
                        type="button"
                        className="btn-autofill-demo"
                        onClick={() => setOtpInput(activeCase.otpVerification?.generatedOtp || '849210')}
                        title="Click to paste simulated OTP"
                      >
                        Auto-Fill Demo OTP: ({activeCase.otpVerification?.generatedOtp || '849210'})
                      </button>
                    </div>

                    <div className="otp-input-row flex items-center gap-3 mt-2">
                      <input
                        type="text"
                        className="input-control otp-code-input mono"
                        maxLength={6}
                        placeholder="849210"
                        value={otpInput}
                        onChange={(e) => setOtpInput(e.target.value)}
                        aria-label="6-Digit OTP"
                      />
                      <button type="submit" className="btn btn-primary btn-verify-otp">
                        <CheckCircle2 size={18} />
                        <span>Verify OTP & Accept Resolution</span>
                      </button>
                    </div>

                    {otpError && (
                      <div className="otp-error-message flex items-center gap-2 mt-2">
                        <AlertCircle size={16} />
                        <span>{otpError}</span>
                      </div>
                    )}

                    <div className="otp-alternative-row flex items-center justify-between mt-3 pt-3 border-top">
                      <span className="dissatisfied-text">
                        Refund not received or resolution unsatisfactory?
                      </span>
                      <button
                        type="button"
                        className="btn btn-outline btn-escalate text-danger"
                        onClick={() => setShowEscalationModal(true)}
                      >
                        <ShieldAlert size={14} />
                        <span>Reject & Escalate to Ombudsman</span>
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Resolved Closure Certificate if Stage 6 */}
              {activeCase.currentStage === 'RESOLVED' && (
                <div className="card resolved-certificate-card">
                  <div className="cert-head flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="cert-seal">
                        <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN Seal" className="cert-logo-img" />
                      </div>
                      <div>
                        <h3>AICTE NIVARAN · Official Resolution & Closure Certificate</h3>
                        <span className="cert-sub mono">Certificate Ref: CERT-NIVARAN-2026-{activeCase.id.slice(-5)} · योगः कर्मसु कौशलम्</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn btn-outline"
                      onClick={() => alert('Certificate downloaded as signed PDF with digital seal.')}
                    >
                      <Download size={16} />
                      <span>Download PDF</span>
                    </button>
                  </div>

                  <div className="cert-body">
                    <p>
                      This certifies that grievance <strong>{activeCase.id}</strong> filed by <strong>{activeCase.complainantName}</strong> against <strong>{activeCase.institutionName}</strong> has been satisfactorily resolved pursuant to AICTE Redressal Norms.
                    </p>
                    <div className="cert-meta-grid grid grid-cols-2 gap-2 mt-3">
                      <div>
                        <strong>Closure Date:</strong> {activeCase.otpVerification?.verifiedAt || '24 Oct 2026'}
                      </div>
                      <div>
                        <strong>Verification Mode:</strong> Citizen Mobile OTP Authenticated (Satisfaction 100%)
                      </div>
                      <div>
                        <strong>Authorized Officer:</strong> {activeCase.assignedOfficer.name} ({activeCase.assignedOfficer.bureau})
                      </div>
                      <div>
                        <strong>Digital Seal:</strong> SHA-256 Validated · GIGW 3.0 Non-Repudiation
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Escalated Banner if Ombudsman */}
              {activeCase.currentStage === 'ESCALATED' && (
                <div className="card escalated-card">
                  <div className="flex items-start gap-3">
                    <ShieldAlert size={28} className="text-danger" />
                    <div>
                      <h3 className="text-danger">Escalated to State Technical Ombudsman</h3>
                      <p className="mt-1">
                        You have formally rejected the proposed resolution. The matter is transferred directly to the AICTE State Ombudsman Office for judicial hearing. A summons notice has been dispatched to the college management.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Case History & Timeline Events */}
              <div className="card timeline-history-card mt-4">
                <h3 className="timeline-heading">Complete Case Audit Trail & Event Ledger</h3>
                <div className="timeline-flow mt-3">
                  {activeCase.timeline.map((evt, idx) => (
                    <div key={evt.id} className="timeline-event-item">
                      <div className="timeline-marker">
                        <div className="marker-dot"></div>
                        {idx !== activeCase.timeline.length - 1 && <div className="marker-line"></div>}
                      </div>
                      <div className="timeline-event-content">
                        <div className="flex items-center justify-between flex-wrap">
                          <strong className="event-title">{evt.title}</strong>
                          <span className="event-time mono">{evt.timestamp}</span>
                        </div>
                        <p className="event-desc">{evt.description}</p>
                        <span className="event-actor">
                          Actor: <strong>{evt.actor}</strong> ({evt.role})
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Case Metadata & Actions */}
            <div className="case-sidebar-column">
              {/* Assigned Officer Card */}
              <div className="card officer-card">
                <span className="side-card-title">Assigned Redressal Officer</span>
                <div className="officer-profile flex items-center gap-3 mt-3">
                  <div className="officer-avatar">
                    🏛️
                  </div>
                  <div>
                    <strong className="officer-name">{activeCase.assignedOfficer.name}</strong>
                    <span className="officer-role">{activeCase.assignedOfficer.designation}</span>
                    <span className="officer-bureau">{activeCase.assignedOfficer.bureau}</span>
                  </div>
                </div>

                <div className="officer-action-row mt-4">
                  <button
                    type="button"
                    className="btn btn-primary btn-block"
                    onClick={() => {
                      onOpenChatWithComplaint(activeCase);
                      setActiveTab('chat');
                    }}
                  >
                    <MessageSquare size={16} />
                    <span>Open Direct Chatbox</span>
                  </button>
                </div>
              </div>

              {/* Stored Proofs Card */}
              <div className="card proofs-card mt-4">
                <div className="flex items-center justify-between">
                  <span className="side-card-title">Stored Cryptographic Proofs</span>
                  <span className="proofs-count-badge">{activeCase.evidenceList.length} Files</span>
                </div>
                <div className="side-proofs-list mt-3">
                  {activeCase.evidenceList.map((ev) => (
                    <div key={ev.id} className="side-proof-item">
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-blue" />
                        <span className="side-ev-name">{ev.name}</span>
                      </div>
                      <div className="ev-hash-row mt-1">
                        <code className="mono hash-crumb" title={ev.sha256Hash}>
                          Hash: {ev.sha256Hash.slice(0, 16)}...
                        </code>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Institution Quick Info */}
              <div className="card inst-meta-card mt-4">
                <span className="side-card-title">Institutional Profile</span>
                <div className="inst-meta-body mt-2">
                  <strong className="inst-title-side">{activeCase.institutionName}</strong>
                  <div className="meta-row mt-2">
                    <span className="meta-lbl">Permanent ID:</span>
                    <code className="mono">{activeCase.aictePermanentId}</code>
                  </div>
                  <div className="meta-row">
                    <span className="meta-lbl">Location:</span>
                    <span>{activeCase.city}, {activeCase.state}</span>
                  </div>
                  <div className="meta-row">
                    <span className="meta-lbl">Grievance Cell:</span>
                    <span className="status-chip chip-success">Functional & Online</span>
                  </div>
                </div>
              </div>

              {/* Community Coordination shortcut */}
              <div className="card discord-promo-card mt-4">
                <div className="flex items-center gap-2">
                  <span className="discord-logo-sm">💬</span>
                  <strong className="discord-promo-title">Discuss on Discord Hub</strong>
                </div>
                <p className="discord-promo-desc mt-1">
                  Connect with peer student reps and AICTE legal advisors in channel <code className="mono">#fee-and-scholarships</code>.
                </p>
                <button
                  type="button"
                  className="btn btn-outline btn-block mt-3"
                  onClick={() => setActiveTab('discord')}
                >
                  <span>Launch Discord Channel</span>
                  <ExternalLink size={14} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Escalation Modal */}
        {showEscalationModal && (
          <div className="modal-overlay">
            <div className="modal-box card">
              <div className="flex items-center gap-3">
                <ShieldAlert size={28} className="text-danger" />
                <h3>Escalate to State Technical Ombudsman</h3>
              </div>
              <p className="mt-2 text-muted">
                If the college has not disbursed your refund or the action taken is fraudulent/unsatisfactory, this case will be transferred directly to the Ombudsman with statutory hearing powers.
              </p>

              <div className="mt-3">
                <label className="input-label">Reason for Dissatisfaction & Non-Agreement</label>
                <textarea
                  className="input-control"
                  rows={4}
                  placeholder="Specify why you are rejecting the proposed ATR (e.g. Bank statement confirms ₹44,000 not credited yet, or order letter was not issued)..."
                  value={dissatisfiedReason}
                  onChange={(e) => setDissatisfiedReason(e.target.value)}
                ></textarea>
              </div>

              <div className="modal-actions flex items-center justify-end gap-3 mt-4">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setShowEscalationModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleEscalateToOmbudsman}
                >
                  <span>Confirm Escalation</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .tracking-page-container {
          padding: 32px 0 64px 0;
        }
        .tracking-lookup-bar {
          padding: 20px 24px;
        }
        .lookup-sub {
          font-size: 0.85rem;
          color: var(--color-neutral-600);
          margin-top: 2px;
        }
        .lookup-input-group {
          width: 380px;
        }

        .case-summary-card {
          padding: 24px;
        }
        .case-id-badge {
          background: #F1F5F9;
          color: var(--color-navy-900);
          font-weight: 700;
          font-size: 0.9rem;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid #CBD5E1;
        }
        .sla-pill {
          background: #EFF6FF;
          color: var(--color-brand-blue-600);
          font-size: 0.8125rem;
          font-weight: 600;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
        }
        .case-subject-title {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 12px 0 6px 0;
          color: var(--color-navy-900);
        }
        .case-inst-text {
          font-size: 0.875rem;
          color: var(--color-neutral-600);
        }

        .visual-stages-stepper {
          margin-top: 24px;
          padding-top: 18px;
          border-top: 1px solid var(--color-neutral-200);
        }
        .stages-title {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-neutral-700);
          display: block;
          margin-bottom: 14px;
        }
        .stages-timeline-nodes {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 6px;
        }
        .stage-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          position: relative;
        }
        .node-icon-circle {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: var(--color-neutral-100);
          border: 2px solid var(--color-neutral-300);
          color: var(--color-neutral-600);
          font-size: 0.8rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 6px;
        }
        .stage-past .node-icon-circle {
          background-color: var(--color-brand-blue-600);
          border-color: var(--color-brand-blue-600);
          color: #FFFFFF;
        }
        .stage-current .node-icon-circle {
          background-color: var(--color-action-600);
          border-color: var(--color-action-600);
          color: #FFFFFF;
          box-shadow: 0 0 0 4px rgba(194, 87, 12, 0.2);
        }
        .node-label {
          font-size: 0.72rem;
          color: var(--color-neutral-600);
          line-height: 1.2;
        }
        .stage-current .node-label {
          color: var(--color-action-600);
          font-weight: 700;
        }

        .otp-acknowledgment-card {
          margin-top: 20px;
          background: #FFFBEB;
          border: 2px solid #F59E0B;
          padding: 24px;
        }
        .key-icon-box {
          background: #FDE68A;
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .otp-title {
          font-size: 1.15rem;
          color: #92400E;
        }
        .otp-sub {
          font-size: 0.85rem;
          color: #78350F;
        }
        .atr-display-card {
          background: #FFFFFF;
          border: 1px solid #FCD34D;
          border-radius: var(--radius-sm);
          padding: 14px 18px;
          margin: 16px 0;
        }
        .atr-badge {
          font-size: 0.75rem;
          font-weight: 700;
          color: #166534;
          background: #DCFCE7;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .atr-order {
          font-size: 0.75rem;
          color: #64748B;
        }
        .atr-summary-p {
          font-size: 0.9rem;
          color: var(--color-neutral-900);
          margin: 8px 0;
        }
        .atr-figures {
          font-size: 0.85rem;
          color: #166534;
        }
        .atr-figures strong {
          color: #15803D;
        }
        .atr-time {
          font-size: 0.75rem;
          color: #94A3B8;
        }

        .otp-demo-hint {
          font-size: 0.8125rem;
          color: #92400E;
        }
        .btn-autofill-demo {
          background: #FEF3C7;
          border: 1px dashed #D97706;
          color: #B45309;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .otp-code-input {
          max-width: 200px;
          font-size: 1.3rem;
          letter-spacing: 4px;
          text-align: center;
          font-weight: 800;
        }
        .btn-verify-otp {
          padding: 10px 22px;
        }
        .otp-error-message {
          font-size: 0.8125rem;
          color: #DC2626;
          font-weight: 600;
        }
        .border-top {
          border-top: 1px solid #FDE68A;
        }
        .dissatisfied-text {
          font-size: 0.8125rem;
          color: #78350F;
        }

        .resolved-certificate-card {
          margin-top: 20px;
          background: #F0FDF4;
          border: 2px solid #86EFAC;
          padding: 24px;
        }
        .cert-seal {
          width: 52px;
          height: 52px;
          background: transparent;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .cert-logo-img {
          width: 52px;
          height: 52px;
          object-fit: contain;
          border-radius: 50%;
          filter: drop-shadow(0 2px 4px rgba(0,0,0,0.15));
        }
        .cert-sub {
          font-size: 0.8rem;
          color: #166534;
        }
        .cert-body {
          margin-top: 14px;
          font-size: 0.9rem;
          color: #14532D;
          line-height: 1.5;
        }
        .cert-meta-grid {
          background: #FFFFFF;
          border: 1px solid #BBF7D0;
          padding: 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
        }

        .escalated-card {
          margin-top: 20px;
          background: #FEF2F2;
          border: 2px solid #F87171;
          padding: 24px;
        }

        .timeline-history-card {
          padding: 24px;
        }
        .timeline-heading {
          font-size: 1.1rem;
          border-bottom: 1px solid var(--color-neutral-200);
          padding-bottom: 10px;
        }
        .timeline-flow {
          display: flex;
          flex-direction: column;
        }
        .timeline-event-item {
          display: flex;
          gap: 16px;
          position: relative;
        }
        .timeline-marker {
          display: flex;
          flex-direction: column;
          align-items: center;
          width: 20px;
        }
        .marker-dot {
          width: 12px;
          height: 12px;
          background-color: var(--color-brand-blue-600);
          border-radius: 50%;
          margin-top: 6px;
        }
        .marker-line {
          width: 2px;
          flex: 1;
          background-color: var(--color-neutral-300);
          margin: 4px 0;
        }
        .timeline-event-content {
          padding-bottom: 24px;
          flex: 1;
        }
        .event-title {
          font-size: 0.95rem;
          color: var(--color-navy-900);
        }
        .event-time {
          font-size: 0.78rem;
          color: var(--color-neutral-600);
        }
        .event-desc {
          font-size: 0.85rem;
          color: var(--color-neutral-700);
          margin: 4px 0;
        }
        .event-actor {
          font-size: 0.75rem;
          color: var(--color-neutral-600);
        }

        .side-card-title {
          font-size: 0.85rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          color: var(--color-neutral-600);
          display: block;
        }
        .officer-avatar {
          width: 44px;
          height: 44px;
          background: #EFF6FF;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .officer-name {
          font-size: 0.95rem;
          display: block;
        }
        .officer-role {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
          display: block;
        }
        .officer-bureau {
          font-size: 0.75rem;
          color: var(--color-action-600);
          font-weight: 600;
        }
        .proofs-count-badge {
          font-size: 0.75rem;
          background: var(--color-neutral-100);
          padding: 2px 6px;
          border-radius: var(--radius-pill);
        }
        .side-proof-item {
          background: #F8FAFC;
          border: 1px solid var(--color-neutral-200);
          padding: 8px 10px;
          border-radius: var(--radius-sm);
          margin-bottom: 6px;
        }
        .side-ev-name {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-navy-900);
        }
        .hash-crumb {
          font-size: 0.7rem;
          color: #64748B;
        }
        .inst-title-side {
          font-size: 0.95rem;
          color: var(--color-navy-900);
          display: block;
        }
        .meta-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.8rem;
          margin-bottom: 4px;
        }
        .meta-lbl {
          color: var(--color-neutral-600);
        }

        .discord-promo-card {
          background: #313338;
          color: #F2F3F5;
          border-color: #1E1F22;
        }
        .discord-logo-sm {
          font-size: 1.15rem;
        }
        .discord-promo-title {
          color: #FFFFFF;
          font-size: 0.95rem;
        }
        .discord-promo-desc {
          font-size: 0.8rem;
          color: #949BA4;
        }
        .discord-promo-card code {
          background: #1E1F22;
          color: #F0B232;
          padding: 1px 4px;
          border-radius: 2px;
        }
        .discord-promo-card .btn-outline {
          background: #5865F2;
          border-color: #5865F2;
          color: #FFFFFF;
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(11, 42, 91, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 999;
          padding: 16px;
        }
        .modal-box {
          max-width: 520px;
          width: 100%;
          background: #FFFFFF;
          padding: 24px;
        }

        @media (max-width: 768px) {
          .case-content-grid {
            grid-template-columns: 1fr;
          }
          .stages-timeline-nodes {
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
          }
          .lookup-input-group {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

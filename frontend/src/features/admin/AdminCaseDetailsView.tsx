// ==========================================================================
// NIVARAN · Screen C: Comprehensive Official Case Inspection (AdminCaseDetailsView.tsx)
// Strongest Demo Screen: Sticky header, 6 tabs, SLA clocks, ReasonDialog actions
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { updateComplaintStage, addMessageToComplaint } from '../../api/complaints';
import { verifyTimelineIntegrity } from '../../api/audit';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { StageTimeline } from '../../ui/StageTimeline';
import { Button } from '../../ui/Button';
import { Tabs, TabItem } from '../../ui/NavigationAndDisclosure';
import { ReasonDialog } from '../../ui/ReasonDialog';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

interface AdminCaseDetailsViewProps {
  caseId: string;
  onBack: () => void;
  onNavigateScreen: (screen: any, preset?: any) => void;
}

export const AdminCaseDetailsView: React.FC<AdminCaseDetailsViewProps> = ({
  caseId,
  onBack,
  onNavigateScreen
}) => {
  const { complaints, currentUser, refreshData } = useApp();
  const { success, error, info } = useToast();

  const [activeTab, setActiveTab] = useState('overview');
  const [activeReasonAction, setActiveReasonAction] = useState<{
    type: 'TRANSFER' | 'REQUEST_INFO' | 'ESCALATE';
    title: string;
    description: string;
  } | null>(null);

  const [messageText, setMessageText] = useState('');
  const [integrityReport, setIntegrityReport] = useState<string | null>(null);

  const complaint = complaints.find(c => c.id === caseId) || complaints[0];

  if (!complaint) {
    return (
      <div style={{ textAlign: 'center', padding: 'var(--sp-8)' }}>
        <h3>Case not found</h3>
        <Button variant="primary" onClick={onBack}>
          Return to All Cases
        </Button>
      </div>
    );
  }

  const handleReasonConfirm = (reason: string) => {
    if (!activeReasonAction) return;

    try {
      const officerName = currentUser?.name || 'Dr. Ramesh Chandra Verma';
      const officerRole = currentUser?.designation || 'Director, PGRC';

      if (activeReasonAction.type === 'TRANSFER') {
        updateComplaintStage(complaint.id, 'ASSIGNED', officerName, officerRole, `Reassigned to Regional Office: ${reason}`);
        success('Case reallocated with immutable transfer reason recorded.');
      } else if (activeReasonAction.type === 'REQUEST_INFO') {
        addMessageToComplaint(complaint.id, {
          senderRole: 'officer',
          senderName: officerName,
          content: `Statutory Request: ${reason}`,
          isOfficialNote: true
        });
        success('Formal information notice issued to complainant.');
      } else if (activeReasonAction.type === 'ESCALATE') {
        updateComplaintStage(complaint.id, 'DISPUTED', officerName, officerRole, `Escalated to Higher Bench: ${reason}`);
        success('Case escalated to Higher Bench.');
      }

      refreshData();
      setActiveReasonAction(null);
    } catch (err: any) {
      error(err.message || 'Action failed.');
    }
  };

  const handleVerifyTimeline = () => {
    const report = verifyTimelineIntegrity(complaint.auditEvents);
    if (report.isValid) {
      setIntegrityReport(`✓ Verification Passed: All ${report.totalEvents} events verified against Root Digest ${report.rootHash.slice(0, 16)}...`);
      success('Cryptographic verification succeeded. Audit trail is untampered.');
    } else {
      setIntegrityReport(`⚠ DISCREPANCY: ${report.notes}`);
      error('Tampering or broken link detected in event chain!');
    }
  };

  const tabs: TabItem[] = [
    { id: 'overview', label: 'Overview & Complainant' },
    { id: 'related', label: 'Related Cases & Overlaps', count: complaint.overlapInfo?.relatedCaseIds.length || 0 },
    { id: 'evidence', label: 'Evidence & Integrity Hashes', count: complaint.evidenceList.length },
    { id: 'timeline', label: 'Audit Timeline Chain', count: complaint.timeline.length },
    { id: 'messages', label: 'Case Inquiries & Notes', count: complaint.messages.length },
    { id: 'resolution', label: 'ATR Proof & Validator' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* ── 1. Sticky Case Header ── */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          padding: 'var(--sp-5)',
          marginBottom: 'var(--sp-6)',
          boxShadow: 'var(--shadow-0)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <Button variant="ghost" size="sm" onClick={onBack} icon={<Icon name="arrow-left" size={14} />}>
              Back to Cases
            </Button>
            <DocketId id={complaint.id} style={{ fontSize: 'var(--fs-md)', padding: '4px 12px' }} />
            <StatusChip stage={complaint.currentStage} />
            <SlaBadge clock={complaint.slaClock} />
          </div>

          {/* Consequential Recommended Actions Group */}
          <div style={{ display: 'flex', gap: 'var(--sp-2)', flexWrap: 'wrap' }}>
            {complaint.overlapInfo?.hasOverlap && (
              <Button
                variant="primary"
                size="sm"
                icon={<Icon name="search" size={14} />}
                onClick={() => onNavigateScreen('overlaps')}
              >
                Review Overlap ({complaint.overlapInfo.matchScore}%)
              </Button>
            )}

            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="user" size={14} />}
              onClick={() =>
                setActiveReasonAction({
                  type: 'TRANSFER',
                  title: 'Reassign or Transfer Case Bureau',
                  description: 'Mandatory AICTE administrative justification required for jurisdiction transfer.'
                })
              }
            >
              Reassign / Transfer
            </Button>

            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="chat" size={14} />}
              onClick={() =>
                setActiveReasonAction({
                  type: 'REQUEST_INFO',
                  title: 'Serve Statutory Notice / Request Information',
                  description: 'Issue official clarification request to complainant or institute desk with 48h deadline.'
                })
              }
            >
              Request Information
            </Button>

            {complaint.currentStage === 'RESOLUTION_PROPOSED' && (
              <Button
                variant="primary"
                size="sm"
                icon={<Icon name="check-circle" size={14} />}
                onClick={() => onNavigateScreen('proof-review')}
              >
                Review Resolution ATR Proof
              </Button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
          {complaint.title}
        </h1>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          {complaint.institutionName} · AICTE Permanent ID: <strong>{complaint.aictePermanentId}</strong> · Category: {complaint.categoryLabel}
        </div>

        <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-light)' }}>
          <StageTimeline currentStage={complaint.currentStage} />
        </div>
      </div>

      {/* ── 2. Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--sp-6)' }}>
        {/* Left Column: 6 Tabs */}
        <div>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Complainant Statement & Role Profile
              </h3>

              <div style={{ backgroundColor: 'var(--navy-50)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
                  Detailed Grievance Chronology:
                </span>
                <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', marginTop: '4px', lineHeight: 1.6 }}>
                  {complaint.details}
                </p>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)', fontSize: 'var(--fs-xs)' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Complainant Name:</span>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', marginTop: '2px' }}>
                    {complaint.complainantName}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Complainant Role:</span>
                  <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', marginTop: '2px' }}>
                    {complaint.complainantRole}
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Contact Information:</span>
                  <div style={{ fontWeight: 600, marginTop: '2px' }}>{complaint.contactMobile}</div>
                  <div style={{ color: 'var(--text-muted)' }}>{complaint.contactEmail}</div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Anonymity Shield:</span>
                  <div style={{ fontWeight: 600, color: complaint.isAnonymous ? 'var(--action)' : 'var(--ok)', marginTop: '2px' }}>
                    {complaint.isAnonymous ? 'Protected Anonymous Complainant' : 'Standard Verified Citizen'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Related Cases */}
          {activeTab === 'related' && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-3)' }}>
                Cross-Bureau Linked Cases & Potential Overlaps
              </h3>

              {complaint.overlapInfo?.hasOverlap ? (
                <div>
                  <div style={{ backgroundColor: 'var(--action-tint)', border: '1px solid var(--action-border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)', marginBottom: 'var(--sp-4)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 700, color: 'var(--action)', fontSize: 'var(--fs-sm)' }}>
                        Cross-Bureau Match Score: {complaint.overlapInfo.matchScore}%
                      </span>
                      <StatusChip stage="UNDER_ACTION" />
                    </div>
                    <ul style={{ paddingLeft: '20px', marginTop: 'var(--sp-2)', fontSize: 'var(--fs-xs)', color: 'var(--text)' }}>
                      {complaint.overlapInfo.matchRationale.map((r, i) => (
                        <li key={i}>{r}</li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
                    <Button variant="primary" size="sm" onClick={() => onNavigateScreen('overlaps')}>
                      Open Full Overlap Comparison View →
                    </Button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                  No overlapping cases currently detected for this institution docket.
                </p>
              )}
            </div>
          )}

          {/* Tab 3: Evidence */}
          {activeTab === 'evidence' && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Cryptographic Evidence Repository
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {complaint.evidenceList.map(ev => (
                  <div key={ev.id} style={{ border: '1px solid var(--border)', padding: 'var(--sp-4)', borderRadius: 'var(--rad-sm)', backgroundColor: 'var(--navy-50)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)' }}>{ev.name}</span>
                      <span style={{ fontSize: '11px', color: 'var(--ok)', fontWeight: 700 }}>VERIFIED DIGEST</span>
                    </div>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', margin: '2px 0' }}>
                      {(ev.size / 1024).toFixed(1)} KB · Stamped: {ev.uploadDate}
                    </div>
                    <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '11px', wordBreak: 'break-all', backgroundColor: 'var(--surface)', padding: '4px', border: '1px solid var(--border-light)', borderRadius: '4px' }}>
                      SHA-256: {ev.sha256Hash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Timeline */}
          {activeTab === 'timeline' && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
                <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)' }}>
                  Immutable Audit Chain
                </h3>
                <Button variant="secondary" size="sm" onClick={handleVerifyTimeline} icon={<Icon name="shield" size={14} />}>
                  Verify Chain Integrity
                </Button>
              </div>

              {integrityReport && (
                <div style={{ padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)', backgroundColor: 'var(--navy-50)', border: '1px solid var(--border)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-4)', fontWeight: 600 }}>
                  {integrityReport}
                </div>
              )}

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
                {complaint.auditEvents.map((audit, idx) => (
                  <div key={audit.id} style={{ borderLeft: '3px solid var(--navy-700)', paddingLeft: 'var(--sp-4)', fontSize: 'var(--fs-xs)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>{audit.action}</span>
                      <span style={{ color: 'var(--text-muted)' }}>{audit.timestamp}</span>
                    </div>
                    <div style={{ color: 'var(--text)', margin: '2px 0' }}>
                      Actor: <strong>{audit.actor}</strong> ({audit.role})
                    </div>
                    {audit.reason && (
                      <div style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>
                        Reason: "{audit.reason}"
                      </div>
                    )}
                    <div style={{ fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px', wordBreak: 'break-all' }}>
                      Digest: {audit.currentHash}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Messages */}
          {activeTab === 'messages' && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Case Direct Inquiries & Official Notes
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-4)' }}>
                {complaint.messages.map(msg => (
                  <div key={msg.id} style={{ padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)', backgroundColor: msg.senderRole === 'officer' ? 'var(--navy-50)' : 'var(--action-tint)', border: '1px solid var(--border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)' }}>
                      <strong>{msg.senderName}</strong>
                      <span style={{ color: 'var(--text-muted)' }}>{msg.timestamp}</span>
                    </div>
                    <p style={{ fontSize: 'var(--fs-sm)', marginTop: '4px' }}>{msg.content}</p>
                  </div>
                ))}
              </div>

              <form onSubmit={e => {
                e.preventDefault();
                if (!messageText.trim()) return;
                addMessageToComplaint(complaint.id, {
                  senderRole: 'officer',
                  senderName: currentUser?.name || 'Dr. Ramesh Chandra Verma',
                  content: messageText.trim(),
                  isOfficialNote: true
                });
                setMessageText('');
                refreshData();
                success('Official inquiry note posted to docket.');
              }} style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <input
                  type="text"
                  value={messageText}
                  onChange={e => setMessageText(e.target.value)}
                  placeholder="Record an official inquiry note or dispatch query..."
                  className={styles.input}
                  required
                />
                <Button variant="primary" size="md">Post Note</Button>
              </form>
            </div>
          )}

          {/* Tab 6: Resolution ATR */}
          {activeTab === 'resolution' && (
            <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Action Taken Report (ATR) Quality & Validation
              </h3>

              {complaint.resolutionDetails ? (
                <div>
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Claimed Remedial Action:</span>
                    <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginTop: '2px' }}>
                      {complaint.resolutionDetails.claimedAction}
                    </div>
                  </div>

                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Proof Document:</span>
                    <div style={{ fontWeight: 600 }}>{complaint.resolutionDetails.proofDocument?.name}</div>
                    <div style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)', color: 'var(--text-muted)' }}>
                      SHA-256: {complaint.resolutionDetails.proofDocument?.sha256Hash}
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: 'var(--sp-3)', marginTop: 'var(--sp-6)' }}>
                    <Button variant="primary" size="md" onClick={() => onNavigateScreen('proof-review')}>
                      Open Full Screen G ATR Proof Reviewer →
                    </Button>
                  </div>
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                  Action Taken Report has not been uploaded yet by the institution nodal desk.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Rail: SLA Clocks & Bureau Summary */}
        <aside style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-5)', height: 'fit-content' }}>
          <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-3)' }}>
            Statutory SLA Clocks
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', fontSize: 'var(--fs-xs)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>First Inquiry Response (72h):</span>
              <div style={{ fontWeight: 700, color: 'var(--ok)', marginTop: '2px' }}>
                ✓ Completed in 4h 12m
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>ATR Submission Mandate (15 Days):</span>
              <div style={{ fontWeight: 700, color: complaint.slaClock.isOverdue ? 'var(--danger)' : 'var(--warn)', marginTop: '2px' }}>
                {complaint.slaClock.dueTimestamp} ({complaint.slaClock.ageingDays} days elapsed)
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Final Citizen Confirmation (7 Days):</span>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
                Awaiting Complainant Action
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)', marginTop: 'var(--sp-2)' }}>
              <span style={{ fontWeight: 700, color: 'var(--navy-900)' }}>Assigned Nodal Desk</span>
              <div style={{ fontWeight: 600, marginTop: '2px' }}>{complaint.assignedOfficer.name}</div>
              <div style={{ color: 'var(--text-muted)' }}>{complaint.assignedOfficer.designation}</div>
              <div style={{ color: 'var(--text-muted)' }}>{complaint.assignedOfficer.email}</div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mandatory Reason Dialog */}
      {activeReasonAction && (
        <ReasonDialog
          isOpen={true}
          onClose={() => setActiveReasonAction(null)}
          onConfirm={handleReasonConfirm}
          title={activeReasonAction.title}
          description={activeReasonAction.description}
          confirmLabel="Execute & Write Audit Event"
        />
      )}
    </div>
  );
};

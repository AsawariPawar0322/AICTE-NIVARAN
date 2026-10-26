// ==========================================================================
// NIVARAN · Screen 6: Citizen Docket Inspection & Timeline (ComplaintDetailsView.tsx)
// Full StageTimeline, chronological events, evidence integrity, messaging
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { addMessageToComplaint } from '../../api/complaints';
import { Button } from '../../ui/Button';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { StageTimeline } from '../../ui/StageTimeline';
import { Tabs, TabItem } from '../../ui/NavigationAndDisclosure';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

export const ComplaintDetailsView: React.FC = () => {
  const { selectedComplaintId, complaints, currentUser, refreshData, navigateToTab } = useApp();
  const { success, error } = useToast();

  const [activeTab, setActiveTab] = useState('timeline');
  const [replyText, setReplyText] = useState('');

  const complaint = complaints.find(c => c.id === selectedComplaintId) || complaints[0];

  if (!complaint) {
    return (
      <div style={{ maxWidth: '800px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-4)', textAlign: 'center' }}>
        <h3>No complaint selected</h3>
        <Button variant="primary" onClick={() => navigateToTab('my-complaints')}>
          Return to My Complaints
        </Button>
      </div>
    );
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    try {
      addMessageToComplaint(complaint.id, {
        senderRole: 'complainant',
        senderName: currentUser?.name || complaint.complainantName,
        content: replyText.trim()
      });
      setReplyText('');
      refreshData();
      success('Message transmitted to assigned Nodal Officer.');
    } catch (err: any) {
      error('Failed to send message.');
    }
  };

  const tabs: TabItem[] = [
    { id: 'timeline', label: 'Timeline & Events', count: complaint.timeline.length },
    { id: 'evidence', label: 'Evidence & Digests', count: complaint.evidenceList.length },
    { id: 'messages', label: 'Official Messages', count: complaint.messages.length },
    { id: 'resolution', label: 'Resolution & ATR' }
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: 'var(--sp-6) auto', padding: '0 var(--sp-6)' }}>
      {/* ── 1. Header Bar ── */}
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
            <DocketId id={complaint.id} style={{ fontSize: 'var(--fs-md)', padding: '4px 12px' }} />
            <StatusChip stage={complaint.currentStage} />
            <SlaBadge clock={complaint.slaClock} />
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
            <Button variant="ghost" size="sm" onClick={() => window.print()} icon={<Icon name="download" size={14} />}>
              Print Docket Sheet
            </Button>
            {complaint.currentStage === 'AWAITING_CONFIRMATION' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigateToTab('resolution-confirm', { complaintId: complaint.id })}
              >
                Review ATR Proof
              </Button>
            )}
          </div>
        </div>

        <h1 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-1)' }}>
          {complaint.title}
        </h1>
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          {complaint.institutionName} (PID: {complaint.aictePermanentId}) · Category: <strong>{complaint.categoryLabel}</strong>
        </div>

        {/* Full Stage Progression */}
        <div style={{ marginTop: 'var(--sp-4)', paddingTop: 'var(--sp-4)', borderTop: '1px solid var(--border-light)' }}>
          <StageTimeline currentStage={complaint.currentStage} />
        </div>
      </div>

      {/* ── 2. Two-Column Layout ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 'var(--sp-6)' }}>
        {/* Left Column: Tabs Content */}
        <div>
          <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

          {/* Timeline Tab */}
          {activeTab === 'timeline' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-6)'
              }}
            >
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Official Redressal Chronology
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)', position: 'relative' }}>
                {complaint.timeline.map((event, idx) => (
                  <div
                    key={event.id}
                    style={{
                      display: 'flex',
                      gap: 'var(--sp-4)',
                      paddingBottom: 'var(--sp-4)',
                      borderBottom: idx < complaint.timeline.length - 1 ? '1px solid var(--border-light)' : 'none'
                    }}
                  >
                    <div
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: 'var(--navy-50)',
                        border: '2px solid var(--border)',
                        color: 'var(--navy-900)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 'var(--fs-xs)',
                        flexShrink: 0
                      }}
                    >
                      {idx + 1}
                    </div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 'var(--fs-md)' }}>
                          {event.title}
                        </span>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                          {event.timestamp}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', margin: '4px 0' }}>
                        {event.description}
                      </p>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                        Logged by: <strong>{event.actor}</strong> ({event.role})
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Evidence Tab */}
          {activeTab === 'evidence' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-6)'
              }}
            >
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Submitted Evidence Files & SHA-256 Hashes
              </h3>

              {complaint.evidenceList.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                  No supporting files were attached at submission time.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                  {complaint.evidenceList.map(ev => (
                    <div
                      key={ev.id}
                      style={{
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--rad-sm)',
                        padding: 'var(--sp-4)',
                        backgroundColor: 'var(--navy-50)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                          {ev.name}
                        </div>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ok)', fontWeight: 600 }}>
                          ✓ Cryptographically Verified
                        </span>
                      </div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-1)' }}>
                        Uploaded: {ev.uploadDate} · Size: {(ev.size / 1024).toFixed(1)} KB
                      </div>
                      <div
                        style={{
                          marginTop: 'var(--sp-2)',
                          fontSize: '11px',
                          fontFamily: 'var(--font-family-mono)',
                          color: 'var(--navy-900)',
                          backgroundColor: 'var(--surface)',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          border: '1px solid var(--border-light)',
                          wordBreak: 'break-all'
                        }}
                      >
                        SHA-256: {ev.sha256Hash}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Messages Tab */}
          {activeTab === 'messages' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-6)'
              }}
            >
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
                Official Communications Thread
              </h3>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', marginBottom: 'var(--sp-5)' }}>
                {complaint.messages.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                    No direct inquiry messages yet. Communications will be logged here.
                  </p>
                ) : (
                  complaint.messages.map(msg => (
                    <div
                      key={msg.id}
                      style={{
                        padding: 'var(--sp-4)',
                        borderRadius: 'var(--rad-sm)',
                        backgroundColor: msg.senderRole === 'officer' ? 'var(--navy-50)' : 'var(--action-tint)',
                        border: `1px solid ${msg.senderRole === 'officer' ? 'var(--border)' : 'var(--action-border)'}`
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                          {msg.senderName}
                        </span>
                        <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                          {msg.timestamp}
                        </span>
                      </div>
                      <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>{msg.content}</p>
                    </div>
                  ))
                )}
              </div>

              {/* Reply box */}
              <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <input
                  type="text"
                  value={replyText}
                  onChange={e => setReplyText(e.target.value)}
                  placeholder="Type an official message or query reply..."
                  className={styles.input}
                  required
                />
                <Button variant="primary" size="md">
                  Send
                </Button>
              </form>
            </div>
          )}

          {/* Resolution Tab */}
          {activeTab === 'resolution' && (
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-6)'
              }}
            >
              <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-3)' }}>
                Action Taken Report (ATR) Status
              </h3>

              {complaint.resolutionDetails ? (
                <div>
                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Reported Action:</div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginTop: '2px' }}>
                      {complaint.resolutionDetails.claimedAction}
                    </div>
                  </div>

                  {complaint.resolutionDetails.refundAmount && (
                    <div style={{ marginBottom: 'var(--sp-4)' }}>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Financial Settlement:</div>
                      <div style={{ fontWeight: 700, fontSize: 'var(--fs-md)', color: 'var(--ok)' }}>
                        {complaint.resolutionDetails.refundAmount}
                      </div>
                    </div>
                  )}

                  <div style={{ marginBottom: 'var(--sp-4)' }}>
                    <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Validator Verification:</div>
                    <span
                      style={{
                        display: 'inline-block',
                        marginTop: '4px',
                        padding: '4px 10px',
                        borderRadius: 'var(--rad-full)',
                        fontSize: 'var(--fs-xs)',
                        fontWeight: 700,
                        backgroundColor:
                          complaint.resolutionDetails.validatorFindings.status === 'PASS'
                            ? 'var(--ok-surface)'
                            : 'var(--warn-surface)',
                        color:
                          complaint.resolutionDetails.validatorFindings.status === 'PASS'
                            ? 'var(--ok)'
                            : 'var(--warn)'
                      }}
                    >
                      {complaint.resolutionDetails.validatorFindings.status === 'PASS'
                        ? '✓ Verified Official Proof'
                        : '⚠ Flagged for Quality Checks'}
                    </span>
                    <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text)', marginTop: '4px' }}>
                      {complaint.resolutionDetails.validatorFindings.notes}
                    </p>
                  </div>

                  {complaint.currentStage === 'AWAITING_CONFIRMATION' && (
                    <div style={{ marginTop: 'var(--sp-6)' }}>
                      <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigateToTab('resolution-confirm', { complaintId: complaint.id })}
                      >
                        Proceed to Resolution Confirmation Screen →
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)' }}>
                  Action Taken Report has not yet been submitted by the institution.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Right Sticky Summary Rail */}
        <aside
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-5)',
            height: 'fit-content'
          }}
        >
          <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-3)' }}>
            Docket Overview
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Complainant:</span>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
                {complaint.isAnonymous ? 'Masked (Anonymous)' : complaint.complainantName} ({complaint.complainantRole})
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned Bureau:</span>
              <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginTop: '2px' }}>
                {complaint.assignedOfficer.bureau}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Nodal Officer:</span>
              <div style={{ fontWeight: 600, color: 'var(--navy-900)', marginTop: '2px' }}>
                {complaint.assignedOfficer.name}
              </div>
              <div style={{ color: 'var(--text-muted)' }}>{complaint.assignedOfficer.designation}</div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Statutory SLA Deadline:</span>
              <div style={{ fontWeight: 600, color: 'var(--text)', marginTop: '2px' }}>
                {complaint.slaClock.dueTimestamp}
              </div>
            </div>

            {complaint.joinedComplainantsCount !== undefined && complaint.joinedComplainantsCount > 0 && (
              <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-2)', borderRadius: 'var(--rad-sm)' }}>
                <span style={{ color: 'var(--navy-900)', fontWeight: 700 }}>
                  👥 {complaint.joinedComplainantsCount} Linked Complainant(s)
                </span>
                <p style={{ color: 'var(--text-muted)', fontSize: '11px', marginTop: '2px' }}>
                  Students joined under collective institutional issue.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
};

// ==========================================================================
// NIVARAN · Public Docket Tracking View (TrackComplaintView.tsx)
// Allows any citizen to verify status, stage timeline, and statutory countdown
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { getComplaintById } from '../../api/complaints';
import { Button } from '../../ui/Button';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { StageTimeline } from '../../ui/StageTimeline';
import { Icon } from '../../ui/Icon';
import styles from '../../ui/ui.module.css';

export const TrackComplaintView: React.FC = () => {
  const { selectedComplaintId, setSelectedComplaintId, navigateToTab } = useApp();
  const [queryInput, setQueryInput] = useState(selectedComplaintId || 'NIV-2026-1042');

  const complaint = getComplaintById(queryInput) || getComplaintById(selectedComplaintId || '') || undefined;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!queryInput.trim()) return;
    setSelectedComplaintId(queryInput.trim());
  };

  return (
    <div style={{ maxWidth: '1000px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)' }}>
      <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
        <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Public Grievance Docket Tracker
        </h2>
        <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-muted)', marginTop: 'var(--sp-1)' }}>
          Statutory transparency check under Guidelines for Indian Government Websites (GIGW)
        </p>
      </div>

      {/* Docket Search Form */}
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
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <input
            type="text"
            value={queryInput}
            onChange={e => setQueryInput(e.target.value)}
            placeholder="Enter Docket Number (e.g. NIV-2026-1042, NIV-2026-84920)..."
            className={styles.input}
            style={{ flex: 1 }}
            required
          />
          <Button variant="primary" size="md" icon={<Icon name="search" size={18} />}>
            Track Status
          </Button>
        </form>

        <div style={{ display: 'flex', gap: 'var(--sp-2)', marginTop: 'var(--sp-3)', fontSize: 'var(--fs-xs)', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Examples:</span>
          <button
            type="button"
            onClick={() => {
              setQueryInput('NIV-2026-1042');
              setSelectedComplaintId('NIV-2026-1042');
            }}
            style={{ color: 'var(--link)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}
          >
            NIV-2026-1042
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setQueryInput('NIV-2026-84920');
              setSelectedComplaintId('NIV-2026-84920');
            }}
            style={{ color: 'var(--link)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}
          >
            NIV-2026-84920
          </button>
          <span>·</span>
          <button
            type="button"
            onClick={() => {
              setQueryInput('NIV-2026-1038');
              setSelectedComplaintId('NIV-2026-1038');
            }}
            style={{ color: 'var(--link)', cursor: 'pointer', background: 'none', border: 'none', fontWeight: 600 }}
          >
            NIV-2026-1038
          </button>
        </div>
      </div>

      {/* Tracker Results */}
      {complaint ? (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-lg)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-1)'
          }}
        >
          {/* Header Row */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: 'var(--sp-3)',
              paddingBottom: 'var(--sp-4)',
              borderBottom: '1px solid var(--border-light)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <DocketId id={complaint.id} style={{ fontSize: 'var(--fs-md)' }} />
              <StatusChip stage={complaint.currentStage} />
              <SlaBadge clock={complaint.slaClock} />
            </div>

            <Button
              variant="ghost"
              size="sm"
              icon={<Icon name="download" size={14} />}
              onClick={() => window.print()}
            >
              Print Receipt
            </Button>
          </div>

          <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', marginTop: 'var(--sp-4)', marginBottom: 'var(--sp-1)' }}>
            {complaint.title}
          </h3>
          <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>
            {complaint.institutionName} · AICTE Permanent ID: <strong>{complaint.aictePermanentId}</strong> · Category: {complaint.categoryLabel}
          </div>

          {/* Stage Timeline */}
          <div style={{ marginBottom: 'var(--sp-8)' }}>
            <h4 style={{ fontSize: 'var(--fs-sm)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
              Stage Progression:
            </h4>
            <StageTimeline currentStage={complaint.currentStage} />
          </div>

          {/* Metadata Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 'var(--sp-4)',
              backgroundColor: 'var(--navy-50)',
              padding: 'var(--sp-4)',
              borderRadius: 'var(--rad-sm)',
              fontSize: 'var(--fs-xs)',
              marginBottom: 'var(--sp-6)'
            }}
          >
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Assigned AICTE Bureau:</span>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '2px' }}>
                {complaint.assignedOfficer.bureau}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Nodal Officer:</span>
              <div style={{ fontWeight: 700, color: 'var(--navy-900)', marginTop: '2px' }}>
                {complaint.assignedOfficer.name}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Date Registered:</span>
              <div style={{ fontWeight: 700, color: 'var(--text)', marginTop: '2px' }}>
                {complaint.submittedAt}
              </div>
            </div>

            <div>
              <span style={{ color: 'var(--text-muted)' }}>Statutory SLA Countdown:</span>
              <div style={{ fontWeight: 700, color: complaint.slaClock.isOverdue ? 'var(--danger)' : 'var(--ok)', marginTop: '2px' }}>
                {complaint.slaClock.dueTimestamp}
              </div>
            </div>
          </div>

          {/* Citizen Confirmation prompt */}
          {complaint.currentStage === 'AWAITING_CONFIRMATION' && (
            <div
              style={{
                backgroundColor: 'var(--warn-surface)',
                border: '1px solid var(--warn-border)',
                borderRadius: 'var(--rad-sm)',
                padding: 'var(--sp-4)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--sp-3)'
              }}
            >
              <div>
                <strong style={{ color: 'var(--warn)', fontSize: 'var(--fs-sm)' }}>
                  Action Taken Report submitted by institution!
                </strong>
                <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text)', marginTop: '2px' }}>
                  Sign in to your Citizen Portal to inspect the evidence and authorize docket closure.
                </p>
              </div>

              <Button
                variant="primary"
                size="sm"
                onClick={() => navigateToTab('citizen-login')}
              >
                Sign In to Confirm ATR
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-8)',
            textAlign: 'center'
          }}
        >
          <Icon name="search" size={32} color="var(--text-muted)" />
          <h4 style={{ color: 'var(--navy-900)', fontSize: 'var(--fs-lg)', marginTop: 'var(--sp-2)' }}>
            Docket not found
          </h4>
          <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-1)' }}>
            Please check the Grievance Docket Number format (e.g. NIV-2026-1042) or verify with your registration acknowledgement SMS/Email.
          </p>
        </div>
      )}
    </div>
  );
};

// ==========================================================================
// NIVARAN · Screen D: Potential Overlaps & Cross-Bureau Matching (PotentialOverlapsView.tsx)
// Core SIH Feature: Side-by-side comparison, weighted match reasons, Lead Bureau nomination
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { updateOverlapDecision } from '../../api/complaints';
import { BureauKey, BUREAU_LABELS } from '../../domain/types';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { Button } from '../../ui/Button';
import { ReasonDialog } from '../../ui/ReasonDialog';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

export const PotentialOverlapsView: React.FC = () => {
  const { complaints, currentUser, refreshData } = useApp();
  const { success, error } = useToast();

  // Find cases with overlap
  const caseA = complaints.find(c => c.id === 'NIV-2026-1042') || complaints[0];
  const caseB = complaints.find(c => c.id === 'NIV-2026-1098') || complaints[1] || complaints[0];

  const [leadBureau, setLeadBureau] = useState<BureauKey>('PGRC');
  const [activeReasonAction, setActiveReasonAction] = useState<{
    decision: 'CONFIRMED' | 'REJECTED';
    title: string;
    description: string;
  } | null>(null);

  const handleDecision = (reason: string) => {
    if (!activeReasonAction) return;

    try {
      const officerName = currentUser?.name || 'Dr. Ramesh Chandra Verma';
      updateOverlapDecision(caseA.id, activeReasonAction.decision, reason, officerName, leadBureau);
      updateOverlapDecision(caseB.id, activeReasonAction.decision, reason, officerName, leadBureau);
      refreshData();
      success(`Relationship ${activeReasonAction.decision}: Recorded in audit logs with Lead Bureau "${BUREAU_LABELS[leadBureau]}".`);
      setActiveReasonAction(null);
    } catch (err: any) {
      error(err.message || 'Action failed.');
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* ── 1. Screen Title & Regulatory Context ── */}
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
          <Icon name="search" size={14} />
          <span>SIH26264 CORE SHOWCASE SCREEN</span>
        </div>
        <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Potential Overlaps & Cross-Bureau Coordination
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          Permanent ID and normalized institution identity first, text similarity second. Prototype score represents heuristic match indicator, not a probabilistic certainty.
        </p>
      </div>

      {/* Mandatory Notice */}
      <div
        style={{
          backgroundColor: 'var(--navy-50)',
          border: '1px solid var(--navy-100)',
          borderRadius: 'var(--rad-sm)',
          padding: 'var(--sp-3) var(--sp-4)',
          marginBottom: 'var(--sp-6)',
          fontSize: 'var(--fs-xs)',
          color: 'var(--navy-900)'
        }}
      >
        <strong>Administrative Notice:</strong> Overlapping cases are coordinated under a designated Lead Bureau, but <em>each case keeps its own unique Docket ID, complainant ownership, independent SLA clock, and audit history</em>.
      </div>

      {/* ── 2. "Why These Cases Matched" Weighted Analysis ── */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)', marginBottom: 'var(--sp-3)' }}>
          <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', fontWeight: 700 }}>
            Match Factor Decomposition (Match Score: 91%)
          </h3>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--action)', fontWeight: 700 }}>
            Prototype Heuristic Match Engine
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--sp-3)', fontSize: 'var(--fs-xs)' }}>
          <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
            <strong>1. AICTE Permanent ID (45% Weight):</strong>
            <p style={{ marginTop: '2px', color: 'var(--ok)', fontWeight: 600 }}>
              ✓ Exact Match: DEMO-001 (ABC Institute of Technology, Pune)
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
            <strong>2. Grievance Category (25% Weight):</strong>
            <p style={{ marginTop: '2px', color: 'var(--ok)', fontWeight: 600 }}>
              ✓ Same Domain: Fee Refund & Excess Charges
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
            <strong>3. Semantic Terminology (21% Weight):</strong>
            <p style={{ marginTop: '2px', color: 'var(--navy-900)' }}>
              ✓ Shared: "cancellation", "seat surrender", "development fee", "cutoff"
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
            <strong>4. Time Horizon Window:</strong>
            <p style={{ marginTop: '2px', color: 'var(--navy-900)' }}>
              ✓ Simultaneous Submissions (October 2026 Round 1 Cutoff)
            </p>
          </div>
        </div>
      </div>

      {/* ── 3. Side-by-Side Comparison Columns ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        {/* Case A: PGRC Central */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-0)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--navy-900)' }}>CASE A (CENTRAL HQ)</span>
            <DocketId id={caseA.id} />
          </div>

          <h3 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
            {caseA.title}
          </h3>

          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
            {caseA.institutionName} · Category: {caseA.categoryLabel}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <StatusChip stage={caseA.currentStage} />
            <SlaBadge clock={caseA.slaClock} />
            <span style={{ backgroundColor: 'var(--navy-50)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
              Bureau: {caseA.bureau}
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-4)' }}>
            <strong>Complainant:</strong> {caseA.complainantName} ({caseA.complainantRole})
            <p style={{ marginTop: '4px', color: 'var(--text)', lineHeight: 1.5 }}>
              "{caseA.details}"
            </p>
          </div>

          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            Assigned: <strong>{caseA.assignedOfficer.name}</strong> ({caseA.assignedOfficer.designation})
          </div>
        </div>

        {/* Case B: Regional Office */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-6)',
            boxShadow: 'var(--shadow-0)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-3)' }}>
            <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--navy-900)' }}>CASE B (REGIONAL OFFICE)</span>
            <DocketId id={caseB.id} />
          </div>

          <h3 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
            {caseB.title}
          </h3>

          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
            {caseB.institutionName} · Category: {caseB.categoryLabel}
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-4)', flexWrap: 'wrap' }}>
            <StatusChip stage={caseB.currentStage} />
            <SlaBadge clock={caseB.slaClock} />
            <span style={{ backgroundColor: 'var(--navy-50)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
              Bureau: {caseB.bureau}
            </span>
          </div>

          <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)', fontSize: 'var(--fs-xs)', marginBottom: 'var(--sp-4)' }}>
            <strong>Complainant:</strong> {caseB.complainantName} ({caseB.complainantRole})
            <p style={{ marginTop: '4px', color: 'var(--text)', lineHeight: 1.5 }}>
              "{caseB.details}"
            </p>
          </div>

          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            Assigned: <strong>{caseB.assignedOfficer.name}</strong> ({caseB.assignedOfficer.designation})
          </div>
        </div>
      </div>

      {/* ── 4. Lead Bureau Nomination & Consequential Action Controls ── */}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <div>
            <label className={styles.fieldLabel} style={{ display: 'block', marginBottom: '4px' }}>
              Nominate Statutory Lead Bureau:
            </label>
            <select
              value={leadBureau}
              onChange={e => setLeadBureau(e.target.value as BureauKey)}
              className={styles.select}
              style={{ minHeight: '38px', fontSize: 'var(--fs-xs)', width: '320px' }}
            >
              <option value="PGRC">Public Grievance Redressal Cell (PGRC Central)</option>
              <option value="REGIONAL_OFFICE">Western Regional Office (WRO Mumbai)</option>
              <option value="APPROVAL_BUREAU">Quality Assurance & Approval Bureau</option>
            </select>
          </div>
          <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', maxWidth: '280px' }}>
            Lead Bureau issues the consolidated show cause notice to ABC Institute of Technology.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)' }}>
          <Button
            variant="ghost"
            size="md"
            onClick={() =>
              setActiveReasonAction({
                decision: 'REJECTED',
                title: 'Reject Case Relationship / Overlap',
                description: 'Provide statutory rationale for treating these as completely unrelated incidents.'
              })
            }
          >
            Reject Relationship
          </Button>

          <Button
            variant="primary"
            size="md"
            icon={<Icon name="check-circle" size={18} />}
            onClick={() =>
              setActiveReasonAction({
                decision: 'CONFIRMED',
                title: 'Confirm Cross-Bureau Overlap & Nominate Lead Bureau',
                description: 'Mandatory reason explaining why these cases are related (e.g. systemic admission fee retention at DEMO-001).'
              })
            }
          >
            Confirm Relationship & Nominate Lead
          </Button>
        </div>
      </div>

      {/* Mandatory Reason Dialog */}
      {activeReasonAction && (
        <ReasonDialog
          isOpen={true}
          onClose={() => setActiveReasonAction(null)}
          onConfirm={handleDecision}
          title={activeReasonAction.title}
          description={activeReasonAction.description}
          confirmLabel="Record Decision in Audit Log"
        />
      )}
    </div>
  );
};

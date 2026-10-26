// ==========================================================================
// NIVARAN · Remaining Administrative Sub-Views (RemainingAdminViews.tsx)
// 3. Verification Queue · 9. Reports · 11. Messages · 12. Cohort Remedies · 13. Settings
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { Button } from '../../ui/Button';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { ChartWrapper, ChartDatum } from '../../ui/ChartWrapper';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

// ── Screen 3: Verification Queue ──
export const VerificationQueueView: React.FC<{ onOpenCase: (id: string) => void }> = ({ onOpenCase }) => {
  const { complaints, refreshData } = useApp();
  const { success } = useToast();

  const queue = complaints.filter(c => c.currentStage === 'SUBMITTED' || c.currentStage === 'VERIFICATION');

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>
        Jurisdiction & Completeness Verification Queue
      </h2>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>
        Verify that applicant complaints fall within AICTE technical education purview and validate AICTE Permanent ID match before bureau dispatch.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
        {queue.length === 0 ? (
          <div style={{ backgroundColor: 'var(--surface)', padding: 'var(--sp-8)', textAlign: 'center', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)' }}>
            All intake dockets have been verified and allocated.
          </div>
        ) : (
          queue.map(item => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
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
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '2px' }}>
                  <DocketId id={item.id} />
                  <StatusChip stage={item.currentStage} />
                  <strong style={{ fontSize: 'var(--fs-sm)' }}>{item.title}</strong>
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  {item.institutionName} · AICTE Permanent ID: <strong>{item.aictePermanentId}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    success(`Docket ${item.id} jurisdiction confirmed. Routed to Central PGRC.`);
                    refreshData();
                  }}
                >
                  Accept & Route
                </Button>
                <Button variant="secondary" size="sm" onClick={() => onOpenCase(item.id)}>
                  Inspect Details
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ── Screen 9: Reports & Analytics ──
export const ReportsAnalyticsView: React.FC = () => {
  const { complaints } = useApp();

  const bureauPerformanceData: ChartDatum[] = [
    { label: 'Public Grievance (PGRC)', value: 92, color: 'var(--ok)' },
    { label: 'Western Regional (WRO)', value: 84, color: 'var(--info)' },
    { label: 'Central Regional (CRO)', value: 76, color: 'var(--warn)' },
    { label: 'Quality & Approvals', value: 96, color: 'var(--ok)' },
    { label: 'Scholarships & Welfare', value: 88, color: 'var(--info)' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-6)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
            Reports & Redressal Analytics
          </h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            Systemic transparency reports, bureau resolution efficacy, and regional compliance statistics.
          </p>
        </div>
        <Button variant="secondary" size="sm" icon={<Icon name="download" size={14} />}>
          Export PDF Report
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--sp-6)' }}>
        <ChartWrapper
          title="Bureau Resolution Compliance Rate (%)"
          subtitle="Percentage of grievances resolved within statutory 30-day mandate"
          data={bureauPerformanceData}
        />

        <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-5)' }}>
          <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-3)', fontWeight: 700 }}>
            Key Performance Indicators (KPIs)
          </h4>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Average Resolution Time</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--navy-900)' }}>6.8 Days</div>
            </div>
            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Citizen Satisfaction Index</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--ok)' }}>4.6 / 5.0</div>
            </div>
            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>ATR Boilerplate Rejections</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--warn)' }}>14 Reports</div>
            </div>
            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-3)', borderRadius: 'var(--rad-sm)' }}>
              <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Cross-Bureau Overlaps Unified</span>
              <div style={{ fontSize: 'var(--fs-xl)', fontWeight: 800, color: 'var(--navy-900)' }}>18 Clusters</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ── Screen 11: Official Messages & Inquiries ──
export const MessagesRequestsView: React.FC = () => {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>
        Official Inquiries & Clarification Notices
      </h2>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>
        Monitor statutory clarification requests issued to institution accounts desks with visible due dates.
      </p>

      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
        <div style={{ padding: 'var(--sp-4)', backgroundColor: 'var(--navy-50)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', marginBottom: 'var(--sp-3)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 'var(--fs-xs)' }}>
            <strong>Inquiry: Bank UTR Missing (NIV-2026-1042)</strong>
            <span style={{ color: 'var(--danger)', fontWeight: 700 }}>Due in 14 hours</span>
          </div>
          <p style={{ fontSize: 'var(--fs-sm)', marginTop: '4px' }}>
            To: Registrar, ABC Institute of Technology · Statutory inquiry issued regarding missing NEFT/RTGS transaction receipt.
          </p>
        </div>
      </div>
    </div>
  );
};

// ── Screen 12: Cohort Remedies Pool ──
export const CohortRemediesView: React.FC = () => {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>
        Complaint Pool & Institutional Cohort Remedies
      </h2>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>
        Propose collective institutional remedies for recurring systemic violations without requiring hundreds of individual inquiries.
      </p>

      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
        <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', fontWeight: 700 }}>
          ABC Institute of Technology (DEMO-001) · Cluster: Fee Deductions
        </h4>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: '2px', marginBottom: 'var(--sp-4)' }}>
          14 complainants identified with identical Rs. 50,000 to Rs. 65,000 deduction on seat withdrawal.
        </p>
        <Button variant="primary" size="md">
          Propose Cohort Direct Restitution Order (Executive Approval)
        </Button>
      </div>
    </div>
  );
};

// ── Screen 13: Settings ──
export const SettingsView: React.FC = () => {
  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800, marginBottom: 'var(--sp-2)' }}>
        System Configuration & SLA Mandates
      </h2>
      <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-6)' }}>
        Configure statutory SLA durations, bureau auto-routing rules, and cryptographic audit root settings.
      </p>

      <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)', fontSize: 'var(--fs-sm)' }}>
          <div>
            <label className={styles.fieldLabel}>First Response SLA Limit</label>
            <input type="text" defaultValue="72 Hours (3 Days)" className={styles.input} readOnly />
          </div>
          <div>
            <label className={styles.fieldLabel}>Action Taken Report Mandate</label>
            <input type="text" defaultValue="15 Days" className={styles.input} readOnly />
          </div>
          <div>
            <label className={styles.fieldLabel}>Citizen Confirmation Window</label>
            <input type="text" defaultValue="7 Days" className={styles.input} readOnly />
          </div>
        </div>
      </div>
    </div>
  );
};

// ==========================================================================
// NIVARAN · Screen A: Official Executive Dashboard (DashboardView.tsx)
// 4 clickable StatCards, top urgent action queue, bureau workload, ageing chart
// ==========================================================================

import React from 'react';
import { useApp } from '../../app/AppProviders';
import { StatCard } from '../../ui/StatCard';
import { ChartWrapper, ChartDatum } from '../../ui/ChartWrapper';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { DocketId } from '../../ui/DocketId';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { AdminScreenKey } from './AdminLayout';

interface DashboardViewProps {
  onNavigateScreen: (screen: AdminScreenKey, filterPreset?: any) => void;
  onOpenCase: (caseId: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigateScreen,
  onOpenCase
}) => {
  const { complaints } = useApp();

  const totalOpen = complaints.filter(c => c.currentStage !== 'CLOSED').length;
  const dueSoon = complaints.filter(c => c.slaClock.status === 'DUE_SOON').length;
  const overdue = complaints.filter(c => c.slaClock.isOverdue).length;
  const overlaps = complaints.filter(c => c.overlapInfo?.hasOverlap && c.overlapInfo.status === 'UNREVIEWED').length;

  // Urgent action items (Overdue, Due Soon, or Potential Overlaps)
  const urgentQueue = complaints
    .filter(c => c.slaClock.isOverdue || c.slaClock.status === 'DUE_SOON' || c.currentStage === 'RESOLUTION_PROPOSED')
    .slice(0, 5);

  // Category breakdown for chart
  const categoryChartData: ChartDatum[] = [
    { label: 'Fee Refunds', value: complaints.filter(c => c.category === 'FEES_REFUND').length, color: 'var(--action)' },
    { label: 'Certificates Withheld', value: complaints.filter(c => c.category === 'CERTIFICATE_WITHHELD').length, color: 'var(--danger)' },
    { label: 'Anti-Ragging', value: complaints.filter(c => c.category === 'ANTI_RAGGING').length, color: 'var(--warn)' },
    { label: 'Scholarship Disbursal', value: complaints.filter(c => c.category === 'SCHOLARSHIP_AICTE').length, color: 'var(--info)' },
    { label: 'Lab & Faculty Infra', value: complaints.filter(c => c.category === 'FACULTY_INFRA').length, color: 'var(--navy-700)' }
  ];

  // Ageing buckets (0-7, 8-15, 16-30, 30+ days)
  const ageingChartData: ChartDatum[] = [
    { label: '0–7 Days (On Track)', value: 4, color: 'var(--ok)' },
    { label: '8–15 Days (Under Review)', value: 2, color: 'var(--info)' },
    { label: '16–30 Days (Escalation Warning)', value: 1, color: 'var(--warn)' },
    { label: '30+ Days (Statutory Breach)', value: 1, color: 'var(--danger)' }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Official Jurisdiction & Workbench Status Strip */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-sm)',
          padding: '8px 14px',
          marginBottom: 'var(--sp-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '8px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--ok)' }} />
          <span>
            <strong>AICTE Central PGRC Triage & Redressal Desk</strong> · Nelson Mandela Marg, Vasant Kunj, New Delhi
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>Statutory SLA: <strong>30-Day Resolution Mandate (APH 2026)</strong></span>
          <span style={{ color: 'var(--navy-900)', fontWeight: 600 }}>Active Roster: All Regions</span>
        </div>
      </div>

      {/* ── 1. Row of 4 Clickable StatCards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--sp-4)',
          marginBottom: 'var(--sp-6)'
        }}
      >
        <StatCard
          title="Open Grievance Cases"
          value={totalOpen}
          deltaText="+4 this week"
          deltaPositive={false}
          icon={<Icon name="folder" size={24} weight="duotone" />}
          onClick={() => onNavigateScreen('all-cases')}
        />

        <StatCard
          title="Due Soon (< 24 Hours)"
          value={dueSoon}
          deltaText="2 action notices pending"
          deltaPositive={false}
          icon={<Icon name="clock" size={24} weight="duotone" />}
          onClick={() => onNavigateScreen('all-cases', { dueSoon: true })}
        />

        <StatCard
          title="Statutory SLA Overdue"
          value={overdue}
          deltaText="Requires emergency directive"
          deltaPositive={false}
          icon={<Icon name="danger" size={24} weight="duotone" />}
          onClick={() => onNavigateScreen('all-cases', { overdueOnly: true })}
        />

        <StatCard
          title="Potential Overlaps"
          value={overlaps}
          deltaText="Cross-bureau matches found"
          deltaPositive={false}
          icon={<Icon name="search" size={24} weight="duotone" />}
          onClick={() => onNavigateScreen('overlaps')}
        />
      </div>

      {/* ── 2. "Needs Action" Priority Triage Queue (Top 5) ── */}
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <div>
            <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', fontWeight: 700 }}>
              Urgent Statutory Action Queue
            </h3>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
              Cases requiring immediate officer review, overlap nomination, or ATR proof validation.
            </p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onNavigateScreen('all-cases')}>
            View All Cases ({complaints.length}) →
          </Button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
          {urgentQueue.map(item => (
            <div
              key={item.id}
              style={{
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-sm)',
                padding: 'var(--sp-4)',
                backgroundColor: item.slaClock.isOverdue ? 'var(--danger-surface)' : 'var(--navy-50)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: 'var(--sp-3)'
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: '4px' }}>
                  <DocketId id={item.id} />
                  <StatusChip stage={item.currentStage} />
                  <SlaBadge clock={item.slaClock} />
                  {item.overlapInfo?.hasOverlap && item.overlapInfo.status === 'UNREVIEWED' && (
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--action)', backgroundColor: 'var(--action-tint)', padding: '2px 8px', borderRadius: '4px' }}>
                      {item.overlapInfo.matchScore}% Cross-Bureau Overlap
                    </span>
                  )}
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                  {item.title}
                </div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                  {item.institutionName} · Bureau: <strong>{item.assignedOfficer.bureau}</strong>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 'var(--sp-2)' }}>
                {item.overlapInfo?.hasOverlap && item.overlapInfo.status === 'UNREVIEWED' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => onNavigateScreen('overlaps')}
                  >
                    Review Overlap
                  </Button>
                )}
                {item.currentStage === 'RESOLUTION_PROPOSED' && (
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onNavigateScreen('proof-review')}
                  >
                    Audit ATR Proof
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onOpenCase(item.id)}
                >
                  Open Case →
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. Charts & Bureau Workload Meters ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: 'var(--sp-6)' }}>
        <ChartWrapper
          title="Grievance Ageing Distribution"
          subtitle="Statutory resolution performance against 30-day mandate"
          data={ageingChartData}
        />

        <ChartWrapper
          title="Cases by Grievance Category"
          subtitle="Highest frequency issues reported this academic session"
          data={categoryChartData}
        />
      </div>
    </div>
  );
};

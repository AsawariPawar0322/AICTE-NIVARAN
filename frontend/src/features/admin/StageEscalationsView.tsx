// ==========================================================================
// NIVARAN · Screen H: Stage Tracking, Kanban Lanes & Escalations (StageEscalationsView.tsx)
// 8 Kanban stage lanes with distinct SLA badge colors, escalation triggers, ageing table
// ==========================================================================

import React from 'react';
import { useApp } from '../../app/AppProviders';
import { StageKey, STAGE_CONFIG } from '../../domain/types';
import { ORDERED_STAGES } from '../../domain/stages';
import { DocketId } from '../../ui/DocketId';
import { SlaBadge } from '../../ui/SlaBadge';
import { Icon } from '../../ui/Icon';

interface StageEscalationsViewProps {
  onOpenCase: (caseId: string) => void;
}

export const StageEscalationsView: React.FC<StageEscalationsViewProps> = ({ onOpenCase }) => {
  const { complaints } = useApp();

  const overdueList = complaints.filter(c => c.slaClock.isOverdue);
  const disputedList = complaints.filter(c => c.currentStage === 'DISPUTED');

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Statutory Stage Tracking & Escalation Matrix
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          Monitor dockets across 8 lifecycle stages with independent statutory SLA clocks.
        </p>
      </div>

      {/* ── 1. Escalation Warnings Strip ── */}
      {(overdueList.length > 0 || disputedList.length > 0) && (
        <div
          style={{
            backgroundColor: 'var(--danger-surface)',
            border: '1px solid var(--danger-border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-4)',
            marginBottom: 'var(--sp-6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 'var(--sp-3)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
            <Icon name="warning" size={24} color="var(--danger)" weight="fill" />
            <div>
              <strong style={{ color: 'var(--danger)', fontSize: 'var(--fs-sm)' }}>
                Urgent Escalation Triggered ({overdueList.length} Overdue Dockets, {disputedList.length} Disputed Closures)
              </strong>
              <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text)', marginTop: '2px' }}>
                Cases exceeding 72h notice window without response are automatically flagged for Regional Officer summons.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ── 2. 8-Stage Kanban Lanes (Horizontal Scrollable Grid) ── */}
      <div
        style={{
          display: 'grid',
          gridAutoFlow: 'column',
          gridAutoColumns: '300px',
          gap: 'var(--sp-4)',
          overflowX: 'auto',
          paddingBottom: 'var(--sp-6)',
          alignItems: 'start'
        }}
      >
        {ORDERED_STAGES.map(stageKey => {
          const meta = STAGE_CONFIG[stageKey];
          const stageCases = complaints.filter(c => c.currentStage === stageKey);

          return (
            <div
              key={stageKey}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                display: 'flex',
                flexDirection: 'column',
                maxHeight: '680px'
              }}
            >
              {/* Lane Header */}
              <div
                style={{
                  padding: 'var(--sp-3) var(--sp-4)',
                  backgroundColor: 'var(--navy-50)',
                  borderBottom: '2px solid var(--border)',
                  borderTopLeftRadius: 'var(--rad-md)',
                  borderTopRightRadius: 'var(--rad-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}
              >
                <div>
                  <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--navy-900)' }}>
                    STEP {meta.step}
                  </span>
                  <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                    {meta.label}
                  </div>
                </div>

                <span
                  style={{
                    backgroundColor: 'var(--navy-900)',
                    color: '#FFFFFF',
                    borderRadius: 'var(--rad-full)',
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px'
                  }}
                >
                  {stageCases.length}
                </span>
              </div>

              {/* Lane Cards */}
              <div style={{ padding: 'var(--sp-3)', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
                {stageCases.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 'var(--sp-6)', color: 'var(--text-muted)', fontSize: 'var(--fs-xs)' }}>
                    No active cases in this stage.
                  </div>
                ) : (
                  stageCases.map(item => (
                    <div
                      key={item.id}
                      onClick={() => onOpenCase(item.id)}
                      style={{
                        backgroundColor: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--rad-sm)',
                        padding: 'var(--sp-3)',
                        cursor: 'pointer',
                        boxShadow: 'var(--shadow-0)',
                        transition: 'transform var(--transition-fast), border-color var(--transition-fast)'
                      }}
                      onMouseEnter={e => {
                        e.currentTarget.style.borderColor = 'var(--navy-700)';
                        e.currentTarget.style.transform = 'translateY(-1px)';
                      }}
                      onMouseLeave={e => {
                        e.currentTarget.style.borderColor = 'var(--border)';
                        e.currentTarget.style.transform = 'translateY(0)';
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-1)' }}>
                        <DocketId id={item.id} />
                        <SlaBadge clock={item.slaClock} />
                      </div>

                      <div style={{ fontWeight: 600, fontSize: 'var(--fs-xs)', color: 'var(--navy-900)', margin: '4px 0' }}>
                        {item.title}
                      </div>

                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {item.institutionName} (PID: {item.aictePermanentId})
                      </div>

                      {item.overlapInfo?.hasOverlap && (
                        <div style={{ marginTop: 'var(--sp-2)' }}>
                          <span style={{ fontSize: '10px', color: 'var(--action)', fontWeight: 700, backgroundColor: 'var(--action-tint)', padding: '1px 6px', borderRadius: '4px' }}>
                            {item.overlapInfo.matchScore}% Overlap Flag
                          </span>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

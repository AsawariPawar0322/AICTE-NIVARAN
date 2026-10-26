// ==========================================================================
// NIVARAN · Storybook-Style Component Library Gallery (UiCatalogView.tsx)
// Interactive showcase of all design tokens, components, and accessible patterns (#ui)
// ==========================================================================

import React, { useState } from 'react';
import {
  Button,
  Field,
  StatusChip,
  SlaBadge,
  DocketId,
  StatCard,
  StageTimeline,
  ReasonDialog,
  Icon,
  useToast
} from '../../ui';
import styles from '../../ui/ui.module.css';

export const UiCatalogView: React.FC = () => {
  const toast = useToast();
  const [showReasonDialog, setShowReasonDialog] = useState(false);
  const [sampleText, setSampleText] = useState('');

  return (
    <div style={{ maxWidth: '1280px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)' }}>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', backgroundColor: 'var(--navy-50)', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 700, color: 'var(--navy-900)' }}>
          NIVARAN COMPONENT LIBRARY & DESIGN SYSTEM
        </div>
        <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', fontWeight: 800, marginTop: 'var(--sp-1)' }}>
          Design System & Component Showcase (#ui)
        </h2>
        <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
          Strict token governance: zero hard-coded hex colors, 8 font sizes only, WCAG 2.1 AA accessible.
        </p>
      </div>

      {/* 1. Buttons */}
      <section style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
          Buttons (Primary Orange, Secondary Navy, Ghost, Danger)
        </h3>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <Button variant="primary" size="md">Primary Button</Button>
          <Button variant="primary" size="md" icon={<Icon name="plus" size={16} />}>With Icon</Button>
          <Button variant="secondary" size="md">Secondary Button</Button>
          <Button variant="ghost" size="md">Ghost Button</Button>
          <Button variant="danger" size="md">Danger Button</Button>
          <Button variant="primary" size="sm">Small</Button>
          <Button variant="primary" size="lg">Large Hero</Button>
          <Button variant="primary" size="md" loading>Loading</Button>
        </div>
      </section>

      {/* 2. Status Chips & SLA Badges */}
      <section style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
          Status Chips & SLA Badges
        </h3>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <StatusChip stage="SUBMITTED" />
          <StatusChip stage="VERIFICATION" />
          <StatusChip stage="ASSIGNED" />
          <StatusChip stage="UNDER_ACTION" />
          <StatusChip stage="RESOLUTION_PROPOSED" />
          <StatusChip stage="AWAITING_CONFIRMATION" />
          <StatusChip stage="DISPUTED" />
          <StatusChip stage="CLOSED" />
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
          <SlaBadge clock={{ hoursRemaining: 48, isOverdue: false, ageingDays: 2, dueTimestamp: 'In 2 days', status: 'ON_TRACK' }} />
          <SlaBadge clock={{ hoursRemaining: 14, isOverdue: false, ageingDays: 14, dueTimestamp: 'Tomorrow 5 PM', status: 'DUE_SOON' }} />
          <SlaBadge clock={{ hoursRemaining: 0, isOverdue: true, overdueHours: 72, ageingDays: 22, dueTimestamp: 'Overdue by 3d', status: 'OVERDUE' }} />
          <SlaBadge clock={{ hoursRemaining: 0, isOverdue: false, ageingDays: 5, dueTimestamp: 'Paused', status: 'PAUSED' }} />
        </div>
      </section>

      {/* 3. Stage Progression Timeline */}
      <section style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
          Stage Progression Timeline (Stage 5 Active)
        </h3>
        <StageTimeline currentStage="RESOLUTION_PROPOSED" />
      </section>

      {/* 4. StatCards & Docket ID */}
      <section style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)', marginBottom: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
          StatCards & Interactive Docket Copy Box
        </h3>
        <div style={{ display: 'flex', gap: 'var(--sp-4)', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
          <DocketId id="NIV-2026-1042" />
          <DocketId id="NIV-2026-84920" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 'var(--sp-4)' }}>
          <StatCard title="Resolved Dockets" value="1,492" deltaText="+12% this month" deltaPositive={true} />
          <StatCard title="Overdue Warning" value="3" deltaText="-2 from yesterday" deltaPositive={false} />
        </div>
      </section>

      {/* 5. Toast Notifications & Reason Dialog Triggers */}
      <section style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-md)', padding: 'var(--sp-6)' }}>
        <h3 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', marginBottom: 'var(--sp-4)' }}>
          Accessible Toast System & Mandatory Reason Dialog (Replaces alert())
        </h3>
        <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
          <Button variant="primary" size="sm" onClick={() => toast.success('ATR Proof confirmed with State Bank gateway.')}>
            Trigger Success Toast
          </Button>
          <Button variant="danger" size="sm" onClick={() => toast.error('SLA statutory deadline breached for Case NIV-2026-1038.')}>
            Trigger Error Toast
          </Button>
          <Button variant="secondary" size="sm" onClick={() => toast.info('Notice served to ABC Institute Registrar.')}>
            Trigger Info Toast
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setShowReasonDialog(true)}>
            Open ReasonDialog (Min 15 chars)
          </Button>
        </div>
      </section>

      {/* Reason Dialog Demo */}
      <ReasonDialog
        isOpen={showReasonDialog}
        onClose={() => setShowReasonDialog(false)}
        onConfirm={reason => toast.success(`Recorded justification in audit log: "${reason}"`)}
        title="Administrative Jurisdiction Transfer"
        description="Explain why this case is transferred between AICTE bureaus."
        confirmLabel="Record Reason"
      />
    </div>
  );
};

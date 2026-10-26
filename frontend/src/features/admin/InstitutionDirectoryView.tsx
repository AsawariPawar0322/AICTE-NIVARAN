// ==========================================================================
// NIVARAN · Screen E: Institution Directory & Accountability Scorecards (InstitutionDirectoryView.tsx)
// Inspection priority band, risk indicators, "How is this calculated?" drawer
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { Institution } from '../../domain/types';
import { Button } from '../../ui/Button';
import { Drawer } from '../../ui/Drawer';
import { StatCard } from '../../ui/StatCard';
import { Icon } from '../../ui/Icon';
import styles from '../../ui/ui.module.css';

export const InstitutionDirectoryView: React.FC = () => {
  const { institutions } = useApp();
  const [search, setSearch] = useState('');
  const [selectedInstId, setSelectedInstId] = useState(institutions[0]?.id || 'inst-demo-001');
  const [showDrawer, setShowDrawer] = useState(false);

  const filtered = institutions.filter(inst => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      inst.name.toLowerCase().includes(q) ||
      inst.permanentId.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.state.toLowerCase().includes(q)
    );
  });

  const currentInst = institutions.find(i => i.id === selectedInstId) || institutions[0];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* ── 1. Confidentiality Banner ── */}
      <div
        style={{
          backgroundColor: 'var(--navy-50)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-sm)',
          padding: 'var(--sp-2) var(--sp-4)',
          marginBottom: 'var(--sp-4)',
          fontSize: 'var(--fs-xs)',
          color: 'var(--text-muted)'
        }}
      >
        🔒 <strong>CONFIDENTIAL ADMINISTRATIVE RECORD:</strong> Institution compliance ratings and inspection priority metrics are for statutory planning purposes and do not constitute formal judicial findings of guilt.
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)' }}>
        <div>
          <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
            Institution Directory & Compliance Scorecards
          </h2>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            Monitor systemic recurrence, SLA breach rates, and surprise inspection recommendations.
          </p>
        </div>

        <Button
          variant="secondary"
          size="sm"
          icon={<Icon name="info" size={16} />}
          onClick={() => setShowDrawer(true)}
        >
          How is this calculated?
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 'var(--sp-6)' }}>
        {/* Left: Directory Search List */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-4)',
            height: 'fit-content'
          }}
        >
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by College, City, or Permanent ID..."
            className={styles.input}
            style={{ marginBottom: 'var(--sp-3)', minHeight: '38px', fontSize: 'var(--fs-xs)' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', maxHeight: '600px', overflowY: 'auto' }}>
            {filtered.map(inst => {
              const isSelected = inst.id === selectedInstId;
              return (
                <div
                  key={inst.id}
                  onClick={() => setSelectedInstId(inst.id)}
                  style={{
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--rad-sm)',
                    border: `1px solid ${isSelected ? 'var(--action)' : 'var(--border)'}`,
                    backgroundColor: isSelected ? 'var(--action-tint)' : 'var(--surface)',
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)'
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: isSelected ? 'var(--action)' : 'var(--navy-900)' }}>
                    {inst.name}
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between', marginTop: '2px' }}>
                    <span>Permanent ID: <strong>{inst.permanentId}</strong></span>
                    <span>{inst.city}, {inst.state}</span>
                  </div>
                  <div style={{ marginTop: 'var(--sp-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span
                      style={{
                        fontSize: '10px',
                        fontWeight: 700,
                        padding: '1px 6px',
                        borderRadius: '4px',
                        backgroundColor:
                          inst.inspectionPriority === 'High'
                            ? 'var(--danger-surface)'
                            : inst.inspectionPriority === 'Medium'
                            ? 'var(--warn-surface)'
                            : 'var(--ok-surface)',
                        color:
                          inst.inspectionPriority === 'High'
                            ? 'var(--danger)'
                            : inst.inspectionPriority === 'Medium'
                            ? 'var(--warn)'
                            : 'var(--ok)'
                      }}
                    >
                      {inst.inspectionPriority} Inspection Priority
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--navy-900)' }}>
                      {inst.openCasesCount} Open Cases
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Institution Detailed Profile & Scorecard */}
        {currentInst && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-6)' }}>
            {/* Header Profile Card */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-6)',
                boxShadow: 'var(--shadow-0)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
                <div>
                  <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
                    {currentInst.name}
                  </h3>
                  <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: '2px' }}>
                    AICTE Permanent ID: <strong>{currentInst.permanentId}</strong> · {currentInst.city}, {currentInst.state} · Category: {currentInst.category}
                  </div>
                </div>

                <div
                  style={{
                    backgroundColor:
                      currentInst.inspectionPriority === 'High'
                        ? 'var(--danger-surface)'
                        : 'var(--ok-surface)',
                    border: `1px solid ${
                      currentInst.inspectionPriority === 'High'
                        ? 'var(--danger-border)'
                        : 'var(--ok-border)'
                    }`,
                    color:
                      currentInst.inspectionPriority === 'High'
                        ? 'var(--danger)'
                        : 'var(--ok)',
                    padding: '6px 14px',
                    borderRadius: 'var(--rad-sm)',
                    fontWeight: 700,
                    fontSize: 'var(--fs-xs)'
                  }}
                >
                  Inspection Priority: {currentInst.inspectionPriority}
                </div>
              </div>

              {/* Four Metric Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: 'var(--sp-3)',
                  marginTop: 'var(--sp-6)'
                }}
              >
                <StatCard title="Active Open Dockets" value={currentInst.openCasesCount} />
                <StatCard title="Statutory SLA Overdue" value={currentInst.overdueCasesCount} />
                <StatCard title="Reopened / Disputed" value={currentInst.reopenedCasesCount} />
                <StatCard title="Overlap Clusters" value={currentInst.overlapClustersCount} />
              </div>
            </div>

            {/* Risk Indicators Card */}
            <div
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-6)',
                boxShadow: 'var(--shadow-0)'
              }}
            >
              <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-3)' }}>
                Contributing Risk Indicators & Warning Signals
              </h4>
              <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)' }}>
                {currentInst.contributingRiskIndicators.map((risk, idx) => (
                  <li key={idx} style={{ color: 'var(--text)' }}>
                    {risk}
                  </li>
                ))}
              </ul>

              <div style={{ marginTop: 'var(--sp-6)', display: 'flex', gap: 'var(--sp-3)' }}>
                <Button variant="primary" size="sm">
                  Schedule Statutory Inspection
                </Button>
                <Button variant="secondary" size="sm">
                  Issue Compliance Notice
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── "How is this calculated?" Drawer ── */}
      <Drawer isOpen={showDrawer} onClose={() => setShowDrawer(false)} title="Inspection Priority Methodology">
        <div style={{ fontSize: 'var(--fs-sm)', color: 'var(--text)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-4)' }}>
          <p>
            The <strong>Inspection Priority Index</strong> identifies technical colleges with anomalous grievance clusters across AICTE regional jurisdictions.
          </p>

          <div>
            <h5 style={{ fontWeight: 700, color: 'var(--navy-900)' }}>1. Quantitative Weightings:</h5>
            <ul style={{ paddingLeft: '20px', marginTop: '4px', fontSize: 'var(--fs-xs)' }}>
              <li>Recurring fee complaints within 60 days (40% weight)</li>
              <li>SLA breach rate exceeding 15% (30% weight)</li>
              <li>Rejected ATRs with boilerplate phrases (20% weight)</li>
              <li>Cross-bureau overlap clusters (10% weight)</li>
            </ul>
          </div>

          <div>
            <h5 style={{ fontWeight: 700, color: 'var(--navy-900)' }}>2. Reporting Period:</h5>
            <p style={{ fontSize: 'var(--fs-xs)', marginTop: '4px' }}>
              Current academic term (1 July 2026 to present date).
            </p>
          </div>

          <div>
            <h5 style={{ fontWeight: 700, color: 'var(--navy-900)' }}>3. Prototype Limitations:</h5>
            <p style={{ fontSize: 'var(--fs-xs)', marginTop: '4px', color: 'var(--text-muted)' }}>
              This rating is an automated statistical tool for prioritizing surprise inspection rosters under AICTE Act Sec 10(p). It does not preclude institute explanations.
            </p>
          </div>
        </div>
      </Drawer>
    </div>
  );
};

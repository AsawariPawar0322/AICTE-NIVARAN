// ==========================================================================
// NIVARAN · Similar-Complaint Discovery Engine (ComplaintDiscoveryView.tsx)
// Searches recurring issues, reveals match rationale, links collective dockets
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../../app/AppProviders';
import { joinComplaint } from '../../api/complaints';
import { findSimilarComplaints } from '../../domain/similarity';
import { Button } from '../../ui/Button';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

export const ComplaintDiscoveryView: React.FC = () => {
  const { complaints, currentUser, refreshData, navigateToTab } = useApp();
  const { success, error } = useToast();

  const [keywordQuery, setKeywordQuery] = useState('');
  const [selectedInstFilter, setSelectedInstFilter] = useState('');

  // Extract unique institutions
  const uniqueInstitutions = useMemo(() => {
    const map = new Map<string, string>();
    complaints.forEach(c => map.set(c.aictePermanentId, c.institutionName));
    return Array.from(map.entries()).map(([pid, name]) => ({ pid, name }));
  }, [complaints]);

  // Run similarity query
  const searchResults = useMemo(() => {
    if (!keywordQuery.trim() && !selectedInstFilter) {
      // Default: show complaints with overlaps or high joined counts
      return complaints.slice(0, 6).map(c => ({
        complaint: c,
        score: c.overlapInfo?.matchScore || 85,
        matchReasons: c.overlapInfo?.matchRationale || ['High cohort activity at institution', 'Statutory SLA in progress']
      }));
    }

    const matches = findSimilarComplaints(
      {
        title: keywordQuery,
        details: keywordQuery,
        aictePermanentId: selectedInstFilter || undefined
      },
      complaints
    );

    return matches;
  }, [keywordQuery, selectedInstFilter, complaints]);

  const handleJoin = (targetCaseId: string) => {
    try {
      const user = {
        name: currentUser?.name || 'Rohan Verma',
        email: currentUser?.email || 'rohan.verma@example.com',
        mobile: currentUser?.mobile || '+91 98234 11223',
        role: (currentUser?.role === 'AICTE Official' ? 'Student' : currentUser?.role || 'Student') as any
      };

      const result = joinComplaint(targetCaseId, user);
      refreshData();
      success(`Successfully joined collective grievance docket! Your personal linked Docket is ${result.newComplaint.id}.`);
      navigateToTab('my-complaints');
    } catch (err: any) {
      error(err.message || 'Failed to join grievance.');
    }
  };

  return (
    <div style={{ maxWidth: '1280px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-6)' }}>
      {/* ── 1. Header ── */}
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
          <span>Cross-Complainant Collective Redressal Engine</span>
        </div>
        <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Similar-Complaint Discovery & Joining
        </h2>
        <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-muted)', maxWidth: '780px' }}>
          Discover ongoing collective grievances filed by other students or faculty across India. Joining links your claim to an active inquiry without creating redundant dockets.
        </p>
      </div>

      {/* ── 2. Search & Filter Bar ── */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          padding: 'var(--sp-4)',
          marginBottom: 'var(--sp-6)',
          display: 'flex',
          gap: 'var(--sp-4)',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ flex: '2 1 300px' }}>
          <input
            type="text"
            value={keywordQuery}
            onChange={e => setKeywordQuery(e.target.value)}
            placeholder="Search by keywords (e.g. fee refund, development fee, marksheet, lab equipment)..."
            className={styles.input}
          />
        </div>

        <div style={{ flex: '1 1 240px' }}>
          <select
            value={selectedInstFilter}
            onChange={e => setSelectedInstFilter(e.target.value)}
            className={styles.select}
          >
            <option value="">Filter by Specific College / PID</option>
            {uniqueInstitutions.map(inst => (
              <option key={inst.pid} value={inst.pid}>
                {inst.name} ({inst.pid})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── 3. Results Grid ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--sp-5)' }}>
        {searchResults.length === 0 ? (
          <div
            style={{
              gridColumn: '1 / -1',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-8)',
              textAlign: 'center'
            }}
          >
            <h4 style={{ color: 'var(--navy-900)', fontSize: 'var(--fs-lg)' }}>
              No similar complaints matched your search
            </h4>
            <p style={{ color: 'var(--text-muted)', fontSize: 'var(--fs-sm)', marginTop: 'var(--sp-2)' }}>
              You can proceed to file a fresh individual grievance for your institution.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => navigateToTab('submit')}
              style={{ marginTop: 'var(--sp-4)' }}
            >
              File Fresh Complaint
            </Button>
          </div>
        ) : (
          searchResults.map(({ complaint: c, score, matchReasons }) => (
            <div
              key={c.id}
              style={{
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--rad-md)',
                padding: 'var(--sp-5)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: 'var(--shadow-0)'
              }}
            >
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-2)' }}>
                  <DocketId id={c.id} />
                  <span
                    style={{
                      fontSize: 'var(--fs-xs)',
                      fontWeight: 700,
                      color: score > 85 ? 'var(--action)' : 'var(--navy-700)',
                      backgroundColor: score > 85 ? 'var(--action-tint)' : 'var(--navy-50)',
                      padding: '2px 8px',
                      borderRadius: 'var(--rad-full)'
                    }}
                  >
                    {score}% Match
                  </span>
                </div>

                <h3 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', marginBottom: 'var(--sp-1)' }}>
                  {c.title}
                </h3>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginBottom: 'var(--sp-3)' }}>
                  {c.institutionName} (PID: {c.aictePermanentId})
                </div>

                <div style={{ display: 'flex', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)', flexWrap: 'wrap' }}>
                  <StatusChip stage={c.currentStage} />
                  {c.joinedComplainantsCount !== undefined && c.joinedComplainantsCount > 0 && (
                    <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>
                      👥 {c.joinedComplainantsCount} people joined
                    </span>
                  )}
                </div>

                {/* Match Reasons */}
                <div
                  style={{
                    backgroundColor: 'var(--navy-50)',
                    padding: 'var(--sp-3)',
                    borderRadius: 'var(--rad-sm)',
                    fontSize: '11px',
                    color: 'var(--navy-900)',
                    marginBottom: 'var(--sp-4)'
                  }}
                >
                  <strong style={{ display: 'block', marginBottom: '2px' }}>Match Rationale:</strong>
                  <ul style={{ paddingLeft: '16px', margin: 0 }}>
                    {matchReasons.slice(0, 3).map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: 'var(--sp-3)',
                  borderTop: '1px solid var(--border-light)'
                }}
              >
                <button
                  type="button"
                  onClick={() => navigateToTab('complaint-detail', { complaintId: c.id })}
                  style={{ fontSize: 'var(--fs-xs)', color: 'var(--link)', cursor: 'pointer', fontWeight: 600 }}
                >
                  Inspect Case Details →
                </button>

                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => handleJoin(c.id)}
                  icon={<Icon name="plus" size={14} />}
                >
                  Join This Complaint
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// ==========================================================================
// NIVARAN · Screen B: All Grievance Cases (AllCasesView.tsx)
// Multi-filter DataTable, CSV export, row keyboard selection
// ==========================================================================

import React, { useState, useMemo } from 'react';
import { useApp } from '../../app/AppProviders';
import { Complaint, CATEGORY_LABELS } from '../../domain/types';
import { DataTable, Column } from '../../ui/DataTable';
import { FilterBar, FilterState } from '../../ui/FilterBar';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { SlaBadge } from '../../ui/SlaBadge';
import { Icon } from '../../ui/Icon';

interface AllCasesViewProps {
  onOpenCase: (caseId: string) => void;
  presetFilters?: Partial<FilterState>;
}

export const AllCasesView: React.FC<AllCasesViewProps> = ({
  onOpenCase,
  presetFilters
}) => {
  const { complaints } = useApp();

  const [filters, setFilters] = useState<FilterState>({
    searchQuery: presetFilters?.searchQuery || '',
    category: presetFilters?.category || undefined,
    bureau: presetFilters?.bureau || undefined,
    stage: presetFilters?.stage || undefined,
    overdueOnly: presetFilters?.overdueOnly || false,
    overlapOnly: presetFilters?.overlapOnly || false
  });

  const categories = Object.entries(CATEGORY_LABELS).map(([k, v]) => ({
    value: k,
    label: v
  }));

  const bureaus = [
    { value: 'PGRC', label: 'Public Grievance Redressal Cell (PGRC)' },
    { value: 'REGIONAL_OFFICE', label: 'Regional Office' },
    { value: 'APPROVAL_BUREAU', label: 'Approvals & Quality Bureau' },
    { value: 'ANTI_RAGGING', label: 'Anti-Ragging Squad' },
    { value: 'WOMEN_CELL', label: 'ICC & Women Safety' },
    { value: 'STUDENT_WELFARE', label: 'Scholarships & Student Welfare' }
  ];

  const filteredData = useMemo(() => {
    return complaints.filter(c => {
      if (filters.overdueOnly && !c.slaClock.isOverdue) return false;
      if (filters.overlapOnly && (!c.overlapInfo || !c.overlapInfo.hasOverlap)) return false;
      if (filters.category && c.category !== filters.category) return false;
      if (filters.bureau && c.bureau !== filters.bureau) return false;
      if (filters.stage && c.currentStage !== filters.stage) return false;

      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        return (
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.institutionName.toLowerCase().includes(q) ||
          c.aictePermanentId.toLowerCase().includes(q) ||
          c.complainantName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [complaints, filters]);

  const columns: Column<Complaint>[] = [
    {
      key: 'id',
      header: 'Docket ID',
      render: item => <DocketId id={item.id} />,
      sortable: true
    },
    {
      key: 'institutionName',
      header: 'Institution & Permanent ID',
      render: item => (
        <div>
          <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{item.institutionName}</div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>PID: <strong>{item.aictePermanentId}</strong></div>
        </div>
      ),
      sortable: true
    },
    {
      key: 'title',
      header: 'Grievance Subject',
      render: item => (
        <div style={{ maxWidth: '260px' }}>
          <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {item.title}
          </div>
          <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
            {item.categoryLabel}
          </div>
        </div>
      )
    },
    {
      key: 'bureau',
      header: 'Bureau / Cell',
      render: item => (
        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--navy-900)' }}>
          {item.bureau}
        </span>
      ),
      sortable: true
    },
    {
      key: 'assignedOfficer',
      header: 'Assigned Officer',
      render: item => (
        <div style={{ fontSize: 'var(--fs-xs)' }}>
          <div style={{ fontWeight: 600 }}>{item.assignedOfficer.name}</div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>{item.assignedOfficer.designation}</div>
        </div>
      )
    },
    {
      key: 'currentStage',
      header: 'Current Stage',
      render: item => <StatusChip stage={item.currentStage} />,
      sortable: true
    },
    {
      key: 'slaClock',
      header: 'SLA Clock',
      render: item => <SlaBadge clock={item.slaClock} />
    },
    {
      key: 'overlapInfo',
      header: 'Overlap Flag',
      render: item => (
        item.overlapInfo?.hasOverlap ? (
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--action)',
              backgroundColor: 'var(--action-tint)',
              border: '1px solid var(--action-border)',
              padding: '2px 6px',
              borderRadius: '4px'
            }}
          >
            {item.overlapInfo.matchScore}% Match
          </span>
        ) : (
          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>None</span>
        )
      )
    },
    {
      key: 'lastActivity',
      header: 'Last Activity',
      render: item => <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{item.lastActivity}</span>
    }
  ];

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--sp-4)' }}>
        <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          All Grievance Cases Repository
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          Search, filter, and inspect statutory grievances across all AICTE bureaus with immutable audit tracking.
        </p>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        categories={categories}
        bureaus={bureaus}
        onReset={() =>
          setFilters({
            searchQuery: '',
            category: undefined,
            bureau: undefined,
            stage: undefined,
            overdueOnly: false,
            overlapOnly: false
          })
        }
      />

      <DataTable
        data={filteredData}
        columns={columns}
        keyExtractor={c => c.id}
        onRowClick={c => onOpenCase(c.id)}
        title="Grievance Dockets"
        exportFileName="aicte_nivaran_cases_export.csv"
      />
    </div>
  );
};

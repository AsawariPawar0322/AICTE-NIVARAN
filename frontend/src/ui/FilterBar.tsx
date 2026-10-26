// ==========================================================================
// NIVARAN · Shared FilterBar Component (FilterBar.tsx)
// Multi-criteria search, category filters, overdue toggle, overlap toggle
// ==========================================================================

import React from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import styles from './ui.module.css';

export interface FilterState {
  searchQuery: string;
  category?: string;
  bureau?: string;
  stage?: string;
  overdueOnly: boolean;
  overlapOnly: boolean;
}

interface FilterBarProps {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
  categories?: { value: string; label: string }[];
  bureaus?: { value: string; label: string }[];
  stages?: { value: string; label: string }[];
  onReset?: () => void;
  className?: string;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  filters,
  onChange,
  categories = [],
  bureaus = [],
  stages = [],
  onReset,
  className = ''
}) => {
  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rad-md)',
        padding: 'var(--sp-4)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--sp-3)',
        marginBottom: 'var(--sp-4)'
      }}
      className={className}
    >
      {/* Top search & quick toggles */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: '1 1 280px' }}>
          <div
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
              display: 'flex'
            }}
          >
            <Icon name="search" size={18} />
          </div>
          <input
            type="text"
            value={filters.searchQuery}
            onChange={e => onChange({ ...filters, searchQuery: e.target.value })}
            placeholder="Search by Docket ID, Institution Name, or Complainant..."
            className={styles.input}
            style={{ paddingLeft: '38px', minHeight: '40px' }}
            aria-label="Search filter"
          />
        </div>

        {/* Overdue Only Toggle */}
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            fontSize: 'var(--fs-sm)',
            cursor: 'pointer',
            padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--rad-sm)',
            backgroundColor: filters.overdueOnly ? 'var(--danger-surface)' : 'var(--bg)',
            color: filters.overdueOnly ? 'var(--danger)' : 'var(--text)',
            border: `1px solid ${filters.overdueOnly ? 'var(--danger-border)' : 'var(--border)'}`,
            fontWeight: 600
          }}
        >
          <input
            type="checkbox"
            checked={filters.overdueOnly}
            onChange={e => onChange({ ...filters, overdueOnly: e.target.checked })}
            style={{ accentColor: 'var(--danger)', width: '16px', height: '16px' }}
          />
          <span>Overdue Only</span>
        </label>

        {/* Overlap Only Toggle */}
        <label
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 'var(--sp-2)',
            fontSize: 'var(--fs-sm)',
            cursor: 'pointer',
            padding: 'var(--sp-2) var(--sp-3)',
            borderRadius: 'var(--rad-sm)',
            backgroundColor: filters.overlapOnly ? 'var(--warn-surface)' : 'var(--bg)',
            color: filters.overlapOnly ? 'var(--warn)' : 'var(--text)',
            border: `1px solid ${filters.overlapOnly ? 'var(--warn-border)' : 'var(--border)'}`,
            fontWeight: 600
          }}
        >
          <input
            type="checkbox"
            checked={filters.overlapOnly}
            onChange={e => onChange({ ...filters, overlapOnly: e.target.checked })}
            style={{ accentColor: 'var(--warn)', width: '16px', height: '16px' }}
          />
          <span>Potential Overlaps Only</span>
        </label>

        {onReset && (
          <Button variant="ghost" size="sm" onClick={onReset}>
            Reset Filters
          </Button>
        )}
      </div>

      {/* Dropdown selectors */}
      <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
        {categories.length > 0 && (
          <div style={{ flex: '1 1 180px' }}>
            <select
              value={filters.category || ''}
              onChange={e => onChange({ ...filters, category: e.target.value || undefined })}
              className={styles.select}
              style={{ minHeight: '38px', fontSize: 'var(--fs-xs)' }}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              {categories.map(c => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {bureaus.length > 0 && (
          <div style={{ flex: '1 1 180px' }}>
            <select
              value={filters.bureau || ''}
              onChange={e => onChange({ ...filters, bureau: e.target.value || undefined })}
              className={styles.select}
              style={{ minHeight: '38px', fontSize: 'var(--fs-xs)' }}
              aria-label="Filter by Bureau"
            >
              <option value="">All Bureaus</option>
              {bureaus.map(b => (
                <option key={b.value} value={b.value}>
                  {b.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {stages.length > 0 && (
          <div style={{ flex: '1 1 180px' }}>
            <select
              value={filters.stage || ''}
              onChange={e => onChange({ ...filters, stage: e.target.value || undefined })}
              className={styles.select}
              style={{ minHeight: '38px', fontSize: 'var(--fs-xs)' }}
              aria-label="Filter by Stage"
            >
              <option value="">All Stages</option>
              {stages.map(s => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>
    </div>
  );
};

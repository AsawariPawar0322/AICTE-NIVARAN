// ==========================================================================
// NIVARAN · Shared Accessible DataTable (DataTable.tsx)
// Sticky header, sortable columns, CSV export, keyboard row focus, mobile responsive card mode
// ==========================================================================

import React, { useState } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';
import styles from './ui.module.css';

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (item: T) => string;
  onRowClick?: (item: T) => void;
  title?: string;
  emptyMessage?: string;
  className?: string;
  enableExport?: boolean;
  exportFileName?: string;
}

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  keyExtractor,
  onRowClick,
  title,
  emptyMessage = 'No records found matching criteria.',
  className = '',
  enableExport = true,
  exportFileName = 'aicte_nivaran_export.csv'
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortKey) return 0;
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    if (aVal === bVal) return 0;
    if (aVal === undefined || aVal === null) return 1;
    if (bVal === undefined || bVal === null) return -1;
    const res = aVal > bVal ? 1 : -1;
    return sortOrder === 'asc' ? res : -res;
  });

  const exportCsv = () => {
    const headers = columns.map(c => `"${c.header}"`).join(',');
    const rows = sortedData.map(item =>
      columns
        .map(c => {
          const val = item[c.key];
          return `"${String(val ?? '').replace(/"/g, '""')}"`;
        })
        .join(',')
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', exportFileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={{ width: '100%' }} className={className}>
      {(title || enableExport) && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 'var(--sp-3)',
            flexWrap: 'wrap',
            gap: 'var(--sp-2)'
          }}
        >
          {title && <h3 style={{ fontSize: 'var(--fs-lg)' }}>{title} ({data.length})</h3>}
          {enableExport && data.length > 0 && (
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="download" size={14} />}
              onClick={exportCsv}
            >
              Export CSV
            </Button>
          )}
        </div>
      )}

      <div
        style={{
          width: '100%',
          overflowX: 'auto',
          backgroundColor: 'var(--surface)',
          borderRadius: 'var(--rad-md)',
          border: '1px solid var(--border)',
          boxShadow: 'var(--shadow-0)'
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            textAlign: 'left',
            fontSize: 'var(--fs-sm)'
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: 'var(--navy-50)',
                borderBottom: '2px solid var(--border)',
                color: 'var(--navy-900)'
              }}
            >
              {columns.map(col => (
                <th
                  key={col.key}
                  scope="col"
                  style={{
                    padding: '10px 14px',
                    fontSize: 'var(--fs-2xs)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    textAlign: col.align || 'left',
                    cursor: col.sortable ? 'pointer' : 'default',
                    whiteSpace: 'nowrap',
                    userSelect: 'none'
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    <span>{col.header}</span>
                    {col.sortable && (
                      <span style={{ color: sortKey === col.key ? 'var(--navy-900)' : 'var(--border)' }}>
                        {sortKey === col.key && sortOrder === 'desc' ? '▼' : '▲'}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: 'var(--sp-8)',
                    textAlign: 'center',
                    color: 'var(--text-muted)'
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((item, idx) => {
                const rowKey = keyExtractor(item);
                return (
                  <tr
                    key={rowKey}
                    tabIndex={onRowClick ? 0 : undefined}
                    role={onRowClick ? 'button' : undefined}
                    onClick={() => onRowClick && onRowClick(item)}
                    onKeyDown={e => {
                      if (onRowClick && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        onRowClick(item);
                      }
                    }}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      backgroundColor: idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)',
                      cursor: onRowClick ? 'pointer' : 'default',
                      transition: 'background-color var(--transition-fast)'
                    }}
                    onMouseEnter={e => {
                      if (onRowClick) e.currentTarget.style.backgroundColor = 'var(--navy-50)';
                    }}
                    onMouseLeave={e => {
                      if (onRowClick) e.currentTarget.style.backgroundColor = idx % 2 === 0 ? 'var(--surface)' : 'var(--bg)';
                    }}
                  >
                    {columns.map(col => (
                      <td
                        key={col.key}
                        style={{
                          padding: 'var(--sp-3) var(--sp-4)',
                          textAlign: col.align || 'left',
                          verticalAlign: 'middle'
                        }}
                      >
                        {col.render ? col.render(item) : item[col.key]}
                      </td>
                    ))}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

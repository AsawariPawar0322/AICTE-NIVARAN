// ==========================================================================
// NIVARAN · Shared Accessible ChartWrapper (ChartWrapper.tsx)
// Renders SVG charts with mandatory WCAG 2.1 AA "View as table" toggle
// ==========================================================================

import React, { useState } from 'react';
import { Button } from './Button';
import styles from './ui.module.css';

export interface ChartDatum {
  label: string;
  value: number;
  color?: string;
  subValue?: string;
}

interface ChartWrapperProps {
  title: string;
  subtitle?: string;
  data: ChartDatum[];
  type?: 'bar' | 'horizontal-bar';
  height?: number;
  className?: string;
}

export const ChartWrapper: React.FC<ChartWrapperProps> = ({
  title,
  subtitle,
  data,
  height = 180,
  className = ''
}) => {
  const [viewAsTable, setViewAsTable] = useState(false);

  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div
      style={{
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rad-md)',
        padding: 'var(--sp-4)',
        boxShadow: 'var(--shadow-0)'
      }}
      className={className}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 'var(--sp-4)',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)'
        }}
      >
        <div>
          <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)' }}>{title}</h4>
          {subtitle && (
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>{subtitle}</p>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setViewAsTable(!viewAsTable)}
          aria-expanded={viewAsTable}
        >
          {viewAsTable ? 'View as Chart' : 'View as Table'}
        </Button>
      </div>

      {viewAsTable ? (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              fontSize: 'var(--fs-xs)',
              borderCollapse: 'collapse',
              textAlign: 'left'
            }}
          >
            <caption className="sr-only">{title} data table alternative</caption>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)', color: 'var(--text-muted)' }}>
                <th scope="col" style={{ padding: 'var(--sp-2)' }}>Category / Metric</th>
                <th scope="col" style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>Count / Value</th>
                <th scope="col" style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>Share (%)</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, i) => {
                const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
                const pct = ((d.value / total) * 100).toFixed(1);
                return (
                  <tr key={i} style={{ borderBottom: '1px solid var(--border-light)' }}>
                    <td style={{ padding: 'var(--sp-2)', fontWeight: 600 }}>{d.label}</td>
                    <td style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>{d.value}</td>
                    <td style={{ padding: 'var(--sp-2)', textAlign: 'right' }}>{pct}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div
          role="img"
          aria-label={`${title} chart`}
          style={{
            height,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-around',
            paddingTop: 'var(--sp-2)'
          }}
        >
          {data.map((item, idx) => {
            const widthPct = Math.max(4, Math.round((item.value / maxValue) * 100));
            const barColor = item.color || 'var(--navy-700)';

            return (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-3)',
                  fontSize: 'var(--fs-xs)'
                }}
              >
                <span
                  style={{
                    width: '130px',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    fontWeight: 600,
                    color: 'var(--text)'
                  }}
                  title={item.label}
                >
                  {item.label}
                </span>

                <div
                  style={{
                    flex: 1,
                    height: '22px',
                    backgroundColor: 'var(--navy-50)',
                    borderRadius: 'var(--rad-sm)',
                    overflow: 'hidden',
                    position: 'relative'
                  }}
                >
                  <div
                    style={{
                      height: '100%',
                      width: `${widthPct}%`,
                      backgroundColor: barColor,
                      borderRadius: 'var(--rad-sm)',
                      transition: 'width var(--transition-slow)'
                    }}
                  />
                </div>

                <span
                  style={{
                    width: '42px',
                    textAlign: 'right',
                    fontWeight: 700,
                    color: 'var(--navy-900)'
                  }}
                >
                  {item.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

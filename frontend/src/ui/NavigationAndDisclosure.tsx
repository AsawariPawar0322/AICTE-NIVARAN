// ==========================================================================
// NIVARAN · Shared Navigation & Disclosure UI (Tabs, Stepper, Accordion)
// ==========================================================================

import React, { useState } from 'react';
import { Icon } from './Icon';
import styles from './ui.module.css';

// ── 1. Accessible Tabs ──
export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: React.ReactNode;
}

export const Tabs: React.FC<{
  tabs: TabItem[];
  activeTab: string;
  onChange: (id: string) => void;
  className?: string;
}> = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div
      role="tablist"
      style={{
        display: 'flex',
        gap: 'var(--sp-2)',
        borderBottom: '2px solid var(--border)',
        overflowX: 'auto',
        marginBottom: 'var(--sp-4)'
      }}
      className={className}
    >
      {tabs.map(tab => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${tab.id}`}
            id={`tab-${tab.id}`}
            onClick={() => onChange(tab.id)}
            style={{
              padding: 'var(--sp-3) var(--sp-4)',
              fontWeight: 600,
              fontSize: 'var(--fs-sm)',
              color: isActive ? 'var(--navy-900)' : 'var(--text-muted)',
              borderBottom: isActive ? '3px solid var(--action)' : '3px solid transparent',
              marginBottom: '-2px',
              backgroundColor: 'transparent',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 'var(--sp-2)',
              whiteSpace: 'nowrap',
              transition: 'all var(--transition-fast)'
            }}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                style={{
                  fontSize: 'var(--fs-xs)',
                  padding: '2px 8px',
                  borderRadius: 'var(--rad-full)',
                  backgroundColor: isActive ? 'var(--navy-100)' : 'var(--bg)',
                  color: isActive ? 'var(--navy-900)' : 'var(--text-muted)',
                  fontWeight: 700
                }}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

// ── 2. Stepper Component for 4-Step Form ──
export interface StepItem {
  number: number;
  title: string;
  subtitle?: string;
}

export const Stepper: React.FC<{
  steps: StepItem[];
  currentStep: number;
  onStepClick?: (stepNumber: number) => void;
  className?: string;
}> = ({ steps, currentStep, onStepClick, className = '' }) => {
  return (
    <nav aria-label="Progress" className={className} style={{ width: '100%', marginBottom: 'var(--sp-6)' }}>
      <ol
        style={{
          listStyle: 'none',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--sp-2)',
          position: 'relative',
          padding: 0
        }}
      >
        {steps.map(s => {
          const isDone = s.number < currentStep;
          const isCurrent = s.number === currentStep;

          return (
            <li
              key={s.number}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--sp-3)',
                cursor: onStepClick && isDone ? 'pointer' : 'default'
              }}
              onClick={() => onStepClick && isDone && onStepClick(s.number)}
            >
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 700,
                  fontSize: 'var(--fs-sm)',
                  backgroundColor: isDone
                    ? 'var(--ok)'
                    : isCurrent
                    ? 'var(--action)'
                    : 'var(--surface)',
                  color: isDone || isCurrent ? '#FFFFFF' : 'var(--text-muted)',
                  border: isDone || isCurrent ? 'none' : '2px solid var(--border)'
                }}
              >
                {isDone ? <Icon name="check" size={16} weight="bold" /> : s.number}
              </div>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                <span
                  style={{
                    fontSize: 'var(--fs-sm)',
                    fontWeight: isCurrent ? 700 : 600,
                    color: isCurrent ? 'var(--navy-900)' : 'var(--text-muted)'
                  }}
                >
                  {s.title}
                </span>
                {s.subtitle && (
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
                    {s.subtitle}
                  </span>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

// ── 3. Accordion (FAQ & Policy explainers) ──
export const AccordionItem: React.FC<{
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}> = ({ title, children, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div
      style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--rad-sm)',
        marginBottom: 'var(--sp-2)',
        overflow: 'hidden',
        backgroundColor: 'var(--surface)'
      }}
    >
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        style={{
          width: '100%',
          padding: 'var(--sp-3) var(--sp-4)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: isOpen ? 'var(--navy-50)' : 'var(--surface)',
          fontWeight: 600,
          fontSize: 'var(--fs-sm)',
          color: 'var(--navy-900)',
          textAlign: 'left'
        }}
      >
        <span>{title}</span>
        <Icon name={isOpen ? 'caret-up' : 'caret-down'} size={16} />
      </button>

      {isOpen && (
        <div style={{ padding: 'var(--sp-4)', fontSize: 'var(--fs-sm)', color: 'var(--text)' }}>
          {children}
        </div>
      )}
    </div>
  );
};

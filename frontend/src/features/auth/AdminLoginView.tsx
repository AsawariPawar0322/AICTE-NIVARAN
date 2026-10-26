// ==========================================================================
// NIVARAN · Official Console Sign In (AdminLoginView.tsx)
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Icon } from '../../ui/Icon';
import styles from '../../ui/ui.module.css';

export const AdminLoginView: React.FC = () => {
  const { loginAs, navigateToTab } = useApp();
  const [govEmail, setGovEmail] = useState('');
  const [pin, setPin] = useState('');

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginAs('official_pgrc');
  };

  return (
    <div style={{ maxWidth: '520px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-4)' }}>
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-lg)',
          boxShadow: 'var(--shadow-1)',
          padding: 'var(--sp-6)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 'var(--sp-6)' }}>
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: 'var(--rad-md)',
              backgroundColor: 'var(--navy-50)',
              color: 'var(--navy-900)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--sp-2)'
            }}
          >
            <Icon name="shield" size={28} weight="duotone" />
          </div>
          <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)' }}>
            Official Redressal Console
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 'var(--sp-1)' }}>
            Secured Access for AICTE Bureaus, Regional Offices, and Institute Nodal Officers
          </p>
        </div>

        {/* 1-Click Official Benchmarks */}
        <div
          style={{
            backgroundColor: 'var(--navy-50)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-sm)',
            padding: 'var(--sp-3)',
            marginBottom: 'var(--sp-5)'
          }}
        >
          <span style={{ fontSize: 'var(--fs-xs)', fontWeight: 700, color: 'var(--navy-900)' }}>
            ⚡ Instant Official Benchmarks:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
            <button
              type="button"
              onClick={() => loginAs('official_pgrc')}
              style={{
                textAlign: 'left',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: 'var(--sp-2) var(--sp-3)',
                borderRadius: 'var(--rad-sm)',
                fontSize: 'var(--fs-xs)',
                cursor: 'pointer'
              }}
            >
              <strong>Dr. Ramesh Chandra Verma</strong> · Director, Central PGRC Bureau
            </button>
            <button
              type="button"
              onClick={() => loginAs('official_wro')}
              style={{
                textAlign: 'left',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: 'var(--sp-2) var(--sp-3)',
                borderRadius: 'var(--rad-sm)',
                fontSize: 'var(--fs-xs)',
                cursor: 'pointer'
              }}
            >
              <strong>Dr. S. Meenakshi</strong> · Assistant Director, Western Regional Office (WRO)
            </button>
            <button
              type="button"
              onClick={() => loginAs('official_cro')}
              style={{
                textAlign: 'left',
                backgroundColor: 'var(--surface)',
                border: '1px solid var(--border)',
                padding: 'var(--sp-2) var(--sp-3)',
                borderRadius: 'var(--rad-sm)',
                fontSize: 'var(--fs-xs)',
                cursor: 'pointer'
              }}
            >
              <strong>Shri Manoj Tiwari</strong> · Regional Officer, Central Regional Office (CRO)
            </button>
          </div>
        </div>

        <form onSubmit={handleOfficialLogin}>
          <Field label="Official @aicte-india.org / NIC Email" required>
            {({ id, ariaDescribedBy }) => (
              <input
                id={id}
                type="email"
                value={govEmail}
                onChange={e => setGovEmail(e.target.value)}
                placeholder="officer@aicte-india.org"
                className={styles.input}
                aria-describedby={ariaDescribedBy}
                required
              />
            )}
          </Field>

          <Field label="Security PIN / Token" hint="Enter statutory authorization PIN" required>
            {({ id, ariaDescribedBy }) => (
              <input
                id={id}
                type="password"
                value={pin}
                onChange={e => setPin(e.target.value)}
                placeholder="••••••"
                className={styles.input}
                aria-describedby={ariaDescribedBy}
                required
              />
            )}
          </Field>

          <Button variant="primary" size="md" style={{ width: '100%' }}>
            Access Official Dashboard
          </Button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-4)' }}>
          <button
            type="button"
            onClick={() => navigateToTab('citizen-login')}
            style={{ fontSize: 'var(--fs-xs)', color: 'var(--link)', cursor: 'pointer' }}
          >
            ← Not an AICTE Official? Switch to Citizen Grievance Portal
          </button>
        </div>
      </div>
    </div>
  );
};

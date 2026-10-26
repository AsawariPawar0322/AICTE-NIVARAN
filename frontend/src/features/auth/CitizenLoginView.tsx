// ==========================================================================
// NIVARAN · Citizen Portal Sign In (CitizenLoginView.tsx)
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Icon } from '../../ui/Icon';
import styles from '../../ui/ui.module.css';

export const CitizenLoginView: React.FC = () => {
  const { loginAs, navigateToTab } = useApp();
  const [mobileOrRoll, setMobileOrRoll] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mobileOrRoll.trim()) return;
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    // Default to Rohan Verma demo account
    loginAs('citizen_rohan');
  };

  return (
    <div style={{ maxWidth: '480px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-4)' }}>
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
              backgroundColor: 'var(--action-tint)',
              color: 'var(--action)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--sp-2)'
            }}
          >
            <Icon name="user" size={28} weight="duotone" />
          </div>
          <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)' }}>
            Citizen Portal Login
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginTop: 'var(--sp-1)' }}>
            Sign in to file grievances, track dockets, and confirm Action Taken Reports
          </p>
        </div>

        {/* 1-Click Demo Profiles */}
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
            ⚡ Instant Benchmark Test Profiles:
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', marginTop: 'var(--sp-2)' }}>
            <button
              type="button"
              onClick={() => loginAs('citizen_rohan')}
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
              <strong>Rohan Verma</strong> (ABC Inst. · Case NIV-2026-1042 Fee Refund)
            </button>
            <button
              type="button"
              onClick={() => loginAs('citizen_aarav')}
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
              <strong>Aarav Sharma</strong> (DTU · Case NIV-2026-84920 Awaiting Confirmation)
            </button>
            <button
              type="button"
              onClick={() => loginAs('citizen_tanvi')}
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
              <strong>Tanvi Shinde</strong> (ABC Inst. · Case NIV-2026-1098 Regional Office)
            </button>
          </div>
        </div>

        {/* Standard Phone/OTP Form */}
        {!otpSent ? (
          <form onSubmit={handleSendOtp}>
            <Field
              label="Registered Mobile Number or Student Roll No"
              hint="We will send a 6-digit OTP verification code."
              required
            >
              {({ id, ariaDescribedBy }) => (
                <input
                  id={id}
                  type="text"
                  value={mobileOrRoll}
                  onChange={e => setMobileOrRoll(e.target.value)}
                  placeholder="+91 98234 11223 or Roll No"
                  className={styles.input}
                  aria-describedby={ariaDescribedBy}
                  required
                />
              )}
            </Field>

            <Button variant="primary" size="md" style={{ width: '100%' }}>
              Send OTP Verification
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp}>
            <Field
              label="Enter 6-Digit OTP Code"
              hint="Enter 123456 for demo verification."
              required
            >
              {({ id, ariaDescribedBy }) => (
                <input
                  id={id}
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={e => setOtp(e.target.value)}
                  placeholder="123456"
                  className={styles.input}
                  aria-describedby={ariaDescribedBy}
                  required
                />
              )}
            </Field>

            <Button variant="primary" size="md" style={{ width: '100%' }}>
              Verify & Enter Portal
            </Button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--sp-4)' }}>
          <button
            type="button"
            onClick={() => navigateToTab('admin-login')}
            style={{ fontSize: 'var(--fs-xs)', color: 'var(--link)', cursor: 'pointer' }}
          >
            Are you an AICTE Redressal Officer? Switch to Official Console →
          </button>
        </div>
      </div>
    </div>
  );
};

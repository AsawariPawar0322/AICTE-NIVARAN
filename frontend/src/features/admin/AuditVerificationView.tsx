// ==========================================================================
// NIVARAN · Screen I: Tamper-Evident Audit Logs & Hash Chain Verification (AuditVerificationView.tsx)
// Cryptographic re-computation, broken link detection, verifiable root anchor
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { verifyTimelineIntegrity, VerificationReport } from '../../api/audit';
import { AuditEvent } from '../../domain/types';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { useToast } from '../../ui/Toast';

export const AuditVerificationView: React.FC = () => {
  const { complaints } = useApp();
  const { success, error } = useToast();

  // Aggregate all audit events across all complaints
  const allEvents: AuditEvent[] = complaints.flatMap(c => c.auditEvents);

  const [simulatedTampering, setSimulatedTampering] = useState(false);
  const [report, setReport] = useState<VerificationReport | null>(null);

  const eventsToTest = simulatedTampering
    ? allEvents.map((ev, i) => (i === 2 ? { ...ev, action: 'TAMPERED_ACTION_UNAUTHORIZED' } : ev))
    : allEvents;

  const handleVerify = () => {
    const res = verifyTimelineIntegrity(eventsToTest);
    setReport(res);
    if (res.isValid) {
      success('Audit ledger integrity verified: all cryptographic digests form a valid contiguous chain.');
    } else {
      error(`Integrity Check Failed: Broken block detected at Event #${res.brokenEventIndex! + 1}`);
    }
  };

  return (
    <div style={{ maxWidth: '1440px', margin: '0 auto' }}>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
          Immutable Audit Log & Cryptographic Timeline Verification
        </h2>
        <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>
          Every statutory lifecycle change is hashed with its predecessor digest. Chaining makes unauthorized database tampering immediately detectable.
        </p>
      </div>

      {/* ── 1. Verification Control Panel ── */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          padding: 'var(--sp-5)',
          marginBottom: 'var(--sp-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-3)'
        }}
      >
        <div>
          <h4 style={{ fontSize: 'var(--fs-md)', color: 'var(--navy-900)', fontWeight: 700 }}>
            Recompute System-Wide Hash Chain ({allEvents.length} Recorded Blocks)
          </h4>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
            Root Genesis Hash: <code style={{ color: 'var(--navy-700)' }}>GENESIS_ROOT_HASH_0000...</code>
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--sp-3)', alignItems: 'center' }}>
          {/* Tamper Simulation Toggle for Demo Testing */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-xs)', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={simulatedTampering}
              onChange={e => {
                setSimulatedTampering(e.target.checked);
                setReport(null);
              }}
              style={{ accentColor: 'var(--danger)' }}
            />
            <span>Simulate Database Alteration (Test Tamper Detection)</span>
          </label>

          <Button variant="primary" size="md" onClick={handleVerify} icon={<Icon name="shield" size={16} />}>
            Verify Chain Integrity
          </Button>
        </div>
      </div>

      {/* ── 2. Report Status Banner ── */}
      {report && (
        <div
          style={{
            padding: 'var(--sp-4) var(--sp-5)',
            borderRadius: 'var(--rad-md)',
            backgroundColor: report.isValid ? 'var(--ok-surface)' : 'var(--danger-surface)',
            border: `2px solid ${report.isValid ? 'var(--ok-border)' : 'var(--danger-border)'}`,
            marginBottom: 'var(--sp-6)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
            <Icon name={report.isValid ? 'check-circle' : 'danger'} size={24} color={report.isValid ? 'var(--ok)' : 'var(--danger)'} weight="fill" />
            <h4 style={{ color: report.isValid ? 'var(--ok)' : 'var(--danger)', fontSize: 'var(--fs-md)' }}>
              {report.isValid ? 'Chain Integrity Validated Successfully' : 'Tamper Alert: Cryptographic Discrepancy Found!'}
            </h4>
          </div>
          <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text)', marginTop: '4px' }}>
            {report.notes}
          </p>
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-family-mono)', color: 'var(--navy-900)', marginTop: 'var(--sp-2)' }}>
            Head Digest: {report.finalHash}
          </div>
        </div>
      )}

      {/* ── 3. Audit Ledger Table ── */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rad-md)',
          overflowX: 'auto',
          boxShadow: 'var(--shadow-0)'
        }}
      >
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--fs-xs)', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--navy-50)', borderBottom: '2px solid var(--border)', color: 'var(--navy-900)' }}>
              <th style={{ padding: 'var(--sp-3)' }}>Event ID</th>
              <th style={{ padding: 'var(--sp-3)' }}>Docket</th>
              <th style={{ padding: 'var(--sp-3)' }}>Timestamp</th>
              <th style={{ padding: 'var(--sp-3)' }}>Actor / Role</th>
              <th style={{ padding: 'var(--sp-3)' }}>Action</th>
              <th style={{ padding: 'var(--sp-3)' }}>Reason / Value</th>
              <th style={{ padding: 'var(--sp-3)' }}>Current SHA-256 Digest</th>
            </tr>
          </thead>
          <tbody>
            {eventsToTest.map((ev, i) => {
              const isBroken = report && !report.isValid && report.brokenEventIndex === i;

              return (
                <tr
                  key={ev.id}
                  style={{
                    borderBottom: '1px solid var(--border-light)',
                    backgroundColor: isBroken ? 'var(--danger-surface)' : i % 2 === 0 ? 'var(--surface)' : 'var(--bg)'
                  }}
                >
                  <td style={{ padding: 'var(--sp-3)', fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>
                    #{i + 1}
                  </td>
                  <td style={{ padding: 'var(--sp-3)', fontWeight: 600 }}>{ev.caseId}</td>
                  <td style={{ padding: 'var(--sp-3)', color: 'var(--text-muted)' }}>{ev.timestamp}</td>
                  <td style={{ padding: 'var(--sp-3)' }}>
                    <strong>{ev.actor}</strong> ({ev.role})
                  </td>
                  <td style={{ padding: 'var(--sp-3)', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {ev.action}
                  </td>
                  <td style={{ padding: 'var(--sp-3)' }}>
                    {ev.reason ? `"${ev.reason}"` : ev.newValue || 'N/A'}
                  </td>
                  <td style={{ padding: 'var(--sp-3)', fontFamily: 'var(--font-family-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    {ev.currentHash.slice(0, 20)}...
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

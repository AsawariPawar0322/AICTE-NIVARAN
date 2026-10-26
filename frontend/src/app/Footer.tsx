// ==========================================================================
// NIVARAN · GIGW Compliant Government Footer (Footer.tsx)
// ==========================================================================

import React from 'react';
import { useI18n } from '../i18n/context';

export const Footer: React.FC = () => {
  const { t } = useI18n();

  return (
    <footer style={{ marginTop: 'auto', backgroundColor: 'var(--navy-900)', color: '#FFFFFF' }}>
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: 'var(--sp-8) var(--sp-6) var(--sp-6)',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--sp-6)',
          fontSize: 'var(--fs-sm)'
        }}
      >
        {/* Col 1: About */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-3)' }}>
            <span style={{ fontWeight: 800, fontSize: 'var(--fs-lg)', color: '#FFFFFF' }}>
              AICTE NIVARAN
            </span>
          </div>
          <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: 'var(--fs-xs)', lineHeight: 1.6 }}>
            {t.portalSubtitle}. Official grievance redressal, cross-bureau coordination, and institutional accountability platform of the All India Council for Technical Education.
          </p>
          <div style={{ marginTop: 'var(--sp-4)', fontSize: 'var(--fs-xs)', color: 'var(--india-saffron)' }}>
            {t.version}
          </div>
        </div>

        {/* Col 2: Useful Links */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-3)' }}>
            Statutory Portals
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 0 }}>
            <li>
              <a href="https://www.aicte-india.org" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>
                AICTE Official Main Portal ↗
              </a>
            </li>
            <li>
              <a href="https://fellowship.aicte-india.org" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>
                Pragati & Saksham Scholarship ↗
              </a>
            </li>
            <li>
              <a href="https://antiragging.in" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>
                National Anti-Ragging Helpline ↗
              </a>
            </li>
            <li>
              <a href="https://pgportal.gov.in" target="_blank" rel="noopener noreferrer" style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>
                CPGRAMS Central Grievance Portal ↗
              </a>
            </li>
          </ul>
        </div>

        {/* Col 3: GIGW Policies */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-3)' }}>
            Policies & Standards
          </h4>
          <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)', padding: 0 }}>
            <li><span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>Accessibility Statement (WCAG 2.1 AA)</span></li>
            <li><span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>Privacy Policy & Data Security</span></li>
            <li><span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>Terms of Redressal & Disclaimer</span></li>
            <li><span style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>Right to Information (RTI) Cell</span></li>
          </ul>
        </div>

        {/* Col 4: Helpline & Contact */}
        <div>
          <h4 style={{ color: '#FFFFFF', fontSize: 'var(--fs-md)', marginBottom: 'var(--sp-3)' }}>
            Contact & Support
          </h4>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)', lineHeight: 1.6 }}>
            Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)', marginTop: 'var(--sp-2)' }}>
            <strong>Helpline:</strong> 1800-11-2525
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: 'var(--fs-xs)' }}>
            <strong>Email:</strong> helpdesk-grievance@aicte-india.org
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.65)', fontSize: '11px', marginTop: 'var(--sp-3)' }}>
            {t.lastUpdated}
          </p>
        </div>
      </div>

      {/* Tricolour rule at bottom */}
      <div className="tricolour-bar" role="presentation">
        <div className="tricolour-saffron" />
        <div className="tricolour-white" />
        <div className="tricolour-green" />
      </div>
    </footer>
  );
};

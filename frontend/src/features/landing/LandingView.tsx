// ==========================================================================
// AICTE NIVARAN · National Technical Grievance Redressal & Institutional Compliance Portal
// Authentic Government Portal Design (Guidelines for Indian Government Websites - GIGW)
// ==========================================================================

import React, { useState } from 'react';
import { useApp } from '../../app/AppProviders';
import { useI18n } from '../../i18n/context';
import { Button } from '../../ui/Button';
import { Icon } from '../../ui/Icon';
import { AccordionItem } from '../../ui/NavigationAndDisclosure';

export const LandingView: React.FC = () => {
  const { navigateToTab, complaints } = useApp();
  const { t } = useI18n();
  const [docketQuery, setDocketQuery] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (docketQuery.trim()) {
      navigateToTab('track', { complaintId: docketQuery.trim() });
    }
  };

  const handleExampleClick = (id: string) => {
    setDocketQuery(id);
    navigateToTab('track', { complaintId: id });
  };

  return (
    <div style={{ width: '100%', minHeight: '100%' }}>
      {/* ── 1. Official Government Public Notice & Advisory Ribbon ── */}
      <aside
        aria-label="Official Public Notice"
        style={{
          backgroundColor: '#0F172A',
          borderBottom: '1px solid #1E293B',
          padding: '8px var(--sp-6)',
          fontSize: 'var(--fs-xs)',
          color: '#F8FAFC'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--sp-4)',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span
              style={{
                backgroundColor: 'var(--action)',
                color: '#FFFFFF',
                padding: '2px 8px',
                borderRadius: '3px',
                fontWeight: 700,
                fontSize: '11px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}
            >
              {t.publicNoticeTag}
            </span>
            <span style={{ color: '#E2E8F0', fontSize: '12.5px' }}>
              <strong style={{ color: '#FFFFFF', marginRight: '6px' }}>
                {t.publicNoticeText.includes(':') ? t.publicNoticeText.split(':')[0] + ':' : ''}
              </strong>
              {t.publicNoticeText.includes(':') ? t.publicNoticeText.split(':')[1] : t.publicNoticeText}
            </span>
          </div>
          <a
            href="https://www.aicte-india.org"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              color: '#93C5FD',
              fontWeight: 600,
              fontSize: '12px',
              textDecoration: 'underline'
            }}
          >
            {t.publicNoticeLink}
          </a>
        </div>
      </aside>

      {/* ── 2. Authoritative Government Banner & Direct Docket Verification Area ── */}
      <section
        style={{
          backgroundColor: 'var(--navy-900)',
          color: '#FFFFFF',
          borderBottom: '4px solid var(--action)',
          padding: 'var(--sp-7) var(--sp-6)'
        }}
      >
        <div
          style={{
            maxWidth: '1280px',
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: 'var(--sp-7)',
            alignItems: 'center'
          }}
        >
          {/* Left Column: Official Mandate & Actions */}
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                padding: '4px 12px',
                borderRadius: 'var(--rad-sm)',
                fontSize: '11px',
                fontWeight: 600,
                color: 'var(--india-saffron)',
                marginBottom: 'var(--sp-3)',
                letterSpacing: '0.03em'
              }}
            >
              <Icon name="shield" size={14} weight="fill" />
              <span>{t.heroRegulationBadge}</span>
            </div>

            <h1
              style={{
                fontSize: 'var(--fs-3xl)',
                color: '#FFFFFF',
                fontWeight: 800,
                lineHeight: 1.25,
                marginBottom: 'var(--sp-3)',
                letterSpacing: '-0.015em'
              }}
            >
              {t.heroTitle}
            </h1>

            <p
              style={{
                fontSize: 'var(--fs-md)',
                color: 'rgba(255, 255, 255, 0.88)',
                lineHeight: 1.55,
                marginBottom: 'var(--sp-5)'
              }}
            >
              {t.heroSubtitle}
            </p>

            <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
              <Button
                variant="primary"
                size="md"
                icon={<Icon name="plus" size={18} />}
                onClick={() => navigateToTab('submit')}
              >
                {t.btnFileComplaint}
              </Button>

              <Button
                variant="outline-white"
                size="md"
                icon={<Icon name="building" size={18} />}
                onClick={() => navigateToTab('discovery')}
              >
                {t.btnTrackDocket}
              </Button>
            </div>
          </div>

          {/* Right Column: Direct Docket Tracking Desk */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              color: 'var(--text)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              boxShadow: 'var(--shadow-2)',
              padding: 'var(--sp-5)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: 'var(--sp-2)' }}>
              <span
                style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: 'var(--rad-sm)',
                  backgroundColor: 'var(--navy-50)',
                  color: 'var(--navy-900)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <Icon name="search" size={18} />
              </span>
              <div>
                <h2 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)' }}>
                  {t.trackCardTitle}
                </h2>
                <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {t.trackCardSubtitle}
                </span>
              </div>
            </div>

            <form onSubmit={handleTrackSubmit} style={{ display: 'flex', gap: '8px', marginTop: 'var(--sp-3)' }}>
              <input
                type="text"
                value={docketQuery}
                onChange={e => setDocketQuery(e.target.value)}
                placeholder={t.trackCardPlaceholder}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rad-sm)',
                  fontSize: 'var(--fs-base)',
                  color: 'var(--text)',
                  backgroundColor: 'var(--surface)'
                }}
                aria-label="Docket Number"
                required
              />
              <Button variant="primary" size="md" icon={<Icon name="search" size={16} />}>
                {t.btnTrack}
              </Button>
            </form>

            {/* Benchmark Regulatory Cases with High-Contrast Accessible Styling */}
            <div style={{ marginTop: 'var(--sp-3)', borderTop: '1px solid var(--border-light)', paddingTop: 'var(--sp-2)' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                {t.sampleDocketsLabel}
              </span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => handleExampleClick('NIV-2026-1042')}
                  style={{
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: 'var(--rad-sm)',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#0284C7', display: 'inline-block' }} />
                  NIV-2026-1042 (Fee Refund)
                </button>
                <button
                  type="button"
                  onClick={() => handleExampleClick('NIV-2026-84920')}
                  style={{
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: 'var(--rad-sm)',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#D97706', display: 'inline-block' }} />
                  NIV-2026-84920 (ATR Pending)
                </button>
                <button
                  type="button"
                  onClick={() => handleExampleClick('NIV-2026-1038')}
                  style={{
                    backgroundColor: '#F8FAFC',
                    color: '#0F172A',
                    border: '1px solid #CBD5E1',
                    borderRadius: 'var(--rad-sm)',
                    padding: '4px 10px',
                    fontSize: '11.5px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }} />
                  NIV-2026-1038 (Certificate Withheld)
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. Four Core Statutory Service Desks ── */}
      <section style={{ maxWidth: '1280px', margin: 'var(--sp-7) auto 0', padding: '0 var(--sp-6)' }}>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
            {t.desksSectionTitle}
          </h2>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            {t.desksSectionSubtitle}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--sp-4)' }}>
          {/* Card 1: Students & Parents */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-1)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--sp-2)' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--rad-sm)',
                    backgroundColor: 'var(--action-tint)',
                    color: 'var(--action)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="user" size={20} weight="bold" />
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {t.deskStudentTitle}
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>
                {t.deskStudentDesc}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="arrow-right" size={14} />}
              onClick={() => navigateToTab('citizen-login')}
              style={{ width: '100%' }}
            >
              {t.deskStudentAction}
            </Button>
          </div>

          {/* Card 2: Faculty & Staff */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-1)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--sp-2)' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--rad-sm)',
                    backgroundColor: 'var(--navy-50)',
                    color: 'var(--navy-800)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="folder" size={20} weight="bold" />
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {t.deskFacultyTitle}
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>
                {t.deskFacultyDesc}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="arrow-right" size={14} />}
              onClick={() => navigateToTab('submit')}
              style={{ width: '100%' }}
            >
              {t.deskFacultyAction}
            </Button>
          </div>

          {/* Card 3: Institute Nodal Officer */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-1)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--sp-2)' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--rad-sm)',
                    backgroundColor: 'var(--ok-surface)',
                    color: 'var(--ok)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="check-circle" size={20} weight="bold" />
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {t.deskNodalTitle}
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>
                {t.deskNodalDesc}
              </p>
            </div>
            <Button
              variant="secondary"
              size="sm"
              icon={<Icon name="arrow-right" size={14} />}
              onClick={() => navigateToTab('admin-login')}
              style={{ width: '100%' }}
            >
              {t.deskNodalAction}
            </Button>
          </div>

          {/* Card 4: AICTE Redressal Bureau */}
          <div
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-5)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxShadow: 'var(--shadow-1)'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: 'var(--sp-2)' }}>
                <span
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--rad-sm)',
                    backgroundColor: 'var(--navy-50)',
                    color: 'var(--navy-900)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon name="shield" size={20} weight="bold" />
                </span>
                <div>
                  <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--navy-900)' }}>
                    {t.deskOfficialTitle}
                  </h3>
                </div>
              </div>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: 'var(--sp-4)' }}>
                {t.deskOfficialDesc}
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              icon={<Icon name="arrow-right" size={14} />}
              onClick={() => navigateToTab('admin-login')}
              style={{ width: '100%' }}
            >
              {t.deskOfficialAction}
            </Button>
          </div>
        </div>
      </section>

      {/* ── 4. Statutory Grievance Categories Directory ── */}
      <section style={{ maxWidth: '1280px', margin: 'var(--sp-7) auto 0', padding: '0 var(--sp-6)' }}>
        <div style={{ marginBottom: 'var(--sp-4)' }}>
          <h2 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', fontWeight: 800 }}>
            Mandated Grievance Classification
          </h2>
          <span style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)' }}>
            Grievances are tracked and escalated according to specific statutory parameters.
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: 'var(--sp-3)' }}>
          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '4px' }}>
              1. Fee Refund & Caution Money Disputes
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Applicable under AICTE Refund Policy for candidates withdrawing admission prior to the notified cutoff date. Enforces statutory deduction limit of max ₹1,000.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '4px' }}>
              2. Retention of Original Documents
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Prohibition on institutions withholding 10th, 12th, or degree certificates, character certificates, or migration slips for coercive fee recovery.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '4px' }}>
              3. Anti-Ragging Regulatory Oversight
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Zero-tolerance reporting coordinated with the Central Anti-Ragging Cell. Automatic high-priority routing to AICTE Regional Director and institutional Anti-Ragging Squad.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '4px' }}>
              4. Women Safety & Internal Complaints Committee (ICC)
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Oversight of mandatory constitution of ICC and adherence to the Sexual Harassment of Women at Workplace (Prevention, Prohibition and Redressal) Act, 2013.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '4px' }}>
              5. AICTE Pragati, Saksham & PMSSS Scholarships
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Grievances concerning delayed verification, non-forwarding of biometric credentials, or erroneous DBT mapping by institutional nodal officers.
            </p>
          </div>

          <div style={{ backgroundColor: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--rad-sm)', padding: 'var(--sp-4)' }}>
            <div style={{ fontWeight: 700, fontSize: '14px', color: 'var(--navy-900)', marginBottom: '4px' }}>
              6. Faculty Standards & Lab Infrastructure
            </div>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45 }}>
              Reporting deficiencies in AICTE-prescribed teacher-cadre ratios, laboratory equipment, library volumes, and physical disability accessibility norms.
            </p>
          </div>
        </div>
      </section>

      {/* ── 5. Transparent National Redressal Performance Register ── */}
      <section style={{ maxWidth: '1280px', margin: 'var(--sp-7) auto 0', padding: '0 var(--sp-6)' }}>
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-md)',
            padding: 'var(--sp-5)'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-4)', flexWrap: 'wrap', gap: '8px' }}>
            <div>
              <h2 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', fontWeight: 800 }}>
                National Technical Redressal Statistics (FY 2026–27)
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                Official statistics published in accordance with AICTE citizen accountability norms.
              </span>
            </div>
            <span style={{ fontSize: '11px', color: 'var(--text-light)' }}>
              Updated Today: 26 Oct 2026
            </span>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--sp-4)',
              textAlign: 'center'
            }}
          >
            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-4)', borderRadius: 'var(--rad-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                {complaints.length + 18420}
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                Total Grievances Lodged
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--ok-surface)', padding: 'var(--sp-4)', borderRadius: 'var(--rad-sm)', border: '1px solid var(--ok-border)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--ok)' }}>
                94.8%
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                Verified Redressal Rate
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--action-tint)', padding: 'var(--sp-4)', borderRadius: 'var(--rad-sm)', border: '1px solid var(--action-border)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--action)' }}>
                14.2 Days
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                Average Disposal Timeline
              </div>
            </div>

            <div style={{ backgroundColor: 'var(--navy-50)', padding: 'var(--sp-4)', borderRadius: 'var(--rad-sm)', border: '1px solid var(--border-light)' }}>
              <div style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--navy-900)' }}>
                9,842
              </div>
              <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', marginTop: '4px' }}>
                Approved Institutions Monitored
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 6. Regulatory Procedures & FAQ ── */}
      <section style={{ maxWidth: '1280px', margin: 'var(--sp-7) auto var(--sp-8)', padding: '0 var(--sp-6)' }}>
        <h2 style={{ fontSize: 'var(--fs-lg)', color: 'var(--navy-900)', fontWeight: 800, marginBottom: 'var(--sp-4)' }}>
          Frequently Asked Questions & Citizen Charter
        </h2>
        <AccordionItem title="What happens after a grievance docket is submitted?" defaultOpen>
          <p style={{ fontSize: '13px', lineHeight: 1.55 }}>
            Upon submission, the complainant receives an official Grievance Docket Number (e.g. NIV-2026-1042). The system matches the respondent institution against the AICTE Permanent ID register and allocates the matter to the designated Bureau (Public Grievance Redressal Cell, Regional Office, or Approval Bureau) under strict statutory 30-day SLA parameters.
          </p>
        </AccordionItem>

        <AccordionItem title="Can an institution close a grievance with generic text?">
          <p style={{ fontSize: '13px', lineHeight: 1.55 }}>
            No. NIVARAN enforces a 5-point Action Taken Report (ATR) verification checklist. Boilerplate responses such as "matter is settled internally" without bank refund transaction IDs or written release orders are rejected. The docket cannot be closed until the complainant formally confirms satisfaction or provides written feedback.
          </p>
        </AccordionItem>

        <AccordionItem title="How does Cross-Bureau Overlap Detection operate?">
          <p style={{ fontSize: '13px', lineHeight: 1.55 }}>
            If multiple students or faculty members report the same systemic issue at an institution (such as withholding caution money), NIVARAN's coordination engine flags the cases into an institutional cluster, appoints a lead coordinating officer, and coordinates joint notices to prevent fragmented redressal.
          </p>
        </AccordionItem>
      </section>
    </div>
  );
};

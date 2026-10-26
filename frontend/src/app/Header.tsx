// ==========================================================================
// NIVARAN · Master Government Header (Header.tsx)
// Fixes Defect D3 (Portal buttons wrap), D4 (Brand wrap), D6 (Sign-out click)
// Adheres strictly to GIGW & AICTE Branding Standards
// ==========================================================================

import React from 'react';
import { useApp } from './AppProviders';
import { useI18n } from '../i18n/context';
import { LanguageSwitch, TextSizeControl, ContrastToggle } from '../ui/A11yControls';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';

export const Header: React.FC = () => {
  const { currentUser, logout, activeTab, navigateToTab } = useApp();
  const { t } = useI18n();

  return (
    <header style={{ width: '100%', zIndex: 1000, position: 'relative' }}>
      {/* 1. Indian Tricolour Hairline (4px) */}
      <div className="tricolour-bar" role="presentation">
        <div className="tricolour-saffron" />
        <div className="tricolour-white" />
        <div className="tricolour-green" />
      </div>

      {/* 2. GIGW Utility Strip */}
      <div
        className="utility-strip"
        style={{
          backgroundColor: 'var(--navy-900)',
          color: '#FFFFFF',
          fontSize: 'var(--fs-xs)',
          padding: '4px var(--sp-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 'var(--sp-2)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)', flexWrap: 'wrap' }}>
          <a href="#main-content" className="skip-link">
            {t.skipToMain}
          </a>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
            <Icon name="eye" size={14} />
            <span>{t.screenReaderInfo}</span>
          </span>
          <span style={{ opacity: 0.8 }}>{t.helpline}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-4)' }}>
          <TextSizeControl />
          <ContrastToggle />
          <LanguageSwitch />
        </div>
      </div>

      {/* 3. Official Brand Row (White background) */}
      <div
        style={{
          backgroundColor: 'var(--surface)',
          padding: 'var(--sp-3) var(--sp-6)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 'var(--sp-4)'
        }}
      >
        {/* Brand Lockup: Authentic AICTE / Govt. of India Masthead */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-4)',
            flexShrink: 0,
            cursor: 'pointer'
          }}
          onClick={() => navigateToTab('home')}
        >
          <img
            src="/aicte-nivaran-logo.png"
            alt="AICTE NIVARAN Official Emblem"
            style={{ height: '54px', width: 'auto', objectFit: 'contain' }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 700,
                color: 'var(--navy-800)',
                letterSpacing: '0.02em',
                lineHeight: 1.2
              }}
            >
              {t.aicteHeaderTitle}
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              <span
                style={{
                  fontWeight: 800,
                  fontSize: 'var(--fs-xl)',
                  color: 'var(--navy-900)',
                  letterSpacing: '0.01em',
                  lineHeight: 1.2
                }}
              >
                {t.portalName}
              </span>
            </div>
            <span
              className="brand-subtitle"
              style={{
                fontSize: '11px',
                color: 'var(--text-muted)',
                fontWeight: 500,
                lineHeight: 1.2
              }}
            >
              {t.portalSubtitle}
            </span>
          </div>
        </div>

        {/* Ministry of Education Lockup */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--sp-3)',
            textAlign: 'right'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--navy-900)' }}>
              {t.govIndia}
            </span>
          </div>
        </div>
      </div>

      {/* 4. Role-Aware Nav Band (Navy-800) */}
      <nav
        aria-label="Primary"
        style={{
          backgroundColor: 'var(--navy-800)',
          color: '#FFFFFF',
          padding: '0 var(--sp-6)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          minHeight: '48px',
          overflowX: 'auto'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-1)', flexWrap: 'nowrap' }}>
          <button
            type="button"
            onClick={() => navigateToTab('home')}
            style={{
              padding: 'var(--sp-3) var(--sp-3)',
              color: '#FFFFFF',
              fontWeight: activeTab === 'home' ? 700 : 500,
              fontSize: 'var(--fs-sm)',
              borderBottom: activeTab === 'home' ? '3px solid var(--action)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              backgroundColor: 'transparent'
            }}
          >
            {t.navHome}
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('submit')}
            style={{
              padding: 'var(--sp-3) var(--sp-3)',
              color: '#FFFFFF',
              fontWeight: activeTab === 'submit' ? 700 : 500,
              fontSize: 'var(--fs-sm)',
              borderBottom: activeTab === 'submit' ? '3px solid var(--action)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              backgroundColor: 'transparent'
            }}
          >
            {t.navSubmit}
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('track')}
            style={{
              padding: 'var(--sp-3) var(--sp-3)',
              color: '#FFFFFF',
              fontWeight: activeTab === 'track' ? 700 : 500,
              fontSize: 'var(--fs-sm)',
              borderBottom: activeTab === 'track' ? '3px solid var(--action)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              backgroundColor: 'transparent'
            }}
          >
            {t.navTrack}
          </button>

          <button
            type="button"
            onClick={() => navigateToTab('discovery')}
            style={{
              padding: 'var(--sp-3) var(--sp-3)',
              color: '#FFFFFF',
              fontWeight: activeTab === 'discovery' ? 700 : 500,
              fontSize: 'var(--fs-sm)',
              borderBottom: activeTab === 'discovery' ? '3px solid var(--action)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              backgroundColor: 'transparent'
            }}
          >
            {t.navDiscovery}
          </button>

          {currentUser?.portalType === 'citizen' && (
            <button
              type="button"
              onClick={() => navigateToTab('my-complaints')}
              style={{
                padding: 'var(--sp-3) var(--sp-3)',
                color: '#FFFFFF',
                fontWeight: activeTab === 'my-complaints' ? 700 : 500,
                fontSize: 'var(--fs-sm)',
                borderBottom: activeTab === 'my-complaints' ? '3px solid var(--action)' : '3px solid transparent',
                whiteSpace: 'nowrap',
                backgroundColor: 'transparent'
              }}
            >
              {t.navMyComplaints}
            </button>
          )}

          {currentUser?.portalType === 'official' && (
            <button
              type="button"
              onClick={() => navigateToTab('admin')}
              style={{
                padding: 'var(--sp-3) var(--sp-3)',
                color: '#FFFFFF',
                fontWeight: activeTab === 'admin' ? 700 : 500,
                fontSize: 'var(--fs-sm)',
                borderBottom: activeTab === 'admin' ? '3px solid var(--action)' : '3px solid transparent',
                whiteSpace: 'nowrap',
                backgroundColor: 'transparent'
              }}
            >
              {t.navAdmin}
            </button>
          )}

          <button
            type="button"
            onClick={() => navigateToTab('hub')}
            style={{
              padding: 'var(--sp-3) var(--sp-3)',
              color: '#FFFFFF',
              fontWeight: activeTab === 'hub' ? 700 : 500,
              fontSize: 'var(--fs-sm)',
              borderBottom: activeTab === 'hub' ? '3px solid var(--action)' : '3px solid transparent',
              whiteSpace: 'nowrap',
              backgroundColor: 'transparent'
            }}
          >
            {t.navHub}
          </button>

        </div>

        {/* Right side: Visitor Auth CTAs or User Profile Pill */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
          {!currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
              {/* Fix D3: white-space: nowrap on portal action buttons */}
              <button
                type="button"
                className="btn-portal-action"
                onClick={() => navigateToTab('citizen-login')}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  padding: '6px 14px',
                  borderRadius: 'var(--rad-sm)',
                  border: '1px solid rgba(255, 255, 255, 0.4)',
                  backgroundColor: 'transparent',
                  cursor: 'pointer'
                }}
              >
                {t.navCitizenPortal}
              </button>

              <button
                type="button"
                className="btn-portal-action"
                onClick={() => navigateToTab('admin-login')}
                style={{
                  whiteSpace: 'nowrap',
                  fontSize: 'var(--fs-xs)',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: 'var(--action)',
                  padding: '6px 14px',
                  borderRadius: 'var(--rad-sm)',
                  border: '1px solid var(--action)',
                  cursor: 'pointer'
                }}
              >
                {t.navOfficialConsole}
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-3)' }}>
              {/* Profile Pill: Ellipsis at 190px */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-2)',
                  backgroundColor: 'rgba(255, 255, 255, 0.1)',
                  padding: '4px 12px',
                  borderRadius: 'var(--rad-full)',
                  fontSize: 'var(--fs-xs)'
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--action)',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '11px'
                  }}
                >
                  {currentUser.name[0]}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '190px' }}>
                  <span style={{ fontWeight: 600, color: '#FFFFFF', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.name}
                  </span>
                  <span style={{ fontSize: '10px', color: 'rgba(255, 255, 255, 0.75)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {currentUser.designation || currentUser.institutionName || currentUser.role}
                  </span>
                </div>
              </div>

              {/* Fix D6: Stable Sign Out button without hover translateY */}
              <Button
                variant="outline-white"
                size="sm"
                onClick={logout}
                icon={<Icon name="sign-out" size={14} />}
                style={{ minHeight: '34px', fontSize: 'var(--fs-xs)' }}
              >
                {t.navSignOut}
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

import React from 'react';
import { translations, Language } from '../locales/translations';
import { Icon } from './Icon';

interface HeaderStripProps {
  lang: Language;
  setLang: (lang: Language) => void;
  fontScale: number;
  setFontScale: (scale: number) => void;
  highContrast: boolean;
  setHighContrast: (val: boolean) => void;
  activeRole: 'complainant' | 'official';
  setActiveRole: (role: 'complainant' | 'official') => void;
  currentUser: { name: string; role: string; institution?: string } | null;
  onOpenLogin: () => void;
  onLogout: () => void;
  onNavigateHome?: () => void;
}

export const HeaderStrip: React.FC<HeaderStripProps> = ({
  lang,
  setLang,
  fontScale,
  setFontScale,
  highContrast,
  setHighContrast,
  activeRole,
  setActiveRole,
  currentUser,
  onOpenLogin,
  onLogout,
  onNavigateHome
}) => {
  const t = translations[lang];

  return (
    <header className="header-master" role="banner">
      <a href="#main-content" className="skip-link">{t.skipToContent}</a>

      {/* Topmost Official Government & Accessibility Strip */}
      <div className="gov-top-bar">
        <div className="container flex items-center justify-between">
          <div className="gov-emblem-cluster flex items-center gap-2">
            <div className="national-emblem" aria-hidden="true">
              🏛️
            </div>
            <div className="gov-text">
              <span className="gov-title">{t.govIndia}</span>
              <span className="gov-sub">{t.ministry}</span>
            </div>
          </div>

          <div className="accessibility-cluster flex items-center gap-3">
            {/* Screen Reader & Audio cue */}
            <button 
              type="button" 
              className="acc-btn flex items-center gap-1"
              title="Screen Reader & Voice Accessibility"
              onClick={() => alert('Screen Reader compatibility enabled (WCAG 2.1 AA / GIGW 3.0 compliant)')}
            >
              <Icon e="🔊" size={14} />
              <span className="hide-on-mobile">{t.screenReader}</span>
            </button>

            {/* High Contrast Mode Toggle */}
            <button
              type="button"
              className={`acc-btn flex items-center gap-1 ${highContrast ? 'acc-active' : ''}`}
              onClick={() => setHighContrast(!highContrast)}
              title="Toggle High Contrast Mode"
            >
              <Icon e="👁️" size={14} />
              <span>{highContrast ? 'Normal' : 'Contrast'}</span>
            </button>

            {/* Font Scaling Controls */}
            <div className="font-scaler flex items-center gap-1" aria-label="Font Size Adjustments">
              <button
                type="button"
                className={`scale-btn ${fontScale < 1 ? 'active' : ''}`}
                onClick={() => setFontScale(0.9)}
                title="Decrease Font Size (A-)"
              >
                A-
              </button>
              <button
                type="button"
                className={`scale-btn ${fontScale === 1 ? 'active' : ''}`}
                onClick={() => setFontScale(1.0)}
                title="Default Font Size (A)"
              >
                A
              </button>
              <button
                type="button"
                className={`scale-btn ${fontScale > 1 ? 'active' : ''}`}
                onClick={() => setFontScale(1.15)}
                title="Increase Font Size (A+)"
              >
                A+
              </button>
            </div>

            {/* Bilingual Switcher */}
            <div className="lang-toggle flex items-center">
              <button
                type="button"
                className={`lang-btn ${lang === 'en' ? 'active-lang' : ''}`}
                onClick={() => setLang('en')}
              >
                English
              </button>
              <span className="lang-divider">|</span>
              <button
                type="button"
                className={`lang-btn ${lang === 'hi' ? 'active-lang' : ''}`}
                onClick={() => setLang('hi')}
              >
                हिन्दी
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main AICTE Branding Strip with Role Switch */}
      <div className="aicte-branding-strip">
        <div className="container flex items-center justify-between branding-inner">
          <div 
            className="brand-lockup flex items-center gap-3"
            onClick={onNavigateHome}
            style={{ cursor: 'pointer' }}
            title="Return to AICTE NIVARAN Home / Landing Page"
          >
            <div className="aicte-logo-box">
              <img 
                src="/aicte-nivaran-logo.png" 
                alt="AICTE NIVARAN Official Emblem" 
                className="aicte-nivaran-emblem-img"
              />
            </div>
            <div className="brand-titles">
              <div className="flex items-center gap-2">
                <h1 className="portal-name">AICTE NIVARAN</h1>
                <span className="nivaran-badge">एआईसीटीई निवारण</span>
              </div>
              <p className="portal-sub">
                {t.aicteName} · <span className="sanskrit-motto">योगः कर्मसु कौशलम्</span>
              </p>
              <p className="portal-small-desc">
                Centralized Technical Grievance Coordination Portal · SIH26264
              </p>
            </div>
          </div>

          {/* Role Switcher Pill (as specified in AICTE Internships pattern) */}
          <div className="header-right-action-cluster flex items-center gap-3">
            <div className="role-switch-container">
              <span className="role-label hide-on-mobile">Active View:</span>
              <div className="role-pill-switch" role="group" aria-label="User Persona Switcher">
                <button
                  type="button"
                  className={`role-tab ${activeRole === 'complainant' ? 'active-role' : ''}`}
                  onClick={() => setActiveRole('complainant')}
                >
                  <Icon e="✅" size={16} />
                  <span>{lang === 'hi' ? 'शिकायतकर्ता' : 'Complainant'}</span>
                </button>
                <button
                  type="button"
                  className={`role-tab ${activeRole === 'official' ? 'active-role' : ''}`}
                  onClick={() => setActiveRole('official')}
                >
                  <span>{lang === 'hi' ? 'एआईसीटीई अधिकारी' : 'AICTE Official'}</span>
                </button>
              </div>
            </div>

            {/* User Auth Status / Sign In Button */}
            <div className="header-auth-cluster flex items-center gap-2">
              {currentUser ? (
                <div className="logged-user-pill flex items-center gap-2">
                  <div className="user-initials-mini">
                    {currentUser.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="logged-meta hide-on-mobile">
                    <span className="logged-name">{currentUser.name}</span>
                    <span className="logged-role">{currentUser.role}</span>
                  </div>
                  <button
                    type="button"
                    className="btn-header-logout"
                    onClick={onLogout}
                    title="Sign Out"
                  >
                    Logout
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  className="btn btn-outline btn-sm btn-header-login flex items-center gap-1"
                  onClick={onOpenLogin}
                >
                  <Icon e="🔐" size={13} />
                  <span>Sign In</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Urgent Helplines Ribbon */}
      <div className="urgent-helplines-strip">
        <div className="container flex items-center justify-between flex-wrap gap-2">
          <div className="helpline-lead flex items-center gap-1">
            <Icon e="⚠️" size={16} />
            <strong className="helpline-title">{t.emergencyHelplines}:</strong>
          </div>
          <div className="helpline-badges flex items-center gap-3 flex-wrap">
            <a href="tel:18001805522" className="helpline-chip chip-ragging">
              <Icon e="📞" size={13} />
              <span>{t.antiRaggingHelpline} (Toll-Free 24x7)</span>
            </a>
            <a href="tel:1091" className="helpline-chip chip-women">
              <Icon e="📞" size={13} />
              <span>{t.womenHelpline}</span>
            </a>
            <a href="tel:1930" className="helpline-chip chip-cyber">
              <Icon e="📞" size={13} />
              <span>{t.cyberHelpline}</span>
            </a>
          </div>
        </div>
      </div>

      <style>{`
        .gov-top-bar {
          background-color: var(--color-navy-900);
          color: #E2E8F0;
          padding: 6px 0;
          font-size: 0.8125rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.12);
        }
        .national-emblem {
          font-size: 1.15rem;
          line-height: 1;
        }
        .gov-title {
          font-weight: 700;
          display: block;
          color: #FFFFFF;
        }
        .gov-sub {
          font-size: 0.72rem;
          color: #CBD5E1;
          display: block;
        }
        .acc-btn {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.25);
          color: #FFFFFF;
          font-size: 0.75rem;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .acc-btn:hover, .acc-active {
          background-color: rgba(255, 255, 255, 0.18);
          border-color: #FFFFFF;
        }
        .font-scaler {
          background: rgba(255, 255, 255, 0.08);
          border-radius: var(--radius-sm);
          padding: 1px 4px;
        }
        .scale-btn {
          background: none;
          border: none;
          color: #CBD5E1;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 6px;
          cursor: pointer;
          border-radius: 2px;
        }
        .scale-btn.active, .scale-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.25);
        }
        .lang-toggle {
          background: rgba(255, 255, 255, 0.1);
          border-radius: var(--radius-sm);
          padding: 2px 6px;
        }
        .lang-btn {
          background: none;
          border: none;
          color: #94A3B8;
          font-size: 0.78rem;
          font-weight: 600;
          cursor: pointer;
          padding: 2px 6px;
        }
        .lang-btn.active-lang {
          color: #FFFFFF;
          font-weight: 700;
        }
        .lang-divider {
          color: rgba(255, 255, 255, 0.3);
          font-size: 0.7rem;
        }

        .aicte-branding-strip {
          background-color: var(--color-surface);
          border-bottom: 2px solid var(--color-brand-orange-500);
          padding: 14px 0;
        }
        .aicte-logo-box {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .aicte-nivaran-emblem-img {
          height: 64px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 2px 6px rgba(11, 42, 91, 0.18));
          transition: transform 0.2s ease;
        }
        .aicte-nivaran-emblem-img:hover {
          transform: scale(1.04) rotate(2deg);
        }
        .portal-name {
          font-size: 1.45rem;
          font-weight: 800;
          color: var(--color-navy-900);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .nivaran-badge {
          font-size: 0.72rem;
          background-color: var(--color-action-600);
          color: #FFFFFF;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          letter-spacing: 0.5px;
        }
        .portal-sub {
          font-size: 0.8125rem;
          color: var(--color-neutral-700);
          font-weight: 600;
          margin-top: 2px;
        }
        .sanskrit-motto {
          color: var(--color-action-600);
          font-style: italic;
          font-weight: 700;
        }
        .portal-small-desc {
          font-size: 0.75rem;
          color: var(--color-neutral-600);
        }

        .role-switch-container {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .role-label {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          font-weight: 600;
        }
        .role-pill-switch {
          display: inline-flex;
          background-color: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          padding: 4px;
          border-radius: var(--radius-pill);
        }
        .role-tab {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-neutral-600);
          background: transparent;
          border: none;
          border-radius: var(--radius-pill);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .role-tab.active-role {
          background-color: var(--color-action-600);
          color: #FFFFFF;
          box-shadow: 0 2px 4px rgba(194, 87, 12, 0.25);
        }

        .header-auth-cluster {
          margin-left: 8px;
        }
        .btn-header-login {
          border-color: var(--color-action-600);
          color: var(--color-action-600);
          font-weight: 700;
          font-size: 0.8rem;
          padding: 5px 12px;
          border-radius: var(--radius-pill);
          cursor: pointer;
        }
        .btn-header-login:hover {
          background-color: var(--color-action-600);
          color: #FFFFFF;
        }
        .logged-user-pill {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          border-radius: var(--radius-pill);
          padding: 3px 8px 3px 4px;
        }
        .user-initials-mini {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: var(--color-brand-blue-600);
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .logged-meta {
          display: flex;
          flex-direction: column;
          line-height: 1.1;
        }
        .logged-name {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-navy-900);
        }
        .logged-role {
          font-size: 0.65rem;
          color: var(--color-neutral-600);
        }
        .btn-header-logout {
          background: none;
          border: none;
          color: #DC2626;
          font-size: 0.72rem;
          font-weight: 700;
          cursor: pointer;
          padding: 2px 6px;
          border-radius: 2px;
          margin-left: 4px;
        }
        .btn-header-logout:hover {
          text-decoration: underline;
        }

        .urgent-helplines-strip {
          background-color: #FFF7ED;
          border-bottom: 1px solid #FFEDD5;
          padding: 6px 0;
          font-size: 0.8125rem;
        }
        .helpline-title {
          color: #9A3412;
          font-size: 0.8125rem;
        }
        .helpline-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          text-decoration: none;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          font-size: 0.78rem;
          transition: transform 0.1s ease;
        }
        .chip-ragging {
          background: #FEE2E2;
          color: #B91C1C;
          border: 1px solid #FCA5A5;
        }
        .chip-women {
          background: #FCE7F3;
          color: #9D174D;
          border: 1px solid #FBCFE8;
        }
        .chip-cyber {
          background: #E0E7FF;
          color: #3730A3;
          border: 1px solid #C7D2FE;
        }

        @media (max-width: 768px) {
          .hide-on-mobile {
            display: none !important;
          }
          .branding-inner {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .portal-name {
            font-size: 1rem;
          }
        }
      `}</style>
    </header>
  );
};

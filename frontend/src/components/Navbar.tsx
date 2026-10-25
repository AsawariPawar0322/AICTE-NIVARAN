import React from 'react';
import { translations, Language } from '../locales/translations';
import { Icon } from './Icon';

export type ActiveTab =
  | 'home'
  | 'citizen'
  | 'admin'
  | 'dashboard'
  | 'file-complaint'
  | 'track'
  | 'chat'
  | 'discord'
  | 'login'
  | 'citizen-login'
  | 'admin-login';

interface NavbarProps {
  lang: Language;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingOtpCount: number;
  onOpenFloatingChat?: () => void;
  isLoggedIn?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  activeTab,
  setActiveTab,
  pendingOtpCount,
  onOpenFloatingChat,
  isLoggedIn = false,
}) => {
  const t = translations[lang];

  const isCitizenArea =
    activeTab === 'citizen' ||
    activeTab === 'dashboard' ||
    activeTab === 'file-complaint' ||
    activeTab === 'track' ||
    activeTab === 'chat' ||
    activeTab === 'citizen-login';

  const isAdminArea = activeTab === 'admin';
  const homeTabActive = activeTab === 'home';

  return (
    <nav className="nb-root" aria-label="Primary navigation">
      {/* ── TOP NAV BAR ── */}
      <div className="nb-bar">
        <div className="container nb-bar-inner">
          {/* Logo lockup */}
          <button
            type="button"
            className="nb-logo-btn"
            onClick={() => setActiveTab('home')}
            aria-label="AICTE NIVARAN — go to home"
          >
            <img src="/aicte-nivaran-logo.png" alt="" className="nb-logo-img" aria-hidden="true" />
            <span className="nb-logo-text">NIVARAN</span>
          </button>

          {/* Primary nav */}
          <div className="nb-nav-items" role="list">
            <button
              type="button"
              role="listitem"
              className={`nb-nav-item ${homeTabActive ? 'nb-nav-active' : ''}`}
              onClick={() => setActiveTab('home')}
              aria-current={homeTabActive ? 'page' : undefined}
            >
              <Icon e="🏠" size={17} />
              <span>Home</span>
            </button>

            <button
              type="button"
              role="listitem"
              className={`nb-nav-item nb-citizen-item ${isCitizenArea ? 'nb-nav-active' : ''}`}
              onClick={() => setActiveTab(isLoggedIn ? 'dashboard' : 'citizen-login')}
              aria-current={isCitizenArea ? 'page' : undefined}
            >
              <Icon e="🎓" size={17} />
              <span>Citizen Portal</span>
              {pendingOtpCount > 0 && (
                <span className="nb-otp-badge" role="status" aria-label={`${pendingOtpCount} OTP pending`}>
                  {pendingOtpCount} OTP
                </span>
              )}
            </button>

            <button
              type="button"
              role="listitem"
              className={`nb-nav-item nb-discord-item ${activeTab === 'discord' ? 'nb-nav-active-discord' : ''}`}
              onClick={() => setActiveTab('discord')}
              aria-current={activeTab === 'discord' ? 'page' : undefined}
            >
              <Icon e="💬" size={17} />
              <span>{t.navDiscord}</span>
              <span className="nb-discord-chip" aria-hidden="true">Peer Hub</span>
            </button>
          </div>

          {/* Right cluster */}
          <div className="nb-right">
            {onOpenFloatingChat && (
              <button
                type="button"
                className="nb-chat-btn"
                onClick={onOpenFloatingChat}
                title="Open AICTE Officer Chat"
              >
                <Icon e="💭" size={15} />
                <span>Officer Chat</span>
                <span className="nb-pulse-dot" aria-hidden="true" />
              </button>
            )}

            <button
              type="button"
              className={`nb-admin-btn ${isAdminArea ? 'nb-admin-active' : ''}`}
              onClick={() => setActiveTab('admin-login')}
              aria-label="Administration portal — for AICTE officials"
              aria-current={isAdminArea ? 'page' : undefined}
            >
              <Icon e="🛡️" size={15} />
              <span>Administration</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── CITIZEN SUB-NAV ── */}
      {isCitizenArea && isLoggedIn && (
        <div className="nb-subnav" role="navigation" aria-label="Citizen services">
          <div className="container nb-subnav-inner">
            <span className="nb-subnav-label" aria-hidden="true">Citizen Services</span>
            <div className="nb-subnav-items" role="list">
              <button
                type="button"
                role="listitem"
                className={`nb-subnav-pill ${(activeTab === 'citizen' || activeTab === 'dashboard') ? 'nb-subnav-active' : ''}`}
                onClick={() => setActiveTab('dashboard')}
              >
                <Icon e="📋" size={14} />
                <span>My Grievances</span>
              </button>

              <button
                type="button"
                role="listitem"
                className={`nb-subnav-pill ${activeTab === 'file-complaint' ? 'nb-subnav-active' : ''}`}
                onClick={() => setActiveTab('file-complaint')}
              >
                <Icon e="📝" size={14} />
                <span>{t.navFileComplaint}</span>
              </button>

              <button
                type="button"
                role="listitem"
                className={`nb-subnav-pill ${activeTab === 'track' ? 'nb-subnav-active' : ''}`}
                onClick={() => setActiveTab('track')}
              >
                <Icon e="🔍" size={14} />
                <span>Track &amp; OTP Closure</span>
                {pendingOtpCount > 0 && (
                  <span className="nb-subnav-badge" role="status" aria-label="Action required">Action Required</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .nb-root {
          background-color: var(--color-navy-900);
          box-shadow: 0 2px 8px rgba(11,42,91,0.2);
          position: sticky;
          top: 0;
          z-index: 200;
        }
        .nb-bar { border-bottom: 1px solid rgba(255,255,255,0.08); }
        .nb-bar-inner {
          display: flex;
          align-items: center;
          gap: 8px;
          min-height: 52px;
        }
        .nb-logo-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 6px 10px 6px 0;
          border-radius: var(--radius-sm);
          flex-shrink: 0;
        }
        .nb-logo-img { height: 28px; width: 28px; object-fit: contain; border-radius: 50%; }
        .nb-logo-text {
          font-size: 0.9rem;
          font-weight: 900;
          letter-spacing: 1.5px;
          color: var(--color-brand-orange-500);
          font-family: var(--font-sans);
        }
        .nb-nav-items { display: flex; align-items: center; gap: 2px; flex: 1; }
        .nb-nav-item {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 14px;
          min-height: 44px;
          background: transparent;
          border: none;
          color: #CBD5E1;
          font-family: var(--font-sans);
          font-size: 0.875rem;
          font-weight: 500;
          border-radius: var(--radius-sm);
          cursor: pointer;
          position: relative;
          transition: background-color 0.15s ease, color 0.15s ease;
          white-space: nowrap;
        }
        .nb-nav-item:hover { background-color: rgba(255,255,255,0.1); color: #fff; }
        .nb-nav-active { color: #fff !important; font-weight: 700; }
        .nb-nav-active::after {
          content: '';
          position: absolute;
          bottom: 0; left: 12px; right: 12px;
          height: 2px;
          background: var(--color-brand-orange-500);
          border-radius: 2px 2px 0 0;
        }
        .nb-citizen-item.nb-nav-active { background-color: rgba(31,95,191,0.25); }
        .nb-otp-badge {
          background: #F59E0B; color: #000;
          font-size: 0.65rem; font-weight: 800;
          padding: 1px 6px; border-radius: var(--radius-pill);
          animation: nb-otp-pulse 2s infinite;
        }
        @keyframes nb-otp-pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        .nb-discord-item { background: rgba(88,101,242,0.12); border: 1px solid rgba(88,101,242,0.25); }
        .nb-discord-item:hover { background: rgba(88,101,242,0.22) !important; }
        .nb-nav-active-discord { background-color: #5865F2 !important; color: #fff !important; }
        .nb-nav-active-discord::after { background: #fff; }
        .nb-discord-chip {
          background: #5865F2; color: #fff;
          font-size: 0.65rem; padding: 1px 6px;
          border-radius: var(--radius-pill); font-weight: 700;
        }
        .nb-right { display: flex; align-items: center; gap: 8px; margin-left: auto; flex-shrink: 0; }
        .nb-chat-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff; padding: 6px 12px;
          border-radius: var(--radius-pill);
          font-size: 0.78rem; font-weight: 600;
          cursor: pointer; font-family: var(--font-sans);
          transition: background-color 0.15s ease; min-height: 34px;
        }
        .nb-chat-btn:hover { background: rgba(255,255,255,0.18); }
        .nb-pulse-dot {
          width: 7px; height: 7px;
          background: #10B981; border-radius: 50%;
          animation: nb-pulse 1.8s infinite; flex-shrink: 0;
        }
        @keyframes nb-pulse {
          0%  { box-shadow: 0 0 0 0 rgba(16,185,129,0.7); }
          70% { box-shadow: 0 0 0 5px rgba(16,185,129,0); }
          100%{ box-shadow: 0 0 0 0 rgba(16,185,129,0); }
        }
        .nb-admin-btn {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(194,87,12,0.15);
          border: 1px solid rgba(194,87,12,0.4);
          color: var(--color-brand-orange-500);
          padding: 7px 14px; border-radius: var(--radius-sm);
          font-size: 0.825rem; font-weight: 700;
          cursor: pointer; font-family: var(--font-sans);
          transition: background-color 0.15s ease; min-height: 36px; white-space: nowrap;
        }
        .nb-admin-btn:hover { background: rgba(194,87,12,0.28); color: #fff; }
        .nb-admin-active { background-color: var(--color-action-600) !important; border-color: var(--color-action-600) !important; color: #fff !important; }
        .nb-subnav { background-color: #0E3673; border-top: 1px solid rgba(255,255,255,0.07); }
        .nb-subnav-inner { display: flex; align-items: center; gap: 8px; padding-top: 6px; padding-bottom: 6px; flex-wrap: wrap; }
        .nb-subnav-label { font-size: 0.72rem; font-weight: 800; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.8px; white-space: nowrap; margin-right: 4px; }
        .nb-subnav-items { display: flex; align-items: center; gap: 6px; flex-wrap: wrap; }
        .nb-subnav-pill {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(255,255,255,0.07);
          border: 1px solid rgba(255,255,255,0.12);
          color: #CBD5E1; font-size: 0.8rem; font-weight: 500;
          padding: 5px 12px; border-radius: var(--radius-pill);
          cursor: pointer; font-family: var(--font-sans);
          transition: all 0.15s ease; min-height: 32px; white-space: nowrap;
        }
        .nb-subnav-pill:hover { background: rgba(255,255,255,0.15); color: #fff; }
        .nb-subnav-active { background-color: #fff !important; color: var(--color-navy-900) !important; font-weight: 700 !important; border-color: #fff !important; }
        .nb-subnav-badge { background: #F59E0B; color: #000; font-size: 0.62rem; font-weight: 800; padding: 1px 6px; border-radius: var(--radius-pill); }
        @media (max-width: 768px) {
          .nb-logo-text { display: none; }
          .nb-chat-btn span { display: none; }
          .nb-discord-chip { display: none; }
          .nb-nav-item span { display: none; }
          .nb-admin-btn span { display: none; }
        }
      `}</style>
    </nav>
  );
};

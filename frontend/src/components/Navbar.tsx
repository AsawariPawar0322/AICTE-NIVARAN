import React from 'react';
import { translations, Language } from '../locales/translations';
import { 
  Home, 
  LayoutDashboard, 
  FilePlus2, 
  SearchCheck, 
  MessageSquareText, 
  MessagesSquare, 
  BellRing,
  LogIn
} from 'lucide-react';

export type ActiveTab = 'home' | 'dashboard' | 'file-complaint' | 'track' | 'chat' | 'discord' | 'login';

interface NavbarProps {
  lang: Language;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  pendingOtpCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  activeTab,
  setActiveTab,
  pendingOtpCount
}) => {
  const t = translations[lang];

  return (
    <nav className="main-navbar" aria-label="Primary Navigation">
      <div className="container flex items-center justify-between navbar-row">
        <div className="nav-links flex items-center gap-1 flex-wrap">
          <button
            type="button"
            className={`nav-item ${activeTab === 'home' ? 'active' : ''}`}
            onClick={() => setActiveTab('home')}
          >
            <Home size={18} />
            <span>{t.navHome}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>{t.navDashboard}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'file-complaint' ? 'active' : ''}`}
            onClick={() => setActiveTab('file-complaint')}
          >
            <FilePlus2 size={18} />
            <span>{t.navFileComplaint}</span>
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'track' ? 'active' : ''}`}
            onClick={() => setActiveTab('track')}
          >
            <SearchCheck size={18} />
            <span>{t.navTrack}</span>
            {pendingOtpCount > 0 && (
              <span className="nav-badge-alert" title="Citizen OTP Acknowledgment Pending!">
                OTP
              </span>
            )}
          </button>

          <button
            type="button"
            className={`nav-item ${activeTab === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveTab('chat')}
          >
            <MessageSquareText size={18} />
            <span>{t.navChat}</span>
            <span className="nav-badge-online">Live</span>
          </button>

          <button
            type="button"
            className={`nav-item discord-nav-item ${activeTab === 'discord' ? 'active-discord' : ''}`}
            onClick={() => setActiveTab('discord')}
          >
            <MessagesSquare size={18} />
            <span>{t.navDiscord}</span>
            <span className="discord-chip">Coordination Hub</span>
          </button>

          <button
            type="button"
            className={`nav-item login-nav-tab ${activeTab === 'login' ? 'active' : ''}`}
            onClick={() => setActiveTab('login')}
          >
            <LogIn size={18} />
            <span>Portal Login</span>
          </button>
        </div>

        <div className="nav-right-cluster flex items-center gap-3 hide-on-mobile">
          <div className="nav-brand-indicator flex items-center gap-2">
            <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN" className="nav-mini-logo" />
            <span className="nav-brand-title">NIVARAN</span>
          </div>
          <div className="nav-status-badge flex items-center gap-2">
            <BellRing size={16} className="text-muted" />
            <span className="live-sla-indicator">
              <span className="pulse-dot"></span>
              72h SLA Active
            </span>
          </div>
        </div>
      </div>

      <style>{`
        .main-navbar {
          background-color: var(--color-navy-900);
          color: #FFFFFF;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 2px 8px rgba(11, 42, 91, 0.15);
        }
        .navbar-row {
          padding-top: 4px;
          padding-bottom: 4px;
        }
        .nav-item {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 10px 14px;
          min-height: 42px;
          background: transparent;
          border: none;
          color: #E2E8F0;
          font-family: var(--font-sans);
          font-size: 0.9rem;
          font-weight: 500;
          border-radius: var(--radius-sm);
          cursor: pointer;
          position: relative;
          transition: background-color 0.15s ease, color 0.15s ease;
        }
        .nav-item:hover {
          background-color: rgba(255, 255, 255, 0.12);
          color: #FFFFFF;
        }
        .nav-item.active {
          background-color: var(--color-brand-blue-600);
          color: #FFFFFF;
          font-weight: 600;
        }
        .discord-nav-item {
          background: rgba(88, 101, 242, 0.15);
          border: 1px solid rgba(88, 101, 242, 0.35);
        }
        .discord-nav-item:hover {
          background: rgba(88, 101, 242, 0.28);
        }
        .discord-nav-item.active-discord {
          background-color: #5865F2 !important;
          color: #FFFFFF !important;
        }
        .discord-chip {
          background: #5865F2;
          color: #FFFFFF;
          font-size: 0.7rem;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
          font-weight: 600;
        }
        .nav-badge-alert {
          background-color: #F59E0B;
          color: #000000;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: var(--radius-pill);
          animation: pulseOtp 2s infinite;
        }
        @keyframes pulseOtp {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        .nav-badge-online {
          background-color: #10B981;
          color: #FFFFFF;
          font-size: 0.68rem;
          font-weight: 700;
          padding: 1px 5px;
          border-radius: var(--radius-pill);
        }
        .live-sla-indicator {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #CBD5E1;
          font-weight: 500;
        }
        .pulse-dot {
          width: 8px;
          height: 8px;
          background-color: #10B981;
          border-radius: 50%;
          box-shadow: 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulseDot 1.8s infinite;
        }
        @keyframes pulseDot {
          0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
          70% { box-shadow: 0 0 0 6px rgba(16, 185, 129, 0); }
          100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }
        .nav-brand-indicator {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 2px 10px;
          border-radius: var(--radius-pill);
        }
        .nav-mini-logo {
          height: 24px;
          width: 24px;
          object-fit: contain;
          border-radius: 50%;
        }
        .nav-brand-title {
          font-size: 0.8rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--color-brand-orange-500);
        }
      `}</style>
    </nav>
  );
};

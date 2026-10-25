import React, { useState } from 'react';
import { Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Icon } from '../components/Icon';
import {
  ShieldStar,
  Buildings,
  UserCircleGear
} from '@phosphor-icons/react';

interface AdminLoginViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  onLoginSuccess: (userProfile: {
    name: string;
    role: string;
    institution?: string;
    rollOrId?: string;
    mobile?: string;
  }) => void;
}

export const AdminLoginView: React.FC<AdminLoginViewProps> = ({
  lang,
  setActiveTab,
  onLoginSuccess
}) => {
  const [officialId, setOfficialId] = useState('PGRC-DIR-0842');
  const [officialPin, setOfficialPin] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [selectedPersona, setSelectedPersona] = useState<'officer' | 'nodal' | null>(null);
  const [error, setError] = useState('');

  const personas = [
    {
      key: 'officer' as const,
      icon: <ShieldStar size={26} weight="duotone" />,
      name: 'Dr. Ramesh Chandra Verma',
      role: 'AICTE Official',
      designation: 'Director, PGRC · AICTE Central HQ',
      id: 'PGRC-DIR-0842',
    },
    {
      key: 'nodal' as const,
      icon: <UserCircleGear size={26} weight="duotone" />,
      name: 'Prof. K. S. Rao',
      role: 'Institute Nodal Officer',
      designation: 'Registrar · Delhi Technological University',
      id: 'DTU-NODAL-14',
    },
  ];

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!officialId.trim()) {
      setError('Please enter your Employee / Nodal ID.');
      return;
    }
    // Accept any non-empty credentials for demo
    const persona = personas.find(p => p.id === officialId) || personas[0];
    onLoginSuccess({
      name: persona.name,
      role: persona.role,
      institution: persona.designation,
      rollOrId: officialId
    });
    setActiveTab('admin');
  };

  const handleDemoPersona = (p: typeof personas[0]) => {
    onLoginSuccess({
      name: p.name,
      role: p.role,
      institution: p.designation,
      rollOrId: p.id
    });
    setActiveTab('admin');
  };

  return (
    <div className="al-root" id="main-content">
      <div className="container al-container">

        <button type="button" className="al-back-btn" onClick={() => setActiveTab('home')}>
          <Icon e="←" size={16} />
          <span>Back to Home</span>
        </button>

        <div className="al-grid">
          {/* ── LEFT BRAND PANE ── */}
          <div className="al-brand-pane">
            <div className="al-brand-header">
              <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN" className="al-brand-logo" />
              <div>
                <span className="al-brand-name">AICTE NIVARAN</span>
                <span className="al-brand-sub">एआईसीटीई निवारण</span>
              </div>
            </div>

            <div className="al-admin-badge">
              <Icon e="🛡️" size={15} />
              <span>Administration Portal</span>
            </div>

            <h2 className="al-brand-heading">Bureau Command<br />& Coordination</h2>
            <p className="al-brand-desc">
              Secure access for AICTE bureau officers and college nodal grievance officers. Review dockets, dispatch notices, and coordinate multi-case institutional clusters.
            </p>

            <div className="al-features-list">
              <div className="al-feat-item">
                <Icon e="📊" size={16} />
                <span><strong>Bureau Grievance Ledger</strong> — live cases across all cells</span>
              </div>
              <div className="al-feat-item">
                <Icon e="🔗" size={16} />
                <span><strong>Intelligent Case Linker</strong> — SIH26264 multi-case clustering</span>
              </div>
              <div className="al-feat-item">
                <Icon e="⏱️" size={16} />
                <span><strong>72h SLA Radar</strong> — auto-escalation to Ombudsman</span>
              </div>
              <div className="al-feat-item">
                <Icon e="✅" size={16} />
                <span><strong>Compliance Matrix</strong> — institutional oversight dashboard</span>
              </div>
            </div>

            {/* Demo personas */}
            <div className="al-demo-box">
              <div className="al-demo-header">
                <Icon e="✨" size={14} />
                <strong>Evaluator Quick-Logins</strong>
              </div>
              <div className="al-demo-personas">
                {personas.map((p) => (
                  <button
                    key={p.key}
                    type="button"
                    className={`al-persona-btn ${selectedPersona === p.key ? 'al-persona-active' : ''}`}
                    onClick={() => handleDemoPersona(p)}
                  >
                    <span className="al-persona-emoji">{p.icon}</span>
                    <div className="al-persona-meta">
                      <strong>{p.name}</strong>
                      <span>{p.designation}</span>
                    </div>
                    <Icon e="→" size={13} className="al-persona-arrow" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT FORM PANE ── */}
          <div className="al-form-pane">
            <div className="al-form-header">
              <div className="al-form-icon">
                <Icon e="🔒" size={22} />
              </div>
              <div>
                <h3 className="al-form-title">Officer Sign In</h3>
                <p className="al-form-sub">For AICTE Head Office, Regional Bureaus, and Institute Nodal Grievance Officers.</p>
              </div>
            </div>

            <form onSubmit={handleLogin} className="al-form">
              <div className="al-field">
                <label className="al-label" htmlFor="al-official-id">
                  Employee / Nodal Officer ID
                </label>
                <div className="al-input-wrap">
                  <Icon e="🏢" size={17} className="al-input-icon" />
                  <input
                    id="al-official-id"
                    type="text"
                    className="al-input al-input-icon-pad al-mono"
                    placeholder="e.g. PGRC-DIR-0842 or DTU-NODAL-14"
                    value={officialId}
                    onChange={(e) => setOfficialId(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="al-field">
                <label className="al-label" htmlFor="al-pin">Security PIN / Password</label>
                <div className="al-input-wrap">
                  <Icon e="🔒" size={17} className="al-input-icon" />
                  <input
                    id="al-pin"
                    type={showPin ? 'text' : 'password'}
                    className="al-input al-input-icon-pad al-input-pin-pad"
                    placeholder="Enter your secure PIN"
                    value={officialPin}
                    onChange={(e) => setOfficialPin(e.target.value)}
                  />
                  <button
                    type="button"
                    className="al-toggle-pin"
                    onClick={() => setShowPin(!showPin)}
                    aria-label={showPin ? 'Hide PIN' : 'Show PIN'}
                  >
                    {showPin ? <Icon e="🙈" size={16} /> : <Icon e="👁️" size={16} />}
                  </button>
                </div>
                <small className="al-helper">For demo, any value is accepted — use the quick-login buttons for one-click access.</small>
              </div>

              {error && <p className="al-error" role="alert">{error}</p>}

              <button type="submit" className="al-btn-primary">
                <Icon e="🔒" size={17} />
                <span>Authorize Officer Session</span>
                <Icon e="→" size={17} />
              </button>
            </form>

            {/* Info panel */}
            <div className="al-info-panel">
              <Icon e="ℹ️" size={16} className="al-info-icon" />
              <p className="al-info-text">
                This portal is restricted to authorised AICTE personnel. All actions are logged in the immutable audit trail. Unauthorised access attempts are reported to the AICTE IT Security Cell.
              </p>
            </div>

            {/* Switch to citizen */}
            <div className="al-switch-portal">
              <span>Are you a student or parent?</span>
              <button type="button" className="al-switch-btn" onClick={() => setActiveTab('citizen-login')}>
                Go to Citizen Portal →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .al-root {
          min-height: calc(100vh - 160px);
          background: linear-gradient(160deg, #F3F5F8 0%, #EEF2F7 100%);
          padding: 40px 0 72px;
        }
        .al-container { max-width: 980px; }

        .al-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: none;
          border: none;
          color: var(--color-neutral-600);
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          margin-bottom: 24px;
          padding: 0;
          font-family: var(--font-sans);
        }
        .al-back-btn:hover { color: var(--color-navy-900); }

        .al-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-modal);
          border: 1px solid var(--color-neutral-300);
        }

        /* BRAND PANE */
        .al-brand-pane {
          background: #0E2A5C;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
        }
        .al-brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .al-brand-logo {
          width: 54px;
          height: 54px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
        }
        .al-brand-name {
          display: block;
          font-size: 1.3rem;
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.3px;
        }
        .al-brand-sub {
          display: block;
          font-size: 0.75rem;
          color: var(--color-brand-orange-500);
          font-weight: 700;
          margin-top: 3px;
        }
        .al-admin-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(194,87,12,0.2);
          border: 1px solid rgba(194,87,12,0.4);
          color: var(--color-brand-orange-500);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          margin-bottom: 20px;
          width: fit-content;
        }
        .al-brand-heading {
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 14px;
        }
        .al-brand-desc {
          font-size: 0.875rem;
          color: #94A3B8;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .al-features-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 28px;
        }
        .al-feat-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 0.82rem;
          color: #CBD5E1;
        }
        .al-feat-item svg { color: var(--color-brand-orange-500); flex-shrink: 0; margin-top: 1px; }
        .al-feat-item strong { color: #E2E8F0; }
        .al-demo-box {
          background: rgba(255,255,255,0.06);
          border: 1px dashed rgba(255,255,255,0.18);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-top: auto;
        }
        .al-demo-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
        }
        .al-demo-header svg { color: #FDE68A; }
        .al-demo-header strong { font-size: 0.8rem; color: #FDE68A; }
        .al-demo-personas { display: flex; flex-direction: column; gap: 8px; }
        .al-persona-btn {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: var(--radius-sm);
          padding: 10px 12px;
          cursor: pointer;
          text-align: left;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
          color: #fff;
        }
        .al-persona-btn:hover { background-color: rgba(194,87,12,0.25); border-color: var(--color-brand-orange-500); }
        .al-persona-active { background-color: rgba(194,87,12,0.3) !important; border-color: var(--color-brand-orange-500) !important; }
        .al-persona-emoji { display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .al-persona-meta { flex: 1; min-width: 0; }
        .al-persona-meta strong { display: block; font-size: 0.8rem; color: #fff; }
        .al-persona-meta span { display: block; font-size: 0.72rem; color: #94A3B8; margin-top: 2px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .al-persona-arrow { color: var(--color-brand-orange-500); flex-shrink: 0; }

        /* FORM PANE */
        .al-form-pane {
          background: #fff;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
        }
        .al-form-header {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          margin-bottom: 28px;
        }
        .al-form-icon {
          width: 44px;
          height: 44px;
          background: #FFF7ED;
          border: 1px solid #FFEDD5;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-action-600);
          flex-shrink: 0;
        }
        .al-form-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0 0 4px;
          line-height: 1.2;
        }
        .al-form-sub {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          line-height: 1.5;
        }
        .al-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
        .al-field { display: flex; flex-direction: column; gap: 6px; }
        .al-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-neutral-700);
        }
        .al-input-wrap { position: relative; display: flex; align-items: center; }
        .al-input-icon {
          position: absolute;
          left: 12px;
          color: var(--color-neutral-400);
          pointer-events: none;
        }
        .al-toggle-pin {
          position: absolute;
          right: 12px;
          background: none;
          border: none;
          color: var(--color-neutral-400);
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0;
        }
        .al-toggle-pin:hover { color: var(--color-neutral-700); }
        .al-input {
          width: 100%;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 11px 12px;
          font-size: 0.9rem;
          font-family: var(--font-sans);
          color: var(--color-neutral-900);
          outline: none;
          background: #fff;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }
        .al-input:focus { border-color: var(--color-action-600); box-shadow: 0 0 0 3px rgba(194,87,12,0.1); }
        .al-input-icon-pad { padding-left: 40px; }
        .al-input-pin-pad { padding-right: 40px; }
        .al-mono { font-family: var(--font-mono); }
        .al-helper { font-size: 0.78rem; color: var(--color-neutral-500); }
        .al-error { font-size: 0.8rem; color: var(--color-danger-text); font-weight: 600; margin: 0; }

        .al-btn-primary {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: var(--color-action-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 13px 20px;
          font-size: 0.975rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 48px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
        }
        .al-btn-primary:hover { background-color: var(--color-action-700); }

        .al-info-panel {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          background: #FFF7ED;
          border: 1px solid #FFEDD5;
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          margin-bottom: 20px;
        }
        .al-info-icon { color: var(--color-action-600); flex-shrink: 0; margin-top: 1px; }
        .al-info-text { font-size: 0.78rem; color: #78350F; line-height: 1.5; margin: 0; }

        .al-switch-portal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--color-neutral-200);
          padding-top: 16px;
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          margin-top: auto;
        }
        .al-switch-btn {
          background: none;
          border: none;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-brand-blue-600);
          cursor: pointer;
          text-decoration: underline;
          font-family: var(--font-sans);
        }

        @media (max-width: 720px) {
          .al-grid { grid-template-columns: 1fr; }
          .al-brand-pane { padding: 28px 24px; }
          .al-form-pane { padding: 28px 24px; }
        }
      `}</style>
    </div>
  );
};

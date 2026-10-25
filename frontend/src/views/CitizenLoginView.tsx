import React, { useState } from 'react';
import { Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Icon } from '../components/Icon';
import {
  GraduationCap,
  ChalkboardTeacher,
  UsersThree
} from '@phosphor-icons/react';

interface CitizenLoginViewProps {
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

export const CitizenLoginView: React.FC<CitizenLoginViewProps> = ({
  lang,
  setActiveTab,
  onLoginSuccess
}) => {
  const [complainantType, setComplainantType] = useState<'Student' | 'Faculty' | 'Parent'>('Student');
  const [identifier, setIdentifier] = useState('+91 98712 34567');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');
  const [guestCaseId, setGuestCaseId] = useState('');

  const roleConfig: Record<'Student' | 'Faculty' | 'Parent', {
    icon: React.ReactNode;
    desc: string;
  }> = {
    Student: {
      icon: <GraduationCap size={26} weight="duotone" />,
      desc: 'Enrolled at an AICTE-approved institution'
    },
    Faculty: {
      icon: <ChalkboardTeacher size={26} weight="duotone" />,
      desc: 'Teaching staff at a recognised college'
    },
    Parent: {
      icon: <UsersThree size={26} weight="duotone" />,
      desc: 'Parent or guardian of an enrolled student'
    },
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;
    setIsOtpSent(true);
    setOtpError('');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode.trim() === '849210' || otpCode.trim().length === 6) {
      onLoginSuccess({
        name: 'Aarav Sharma',
        role: complainantType,
        institution: 'Delhi Technological University (DTU)',
        rollOrId: '2024-CS-108',
        mobile: identifier
      });
      setActiveTab('dashboard');
    } else {
      setOtpError('Invalid OTP. Use demo code 849210.');
    }
  };

  const handleDemoLogin = () => {
    onLoginSuccess({
      name: 'Aarav Sharma',
      role: 'Student',
      institution: 'Delhi Technological University (DTU)',
      rollOrId: '2024-CS-108',
      mobile: '+91 98712 34567'
    });
    setActiveTab('dashboard');
  };

  return (
    <div className="cl-root" id="main-content">
      <div className="container cl-container">

        {/* ── Back button ── */}
        <button type="button" className="cl-back-btn" onClick={() => setActiveTab('home')}>
          <Icon e="←" size={16} />
          <span>Back to Home</span>
        </button>

        <div className="cl-grid">
          {/* ── LEFT BRAND PANE ── */}
          <div className="cl-brand-pane">
            <div className="cl-brand-header">
              <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN" className="cl-brand-logo" />
              <div>
                <span className="cl-brand-name">AICTE NIVARAN</span>
                <span className="cl-brand-sub">एआईसीटीई निवारण</span>
              </div>
            </div>

            <div className="cl-citizen-badge">
              <Icon e="🎓" size={16} />
              <span>Citizen Portal</span>
            </div>

            <h2 className="cl-brand-heading">Your Grievance.<br />Your Resolution.</h2>
            <p className="cl-brand-desc">
              Secure OTP-based sign in for students, faculty, and parents. File, track, and enforce resolution across 12,000+ AICTE institutions.
            </p>

            <div className="cl-security-list">
              <div className="cl-sec-item">
                <Icon e="✅" size={16} />
                <span>256-Bit SSL · GIGW 3.0 Compliant</span>
              </div>
              <div className="cl-sec-item">
                <Icon e="🔑" size={16} />
                <span>OTP-Authenticated Case Closure</span>
              </div>
              <div className="cl-sec-item">
                <Icon e="🪪" size={16} />
                <span>DigiLocker & Aadhaar e-KYC Ready</span>
              </div>
            </div>

            {/* Demo persona box */}
            <div className="cl-demo-box">
              <div className="cl-demo-header">
                <Icon e="✨" size={14} />
                <strong>Evaluator Quick-Login</strong>
              </div>
              <p className="cl-demo-sub">One-click demo with pending OTP refund case pre-loaded</p>
              <button type="button" className="cl-demo-btn" onClick={handleDemoLogin}>
                <GraduationCap size={16} weight="duotone" style={{ marginRight: 6, verticalAlign: 'middle' }} />
                Aarav Sharma · DTU CSE Student (Has Pending OTP)
              </button>
            </div>
          </div>

          {/* ── RIGHT FORM PANE ── */}
          <div className="cl-form-pane">
            <div className="cl-form-header">
              <h3 className="cl-form-title">Citizen Sign In</h3>
              <p className="cl-form-sub">Enter your registered mobile number or email to receive a secure 6-digit OTP.</p>
            </div>

            {/* Role selector */}
            <div className="cl-role-selector">
              <span className="cl-role-label">I am a:</span>
              <div className="cl-role-tabs">
                {(['Student', 'Faculty', 'Parent'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`cl-role-tab ${complainantType === r ? 'cl-role-active' : ''}`}
                    onClick={() => setComplainantType(r)}
                  >
                    <span className="cl-role-icon">{roleConfig[r].icon}</span>
                    <span>{r}</span>
                  </button>
                ))}
              </div>
              <p className="cl-role-desc">{roleConfig[complainantType].desc}</p>
            </div>

            {/* OTP Flow */}
            {!isOtpSent ? (
              <form onSubmit={handleSendOtp} className="cl-form">
                <div className="cl-field">
                  <label className="cl-label" htmlFor="cl-identifier">
                    Mobile Number or Email Address
                  </label>
                  <div className="cl-input-wrap">
                    <Icon e="??" size={17} className="cl-input-icon" />
                    <input
                      id="cl-identifier"
                      type="text"
                      className="cl-input cl-input-icon-pad"
                      placeholder="+91 98712 34567 or email@example.com"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      required
                    />
                  </div>
                  <small className="cl-helper">A 6-digit verification code will be sent instantly.</small>
                </div>

                <button type="submit" className="cl-btn-primary">
                  <span>Send 6-Digit OTP</span>
                  <Icon e="?" size={18} />
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="cl-form">
                <div className="cl-otp-sent-banner">
                  <div className="cl-otp-sent-left">
                    <Icon e="?" size={16} className="cl-sent-icon" />
                    <span>Code sent to <strong>{identifier}</strong></span>
                  </div>
                  <button type="button" className="cl-change-btn" onClick={() => setIsOtpSent(false)}>
                    Change
                  </button>
                </div>

                <div className="cl-field">
                  <div className="cl-label-row">
                    <label className="cl-label" htmlFor="cl-otp">Enter 6-Digit OTP</label>
                    <button
                      type="button"
                      className="cl-autofill-btn"
                      onClick={() => setOtpCode('849210')}
                    >
                      Auto-fill demo: 849210
                    </button>
                  </div>
                  <input
                    id="cl-otp"
                    type="text"
                    className="cl-input cl-otp-input"
                    maxLength={6}
                    placeholder="– – – – – –"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                  />
                  {otpError && <p className="cl-error" role="alert">{otpError}</p>}
                </div>

                <button type="submit" className="cl-btn-primary">
                  <Icon e="?" size={18} />
                  <span>Verify &amp; Access Dashboard</span>
                </button>

                <div className="cl-resend-row">
                  <span>Didn't receive the code?</span>
                  <button
                    type="button"
                    className="cl-resend-btn"
                    onClick={() => alert('New OTP dispatched: 849210')}
                  >
                    <Icon e="??" size={13} />
                    Resend OTP
                  </button>
                </div>
              </form>
            )}

            {/* Divider */}
            <div className="cl-divider"><span>or</span></div>

            {/* Guest track */}
            <div className="cl-guest-track">
              <p className="cl-guest-label">Track an existing case without signing in</p>
              <div className="cl-guest-row">
                <input
                  type="text"
                  className="cl-input cl-mono"
                  placeholder="AICTE-2026-GRV-84920"
                  value={guestCaseId}
                  onChange={(e) => setGuestCaseId(e.target.value)}
                  aria-label="Enter case ID"
                />
                <button
                  type="button"
                  className="cl-track-btn"
                  onClick={() => setActiveTab('track')}
                >
                  <Icon e="??" size={15} />
                  <span>Track</span>
                </button>
              </div>
            </div>

            {/* Admin redirect */}
            <div className="cl-switch-portal">
              <span>Are you an AICTE officer?</span>
              <button type="button" className="cl-switch-btn" onClick={() => setActiveTab('admin-login')}>
                Go to Administration Portal →
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .cl-root {
          min-height: calc(100vh - 160px);
          background: linear-gradient(160deg, #F3F5F8 0%, #EEF2F7 100%);
          padding: 40px 0 72px;
        }
        .cl-container { max-width: 980px; }

        .cl-back-btn {
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
        .cl-back-btn:hover { color: var(--color-navy-900); }

        .cl-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-modal);
          border: 1px solid var(--color-neutral-300);
        }

        /* ── BRAND PANE ── */
        .cl-brand-pane {
          background: var(--color-navy-900);
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .cl-brand-header {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 20px;
        }
        .cl-brand-logo {
          width: 56px;
          height: 56px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.35));
        }
        .cl-brand-name {
          display: block;
          font-size: 1.3rem;
          font-weight: 900;
          color: #fff;
          line-height: 1;
          letter-spacing: -0.3px;
        }
        .cl-brand-sub {
          display: block;
          font-size: 0.75rem;
          color: var(--color-brand-orange-500);
          font-weight: 700;
          margin-top: 3px;
        }
        .cl-citizen-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(31,95,191,0.25);
          border: 1px solid rgba(96,165,250,0.4);
          color: #93C5FD;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          margin-bottom: 20px;
          width: fit-content;
        }
        .cl-brand-heading {
          font-size: 1.6rem;
          font-weight: 900;
          color: #fff;
          line-height: 1.25;
          margin-bottom: 14px;
        }
        .cl-brand-desc {
          font-size: 0.875rem;
          color: #94A3B8;
          line-height: 1.6;
          margin-bottom: 24px;
        }
        .cl-security-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
        }
        .cl-sec-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8rem;
          color: #CBD5E1;
        }
        .cl-sec-item svg { color: var(--color-brand-orange-500); flex-shrink: 0; }
        .cl-demo-box {
          background: rgba(255,255,255,0.06);
          border: 1px dashed rgba(255,255,255,0.2);
          border-radius: var(--radius-md);
          padding: 16px;
          margin-top: auto;
        }
        .cl-demo-header {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 4px;
        }
        .cl-demo-header svg { color: #FDE68A; }
        .cl-demo-header strong { font-size: 0.8rem; color: #FDE68A; }
        .cl-demo-sub {
          font-size: 0.75rem;
          color: #94A3B8;
          margin-bottom: 10px;
        }
        .cl-demo-btn {
          width: 100%;
          background: rgba(255,255,255,0.1);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          font-size: 0.8rem;
          padding: 9px 12px;
          border-radius: var(--radius-sm);
          text-align: left;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
        }
        .cl-demo-btn:hover { background-color: var(--color-action-600); border-color: var(--color-action-600); }

        /* ── FORM PANE ── */
        .cl-form-pane {
          background: #fff;
          padding: 40px 36px;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .cl-form-header { margin-bottom: 24px; }
        .cl-form-title {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0 0 6px;
        }
        .cl-form-sub {
          font-size: 0.875rem;
          color: var(--color-neutral-600);
          line-height: 1.5;
        }

        .cl-role-selector { margin-bottom: 24px; }
        .cl-role-label {
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          display: block;
          margin-bottom: 8px;
        }
        .cl-role-tabs {
          display: flex;
          gap: 8px;
          margin-bottom: 8px;
        }
        .cl-role-tab {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 10px 8px;
          background: var(--color-neutral-100);
          border: 2px solid var(--color-neutral-200);
          border-radius: var(--radius-md);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--color-neutral-600);
          transition: all 0.15s ease;
          min-height: 44px;
        }
        .cl-role-tab:hover { border-color: var(--color-brand-blue-600); color: var(--color-brand-blue-600); }
        .cl-role-active {
          border-color: var(--color-brand-blue-600) !important;
          background: var(--color-brand-blue-100) !important;
          color: var(--color-brand-blue-600) !important;
        }
        .cl-role-icon { display: flex; align-items: center; justify-content: center; }
        .cl-role-desc {
          font-size: 0.78rem;
          color: var(--color-neutral-600);
          margin: 0;
          min-height: 18px;
        }

        .cl-form { display: flex; flex-direction: column; gap: 18px; margin-bottom: 20px; }
        .cl-field { display: flex; flex-direction: column; gap: 6px; }
        .cl-label {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-neutral-700);
        }
        .cl-label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .cl-input-wrap { position: relative; display: flex; align-items: center; }
        .cl-input-icon {
          position: absolute;
          left: 12px;
          color: var(--color-neutral-400);
          pointer-events: none;
        }
        .cl-input {
          width: 100%;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 10px 12px;
          font-size: 0.9rem;
          font-family: var(--font-sans);
          color: var(--color-neutral-900);
          outline: none;
          background: #fff;
          transition: border-color 0.15s ease;
          box-sizing: border-box;
        }
        .cl-input:focus { border-color: var(--color-brand-blue-600); box-shadow: 0 0 0 3px rgba(31,95,191,0.1); }
        .cl-input-icon-pad { padding-left: 40px; }
        .cl-mono { font-family: var(--font-mono); }
        .cl-otp-input {
          font-size: 1.6rem;
          font-weight: 800;
          letter-spacing: 8px;
          text-align: center;
          font-family: var(--font-mono);
          padding: 12px;
        }
        .cl-helper { font-size: 0.78rem; color: var(--color-neutral-600); }
        .cl-error {
          font-size: 0.8rem;
          color: var(--color-danger-text);
          font-weight: 600;
          margin: 0;
        }
        .cl-autofill-btn {
          background: #FEF3C7;
          border: 1px dashed #D97706;
          color: #92400E;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          white-space: nowrap;
        }
        .cl-btn-primary {
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
        .cl-btn-primary:hover { background-color: var(--color-action-700); }

        .cl-otp-sent-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--color-brand-blue-100);
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-sm);
          padding: 9px 14px;
          font-size: 0.8125rem;
          color: var(--color-brand-blue-600);
        }
        .cl-otp-sent-left { display: flex; align-items: center; gap: 8px; }
        .cl-sent-icon { color: #16A34A; flex-shrink: 0; }
        .cl-change-btn {
          background: none;
          border: none;
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-brand-blue-600);
          cursor: pointer;
          text-decoration: underline;
          font-family: var(--font-sans);
        }
        .cl-resend-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 0.8rem;
          color: var(--color-neutral-600);
        }
        .cl-resend-btn {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-brand-blue-600);
          cursor: pointer;
          font-family: var(--font-sans);
        }
        .cl-divider {
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--color-neutral-400);
          font-size: 0.78rem;
          margin: 20px 0 16px;
        }
        .cl-divider::before, .cl-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--color-neutral-200);
        }

        .cl-guest-track { margin-bottom: 20px; }
        .cl-guest-label { font-size: 0.8rem; color: var(--color-neutral-600); margin-bottom: 8px; }
        .cl-guest-row { display: flex; gap: 8px; }
        .cl-track-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--color-navy-900);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 10px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          font-family: var(--font-sans);
          min-height: 44px;
        }
        .cl-track-btn:hover { background-color: #0E3673; }

        .cl-switch-portal {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--color-neutral-200);
          padding-top: 16px;
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
        }
        .cl-switch-btn {
          background: none;
          border: none;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-action-600);
          cursor: pointer;
          text-decoration: underline;
          font-family: var(--font-sans);
        }

        @media (max-width: 720px) {
          .cl-grid { grid-template-columns: 1fr; }
          .cl-brand-pane { padding: 28px 24px; }
          .cl-form-pane { padding: 28px 24px; }
        }
      `}</style>
    </div>
  );
};

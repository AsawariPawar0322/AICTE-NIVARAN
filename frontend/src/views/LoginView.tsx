import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { 
  Lock, 
  Smartphone, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Building2, 
  UserCheck, 
  Search,
  Sparkles,
  HelpCircle
} from 'lucide-react';

interface LoginViewProps {
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

export const LoginView: React.FC<LoginViewProps> = ({
  lang,
  setActiveTab,
  onLoginSuccess
}) => {
  const t = translations[lang];
  const [authTrack, setAuthTrack] = useState<'citizen' | 'official'>('citizen');

  // Citizen Track State
  const [identifier, setIdentifier] = useState('+91 98712 34567');
  const [complainantType, setComplainantType] = useState<'Student' | 'Faculty' | 'Parent'>('Student');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpError, setOtpError] = useState('');

  // Official Track State
  const [officialId, setOfficialId] = useState('PGRC-DIR-0842');
  const [officialPin, setOfficialPin] = useState('••••••');

  // Guest Tracking lookup state
  const [guestCaseId, setGuestCaseId] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      alert('Please enter your mobile number or email.');
      return;
    }
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
      setOtpError('Invalid OTP. Please enter the demo code 849210.');
    }
  };

  const handleOfficialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    onLoginSuccess({
      name: 'Dr. Ramesh Chandra Verma',
      role: 'AICTE Official',
      institution: 'AICTE Head Office, New Delhi',
      rollOrId: officialId
    });
    setActiveTab('dashboard');
  };

  const loginDemoPersona = (persona: 'student' | 'officer' | 'nodal') => {
    if (persona === 'student') {
      onLoginSuccess({
        name: 'Aarav Sharma',
        role: 'Student',
        institution: 'Delhi Technological University (DTU)',
        rollOrId: '2024-CS-108',
        mobile: '+91 98712 34567'
      });
    } else if (persona === 'officer') {
      onLoginSuccess({
        name: 'Dr. Ramesh Chandra Verma',
        role: 'AICTE Official',
        institution: 'AICTE Central HQ, New Delhi',
        rollOrId: 'PGRC-DIR-0842'
      });
    } else {
      onLoginSuccess({
        name: 'Prof. K. S. Rao',
        role: 'Institute Nodal Officer',
        institution: 'Delhi Technological University (DTU)',
        rollOrId: 'DTU-NODAL-14'
      });
    }
    setActiveTab('dashboard');
  };

  return (
    <div className="login-page-container" id="main-content">
      <div className="container max-w-960">
        <div className="login-grid-card card">
          {/* Left Hero / Brand Pane */}
          <div className="login-brand-pane flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src="/aicte-nivaran-logo.png" 
                  alt="AICTE NIVARAN" 
                  className="login-brand-logo" 
                />
                <div>
                  <h2 className="login-brand-title">AICTE NIVARAN</h2>
                  <span className="login-brand-sub">एआईसीटीई निवारण · SIH26264</span>
                </div>
              </div>

              <span className="sanskrit-pill">योगः कर्मसु कौशलम्</span>

              <h3 className="login-hero-heading mt-4">
                Single Sign-On Gateway for Technical Education Redressal
              </h3>
              <p className="login-hero-p">
                Secure access for over 12,000+ technical colleges across India. Monitor case progress, review official inquiry records, and authenticate resolution closure via Citizen OTP.
              </p>

              <div className="security-badges-list mt-4">
                <div className="sec-item flex items-center gap-2">
                  <ShieldCheck size={18} className="text-green" />
                  <span>256-Bit SSL Encryption & GIGW 3.0 Compliant</span>
                </div>
                <div className="sec-item flex items-center gap-2">
                  <KeyRound size={18} className="text-warning-bold" />
                  <span>Mandatory Citizen OTP for Case Closure</span>
                </div>
                <div className="sec-item flex items-center gap-2">
                  <UserCheck size={18} className="text-blue" />
                  <span>DigiLocker & Aadhaar e-KYC Ready</span>
                </div>
              </div>
            </div>

            {/* Quick Demo Personas Box for Judges / Evaluators */}
            <div className="demo-personas-box">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={16} className="text-warning" />
                <strong className="demo-box-title">SIH Evaluator Quick-Logins (1-Click):</strong>
              </div>
              <div className="demo-buttons-grid flex flex-col gap-2">
                <button
                  type="button"
                  className="btn-demo-persona"
                  onClick={() => loginDemoPersona('student')}
                >
                  🎓 <strong>Student:</strong> Aarav Sharma (DTU CSE · Has Pending OTP Refund)
                </button>
                <button
                  type="button"
                  className="btn-demo-persona"
                  onClick={() => loginDemoPersona('officer')}
                >
                  🏛️ <strong>AICTE Official:</strong> Dr. Ramesh Chandra Verma (Director PGRC)
                </button>
                <button
                  type="button"
                  className="btn-demo-persona"
                  onClick={() => loginDemoPersona('nodal')}
                >
                  🏢 <strong>College Nodal Officer:</strong> Prof. K. S. Rao (Registrar Desk)
                </button>
              </div>
            </div>
          </div>

          {/* Right Interactive Login Forms */}
          <div className="login-form-pane">
            {/* Track Selector Tabs */}
            <div className="login-track-switcher flex items-center">
              <button
                type="button"
                className={`track-tab ${authTrack === 'citizen' ? 'active-track' : ''}`}
                onClick={() => {
                  setAuthTrack('citizen');
                  setIsOtpSent(false);
                  setOtpError('');
                }}
              >
                <Smartphone size={16} />
                <span>Student / Parent / Faculty</span>
              </button>
              <button
                type="button"
                className={`track-tab ${authTrack === 'official' ? 'active-track' : ''}`}
                onClick={() => {
                  setAuthTrack('official');
                  setOtpError('');
                }}
              >
                <Building2 size={16} />
                <span>AICTE / College Official</span>
              </button>
            </div>

            {/* Citizen Auth Form */}
            {authTrack === 'citizen' && (
              <div className="auth-form-wrap mt-4">
                <div className="form-heading-row">
                  <h3>Citizen Login via OTP</h3>
                  <p className="form-sub-text">
                    Enter your registered mobile or email to receive a secure 6-digit access code.
                  </p>
                </div>

                {!isOtpSent ? (
                  <form onSubmit={handleSendOtp} className="mt-4">
                    <div className="role-chip-selector flex items-center gap-2 mb-3">
                      <span className="text-muted-xs">I am a:</span>
                      {(['Student', 'Faculty', 'Parent'] as const).map((r) => (
                        <button
                          key={r}
                          type="button"
                          className={`complainant-role-btn ${complainantType === r ? 'active' : ''}`}
                          onClick={() => setComplainantType(r)}
                        >
                          {r}
                        </button>
                      ))}
                    </div>

                    <div className="form-group mb-3">
                      <label className="input-label">Mobile Number or Email Address</label>
                      <input
                        type="text"
                        className="input-control"
                        placeholder="+91 98712 34567 or email@example.com"
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        required
                      />
                      <small className="input-helper">We will send an instantaneous 6-digit verification code.</small>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block btn-lg mt-4">
                      <span>Send 6-Digit OTP</span>
                      <ArrowRight size={18} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="mt-4">
                    <div className="otp-dispatched-banner flex items-center justify-between">
                      <div>
                        <span className="otp-sent-to">Code sent to: <strong>{identifier}</strong></span>
                        <button
                          type="button"
                          className="btn-change-number"
                          onClick={() => setIsOtpSent(false)}
                        >
                          Change
                        </button>
                      </div>
                      <button
                        type="button"
                        className="btn-autofill-pill"
                        onClick={() => setOtpCode('849210')}
                        title="Click to paste simulated OTP"
                      >
                        Auto-Fill Demo Code (849210)
                      </button>
                    </div>

                    <div className="form-group mt-3">
                      <label className="input-label">Enter 6-Digit OTP</label>
                      <input
                        type="text"
                        className="input-control otp-box mono text-center"
                        maxLength={6}
                        placeholder="849210"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        required
                      />
                    </div>

                    {otpError && (
                      <div className="otp-error-msg mt-2 text-danger">
                        {otpError}
                      </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-block btn-lg mt-4">
                      <CheckCircle2 size={18} />
                      <span>Verify & Access Dashboard</span>
                    </button>

                    <div className="resend-row flex items-center justify-between mt-3 text-muted">
                      <span>Didn't receive code?</span>
                      <button
                        type="button"
                        className="btn-resend"
                        onClick={() => alert('New OTP dispatched: 849210')}
                      >
                        Resend OTP (30s)
                      </button>
                    </div>
                  </form>
                )}
              </div>
            )}

            {/* Official Auth Form */}
            {authTrack === 'official' && (
              <div className="auth-form-wrap mt-4">
                <div className="form-heading-row">
                  <h3>Institutional & Bureau Officer Sign In</h3>
                  <p className="form-sub-text">
                    For AICTE Head Office, Regional Bureaus, and Institute Nodal Grievance Officers.
                  </p>
                </div>

                <form onSubmit={handleOfficialLogin} className="mt-4">
                  <div className="form-group mb-3">
                    <label className="input-label">Official Employee / Nodal ID</label>
                    <input
                      type="text"
                      className="input-control mono"
                      value={officialId}
                      onChange={(e) => setOfficialId(e.target.value)}
                      placeholder="e.g. PGRC-DIR-0842 or DTU-NODAL-14"
                      required
                    />
                  </div>

                  <div className="form-group mb-3">
                    <label className="input-label">Security PIN / Password</label>
                    <input
                      type="password"
                      className="input-control"
                      value={officialPin}
                      onChange={(e) => setOfficialPin(e.target.value)}
                      placeholder="Enter official security PIN"
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-secondary btn-block btn-lg mt-4">
                    <Lock size={18} />
                    <span>Authorize Officer Session</span>
                  </button>
                </form>
              </div>
            )}

            {/* Guest Case Tracking Shortcut */}
            <div className="guest-tracker-bar mt-4 pt-4">
              <span className="guest-title">Just want to track an existing case?</span>
              <div className="guest-input-row flex items-center gap-2 mt-2">
                <input
                  type="text"
                  className="input-control mono"
                  placeholder="e.g. AICTE-2026-GRV-84920"
                  value={guestCaseId}
                  onChange={(e) => setGuestCaseId(e.target.value)}
                />
                <button
                  type="button"
                  className="btn btn-outline btn-guest-track"
                  onClick={() => {
                    setActiveTab('track');
                  }}
                >
                  <Search size={16} />
                  <span>Track</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .login-page-container {
          padding: 40px 0 72px 0;
          background: linear-gradient(180deg, #F3F5F8 0%, #FFFFFF 100%);
        }
        .max-w-960 {
          max-width: 960px;
          margin: 0 auto;
        }

        .login-grid-card {
          padding: 0;
          display: grid;
          grid-template-columns: 1fr 1fr;
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-modal);
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
        }

        .login-brand-pane {
          background-color: var(--color-navy-900);
          color: #FFFFFF;
          padding: 36px 32px;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        .login-brand-logo {
          height: 54px;
          width: 54px;
          object-fit: contain;
          filter: drop-shadow(0 4px 8px rgba(0,0,0,0.4));
        }
        .login-brand-title {
          font-size: 1.4rem;
          color: #FFFFFF;
          line-height: 1.1;
        }
        .login-brand-sub {
          font-size: 0.75rem;
          color: var(--color-brand-orange-500);
          font-weight: 700;
        }
        .sanskrit-pill {
          background: rgba(242, 137, 94, 0.2);
          color: var(--color-brand-orange-500);
          border: 1px solid var(--color-brand-orange-500);
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 10px;
          border-radius: var(--radius-pill);
          display: inline-block;
        }
        .login-hero-heading {
          font-size: 1.25rem;
          color: #F8FAFC;
          line-height: 1.3;
        }
        .login-hero-p {
          font-size: 0.85rem;
          color: #94A3B8;
          margin-top: 8px;
          line-height: 1.45;
        }

        .security-badges-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-size: 0.8rem;
          color: #CBD5E1;
        }

        .demo-personas-box {
          background: rgba(255, 255, 255, 0.06);
          border: 1px dashed rgba(255, 255, 255, 0.25);
          border-radius: var(--radius-md);
          padding: 14px;
          margin-top: 24px;
        }
        .demo-box-title {
          font-size: 0.78rem;
          color: #FDE68A;
        }
        .btn-demo-persona {
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #FFFFFF;
          font-size: 0.75rem;
          padding: 6px 10px;
          border-radius: var(--radius-sm);
          text-align: left;
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .btn-demo-persona:hover {
          background-color: var(--color-action-600);
          border-color: var(--color-action-600);
        }

        /* Right Form Pane */
        .login-form-pane {
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }

        .login-track-switcher {
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-pill);
          padding: 4px;
        }
        .track-tab {
          flex: 1;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          padding: 8px 12px;
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-neutral-600);
          background: transparent;
          border: none;
          border-radius: var(--radius-pill);
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .track-tab.active-track {
          background: var(--color-action-600);
          color: #FFFFFF;
          box-shadow: 0 2px 4px rgba(194, 87, 12, 0.2);
        }

        .form-heading-row h3 {
          font-size: 1.25rem;
          color: var(--color-navy-900);
        }
        .form-sub-text {
          font-size: 0.85rem;
          color: var(--color-neutral-600);
          margin-top: 2px;
        }

        .role-chip-selector {
          font-size: 0.8rem;
        }
        .complainant-role-btn {
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          font-size: 0.78rem;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          font-weight: 600;
          color: var(--color-neutral-700);
        }
        .complainant-role-btn.active {
          background-color: var(--color-brand-blue-600);
          color: #FFFFFF;
          border-color: var(--color-brand-blue-600);
        }

        .btn-lg {
          min-height: 46px;
          font-size: 1rem;
        }

        .otp-dispatched-banner {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-sm);
          padding: 8px 12px;
          font-size: 0.8rem;
        }
        .btn-change-number {
          background: none;
          border: none;
          color: var(--color-brand-blue-600);
          font-size: 0.75rem;
          text-decoration: underline;
          margin-left: 6px;
          cursor: pointer;
        }
        .btn-autofill-pill {
          background: #FEF3C7;
          border: 1px dashed #D97706;
          color: #92400E;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .otp-box {
          font-size: 1.5rem;
          letter-spacing: 6px;
          font-weight: 800;
        }
        .btn-resend {
          background: none;
          border: none;
          color: var(--color-brand-blue-600);
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
        }

        .guest-tracker-bar {
          border-top: 1px solid var(--color-neutral-200);
        }
        .guest-title {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
          display: block;
        }
        .btn-guest-track {
          white-space: nowrap;
        }

        @media (max-width: 800px) {
          .login-grid-card {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Language } from './locales/translations';
import { HeaderStrip } from './components/HeaderStrip';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { CitizenLoginView } from './views/CitizenLoginView';
import { AdminLoginView } from './views/AdminLoginView';
import { ComplainantDashboard } from './views/ComplainantDashboard';
import { FileComplaintView } from './views/FileComplaintView';
import { TrackComplaintView } from './views/TrackComplaintView';
import { UserAdminChatView } from './views/UserAdminChatView';
import { AdministrationView } from './views/AdministrationView';
import { DiscordReplicaView } from './views/DiscordReplicaView';
import { FloatingOfficialChat } from './components/FloatingOfficialChat';
import {
  mockInstitutions,
  initialComplaints,
  initialChatMessages
} from './data/mockData';
import { Complaint, Institution, UserAdminMessage, StageKey } from './types';
import { Icon } from './components/Icon';

const VALID_TABS: ActiveTab[] = [
  'home', 'citizen', 'admin', 'dashboard', 'file-complaint',
  'track', 'chat', 'discord', 'login', 'citizen-login', 'admin-login'
];

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'complainant' | 'official'>('complainant');
  const [activeTab, setActiveTab] = useState<ActiveTab>(() => {
    const hash = window.location.hash.replace('#', '') as ActiveTab;
    return VALID_TABS.includes(hash) ? hash : 'home';
  });
  const [isFloatingChatOpen, setIsFloatingChatOpen] = useState(false);

  // Sync hash routing
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = 'home';
    }
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as ActiveTab;
      if (VALID_TABS.includes(hash)) setActiveTab(hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleTabChange = (newTab: ActiveTab) => {
    setActiveTab(newTab);
    window.location.hash = newTab;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── User state ──
  const [currentUser, setCurrentUser] = useState<{
    name: string;
    role: string;
    institution?: string;
    rollOrId?: string;
    mobile?: string;
  } | null>({
    name: 'Aarav Sharma',
    role: 'Student',
    institution: 'Delhi Technological University (DTU)',
    rollOrId: '2024-CS-108',
    mobile: '+91 98712 34567'
  });

  // ── Application data ──
  const [institutions] = useState<Institution[]>(mockInstitutions);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(initialComplaints[0]);
  const [selectedInstForComplaint, setSelectedInstForComplaint] = useState<Institution | null>(null);
  const [chatMessages, setChatMessages] = useState<UserAdminMessage[]>(initialChatMessages);

  // Apply accessibility tokens
  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', fontScale.toString());
  }, [fontScale]);

  useEffect(() => {
    if (highContrast) {
      document.documentElement.setAttribute('data-high-contrast', 'true');
    } else {
      document.documentElement.removeAttribute('data-high-contrast');
    }
  }, [highContrast]);

  // ── Handlers ──
  const handleAddNewComplaint = (newComplaint: Complaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
    setSelectedComplaint(newComplaint);
  };

  const handleUpdateComplaintStage = (caseId: string, newStage: StageKey, feedback?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id !== caseId) return c;
      return {
        ...c,
        currentStage: newStage,
        stageNumber: newStage === 'RESOLVED' ? 6 : c.stageNumber,
        otpVerification: {
          ...c.otpVerification,
          generatedOtp: c.otpVerification?.generatedOtp || '849210',
          isVerified: newStage === 'RESOLVED',
          verifiedAt: newStage === 'RESOLVED' ? 'Today, 04:30 PM' : undefined,
          citizenFeedback: feedback || c.otpVerification?.citizenFeedback
        }
      };
    }));
  };

  const handleSendMessage = (msg: UserAdminMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const handleOpenChatWithComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setIsFloatingChatOpen(true);
  };

  const handleLoginSuccess = (user: typeof currentUser) => {
    setCurrentUser(user);
    if (user?.role.includes('Official') || user?.role.includes('Nodal')) {
      setActiveRole('official');
    } else {
      setActiveRole('complainant');
    }
  };

  const pendingOtpCount = complaints.filter(c => c.currentStage === 'PENDING_OTP').length;
  const isLoggedIn = currentUser !== null;

  return (
    <div className="app-root">
      {/* 1. Government Header Strip */}
      <HeaderStrip
        lang={lang}
        setLang={setLang}
        fontScale={fontScale}
        setFontScale={setFontScale}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        activeRole={activeRole}
        setActiveRole={(newRole) => {
          setActiveRole(newRole);
          handleTabChange(newRole === 'official' ? 'admin-login' : 'home');
        }}
        currentUser={currentUser}
        onOpenLogin={() => handleTabChange('citizen-login')}
        onNavigateHome={() => handleTabChange('home')}
        onLogout={() => {
          setCurrentUser(null);
          setActiveRole('complainant');
          handleTabChange('home');
        }}
      />

      {/* 2. Navigation */}
      <Navbar
        lang={lang}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        pendingOtpCount={pendingOtpCount}
        onOpenFloatingChat={() => setIsFloatingChatOpen(true)}
        isLoggedIn={isLoggedIn}
      />

      {/* 3. Main content */}
      <main id="main-content">

        {/* Landing */}
        {activeTab === 'home' && (
          <LandingPage
            lang={lang}
            setActiveTab={handleTabChange}
            institutions={institutions}
            onSelectInstitutionForComplaint={(inst) => {
              setSelectedInstForComplaint(inst);
              handleTabChange('file-complaint');
            }}
          />
        )}

        {/* Citizen Login */}
        {activeTab === 'citizen-login' && (
          <CitizenLoginView
            lang={lang}
            setActiveTab={handleTabChange}
            onLoginSuccess={(user) => {
              handleLoginSuccess(user);
              handleTabChange('dashboard');
            }}
          />
        )}

        {/* Admin Login */}
        {activeTab === 'admin-login' && (
          <AdminLoginView
            lang={lang}
            setActiveTab={handleTabChange}
            onLoginSuccess={(user) => {
              handleLoginSuccess(user);
              handleTabChange('admin');
            }}
          />
        )}

        {/* Legacy login redirect */}
        {activeTab === 'login' && (
          <CitizenLoginView
            lang={lang}
            setActiveTab={handleTabChange}
            onLoginSuccess={(user) => {
              handleLoginSuccess(user);
              handleTabChange('dashboard');
            }}
          />
        )}

        {/* Citizen: Dashboard */}
        {(activeTab === 'citizen' || activeTab === 'dashboard') && (
          <ComplainantDashboard
            lang={lang}
            setActiveTab={handleTabChange}
            complaints={complaints}
            onSelectComplaintForTracking={(complaint) => {
              setSelectedComplaint(complaint);
              handleTabChange('track');
            }}
            onOpenChatWithComplaint={handleOpenChatWithComplaint}
          />
        )}

        {/* Citizen: File complaint */}
        {activeTab === 'file-complaint' && (
          <FileComplaintView
            lang={lang}
            setActiveTab={handleTabChange}
            institutions={institutions}
            onAddNewComplaint={handleAddNewComplaint}
            selectedInstitution={selectedInstForComplaint}
          />
        )}

        {/* Citizen: Track */}
        {activeTab === 'track' && (
          <TrackComplaintView
            lang={lang}
            setActiveTab={handleTabChange}
            complaints={complaints}
            selectedComplaint={selectedComplaint}
            onUpdateComplaintStage={handleUpdateComplaintStage}
            onOpenChatWithComplaint={handleOpenChatWithComplaint}
          />
        )}

        {/* Administration */}
        {activeTab === 'admin' && (
          <AdministrationView
            lang={lang}
            setActiveTab={handleTabChange}
            complaints={complaints}
            institutions={institutions}
            onSelectComplaintForTracking={(complaint) => {
              setSelectedComplaint(complaint);
              handleTabChange('track');
            }}
            onOpenOfficialChat={handleOpenChatWithComplaint}
            onUpdateComplaintStage={handleUpdateComplaintStage}
          />
        )}

        {/* Chat fallback */}
        {activeTab === 'chat' && selectedComplaint && (
          <UserAdminChatView
            lang={lang}
            setActiveTab={handleTabChange}
            complaint={selectedComplaint}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        )}

        {/* Discord */}
        {activeTab === 'discord' && (
          <DiscordReplicaView
            lang={lang}
            setActiveTab={handleTabChange}
          />
        )}
      </main>

      {/* 4. Floating chat */}
      <FloatingOfficialChat
        complaints={complaints}
        selectedComplaint={selectedComplaint}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
        messages={chatMessages}
        onSendMessage={handleSendMessage}
        isOpen={isFloatingChatOpen}
        setIsOpen={setIsFloatingChatOpen}
      />

      {/* 5. Footer */}
      {activeTab !== 'discord' && (
        <footer className="gov-footer" role="contentinfo">
          <div className="container">
            <div className="footer-columns grid grid-cols-4 gap-6">
              <div className="col-span-1">
                <div className="flex items-center gap-3 mb-2">
                  <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN" className="footer-logo-img" />
                  <div>
                    <strong className="footer-heading">AICTE NIVARAN</strong>
                    <span className="footer-sub-label">एआईसीटीई निवारण · SIH26264</span>
                  </div>
                </div>
                <p className="footer-p">
                  All India Council For Technical Education · Unified Grievance Coordination System for 12,000+ approved technical institutions.
                </p>
                <div className="wcag-badge mt-3 flex items-center gap-1">
                  <Icon e="✅" size={13} />
                  <span>WCAG 2.1 AA · GIGW 3.0</span>
                </div>
              </div>

              <div>
                <strong className="footer-col-title">Portals</strong>
                <ul className="footer-links-list">
                  <li><button type="button" onClick={() => handleTabChange('home')}>Home</button></li>
                  <li><button type="button" onClick={() => handleTabChange('citizen-login')}>Citizen Sign In</button></li>
                  <li><button type="button" onClick={() => handleTabChange('file-complaint')}>File a Grievance</button></li>
                  <li><button type="button" onClick={() => handleTabChange('track')}>Track &amp; OTP Closure</button></li>
                  <li><button type="button" onClick={() => handleTabChange('admin-login')}>Administration Portal</button></li>
                </ul>
              </div>

              <div>
                <strong className="footer-col-title">Bureau Cells</strong>
                <ul className="footer-links-list">
                  <li><button type="button" onClick={() => handleTabChange('admin')}>PGRC Central Bureau</button></li>
                  <li><button type="button" onClick={() => handleTabChange('file-complaint')}>Anti-Ragging Squad</button></li>
                  <li><button type="button" onClick={() => handleTabChange('file-complaint')}>Women Safety Cell (ICC)</button></li>
                  <li><button type="button" onClick={() => handleTabChange('admin')}>State Ombudsman Directory</button></li>
                </ul>
              </div>

              <div>
                <strong className="footer-col-title">Community &amp; Help</strong>
                <p className="footer-p mb-3">
                  Real-time peer support and officer coordination via our Discord replica hub.
                </p>
                <div className="flex flex-col gap-2">
                  <button
                    type="button"
                    className="btn btn-outline btn-sm footer-discord-btn"
                    onClick={() => handleTabChange('discord')}
                  >
                    <span>Launch Discord Hub</span>
                    <Icon e="↗️" size={12} />
                  </button>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm"
                    onClick={() => setIsFloatingChatOpen(true)}
                  >
                    Open Officer Chat
                  </button>
                </div>
              </div>
            </div>

            <div className="footer-bottom-strip flex items-center justify-between flex-wrap gap-2 mt-4 pt-4">
              <span className="copyright-text">
                © 2026 All India Council for Technical Education (AICTE), Ministry of Education, Government of India.
              </span>
              <span className="designed-text">
                Built for Smart India Hackathon · SIH26264
              </span>
            </div>
          </div>

          <style>{`
            .gov-footer {
              background-color: var(--color-navy-900);
              color: #CBD5E1;
              padding: 48px 0 24px;
              border-top: 3px solid var(--color-brand-orange-500);
              font-size: 0.85rem;
            }
            .footer-logo-img {
              height: 44px;
              width: 44px;
              object-fit: contain;
              filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            }
            .footer-heading {
              color: #fff;
              font-size: 1.05rem;
              display: block;
              line-height: 1.2;
            }
            .footer-sub-label {
              font-size: 0.7rem;
              color: var(--color-brand-orange-500);
              font-weight: 700;
              display: block;
            }
            .footer-p {
              color: #94A3B8;
              font-size: 0.8rem;
              line-height: 1.5;
            }
            .wcag-badge {
              background: rgba(22,101,52,0.2);
              border: 1px solid #166534;
              color: #86EFAC;
              font-size: 0.7rem;
              font-weight: 700;
              padding: 3px 8px;
              border-radius: var(--radius-sm);
              display: inline-flex;
              align-items: center;
              gap: 4px;
            }
            .footer-col-title {
              color: #fff;
              font-size: 0.875rem;
              display: block;
              margin-bottom: 12px;
              font-weight: 700;
            }
            .footer-links-list {
              list-style: none;
              display: flex;
              flex-direction: column;
              gap: 8px;
            }
            .footer-links-list button {
              background: none;
              border: none;
              color: #94A3B8;
              font-size: 0.8rem;
              cursor: pointer;
              text-align: left;
              padding: 0;
              font-family: var(--font-sans);
              transition: color 0.1s ease;
            }
            .footer-links-list button:hover { color: #fff; text-decoration: underline; }
            .footer-discord-btn {
              background: rgba(88,101,242,0.15);
              border-color: rgba(88,101,242,0.5);
              color: #fff;
            }
            .footer-bottom-strip {
              border-top: 1px solid rgba(255,255,255,0.08);
              font-size: 0.75rem;
            }
            .copyright-text { color: #64748B; }
            .designed-text { color: #94A3B8; }
          `}</style>
        </footer>
      )}
    </div>
  );
}

export default App;

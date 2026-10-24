import React, { useState, useEffect } from 'react';
import { Language } from './locales/translations';
import { HeaderStrip } from './components/HeaderStrip';
import { Navbar, ActiveTab } from './components/Navbar';
import { LandingPage } from './views/LandingPage';
import { ComplainantDashboard } from './views/ComplainantDashboard';
import { FileComplaintView } from './views/FileComplaintView';
import { TrackComplaintView } from './views/TrackComplaintView';
import { UserAdminChatView } from './views/UserAdminChatView';
import { DiscordReplicaView } from './views/DiscordReplicaView';
import { LoginView } from './views/LoginView';
import { 
  mockInstitutions, 
  initialComplaints, 
  initialChatMessages 
} from './data/mockData';
import { Complaint, Institution, UserAdminMessage, StageKey } from './types';
import { ShieldCheck, Heart, ExternalLink, HelpCircle } from 'lucide-react';

export function App() {
  const [lang, setLang] = useState<Language>('en');
  const [fontScale, setFontScale] = useState<number>(1.0);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [activeRole, setActiveRole] = useState<'complainant' | 'official'>('complainant');
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Authenticated User State
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

  // Application Data State
  const [institutions] = useState<Institution[]>(mockInstitutions);
  const [complaints, setComplaints] = useState<Complaint[]>(initialComplaints);
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(initialComplaints[0]);
  const [selectedInstForComplaint, setSelectedInstForComplaint] = useState<Institution | null>(null);
  const [chatMessages, setChatMessages] = useState<UserAdminMessage[]>(initialChatMessages);

  // Apply font scale and high contrast to document root
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

  const handleAddNewComplaint = (newComplaint: Complaint) => {
    setComplaints([newComplaint, ...complaints]);
    setSelectedComplaint(newComplaint);
  };

  const handleSelectComplaintForTracking = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('track');
  };

  const handleOpenChatWithComplaint = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab('chat');
  };

  const handleUpdateComplaintStage = (caseId: string, newStage: StageKey, feedback?: string) => {
    setComplaints(prev => prev.map(c => {
      if (c.id === caseId) {
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
      }
      return c;
    }));
  };

  const handleSendMessage = (msg: UserAdminMessage) => {
    setChatMessages(prev => [...prev, msg]);
  };

  const pendingOtpCount = complaints.filter(c => c.currentStage === 'PENDING_OTP').length;

  return (
    <div className="app-root">
      {/* 1. Header Strip (Bilingual, Accessibility, Role Switch) */}
      <HeaderStrip
        lang={lang}
        setLang={setLang}
        fontScale={fontScale}
        setFontScale={setFontScale}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        activeRole={activeRole}
        setActiveRole={setActiveRole}
        currentUser={currentUser}
        onOpenLogin={() => setActiveTab('login')}
        onLogout={() => {
          setCurrentUser(null);
          alert('Signed out successfully. You can continue using guest tracking or sign in anytime.');
        }}
      />

      {/* 2. Main Navigation Bar */}
      <Navbar
        lang={lang}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        pendingOtpCount={pendingOtpCount}
      />

      {/* 3. Main Views */}
      <main id="main-content">
        {activeTab === 'home' && (
          <LandingPage
            lang={lang}
            setActiveTab={setActiveTab}
            institutions={institutions}
            onSelectInstitutionForComplaint={(inst) => {
              setSelectedInstForComplaint(inst);
              setActiveTab('file-complaint');
            }}
          />
        )}

        {activeTab === 'dashboard' && (
          <ComplainantDashboard
            lang={lang}
            setActiveTab={setActiveTab}
            complaints={complaints}
            onSelectComplaintForTracking={handleSelectComplaintForTracking}
            onOpenChatWithComplaint={handleOpenChatWithComplaint}
          />
        )}

        {activeTab === 'file-complaint' && (
          <FileComplaintView
            lang={lang}
            setActiveTab={setActiveTab}
            institutions={institutions}
            onAddNewComplaint={handleAddNewComplaint}
            selectedInstitution={selectedInstForComplaint}
          />
        )}

        {activeTab === 'track' && (
          <TrackComplaintView
            lang={lang}
            setActiveTab={setActiveTab}
            complaints={complaints}
            selectedComplaint={selectedComplaint}
            onUpdateComplaintStage={handleUpdateComplaintStage}
            onOpenChatWithComplaint={handleOpenChatWithComplaint}
          />
        )}

        {activeTab === 'chat' && selectedComplaint && (
          <UserAdminChatView
            lang={lang}
            setActiveTab={setActiveTab}
            complaint={selectedComplaint}
            messages={chatMessages}
            onSendMessage={handleSendMessage}
          />
        )}

        {activeTab === 'discord' && (
          <DiscordReplicaView
            lang={lang}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'login' && (
          <LoginView
            lang={lang}
            setActiveTab={setActiveTab}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              if (user.role.includes('Official')) {
                setActiveRole('official');
              } else {
                setActiveRole('complainant');
              }
            }}
          />
        )}
      </main>

      {/* 4. Accessible Government Footer */}
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
                All India Council For Technical Education · Unified Grievance Coordination System for all 12,000+ approved technical universities and polytechnics.
              </p>
              <div className="wcag-badge mt-3 flex items-center gap-1">
                <ShieldCheck size={14} className="text-green" />
                <span>WCAG 2.1 AA & GIGW 3.0 Compliant</span>
              </div>
            </div>

            <div>
              <strong className="footer-col-title">Quick Portals</strong>
              <ul className="footer-links-list">
                <li><button type="button" onClick={() => setActiveTab('home')}>AICTE Redressal Front Door</button></li>
                <li><button type="button" onClick={() => setActiveTab('dashboard')}>Complainant Dashboard</button></li>
                <li><button type="button" onClick={() => setActiveTab('file-complaint')}>File a Grievance</button></li>
                <li><button type="button" onClick={() => setActiveTab('track')}>Track Stages & OTP Closure</button></li>
                <li><button type="button" onClick={() => setActiveTab('login')}>Portal Login / Sign In</button></li>
              </ul>
            </div>

            <div>
              <strong className="footer-col-title">Statutory Cells</strong>
              <ul className="footer-links-list">
                <li><a href="#pgrc" onClick={(e) => { e.preventDefault(); alert('Public Grievance Redressal Cell (PGRC) AICTE HQ'); }}>PGRC Central Bureau</a></li>
                <li><a href="#ragging" onClick={(e) => { e.preventDefault(); alert('National Anti-Ragging Monitoring Cell'); }}>Anti-Ragging Squad</a></li>
                <li><a href="#icc" onClick={(e) => { e.preventDefault(); alert('Internal Complaints Committee (ICC)'); }}>Women Safety Cell</a></li>
                <li><a href="#ombudsman" onClick={(e) => { e.preventDefault(); alert('AICTE State Technical Ombudsman Directory'); }}>State Ombudsman</a></li>
              </ul>
            </div>

            <div>
              <strong className="footer-col-title">Coordination & Community</strong>
              <p className="footer-p mb-2">
                Have questions or need peer support? Join our real-time Discord replica hub.
              </p>
              <button
                type="button"
                className="btn btn-outline btn-sm discord-footer-btn"
                onClick={() => setActiveTab('discord')}
              >
                <span>Launch Discord Hub</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>

          <div className="footer-bottom-strip flex items-center justify-between flex-wrap gap-2 mt-4 pt-4">
            <span className="copyright-text">
              © 2026 All India Council for Technical Education (AICTE), Ministry of Education, Government of India.
            </span>
            <span className="designed-text flex items-center gap-1">
              Built for Smart India Hackathon · Problem Statement SIH26264
            </span>
          </div>
        </div>

        <style>{`
          .gov-footer {
            background-color: var(--color-navy-900);
            color: #CBD5E1;
            padding: 48px 0 24px 0;
            border-top: 3px solid var(--color-brand-orange-500);
            font-size: 0.85rem;
          }
          .footer-logo-img {
            height: 48px;
            width: 48px;
            object-fit: contain;
            filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3));
          }
          .footer-heading {
            color: #FFFFFF;
            font-size: 1.15rem;
            line-height: 1.1;
          }
          .footer-sub-label {
            font-size: 0.72rem;
            color: var(--color-brand-orange-500);
            display: block;
            font-weight: 700;
          }
          .footer-p {
            color: #94A3B8;
            font-size: 0.8125rem;
            line-height: 1.5;
          }
          .wcag-badge {
            background: rgba(22, 101, 52, 0.2);
            border: 1px solid #166534;
            color: #86EFAC;
            font-size: 0.72rem;
            font-weight: 700;
            padding: 3px 8px;
            border-radius: var(--radius-sm);
            display: inline-flex;
          }
          .footer-col-title {
            color: #FFFFFF;
            font-size: 0.95rem;
            display: block;
            margin-bottom: 12px;
          }
          .footer-links-list {
            list-style: none;
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .footer-links-list button, .footer-links-list a {
            background: none;
            border: none;
            color: #94A3B8;
            font-size: 0.8125rem;
            text-decoration: none;
            cursor: pointer;
            text-align: left;
            padding: 0;
            transition: color 0.1s ease;
          }
          .footer-links-list button:hover, .footer-links-list a:hover {
            color: #FFFFFF;
            text-decoration: underline;
          }
          .discord-footer-btn {
            background: rgba(88, 101, 242, 0.2);
            border-color: #5865F2;
            color: #FFFFFF;
          }
          .footer-bottom-strip {
            border-top: 1px solid rgba(255, 255, 255, 0.1);
            font-size: 0.78rem;
            color: #64748B;
          }
          .designed-text {
            color: #94A3B8;
          }
        `}</style>
      </footer>
    </div>
  );
}

export default App;

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
import { AdminInboxView } from './views/AdminInboxView';
import { FloatingOfficialChat } from './components/FloatingOfficialChat';
import {
  mockInstitutions,
  initialComplaints,
  initialConversations
} from './data/mockData';
import {
  Complaint,
  Institution,
  UserAdminMessage,
  StageKey,
  ConversationMap,
  ConversationReader,
  DocumentRequest,
  EvidenceFile,
  NewTimelineEvent
} from './types';
import { Icon } from './components/Icon';

const VALID_TABS: ActiveTab[] = [
  'home', 'citizen', 'admin', 'dashboard', 'file-complaint',
  'track', 'chat', 'discord', 'login', 'citizen-login', 'admin-login', 'admin-inbox'
];

const makeId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

const withTimelineEvent = (c: Complaint, event: NewTimelineEvent): Complaint => ({
  ...c,
  timeline: [
    ...c.timeline,
    { ...event, id: makeId('tl'), timestamp: 'Just now', stage: event.stage ?? c.currentStage }
  ]
});

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
  // Selection is stored by id so views always read the latest version of the complaint
  const [selectedComplaintId, setSelectedComplaintId] = useState<string | null>(initialComplaints[0]?.id ?? null);
  const [selectedInstForComplaint, setSelectedInstForComplaint] = useState<Institution | null>(null);
  const [conversations, setConversations] = useState<ConversationMap>(initialConversations);

  const selectedComplaint = complaints.find(c => c.id === selectedComplaintId) ?? null;

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
  const updateComplaint = (caseId: string, update: (c: Complaint) => Complaint) => {
    setComplaints(prev => prev.map(c => (c.id === caseId ? update(c) : c)));
  };

  const appendMessage = (complaintId: string, msg: UserAdminMessage) => {
    setConversations(prev => ({ ...prev, [complaintId]: [...(prev[complaintId] || []), msg] }));
  };

  const handleAddNewComplaint = (newComplaint: Complaint) => {
    setComplaints(prev => [newComplaint, ...prev]);
    setSelectedComplaintId(newComplaint.id);
    appendMessage(newComplaint.id, {
      id: makeId('msg'),
      complaintId: newComplaint.id,
      kind: 'system',
      senderRole: 'system',
      senderName: 'AICTE Grievance System',
      content: `Conversation opened for case ${newComplaint.id}. All messages in this thread are logged into the official case audit trail.`,
      timestamp: 'Just now',
      readByOfficer: true,
      readByComplainant: true
    });
  };

  const handleUpdateComplaintStage = (
    caseId: string,
    newStage: StageKey,
    feedback?: string,
    event?: NewTimelineEvent
  ) => {
    updateComplaint(caseId, c => {
      const updated: Complaint = {
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
      return event ? withTimelineEvent(updated, { ...event, stage: newStage }) : updated;
    });
  };

  // Complainant or officer message; attached files are also added to the case evidence
  const handleSendMessage = (complaintId: string, msg: UserAdminMessage) => {
    appendMessage(complaintId, msg);
    const files = msg.attachments || [];
    if (files.length > 0) {
      updateComplaint(complaintId, c => withTimelineEvent(
        { ...c, evidenceList: [...c.evidenceList, ...files] },
        {
          title: 'Supplementary Evidence Shared via Case Conversation',
          description: `${files.length} file(s) shared with SHA-256 digests: ${files.map(f => f.name).join(', ')}.`,
          actor: msg.senderName,
          role: msg.senderRole === 'officer' ? 'AICTE Officer' : 'Complainant'
        }
      ));
    }
  };

  const handleRequestDocuments = (
    complaintId: string,
    officerName: string,
    request: Omit<DocumentRequest, 'id' | 'status'>,
    message: string
  ) => {
    appendMessage(complaintId, {
      id: makeId('msg'),
      complaintId,
      kind: 'document_request',
      senderRole: 'officer',
      senderName: officerName,
      content: message,
      timestamp: 'Just now',
      documentRequest: { ...request, id: makeId('docreq'), status: 'pending' },
      readByOfficer: true,
      readByComplainant: false
    });
    updateComplaint(complaintId, c => withTimelineEvent(c, {
      title: 'Documents Requested from Complainant',
      description: `Requested: ${request.items.join(', ')}${request.dueDate ? ` · Due by ${request.dueDate}` : ''}.`,
      actor: officerName,
      role: 'AICTE Officer'
    }));
  };

  const handleAddClarification = (complaintId: string, officerName: string, text: string) => {
    appendMessage(complaintId, {
      id: makeId('msg'),
      complaintId,
      kind: 'clarification',
      senderRole: 'officer',
      senderName: officerName,
      content: text,
      timestamp: 'Just now',
      isOfficialNote: true,
      readByOfficer: true,
      readByComplainant: false
    });
    updateComplaint(complaintId, c => withTimelineEvent(c, {
      title: 'Clarification Issued to Complainant',
      description: text.length > 160 ? `${text.slice(0, 157)}...` : text,
      actor: officerName,
      role: 'AICTE Officer'
    }));
  };

  const handleMarkThreadRead = (complaintId: string, reader: ConversationReader) => {
    const flag = reader === 'officer' ? 'readByOfficer' : 'readByComplainant';
    setConversations(prev => {
      const thread = prev[complaintId];
      if (!thread || thread.every(m => m[flag])) return prev;
      return { ...prev, [complaintId]: thread.map(m => (m[flag] ? m : { ...m, [flag]: true })) };
    });
  };

  const handleFulfillDocumentRequest = (
    complaintId: string,
    requestId: string,
    files: EvidenceFile[],
    senderName: string
  ) => {
    const requestMsg = (conversations[complaintId] || []).find(m => m.documentRequest?.id === requestId);
    const request = requestMsg?.documentRequest;
    if (!request || request.status === 'fulfilled' || files.length === 0) return;

    setConversations(prev => ({
      ...prev,
      [complaintId]: [
        ...(prev[complaintId] || []).map(m =>
          m.documentRequest?.id === requestId
            ? {
                ...m,
                documentRequest: {
                  ...request,
                  status: 'fulfilled' as const,
                  fulfilledAt: 'Just now',
                  fulfilledFileIds: files.map(f => f.id)
                }
              }
            : m
        ),
        {
          id: makeId('msg'),
          complaintId,
          kind: 'document_submission',
          senderRole: 'complainant',
          senderName,
          content: `Submitted ${files.length} document(s) for: ${request.items.join(', ')}.`,
          timestamp: 'Just now',
          attachments: files,
          replyToRequestId: requestId,
          readByOfficer: false,
          readByComplainant: true
        }
      ]
    }));

    updateComplaint(complaintId, c => withTimelineEvent(
      { ...c, evidenceList: [...c.evidenceList, ...files] },
      {
        title: 'Requested Documents Submitted by Complainant',
        description: `${files.length} file(s) uploaded with SHA-256 digests in response to the request for: ${request.items.join(', ')}.`,
        actor: senderName,
        role: 'Complainant'
      }
    ));
  };

  const handleOpenChatWithComplaint = (complaint: Complaint) => {
    setSelectedComplaintId(complaint.id);
    setIsFloatingChatOpen(true);
  };

  const handleOpenCaseFromInbox = (complaintId: string) => {
    setSelectedComplaintId(complaintId);
    handleTabChange('track');
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
  const allMessages = Object.values(conversations).flat();
  const officerUnreadCount = allMessages.filter(m => !m.readByOfficer).length;
  const complainantUnreadCount = allMessages.filter(m => !m.readByComplainant).length;
  // Name used on Support Inbox messages; falls back to the case's assigned officer
  const officialName =
    currentUser && (currentUser.role.includes('Official') || currentUser.role.includes('Nodal'))
      ? currentUser.name
      : null;

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
          // Signed-in officials go straight to the portal instead of the login screen
          if (newRole === 'official') handleTabChange(officialName ? 'admin' : 'admin-login');
          else handleTabChange('home');
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
        activeRole={activeRole}
        isOfficialSignedIn={officialName !== null}
        officerUnreadCount={officerUnreadCount}
        complainantUnreadCount={complainantUnreadCount}
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
              setSelectedComplaintId(complaint.id);
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

        {/* Administration (#admin-inbox opens it on the Messages sub-tab) */}
        {(activeTab === 'admin' || activeTab === 'admin-inbox') && (
          <AdministrationView
            key={activeTab}
            lang={lang}
            setActiveTab={handleTabChange}
            complaints={complaints}
            institutions={institutions}
            onSelectComplaintForTracking={(complaint) => {
              setSelectedComplaintId(complaint.id);
              handleTabChange('track');
            }}
            onOpenOfficialChat={(complaint) => setSelectedComplaintId(complaint.id)}
            onUpdateComplaintStage={handleUpdateComplaintStage}
            initialAdminTab={activeTab === 'admin-inbox' ? 'messages' : 'ledger'}
            officerUnreadCount={officerUnreadCount}
            messagesPanel={
              <AdminInboxView
                embedded
                lang={lang}
                complaints={complaints}
                conversations={conversations}
                selectedComplaintId={selectedComplaintId}
                officialName={officialName}
                onSelectComplaint={setSelectedComplaintId}
                onOpenFullCase={handleOpenCaseFromInbox}
                onSendMessage={handleSendMessage}
                onRequestDocuments={handleRequestDocuments}
                onAddClarification={handleAddClarification}
                onMarkThreadRead={handleMarkThreadRead}
              />
            }
          />
        )}

        {/* Chat fallback */}
        {activeTab === 'chat' && selectedComplaint && (
          <UserAdminChatView
            lang={lang}
            setActiveTab={handleTabChange}
            complaint={selectedComplaint}
            messages={conversations[selectedComplaint.id] || []}
            onSendMessage={handleSendMessage}
            onFulfillDocumentRequest={handleFulfillDocumentRequest}
            onMarkThreadRead={handleMarkThreadRead}
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
        lang={lang}
        complaints={complaints}
        selectedComplaint={selectedComplaint}
        onSelectComplaint={(c) => setSelectedComplaintId(c.id)}
        conversations={conversations}
        unreadCount={complainantUnreadCount}
        onSendMessage={handleSendMessage}
        onFulfillDocumentRequest={handleFulfillDocumentRequest}
        onMarkThreadRead={handleMarkThreadRead}
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

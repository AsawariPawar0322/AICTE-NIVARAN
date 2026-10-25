import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint, Institution, StageKey } from '../types';
import { 
  ShieldCheck, 
  Layers, 
  Building2, 
  Clock, 
  FileCheck2, 
  Link2, 
  AlertTriangle, 
  CheckCircle2, 
  Search, 
  Filter, 
  ArrowUpRight, 
  FileText, 
  MessageSquare, 
  Send, 
  ChevronRight, 
  Sparkles,
  ExternalLink,
  Scale,
  Users
} from 'lucide-react';

interface AdministrationViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaints: Complaint[];
  institutions: Institution[];
  onSelectComplaintForTracking: (complaint: Complaint) => void;
  onOpenOfficialChat: (complaint: Complaint) => void;
  onUpdateComplaintStage: (caseId: string, newStage: StageKey, feedback?: string) => void;
  // Support Inbox rendered by App, shown under the "Messages" sub-tab
  messagesPanel?: React.ReactNode;
  officerUnreadCount?: number;
  initialAdminTab?: AdminTab;
}

export type AdminTab = 'ledger' | 'clusters' | 'institutions' | 'escalations' | 'messages';

export const AdministrationView: React.FC<AdministrationViewProps> = ({
  lang,
  setActiveTab,
  complaints,
  institutions,
  onSelectComplaintForTracking,
  onOpenOfficialChat,
  onUpdateComplaintStage,
  messagesPanel,
  officerUnreadCount = 0,
  initialAdminTab = 'ledger'
}) => {
  const t = translations[lang];
  const [adminTab, setAdminTab] = useState<AdminTab>(initialAdminTab);
  const [filterBureau, setFilterBureau] = useState<string>('ALL');
  const [filterStage, setFilterStage] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCaseForAction, setSelectedCaseForAction] = useState<Complaint | null>(complaints[0]);
  const [actionNoticeText, setActionNoticeText] = useState<string>('');
  const [confirmedLinks, setConfirmedLinks] = useState<Record<string, string[]>>({
    'AICTE-2026-GRV-84920': ['AICTE-2026-GRV-84931 (Related Seat Surrender)']
  });
  const [showLinkSuccessBanner, setShowLinkSuccessBanner] = useState<string | null>(null);

  // Statistics
  const totalCases = complaints.length;
  const pendingOtpCount = complaints.filter(c => c.currentStage === 'PENDING_OTP').length;
  const underInvestigationCount = complaints.filter(c => c.currentStage === 'INVESTIGATION' || c.currentStage === 'ALLOTTED').length;
  const resolvedCount = complaints.filter(c => c.currentStage === 'RESOLVED').length;

  const filteredComplaints = complaints.filter(c => {
    if (filterStage !== 'ALL' && c.currentStage !== filterStage) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = c.id.toLowerCase().includes(q) ||
        c.institutionName.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.complainantName.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  // Officers message complainants from the Support Inbox when it is available
  const openMessagesFor = (caseItem: Complaint) => {
    onOpenOfficialChat(caseItem);
    if (messagesPanel) setAdminTab('messages');
  };

  const handleConfirmLink = (primaryId: string, targetId: string) => {
    setConfirmedLinks(prev => ({
      ...prev,
      [primaryId]: [...(prev[primaryId] || []), targetId]
    }));
    setShowLinkSuccessBanner(`Successfully linked case ${targetId} to parent docket ${primaryId}. Multi-case institutional cluster registered.`);
    setTimeout(() => setShowLinkSuccessBanner(null), 5000);
  };

  const handleIssueNotice = (caseItem: Complaint) => {
    if (!actionNoticeText.trim()) {
      alert('Please enter statutory notice instructions or reference number.');
      return;
    }
    onUpdateComplaintStage(caseItem.id, 'INVESTIGATION', actionNoticeText);
    alert(`Statutory Notice served to Registrar of ${caseItem.institutionName}. 48-Hour ATR timer activated.`);
    setActionNoticeText('');
  };

  return (
    <div className="admin-view-root" id="main-content">
      {/* 1. Official Header & Credentials Bar */}
      <section className="admin-header-strip">
        <div className="container">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="official-emblem-seal">
                🏛️
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="admin-title">AICTE Central Grievance Command & Coordination Portal</h1>
                  <span className="admin-badge-official">PGRC Central Bureau</span>
                </div>
                <p className="admin-sub">
                  Officer on Duty: <strong>Dr. Ramesh Chandra Verma</strong> · Director, Public Grievance Redressal Cell · AICTE Head Office, New Delhi
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                className="btn btn-outline admin-header-btn"
                onClick={() => setActiveTab('discord')}
              >
                <span>Bureau Discord Hub</span>
                <ExternalLink size={14} />
              </button>
              <button
                type="button"
                className="btn btn-primary admin-header-btn"
                onClick={() => {
                  if (selectedCaseForAction) openMessagesFor(selectedCaseForAction);
                }}
              >
                <MessageSquare size={14} />
                <span>Launch Officer Chat</span>
              </button>
            </div>
          </div>

          {/* Sub Navigation Bar for Administration */}
          <div className="admin-subnav-strip flex items-center gap-2 mt-4">
            <button
              type="button"
              className={`admin-subnav-btn ${adminTab === 'ledger' ? 'active' : ''}`}
              onClick={() => setAdminTab('ledger')}
            >
              <Layers size={16} />
              <span>Bureau Grievance Ledger ({totalCases})</span>
            </button>

            <button
              type="button"
              className={`admin-subnav-btn ${adminTab === 'clusters' ? 'active' : ''}`}
              onClick={() => setAdminTab('clusters')}
            >
              <Link2 size={16} />
              <span>Intelligent Case Linker</span>
              <span className="admin-chip-innovation">SIH26264 Core</span>
            </button>

            <button
              type="button"
              className={`admin-subnav-btn ${adminTab === 'institutions' ? 'active' : ''}`}
              onClick={() => setAdminTab('institutions')}
            >
              <Building2 size={16} />
              <span>Institutional Compliance ({institutions.length})</span>
            </button>

            <button
              type="button"
              className={`admin-subnav-btn ${adminTab === 'escalations' ? 'active' : ''}`}
              onClick={() => setAdminTab('escalations')}
            >
              <Clock size={16} />
              <span>72h SLA & Escalation Radar</span>
              {pendingOtpCount > 0 && <span className="admin-badge-alert">{pendingOtpCount} OTP Pending</span>}
            </button>

            {messagesPanel && (
              <button
                type="button"
                className={`admin-subnav-btn ${adminTab === 'messages' ? 'active' : ''}`}
                onClick={() => setAdminTab('messages')}
              >
                <MessageSquare size={16} />
                <span>{t.navInbox}</span>
                {officerUnreadCount > 0 && <span className="admin-badge-alert">{officerUnreadCount} Unread</span>}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Success Banner if Case Linked */}
      {showLinkSuccessBanner && (
        <div className="container mt-3">
          <div className="link-success-banner flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-green" />
              <span>{showLinkSuccessBanner}</span>
            </div>
            <button type="button" className="close-banner-btn" onClick={() => setShowLinkSuccessBanner(null)}>✕</button>
          </div>
        </div>
      )}

      {/* 2. Main Tab Contents */}
      <section className="admin-body-section">
        <div className="container">
          {/* TAB 1: LEDGER */}
          {adminTab === 'ledger' && (
            <div className="ledger-layout">
              {/* Metric Counters */}
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div className="stat-card">
                  <span className="stat-number">{totalCases}</span>
                  <span className="stat-label">Total Active Cases in Bureau</span>
                </div>
                <div className="stat-card stat-alert">
                  <span className="stat-number text-warning">{pendingOtpCount}</span>
                  <span className="stat-label">Pending Citizen OTP Closure</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number text-blue">{underInvestigationCount}</span>
                  <span className="stat-label">Under Investigation / ATR Notice</span>
                </div>
                <div className="stat-card">
                  <span className="stat-number text-green">{resolvedCount}</span>
                  <span className="stat-label">Resolved & Citizen Verified</span>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="card filters-card mb-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="search-filter-box flex items-center gap-2">
                    <Search size={18} className="text-muted" />
                    <input
                      type="text"
                      placeholder="Search case ID, institution, complainant, or issue..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="filter-search-input"
                    />
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="filter-label flex items-center gap-1">
                      <Filter size={14} /> Stage:
                    </span>
                    <select
                      className="filter-select"
                      value={filterStage}
                      onChange={(e) => setFilterStage(e.target.value)}
                    >
                      <option value="ALL">All Stages</option>
                      <option value="REGISTERED">Stage 1: Registered</option>
                      <option value="ALLOTTED">Stage 2: Allotted</option>
                      <option value="INVESTIGATION">Stage 3: Investigation</option>
                      <option value="RESOLUTION_PROPOSED">Stage 4: Resolution Proposed</option>
                      <option value="PENDING_OTP">Stage 5: Pending Citizen OTP</option>
                      <option value="RESOLVED">Stage 6: Resolved</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Grievances Table & Quick Action Drawer */}
              <div className="grid grid-cols-3 gap-6">
                {/* Left 2 Cols: Cases Table */}
                <div className="col-span-2">
                  <div className="card table-card">
                    <div className="table-header-row flex items-center justify-between">
                      <h3 className="table-title">Registered Bureau Cases</h3>
                      <span className="text-muted text-sm">Showing {filteredComplaints.length} Records</span>
                    </div>

                    <div className="admin-table-wrap">
                      <table className="admin-table">
                        <thead>
                          <tr>
                            <th>Case Reference</th>
                            <th>Institution & Permanent ID</th>
                            <th>Category</th>
                            <th>Stage & Verification</th>
                            <th>SLA</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredComplaints.map((c) => {
                            const isSelected = selectedCaseForAction?.id === c.id;
                            const isOtpPending = c.currentStage === 'PENDING_OTP';
                            return (
                              <tr
                                key={c.id}
                                className={`table-row ${isSelected ? 'row-selected' : ''}`}
                                onClick={() => setSelectedCaseForAction(c)}
                              >
                                <td>
                                  <strong className="case-id-strong mono">{c.id}</strong>
                                  <span className="case-complainant-sub">{c.complainantName} ({c.complainantRole})</span>
                                </td>
                                <td>
                                  <strong className="inst-table-name">{c.institutionName}</strong>
                                  <span className="mono-sub">ID: {c.aictePermanentId}</span>
                                </td>
                                <td>
                                  <span className="cat-chip-table">{c.categoryLabel}</span>
                                </td>
                                <td>
                                  <span className={`stage-chip stage-${c.currentStage.toLowerCase()}`}>
                                    {c.currentStage.replace('_', ' ')}
                                  </span>
                                  {isOtpPending && (
                                    <span className="otp-pulse-chip" title="Awaiting Citizen Satisfaction OTP">
                                      OTP Required
                                    </span>
                                  )}
                                </td>
                                <td>
                                  <span className="sla-countdown-table mono">
                                    {c.slaHoursRemaining}h remaining
                                  </span>
                                </td>
                                <td>
                                  <button
                                    type="button"
                                    className="btn btn-outline btn-table-action"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      onSelectComplaintForTracking(c);
                                    }}
                                  >
                                    Inspect Docket
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right 1 Col: Selected Case Official Action Desk */}
                <div className="col-span-1">
                  {selectedCaseForAction ? (
                    <div className="card action-docket-card">
                      <div className="docket-header">
                        <span className="docket-tag">ACTIVE DOSSIER INSPECTOR</span>
                        <h4 className="docket-case-id mono">{selectedCaseForAction.id}</h4>
                        <p className="docket-inst-meta">
                          {selectedCaseForAction.institutionName} · Permanent ID: {selectedCaseForAction.aictePermanentId}
                        </p>
                      </div>

                      <div className="docket-body">
                        <div className="docket-summary-box">
                          <strong className="summary-title">{selectedCaseForAction.title}</strong>
                          <p className="summary-details">{selectedCaseForAction.details}</p>
                        </div>

                        {/* Evidence Verification Block */}
                        <div className="evidence-vault-summary mt-3">
                          <span className="sub-heading-bold">Cryptographic Evidence Vault:</span>
                          <div className="evidence-chips-list mt-1">
                            {selectedCaseForAction.evidenceList.map(ev => (
                              <div key={ev.id} className="ev-item flex items-center justify-between">
                                <span className="ev-name truncate">{ev.name}</span>
                                <span className="ev-hash-verified" title={`SHA-256: ${ev.sha256Hash}`}>SHA-256 ✓</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Action Taken Report Status */}
                        {selectedCaseForAction.resolutionProposedDetails && (
                          <div className="atr-status-box mt-3">
                            <span className="atr-badge">Institute ATR on Record</span>
                            <p className="atr-text mt-1">{selectedCaseForAction.resolutionProposedDetails.atrSummary}</p>
                            {selectedCaseForAction.resolutionProposedDetails.refundAmount && (
                              <div className="atr-refund-pill mt-1">
                                Refund: <strong>{selectedCaseForAction.resolutionProposedDetails.refundAmount}</strong>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Official Action Controls */}
                        <div className="official-controls-box mt-4">
                          <label className="official-control-label">Serve Statutory Order / Notice to Institute:</label>
                          <textarea
                            className="official-textarea"
                            rows={3}
                            placeholder="e.g. Inquire regarding caution fee deduction; submit refund NEFT UTR within 48h pursuant to AICTE Chapter 10..."
                            value={actionNoticeText}
                            onChange={(e) => setActionNoticeText(e.target.value)}
                          />
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              type="button"
                              className="btn btn-primary btn-sm flex-1"
                              onClick={() => handleIssueNotice(selectedCaseForAction)}
                            >
                              <Send size={14} />
                              <span>Dispatch Notice</span>
                            </button>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => openMessagesFor(selectedCaseForAction)}
                              title="Message Complainant"
                            >
                              <MessageSquare size={14} />
                              <span>Chat</span>
                            </button>
                          </div>
                        </div>

                        {/* Fast stage transition */}
                        <div className="stage-override-bar mt-3 pt-3 border-top">
                          <span className="text-muted text-xs block mb-1">Bureau Stage Transition:</span>
                          <div className="flex items-center gap-1 flex-wrap">
                            <button
                              type="button"
                              className="btn-tiny"
                              onClick={() => onUpdateComplaintStage(selectedCaseForAction.id, 'INVESTIGATION')}
                            >
                              Mark Investigating
                            </button>
                            <button
                              type="button"
                              className="btn-tiny btn-tiny-orange"
                              onClick={() => onUpdateComplaintStage(selectedCaseForAction.id, 'PENDING_OTP')}
                            >
                              Dispatch Citizen OTP
                            </button>
                            <button
                              type="button"
                              className="btn-tiny btn-tiny-green"
                              onClick={() => onUpdateComplaintStage(selectedCaseForAction.id, 'RESOLVED', 'Closed by Bureau Authority')}
                            >
                              Confirm Resolved
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="card text-center p-6 text-muted">
                      Select a grievance from the ledger to inspect and issue orders.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: INTELLIGENT CASE LINKER (SIH26264 CORE) */}
          {adminTab === 'clusters' && (
            <div className="clusters-layout">
              <div className="linker-hero-banner card mb-4">
                <div className="flex items-start gap-4">
                  <div className="linker-icon-seal">
                    <Sparkles size={28} className="text-orange" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="linker-title">Intelligent Cross-Bureau Case Discovery & Linking Engine</h2>
                      <span className="innovation-badge">SIH26264 Signature Feature</span>
                    </div>
                    <p className="linker-desc">
                      Under traditional systems, grievances against the same university remain scattered across multiple cells. 
                      NIVARAN correlates institution identity (Permanent ID), incident categories, and semantic tokens to surface multi-case clusters before unilateral decisions are made.
                    </p>
                  </div>
                </div>
              </div>

              {/* Cluster 1: Delhi Technological University (DTU) */}
              <div className="card cluster-card mb-4">
                <div className="cluster-header flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 size={24} className="text-blue" />
                    <div>
                      <h3 className="cluster-inst-name">Delhi Technological University (DTU)</h3>
                      <span className="cluster-id-sub">
                        Permanent ID: <code className="mono">1-10928341</code> · New Delhi, Delhi · 4 Active Cases Detected
                      </span>
                    </div>
                  </div>
                  <div className="cluster-score-pill">
                    <span className="score-value">94%</span>
                    <span className="score-label">Pattern Match Correlation</span>
                  </div>
                </div>

                <div className="cluster-cases-grid grid grid-cols-2 gap-4 mt-4">
                  {/* Primary Case */}
                  <div className="cluster-case-item primary-item">
                    <div className="flex items-center justify-between">
                      <span className="role-tag primary-tag">Primary Complaint Docket</span>
                      <span className="mono-case">AICTE-2026-GRV-84920</span>
                    </div>
                    <strong className="case-heading mt-1">Excessive Caution Money & Tuition Non-Refund</strong>
                    <p className="case-snippet">Complainant: Aarav Sharma (Surrendered seat 14 Aug 2026, ₹45,000 deduction contrary to guidelines).</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="stage-mini-pill">Pending OTP</span>
                      <span className="cat-mini-pill">FEES_REFUND</span>
                    </div>
                  </div>

                  {/* Correlated Candidate Case */}
                  <div className="cluster-case-item match-item">
                    <div className="flex items-center justify-between">
                      <span className="role-tag match-tag">Discovered Overlap Match</span>
                      <span className="mono-case">AICTE-2026-GRV-84931</span>
                    </div>
                    <strong className="case-heading mt-1">Caution Deposit Withheld After Round 1 Seat Exit</strong>
                    <p className="case-snippet">Complainant: Tanya Verma (Surrendered seat 15 Aug 2026, ₹45,000 deduction by same finance counter).</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="flex items-center gap-1.5">
                        <span className="correlation-chip">Common Faculty: Accounts Dept</span>
                        <span className="correlation-chip">Same 24h Window</span>
                      </div>

                      {confirmedLinks['AICTE-2026-GRV-84920']?.includes('AICTE-2026-GRV-84931 (Related Seat Surrender)') ? (
                        <span className="link-confirmed-badge flex items-center gap-1">
                          <CheckCircle2 size={14} />
                          <span>Linked to Bureau Docket</span>
                        </span>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary btn-sm"
                          onClick={() => handleConfirmLink('AICTE-2026-GRV-84920', 'AICTE-2026-GRV-84931 (Related Seat Surrender)')}
                        >
                          <Link2 size={14} />
                          <span>+ Link to Existing Complaint</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                <div className="cluster-footer-actions flex items-center justify-between mt-4 pt-3 border-top">
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <Scale size={16} />
                    <span>Statutory Implication: Bundling enables single-window systemic inquiry instead of isolated student hearings.</span>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline btn-sm"
                    onClick={() => alert('Coordinated Inquiry Notice generated for DTU Academic & Finance Bureau covering both complainants.')}
                  >
                    Generate Combined Institutional Inquiry Notice
                  </button>
                </div>
              </div>

              {/* Cluster 2: VJTI Mumbai */}
              <div className="card cluster-card">
                <div className="cluster-header flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Building2 size={24} className="text-orange" />
                    <div>
                      <h3 className="cluster-inst-name">Veermata Jijabai Technological Institute (VJTI)</h3>
                      <span className="cluster-id-sub">
                        Permanent ID: <code className="mono">1-48201948</code> · Mumbai, Maharashtra · 3 Laboratory Complaints
                      </span>
                    </div>
                  </div>
                  <div className="cluster-score-pill score-medium">
                    <span className="score-value">88%</span>
                    <span className="score-label">Equipment Deficit Cluster</span>
                  </div>
                </div>

                <div className="cluster-cases-grid grid grid-cols-2 gap-4 mt-4">
                  <div className="cluster-case-item primary-item">
                    <div className="flex items-center justify-between">
                      <span className="role-tag primary-tag">Docket A</span>
                      <span className="mono-case">AICTE-2026-GRV-65021</span>
                    </div>
                    <strong className="case-heading mt-1">Lack of Core Metallurgy Lab Universal Testing Machine</strong>
                    <p className="case-snippet">Complainant: Rohan Deshmukh (Mechanical 3rd Year · UTM broken since 8 months).</p>
                  </div>

                  <div className="cluster-case-item match-item">
                    <div className="flex items-center justify-between">
                      <span className="role-tag match-tag">Docket B (Candidate)</span>
                      <span className="mono-case">AICTE-2026-GRV-65089</span>
                    </div>
                    <strong className="case-heading mt-1">Strength of Materials Lab Practical Equipment Non-Functional</strong>
                    <p className="case-snippet">Complainant: Sneha Patwardhan (Production Engineering · Missing tensile apparatus calibration).</p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="correlation-chip">Same Department Building</span>
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => handleConfirmLink('AICTE-2026-GRV-65021', 'AICTE-2026-GRV-65089 (Strength of Materials Lab)')}
                      >
                        <Link2 size={14} />
                        <span>Link to Infrastructure Inspection</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: INSTITUTIONS */}
          {adminTab === 'institutions' && (
            <div className="institutions-admin-layout">
              <div className="card table-card">
                <div className="table-header-row flex items-center justify-between">
                  <div>
                    <h3 className="table-title">National Technical Institution Compliance Directory</h3>
                    <p className="text-muted text-sm">Real-time status across AICTE approved engineering, management, and polytechnic institutes.</p>
                  </div>
                  <span className="status-chip chip-info">Database Status: Synced</span>
                </div>

                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Permanent ID</th>
                        <th>Institution Name</th>
                        <th>Location</th>
                        <th>Category</th>
                        <th>Open Grievances</th>
                        <th>Compliance Rating</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {institutions.map(inst => (
                        <tr key={inst.id} className="table-row">
                          <td className="mono font-bold">{inst.permanentId}</td>
                          <td>
                            <strong>{inst.name}</strong>
                          </td>
                          <td>{inst.city}, {inst.state}</td>
                          <td>
                            <span className="cat-chip-table">{inst.category}</span>
                          </td>
                          <td>
                            <span className="open-cases-badge">
                              {inst.openCasesCount} Pending
                            </span>
                          </td>
                          <td>
                            <span className="compliance-tag font-semibold text-green">
                              {inst.complianceRating}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-outline btn-sm"
                              onClick={() => {
                                setSearchQuery(inst.name);
                                setAdminTab('ledger');
                              }}
                            >
                              Filter Grievances →
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 72H SLA & ESCALATIONS */}
          {adminTab === 'messages' && messagesPanel}

          {adminTab === 'escalations' && (
            <div className="escalations-layout">
              <div className="grid grid-cols-2 gap-6">
                <div className="card">
                  <h3 className="card-title flex items-center gap-2">
                    <Clock size={20} className="text-warning" />
                    <span>72-Hour First Response Monitoring</span>
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    Mandated under AICTE Grievance Directive 2026. Non-responsive colleges face automatic fine deductions and approval audits.
                  </p>

                  <div className="sla-monitor-list flex flex-col gap-3">
                    {complaints.map(c => (
                      <div key={c.id} className="sla-monitor-item card-inner flex items-center justify-between">
                        <div>
                          <span className="mono-sub font-bold">{c.id}</span>
                          <h5 className="sla-inst-title">{c.institutionName}</h5>
                          <span className="sla-category-sub">{c.categoryLabel}</span>
                        </div>
                        <div className="text-right">
                          <div className="sla-countdown-badge mono">
                            {c.slaHoursRemaining}h Remaining
                          </div>
                          <span className="text-xs text-muted block mt-1">Status: {c.currentStage}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="card">
                  <h3 className="card-title flex items-center gap-2">
                    <AlertTriangle size={20} className="text-danger" />
                    <span>Ombudsman Escalation Matrix</span>
                  </h3>
                  <p className="text-muted text-sm mb-4">
                    Cases unresolved within statutory timelines are transferred to the State Technical Ombudsman for formal judicial adjudication.
                  </p>

                  <div className="ombudsman-info-box p-4 bg-light rounded border">
                    <h5 className="font-bold mb-2">Escalation Protocol SIH26264:</h5>
                    <ul className="escalation-rules-list flex flex-col gap-2 text-sm text-muted">
                      <li>• <strong>Level 1 (0-72h):</strong> Institutional Grievance Redressal Committee (IGRAC).</li>
                      <li>• <strong>Level 2 (Day 4-15):</strong> AICTE Regional Office & PGRC Central Director Notice.</li>
                      <li>• <strong>Level 3 (Day 16+):</strong> Automatic transfer to High Court Retired Judge / State Technical Ombudsman.</li>
                    </ul>
                    <button
                      type="button"
                      className="btn btn-outline btn-block mt-4"
                      onClick={() => alert('All current complaints are within the 72h first response threshold.')}
                    >
                      Audit Escalation Queue
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .admin-view-root {
          background-color: #F8FAFC;
          min-height: calc(100vh - 120px);
          font-family: var(--font-sans);
          padding-bottom: 48px;
        }

        .admin-header-strip {
          background: linear-gradient(135deg, #0B2A5B 0%, #0F3875 100%);
          color: #FFFFFF;
          padding: 24px 0 0 0;
          border-bottom: 3px solid var(--color-brand-orange-500);
        }
        .official-emblem-seal {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.15);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.6rem;
          border: 2px solid var(--color-brand-orange-500);
        }
        .admin-title {
          font-size: 1.35rem;
          font-weight: 800;
          color: #FFFFFF;
          margin: 0;
        }
        .admin-badge-official {
          background: var(--color-brand-orange-500);
          color: #0B2A5B;
          font-weight: 800;
          font-size: 0.72rem;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .admin-sub {
          color: #CBD5E1;
          font-size: 0.85rem;
          margin-top: 2px;
        }
        .admin-header-btn {
          font-size: 0.825rem;
          padding: 6px 14px;
        }

        /* Subnav strip */
        .admin-subnav-strip {
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          padding-top: 8px;
          overflow-x: auto;
          flex-wrap: wrap;
        }
        .admin-subnav-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: none;
          color: #E2E8F0;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 10px 16px;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .admin-subnav-btn:hover {
          color: #FFFFFF;
          background: rgba(255, 255, 255, 0.08);
        }
        .admin-subnav-btn.active {
          color: #FFFFFF;
          border-bottom-color: var(--color-brand-orange-500);
          background: rgba(255, 255, 255, 0.12);
        }
        .admin-chip-innovation {
          background: #C2570C;
          color: #FFFFFF;
          font-size: 0.68rem;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
          font-weight: 800;
        }
        .admin-badge-alert {
          background: #F59E0B;
          color: #000000;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
        }

        /* Body */
        .admin-body-section {
          padding: 24px 0;
        }

        .stat-alert {
          border-left: 4px solid var(--color-brand-orange-500);
        }

        /* Filters */
        .filters-card {
          padding: 12px 18px;
        }
        .search-filter-box {
          background: #F8FAFC;
          border: 1px solid var(--color-neutral-300);
          border-radius: 6px;
          padding: 6px 12px;
          width: 380px;
          max-width: 100%;
        }
        .filter-search-input {
          border: none;
          background: transparent;
          outline: none;
          font-size: 0.85rem;
          width: 100%;
        }
        .filter-select {
          border: 1px solid var(--color-neutral-300);
          background: #FFFFFF;
          border-radius: 6px;
          padding: 6px 12px;
          font-size: 0.825rem;
          outline: none;
        }

        /* Table */
        .table-card {
          padding: 0;
          overflow: hidden;
        }
        .table-header-row {
          padding: 16px 20px;
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .table-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-navy-900);
          margin: 0;
        }
        .admin-table-wrap {
          overflow-x: auto;
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
          text-align: left;
        }
        .admin-table th {
          background: #F1F5F9;
          padding: 10px 16px;
          color: #475569;
          font-weight: 700;
          border-bottom: 1px solid var(--color-neutral-300);
          white-space: nowrap;
        }
        .admin-table td {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-neutral-200);
          vertical-align: middle;
        }
        .table-row {
          cursor: pointer;
          transition: background-color 0.15s ease;
        }
        .table-row:hover {
          background-color: #F8FAFC;
        }
        .table-row.row-selected {
          background-color: #EFF6FF;
        }
        .case-id-strong {
          color: var(--color-navy-900);
          display: block;
        }
        .case-complainant-sub {
          font-size: 0.72rem;
          color: #64748B;
          display: block;
        }
        .inst-table-name {
          color: #0F172A;
          display: block;
          max-width: 220px;
        }
        .mono-sub {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          color: #64748B;
        }
        .cat-chip-table {
          background: #E2E8F0;
          color: #334155;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }
        .stage-chip {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          display: inline-block;
        }
        .stage-registered { background: #E2E8F0; color: #334155; }
        .stage-allotted { background: #DBEAFE; color: #1D4ED8; }
        .stage-investigation { background: #FEF3C7; color: #92400E; }
        .stage-pending_otp { background: #FFEDD5; color: #C2570C; border: 1px solid #FDBA74; }
        .stage-resolved { background: #DCFCE7; color: #166534; }
        .otp-pulse-chip {
          background: #C2570C;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 5px;
          border-radius: var(--radius-pill);
          display: block;
          margin-top: 2px;
          width: fit-content;
        }
        .sla-countdown-table {
          color: #C2570C;
          font-weight: 700;
          font-size: 0.8rem;
        }
        .btn-table-action {
          font-size: 0.75rem;
          padding: 4px 10px;
        }

        /* Selected Docket card */
        .action-docket-card {
          padding: 16px;
          position: sticky;
          top: 20px;
        }
        .docket-header {
          border-bottom: 1px solid var(--color-neutral-200);
          padding-bottom: 10px;
          margin-bottom: 12px;
        }
        .docket-tag {
          font-size: 0.68rem;
          font-weight: 800;
          color: var(--color-action-600);
          letter-spacing: 0.5px;
          display: block;
        }
        .docket-case-id {
          font-size: 1.15rem;
          color: var(--color-navy-900);
          margin: 2px 0;
        }
        .docket-inst-meta {
          font-size: 0.75rem;
          color: #64748B;
        }
        .docket-summary-box {
          background: #F8FAFC;
          border-radius: 6px;
          padding: 10px;
          border: 1px solid var(--color-neutral-200);
        }
        .summary-title {
          font-size: 0.85rem;
          color: var(--color-navy-900);
          display: block;
        }
        .summary-details {
          font-size: 0.78rem;
          color: #475569;
          margin-top: 4px;
          line-height: 1.4;
        }
        .sub-heading-bold {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1E293B;
          display: block;
        }
        .ev-item {
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-200);
          border-radius: 4px;
          padding: 4px 8px;
          font-size: 0.72rem;
          margin-bottom: 4px;
        }
        .ev-hash-verified {
          color: #166534;
          font-weight: 700;
        }
        .atr-status-box {
          background: #ECFDF5;
          border: 1px solid #A7F3D0;
          border-radius: 6px;
          padding: 8px 10px;
        }
        .atr-badge {
          background: #059669;
          color: #FFFFFF;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
        }
        .atr-text {
          font-size: 0.75rem;
          color: #065F46;
          margin: 0;
        }
        .atr-refund-pill {
          font-size: 0.72rem;
          color: #047857;
        }
        .official-control-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #1E293B;
          display: block;
          margin-bottom: 4px;
        }
        .official-textarea {
          width: 100%;
          border: 1px solid var(--color-neutral-300);
          border-radius: 6px;
          padding: 6px 10px;
          font-size: 0.8rem;
          outline: none;
          font-family: inherit;
        }
        .official-textarea:focus {
          border-color: var(--color-focus);
        }
        .btn-tiny {
          background: #E2E8F0;
          border: 1px solid #CBD5E1;
          color: #1E293B;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: 4px;
          cursor: pointer;
        }
        .btn-tiny:hover { background: #CBD5E1; }
        .btn-tiny-orange { background: #FFEDD5; border-color: #FDBA74; color: #C2570C; }
        .btn-tiny-green { background: #DCFCE7; border-color: #86EFAC; color: #166534; }

        /* Clusters Tab (SIH26264) */
        .linker-hero-banner {
          background: linear-gradient(135deg, #FFF7ED 0%, #FFFFFF 100%);
          border-left: 5px solid var(--color-brand-orange-500);
          padding: 20px;
        }
        .linker-icon-seal {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: #FFEDD5;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .linker-title {
          font-size: 1.25rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0;
        }
        .innovation-badge {
          background: var(--color-action-600);
          color: #FFFFFF;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .linker-desc {
          font-size: 0.85rem;
          color: #475569;
          margin-top: 4px;
          line-height: 1.5;
        }

        .cluster-card {
          padding: 20px;
        }
        .cluster-inst-name {
          font-size: 1.15rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0;
        }
        .cluster-id-sub {
          font-size: 0.78rem;
          color: #64748B;
        }
        .cluster-score-pill {
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          padding: 4px 12px;
          border-radius: var(--radius-md);
          text-align: right;
        }
        .cluster-score-pill.score-medium {
          background: #FFF7ED;
          border-color: #FED7AA;
        }
        .score-value {
          font-size: 1.2rem;
          font-weight: 900;
          color: var(--color-brand-blue-600);
          display: block;
        }
        .score-medium .score-value {
          color: var(--color-action-600);
        }
        .score-label {
          font-size: 0.68rem;
          color: #64748B;
          text-transform: uppercase;
        }

        .cluster-case-item {
          background: #F8FAFC;
          border: 1px solid var(--color-neutral-300);
          border-radius: 8px;
          padding: 14px;
        }
        .primary-item {
          border-left: 4px solid var(--color-brand-blue-600);
        }
        .match-item {
          border-left: 4px solid var(--color-brand-orange-500);
          background: #FFFDFB;
        }
        .role-tag {
          font-size: 0.68rem;
          font-weight: 800;
          text-transform: uppercase;
          padding: 1px 6px;
          border-radius: 3px;
        }
        .primary-tag { background: #DBEAFE; color: #1D4ED8; }
        .match-tag { background: #FFEDD5; color: #C2570C; }
        .mono-case {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          font-weight: 700;
          color: #0F172A;
        }
        .case-heading {
          font-size: 0.9rem;
          color: var(--color-navy-900);
          display: block;
        }
        .case-snippet {
          font-size: 0.78rem;
          color: #475569;
          margin-top: 4px;
          line-height: 1.4;
        }
        .correlation-chip {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: #334155;
          font-size: 0.68rem;
          font-weight: 600;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
        }
        .link-confirmed-badge {
          background: #DCFCE7;
          border: 1px solid #86EFAC;
          color: #166534;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
        }

        .link-success-banner {
          background: #DCFCE7;
          border: 1px solid #86EFAC;
          color: #166534;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .close-banner-btn {
          background: none;
          border: none;
          color: #166534;
          cursor: pointer;
          font-size: 1rem;
        }

        .open-cases-badge {
          background: #FEE2E2;
          color: #991B1B;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }

        .sla-countdown-badge {
          background: #FEF3C7;
          color: #92400E;
          border: 1px solid #FCD34D;
          font-size: 0.78rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: 4px;
          display: inline-block;
        }
        .sla-inst-title {
          font-size: 0.85rem;
          color: var(--color-navy-900);
          margin: 2px 0;
        }
        .sla-category-sub {
          font-size: 0.72rem;
          color: #64748B;
        }
      `}</style>
    </div>
  );
};

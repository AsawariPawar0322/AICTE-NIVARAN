import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint } from '../types';
import {
  FolderClock,
  CheckCircle,
  AlertCircle,
  Clock,
  FilePlus2,
  MessageSquare,
  ArrowRight,
  KeyRound,
  ShieldCheck,
  Building,
  User,
  Filter
} from 'lucide-react';

interface ComplainantDashboardProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaints: Complaint[];
  onSelectComplaintForTracking: (complaint: Complaint) => void;
  onOpenChatWithComplaint: (complaint: Complaint) => void;
}

export const ComplainantDashboard: React.FC<ComplainantDashboardProps> = ({
  lang,
  setActiveTab,
  complaints,
  onSelectComplaintForTracking,
  onOpenChatWithComplaint
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<'ALL' | 'ACTION_REQUIRED' | 'ACTIVE' | 'RESOLVED'>('ALL');

  const pendingOtpCases = complaints.filter(c => c.currentStage === 'PENDING_OTP');
  const activeCases = complaints.filter(c => c.currentStage !== 'RESOLVED');
  const resolvedCases = complaints.filter(c => c.currentStage === 'RESOLVED');

  const filteredComplaints = complaints.filter(c => {
    if (filter === 'ACTION_REQUIRED') return c.currentStage === 'PENDING_OTP';
    if (filter === 'ACTIVE') return c.currentStage !== 'RESOLVED';
    if (filter === 'RESOLVED') return c.currentStage === 'RESOLVED';
    return true;
  });

  return (
    <div className="dashboard-container" id="main-content">
      <div className="container">
        {/* User Identity Profile Banner */}
        <div className="user-profile-header flex items-center justify-between flex-wrap gap-4">
          <div className="user-info flex items-center gap-3">
            <div className="user-avatar-circle">
              <User size={28} />
            </div>
            <div>
              <div className="user-name-row flex items-center gap-2">
                <h2 className="user-display-name">Aarav Sharma</h2>
                <span className="user-role-badge">Verified Student</span>
                <span className="nivaran-portal-tag">AICTE NIVARAN Portal</span>
              </div>
              <p className="user-institution-sub flex items-center gap-2">
                <Building size={14} />
                <span>Delhi Technological University (DTU) · Roll: 2024-CS-108 · Mobile: +91 98712 34567</span>
              </p>
            </div>
          </div>

          <div className="profile-action-buttons flex items-center gap-3">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveTab('file-complaint')}
            >
              <FilePlus2 size={16} />
              <span>{t.navFileComplaint}</span>
            </button>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setActiveTab('discord')}
            >
              <MessageSquare size={16} />
              <span>Community Hub</span>
            </button>
          </div>
        </div>

        {/* Action Required Banner if OTP pending */}
        {pendingOtpCases.length > 0 && (
          <div className="urgent-action-box flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="pulse-icon-box">
                <KeyRound size={24} className="text-warning-bold" />
              </div>
              <div>
                <strong className="action-box-title">Citizen Action Required: 1 Grievance Awaiting Your OTP Acknowledgment!</strong>
                <p className="action-box-desc">
                  Delhi Technological University has submitted the Action Taken Report (ATR) and processed your ₹44,000 refund. Please review and input your OTP to finalize case closure or escalate.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="btn btn-primary btn-otp-action"
              onClick={() => {
                onSelectComplaintForTracking(pendingOtpCases[0]);
                setActiveTab('track');
              }}
            >
              <KeyRound size={16} />
              <span>Verify OTP & Close Case</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}

        {/* Metric Summary Cards */}
        <div className="grid grid-cols-4 gap-4 dashboard-metrics-row">
          <div
            className={`metric-tile ${filter === 'ALL' ? 'active-metric' : ''}`}
            onClick={() => setFilter('ALL')}
          >
            <div className="metric-header flex items-center justify-between">
              <span className="metric-label">Total Grievances</span>
              <FolderClock size={18} className="text-muted" />
            </div>
            <div className="metric-value">{complaints.length}</div>
            <span className="metric-sub">Across all categories</span>
          </div>

          <div
            className={`metric-tile tile-action ${filter === 'ACTION_REQUIRED' ? 'active-metric' : ''}`}
            onClick={() => setFilter('ACTION_REQUIRED')}
          >
            <div className="metric-header flex items-center justify-between">
              <span className="metric-label">Action / OTP Required</span>
              <AlertCircle size={18} className="text-warning-bold" />
            </div>
            <div className="metric-value text-warning-bold">{pendingOtpCases.length}</div>
            <span className="metric-sub">Needs complainant input</span>
          </div>

          <div
            className={`metric-tile ${filter === 'ACTIVE' ? 'active-metric' : ''}`}
            onClick={() => setFilter('ACTIVE')}
          >
            <div className="metric-header flex items-center justify-between">
              <span className="metric-label">Under Investigation</span>
              <Clock size={18} className="text-blue" />
            </div>
            <div className="metric-value">{activeCases.length}</div>
            <span className="metric-sub">Within 72h SLA buffer</span>
          </div>

          <div
            className={`metric-tile ${filter === 'RESOLVED' ? 'active-metric' : ''}`}
            onClick={() => setFilter('RESOLVED')}
          >
            <div className="metric-header flex items-center justify-between">
              <span className="metric-label">Closed & Resolved</span>
              <CheckCircle size={18} className="text-green" />
            </div>
            <div className="metric-value text-green">{resolvedCases.length}</div>
            <span className="metric-sub">OTP Verified Closures</span>
          </div>
        </div>

        {/* Complaints Data Feed */}
        <div className="complaints-feed-card card">
          <div className="feed-header flex items-center justify-between flex-wrap gap-3">
            <div>
              <h3>My Grievances & Redressal Records</h3>
              <p className="feed-sub">Review stage progress, official remarks, proof integrity, and verify closure.</p>
            </div>

            <div className="filter-chips-row flex items-center gap-2">
              <Filter size={16} className="text-muted" />
              <button
                type="button"
                className={`filter-chip ${filter === 'ALL' ? 'active' : ''}`}
                onClick={() => setFilter('ALL')}
              >
                All ({complaints.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'ACTION_REQUIRED' ? 'active' : ''}`}
                onClick={() => setFilter('ACTION_REQUIRED')}
              >
                OTP Pending ({pendingOtpCases.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'ACTIVE' ? 'active' : ''}`}
                onClick={() => setFilter('ACTIVE')}
              >
                Active ({activeCases.length})
              </button>
              <button
                type="button"
                className={`filter-chip ${filter === 'RESOLVED' ? 'active' : ''}`}
                onClick={() => setFilter('RESOLVED')}
              >
                Resolved ({resolvedCases.length})
              </button>
            </div>
          </div>

          <div className="complaints-list">
            {filteredComplaints.length === 0 ? (
              <div className="empty-state-box text-center">
                <FolderClock size={40} className="empty-icon" />
                <p>No grievances found matching this filter.</p>
              </div>
            ) : (
              filteredComplaints.map((item) => {
                const isOtpPending = item.currentStage === 'PENDING_OTP';
                const isResolved = item.currentStage === 'RESOLVED';

                return (
                  <div key={item.id} className={`complaint-row-item ${isOtpPending ? 'highlight-row' : ''}`}>
                    <div className="row-meta-top flex items-center justify-between flex-wrap gap-2">
                      <div className="case-id-cluster flex items-center gap-2">
                        <code className="case-id-badge mono">{item.id}</code>
                        <span className="category-pill">{item.categoryLabel}</span>
                        {item.relatedCaseCount && item.relatedCaseCount > 0 && (
                          <span className="related-pill" title="Other students filed similar complaints against this college">
                            {item.relatedCaseCount} Related Cases
                          </span>
                        )}
                      </div>

                      <div className="stage-pill-box flex items-center gap-2">
                        {isOtpPending ? (
                          <span className="status-chip chip-warning">
                            <KeyRound size={13} />
                            Stage 5: Pending Citizen OTP
                          </span>
                        ) : isResolved ? (
                          <span className="status-chip chip-success">
                            <ShieldCheck size={13} />
                            Stage 6: Disposed & Verified
                          </span>
                        ) : (
                          <span className="status-chip chip-info">
                            <Clock size={13} />
                            Stage {item.stageNumber}: {item.currentStage}
                          </span>
                        )}

                        <span className="sla-badge flex items-center gap-1">
                          <Clock size={12} />
                          {item.slaHoursRemaining > 0 ? `${item.slaHoursRemaining}h SLA Left` : 'SLA Satisfied'}
                        </span>
                      </div>
                    </div>

                    <h4 className="complaint-item-title">{item.title}</h4>
                    <p className="complaint-item-desc">{item.details}</p>

                    <div className="complaint-institution-strip flex items-center justify-between flex-wrap gap-2">
                      <div className="inst-detail">
                        <strong>Institution:</strong> {item.institutionName} (<code className="mono">{item.aictePermanentId}</code>) · Assigned to: <em>{item.assignedOfficer.name} ({item.assignedOfficer.bureau})</em>
                      </div>
                      <div className="proof-count-tag">
                        {item.evidenceList.length} Cryptographic Proof(s) Attached
                      </div>
                    </div>

                    {/* Action Taken Report preview for OTP pending */}
                    {isOtpPending && item.resolutionProposedDetails && (
                      <div className="atr-preview-box">
                        <div className="atr-head flex items-center justify-between">
                          <strong className="atr-title">Proposed Resolution by DTU Accounts Bureau:</strong>
                          <span className="atr-ref">Order: {item.resolutionProposedDetails.officialOrderRef}</span>
                        </div>
                        <p className="atr-text">{item.resolutionProposedDetails.atrSummary}</p>
                        <div className="atr-bottom-row flex items-center justify-between">
                          <span className="atr-amount">Refund Amount: <strong>{item.resolutionProposedDetails.refundAmount}</strong></span>
                          <span className="atr-help-text">Please verify receipt in your bank account and submit OTP.</span>
                        </div>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="row-action-bar flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={() => {
                          onOpenChatWithComplaint(item);
                          setActiveTab('chat');
                        }}
                      >
                        <MessageSquare size={14} />
                        <span>Chat with Nodal Officer</span>
                      </button>

                      <button
                        type="button"
                        className={`btn btn-sm ${isOtpPending ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => {
                          onSelectComplaintForTracking(item);
                          setActiveTab('track');
                        }}
                      >
                        {isOtpPending ? (
                          <>
                            <KeyRound size={14} />
                            <span>Verify OTP for Closure</span>
                          </>
                        ) : (
                          <>
                            <span>View Stage Timeline</span>
                            <ArrowRight size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        .dashboard-container {
          padding: 32px 0 64px 0;
        }
        .user-profile-header {
          background-color: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-lg);
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: var(--shadow-sm);
        }
        .user-avatar-circle {
          width: 54px;
          height: 54px;
          border-radius: 50%;
          background: #EFF6FF;
          color: var(--color-brand-blue-600);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #BFDBFE;
        }
        .user-display-name {
          font-size: 1.35rem;
          font-weight: 700;
        }
        .user-role-badge {
          background-color: #DCFCE7;
          color: #166534;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .nivaran-portal-tag {
          background-color: #EFF6FF;
          color: var(--color-brand-blue-600);
          border: 1px solid #BFDBFE;
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .user-institution-sub {
          font-size: 0.85rem;
          color: var(--color-neutral-600);
          margin-top: 4px;
        }

        .urgent-action-box {
          background-color: #FEF3C7;
          border: 2px solid #F59E0B;
          border-radius: var(--radius-md);
          padding: 18px 24px;
          margin-bottom: 24px;
          box-shadow: 0 4px 12px rgba(245, 158, 11, 0.15);
        }
        .pulse-icon-box {
          background: #FDE68A;
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .text-warning-bold {
          color: #B45309;
        }
        .action-box-title {
          color: #92400E;
          font-size: 1rem;
          display: block;
        }
        .action-box-desc {
          font-size: 0.875rem;
          color: #78350F;
          margin-top: 2px;
        }
        .btn-otp-action {
          white-space: nowrap;
          padding: 10px 20px;
        }

        .dashboard-metrics-row {
          margin-bottom: 28px;
        }
        .metric-tile {
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 18px;
          cursor: pointer;
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
        }
        .metric-tile:hover {
          border-color: var(--color-brand-blue-600);
        }
        .active-metric {
          border-color: var(--color-brand-blue-600);
          background-color: #F8FAFC;
          box-shadow: 0 0 0 2px rgba(31, 95, 191, 0.2);
        }
        .tile-action {
          border-left: 4px solid #F59E0B;
        }
        .metric-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--color-neutral-600);
        }
        .metric-value {
          font-size: 1.85rem;
          font-weight: 800;
          color: var(--color-navy-900);
          font-family: var(--font-mono);
          margin: 6px 0 2px 0;
        }
        .metric-sub {
          font-size: 0.75rem;
          color: var(--color-neutral-400);
        }

        .feed-header {
          border-bottom: 1px solid var(--color-neutral-200);
          padding-bottom: 16px;
          margin-bottom: 20px;
        }
        .feed-sub {
          font-size: 0.85rem;
          color: var(--color-neutral-600);
          margin-top: 2px;
        }
        .filter-chip {
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          color: var(--color-neutral-700);
          font-size: 0.8rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          cursor: pointer;
        }
        .filter-chip.active {
          background: var(--color-navy-900);
          color: #FFFFFF;
          border-color: var(--color-navy-900);
        }

        .complaint-row-item {
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 20px;
          margin-bottom: 16px;
          transition: border-color 0.15s ease;
        }
        .highlight-row {
          border: 2px solid #F59E0B;
          background: #FFFDF7;
        }
        .case-id-badge {
          background: var(--color-neutral-100);
          color: var(--color-navy-900);
          font-weight: 700;
          font-size: 0.85rem;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--color-neutral-300);
        }
        .category-pill {
          background: #EFF6FF;
          color: #1E40AF;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .related-pill {
          background: #F3E8FF;
          color: #6B21A8;
          font-size: 0.72rem;
          font-weight: 600;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .sla-badge {
          font-size: 0.75rem;
          color: #475569;
          background: #F1F5F9;
          padding: 3px 8px;
          border-radius: var(--radius-sm);
        }
        .complaint-item-title {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 10px 0 6px 0;
          color: var(--color-navy-900);
        }
        .complaint-item-desc {
          font-size: 0.9rem;
          color: var(--color-neutral-700);
          line-height: 1.4;
          margin-bottom: 12px;
        }
        .complaint-institution-strip {
          background: var(--color-neutral-100);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
          font-size: 0.8125rem;
          color: var(--color-neutral-700);
          margin-bottom: 14px;
        }
        .proof-count-tag {
          font-weight: 600;
          color: var(--color-brand-blue-600);
        }

        .atr-preview-box {
          background: #F0FDF4;
          border: 1px solid #86EFAC;
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin-bottom: 14px;
        }
        .atr-head {
          font-size: 0.85rem;
          color: #166534;
        }
        .atr-ref {
          font-size: 0.75rem;
          font-family: var(--font-mono);
          color: #15803D;
        }
        .atr-text {
          font-size: 0.875rem;
          color: #14532D;
          margin: 4px 0;
        }
        .atr-bottom-row {
          font-size: 0.8rem;
          color: #166534;
        }
        .atr-amount strong {
          color: #15803D;
        }
        .empty-state-box {
          padding: 40px;
          color: var(--color-neutral-600);
        }
        .empty-icon {
          color: var(--color-neutral-400);
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

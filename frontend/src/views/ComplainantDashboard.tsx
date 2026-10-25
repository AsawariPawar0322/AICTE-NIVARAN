import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint } from '../types';
import { Icon } from '../components/Icon';

interface ComplainantDashboardProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  complaints: Complaint[];
  onSelectComplaintForTracking: (complaint: Complaint) => void;
  onOpenChatWithComplaint: (complaint: Complaint) => void;
}

type FilterKey = 'ALL' | 'ACTION_REQUIRED' | 'ACTIVE' | 'RESOLVED';

const STAGE_LABELS: Record<string, string> = {
  REGISTERED: 'Registered',
  ALLOTTED: 'Bureau Allotted',
  INVESTIGATION: 'Under Investigation',
  RESOLUTION_PROPOSED: 'ATR Proposed',
  PENDING_OTP: 'Awaiting OTP',
  RESOLVED: 'Resolved',
  ESCALATED: 'Escalated',
};

export const ComplainantDashboard: React.FC<ComplainantDashboardProps> = ({
  lang,
  setActiveTab,
  complaints,
  onSelectComplaintForTracking,
  onOpenChatWithComplaint,
}) => {
  const t = translations[lang];
  const [filter, setFilter] = useState<FilterKey>('ALL');

  const pendingOtpCases = complaints.filter(c => c.currentStage === 'PENDING_OTP');
  const activeCases     = complaints.filter(c => !['RESOLVED', 'ESCALATED'].includes(c.currentStage));
  const resolvedCases   = complaints.filter(c => c.currentStage === 'RESOLVED');

  const filtered = complaints.filter(c => {
    if (filter === 'ACTION_REQUIRED') return c.currentStage === 'PENDING_OTP';
    if (filter === 'ACTIVE')          return !['RESOLVED', 'ESCALATED'].includes(c.currentStage);
    if (filter === 'RESOLVED')        return c.currentStage === 'RESOLVED';
    return true;
  });

  const metrics: { key: FilterKey; label: string; value: number; accent?: string }[] = [
    { key: 'ALL',              label: 'Total Grievances',      value: complaints.length },
    { key: 'ACTION_REQUIRED',  label: 'OTP Action Required',   value: pendingOtpCases.length, accent: 'warning' },
    { key: 'ACTIVE',           label: 'Under Investigation',   value: activeCases.length,     accent: 'info' },
    { key: 'RESOLVED',         label: 'Closed & Resolved',     value: resolvedCases.length,   accent: 'success' },
  ];

  return (
    <div className="cd-root" id="main-content">
      <div className="container cd-container">

        {/* ── PROFILE HEADER ── */}
        <div className="cd-profile-card">
          <div className="cd-profile-left">
            <div className="cd-avatar" aria-hidden="true">
              <Icon e="??" size={24} />
            </div>
            <div className="cd-profile-info">
              <div className="cd-name-row">
                <h2 className="cd-name">Aarav Sharma</h2>
                <span className="cd-verified-badge">
                  <Icon e="?" size={12} />
                  Verified Student
                </span>
                <span className="cd-portal-tag">AICTE NIVARAN</span>
              </div>
              <p className="cd-institution-row">
                <Icon e="???" size={14} />
                Delhi Technological University (DTU) · Roll: 2024-CS-108 · +91 98712 34567
              </p>
            </div>
          </div>
          <div className="cd-profile-actions">
            <button
              type="button"
              className="cd-btn-primary"
              onClick={() => setActiveTab('file-complaint')}
            >
              <Icon e="??" size={15} />
              <span>{t.navFileComplaint}</span>
            </button>
            <button
              type="button"
              className="cd-btn-outline"
              onClick={() => setActiveTab('discord')}
            >
              <Icon e="??" size={15} />
              <span>Community Hub</span>
            </button>
          </div>
        </div>

        {/* ── OTP ACTION BANNER ── */}
        {pendingOtpCases.length > 0 && (
          <div className="cd-otp-banner" role="alert">
            <div className="cd-otp-banner-left">
              <div className="cd-otp-icon-box" aria-hidden="true">
                <Icon e="🔑" size={22} />
              </div>
              <div>
                <strong className="cd-otp-title">
                  Action Required — {pendingOtpCases.length} case{pendingOtpCases.length > 1 ? 's' : ''} awaiting your OTP
                </strong>
                <p className="cd-otp-desc">
                  Delhi Technological University has submitted the Action Taken Report (ATR) and processed your ₹44,000 refund. Verify OTP to finalise closure.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="cd-otp-cta"
              onClick={() => {
                onSelectComplaintForTracking(pendingOtpCases[0]);
                setActiveTab('track');
              }}
            >
              <Icon e="🔑" size={15} />
              <span>Verify OTP &amp; Close Case</span>
              <Icon e="→" size={15} />
            </button>
          </div>
        )}

        {/* ── METRICS ── */}
        <div className="cd-metrics-grid" role="list" aria-label="Grievance summary">
          {metrics.map((m) => (
            <button
              key={m.key}
              type="button"
              role="listitem"
              className={`cd-metric-tile cd-metric-${m.accent || 'default'} ${filter === m.key ? 'cd-metric-active' : ''}`}
              onClick={() => setFilter(m.key)}
              aria-pressed={filter === m.key}
            >
              <span className="cd-metric-label">{m.label}</span>
              <span className="cd-metric-value">{m.value}</span>
              <span className="cd-metric-sub">
                {m.key === 'ALL'             && 'All categories'}
                {m.key === 'ACTION_REQUIRED' && 'Needs your input'}
                {m.key === 'ACTIVE'          && 'Within 72h SLA'}
                {m.key === 'RESOLVED'        && 'OTP verified'}
              </span>
            </button>
          ))}
        </div>

        {/* ── COMPLAINTS FEED ── */}
        <div className="cd-feed-card">
          <div className="cd-feed-header">
            <div>
              <h3 className="cd-feed-title">My Grievances</h3>
              <p className="cd-feed-sub">Track stage progress, proof integrity, and verify closure.</p>
            </div>
            <div className="cd-filter-row" role="group" aria-label="Filter complaints">
              <Icon e="⚙️" size={15} className="cd-filter-icon" aria-hidden="true" />
              {metrics.map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`cd-filter-chip ${filter === m.key ? 'cd-filter-active' : ''}`}
                  onClick={() => setFilter(m.key)}
                  aria-pressed={filter === m.key}
                >
                  {m.key === 'ALL' ? `All (${complaints.length})` :
                   m.key === 'ACTION_REQUIRED' ? `OTP (${pendingOtpCases.length})` :
                   m.key === 'ACTIVE' ? `Active (${activeCases.length})` :
                   `Resolved (${resolvedCases.length})`}
                </button>
              ))}
            </div>
          </div>

          <div className="cd-complaints-list">
            {filtered.length === 0 ? (
              <div className="cd-empty-state">
                <Icon e="??" size={40} />
                <p>No complaints match this filter.</p>
              </div>
            ) : (
              filtered.map((item) => {
                const isOtp      = item.currentStage === 'PENDING_OTP';
                const isResolved = item.currentStage === 'RESOLVED';
                const isEscalated = item.currentStage === 'ESCALATED';

                return (
                  <article
                    key={item.id}
                    className={`cd-complaint-card ${isOtp ? 'cd-card-otp' : isResolved ? 'cd-card-resolved' : ''}`}
                  >
                    {/* Top meta row */}
                    <div className="cd-card-top-row">
                      <div className="cd-card-ids">
                        <code className="cd-case-id">{item.id}</code>
                        <span className="cd-category-chip">{item.categoryLabel}</span>
                        {(item.relatedCaseCount ?? 0) > 0 && (
                          <span className="cd-related-chip">
                            <Icon e="??" size={11} />
                            {item.relatedCaseCount} linked
                          </span>
                        )}
                      </div>
                      <div className="cd-card-status">
                        {isOtp ? (
                          <span className="cd-stage-chip cd-stage-warning">
                            <Icon e="??" size={12} />
                            Stage 5 · OTP Required
                          </span>
                        ) : isResolved ? (
                          <span className="cd-stage-chip cd-stage-success">
                            <Icon e="?" size={12} />
                            Resolved
                          </span>
                        ) : isEscalated ? (
                          <span className="cd-stage-chip cd-stage-danger">
                            <Icon e="??" size={12} />
                            Escalated
                          </span>
                        ) : (
                          <span className="cd-stage-chip cd-stage-info">
                            <Icon e="??" size={12} />
                            Stage {item.stageNumber} · {STAGE_LABELS[item.currentStage] || item.currentStage}
                          </span>
                        )}
                        <span className="cd-sla-pill">
                          <Icon e="??" size={11} />
                          {item.slaHoursRemaining > 0 ? `${item.slaHoursRemaining}h SLA` : 'SLA Met'}
                        </span>
                      </div>
                    </div>

                    {/* Title + description */}
                    <h4 className="cd-card-title">{item.title}</h4>
                    <p className="cd-card-desc">{item.details}</p>

                    {/* Institution strip */}
                    <div className="cd-inst-strip">
                      <div className="cd-inst-left">
                        <Icon e="???" size={13} />
                        <span>
                          <strong>{item.institutionName}</strong>
                          <code className="cd-inst-id">({item.aictePermanentId})</code>
                        </span>
                        <span className="cd-inst-sep">·</span>
                        <span>Officer: {item.assignedOfficer.name}</span>
                      </div>
                      <span className="cd-proof-count">
                        <Icon e="??" size={12} />
                        {item.evidenceList.length} proof file{item.evidenceList.length !== 1 ? 's' : ''}
                      </span>
                    </div>

                    {/* ATR preview for OTP pending */}
                    {isOtp && item.resolutionProposedDetails && (
                      <div className="cd-atr-preview">
                        <div className="cd-atr-header">
                          <span className="cd-atr-label">Action Taken Report — {item.resolutionProposedDetails.officialOrderRef}</span>
                          <span className="cd-atr-amount">
                            Refund: <strong>{item.resolutionProposedDetails.refundAmount}</strong>
                          </span>
                        </div>
                        <p className="cd-atr-summary">{item.resolutionProposedDetails.atrSummary}</p>
                      </div>
                    )}

                    {/* Action buttons */}
                    <div className="cd-card-actions">
                      <button
                        type="button"
                        className="cd-action-btn cd-action-secondary"
                        onClick={() => onOpenChatWithComplaint(item)}
                      >
                        <Icon e="??" size={14} />
                        <span>Chat with Officer</span>
                      </button>

                      <button
                        type="button"
                        className={`cd-action-btn ${isOtp ? 'cd-action-primary-otp' : 'cd-action-primary'}`}
                        onClick={() => {
                          onSelectComplaintForTracking(item);
                          setActiveTab('track');
                        }}
                      >
                        {isOtp ? (
                          <>
                            <Icon e="??" size={14} />
                            <span>Verify OTP &amp; Close</span>
                          </>
                        ) : (
                          <>
                            <span>View Timeline</span>
                            <Icon e="�" size={14} />
                          </>
                        )}
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>

      <style>{`
        /* ── ROOT ── */
        .cd-root {
          background: var(--color-neutral-100);
          padding: 32px 0 72px;
          min-height: calc(100vh - 160px);
        }
        .cd-container { max-width: 1100px; }

        /* ── PROFILE CARD ── */
        .cd-profile-card {
          background: #fff;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg);
          padding: 24px 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          flex-wrap: wrap;
          margin-bottom: 20px;
          box-shadow: var(--shadow-sm);
        }
        .cd-profile-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 0;
        }
        .cd-avatar {
          width: 52px;
          height: 52px;
          border-radius: 50%;
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid #BFDBFE;
          flex-shrink: 0;
        }
        .cd-profile-info { min-width: 0; }
        .cd-name-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 4px;
        }
        .cd-name {
          font-size: 1.3rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0;
          line-height: 1.2;
        }
        .cd-verified-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: var(--color-success-bg);
          color: var(--color-success-text);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          border: 1px solid var(--color-success-border);
        }
        .cd-portal-tag {
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          border: 1px solid #BFDBFE;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .cd-institution-row {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          margin: 0;
          flex-wrap: wrap;
        }
        .cd-institution-row svg { flex-shrink: 0; }
        .cd-profile-actions {
          display: flex;
          gap: 10px;
          flex-shrink: 0;
        }
        .cd-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: var(--color-action-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 9px 18px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 40px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
        }
        .cd-btn-primary:hover { background: var(--color-action-700); }
        .cd-btn-outline {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          background: transparent;
          color: var(--color-navy-900);
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 9px 18px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 40px;
          font-family: var(--font-sans);
          transition: border-color 0.15s ease;
        }
        .cd-btn-outline:hover { border-color: var(--color-navy-900); }

        /* ── OTP BANNER ── */
        .cd-otp-banner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          background: var(--color-warning-bg);
          border: 2px solid var(--color-warning-border);
          border-radius: var(--radius-md);
          padding: 18px 22px;
          margin-bottom: 20px;
        }
        .cd-otp-banner-left {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }
        .cd-otp-icon-box {
          width: 44px;
          height: 44px;
          background: #FDE68A;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #92400E;
          flex-shrink: 0;
        }
        .cd-otp-title {
          display: block;
          font-size: 0.95rem;
          color: #92400E;
          margin-bottom: 3px;
        }
        .cd-otp-desc {
          font-size: 0.8125rem;
          color: #78350F;
          margin: 0;
          line-height: 1.45;
        }
        .cd-otp-cta {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: var(--color-action-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 10px 20px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          min-height: 44px;
          font-family: var(--font-sans);
          transition: background-color 0.15s ease;
          flex-shrink: 0;
        }
        .cd-otp-cta:hover { background: var(--color-action-700); }

        /* ── METRICS ── */
        .cd-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
          margin-bottom: 20px;
        }
        .cd-metric-tile {
          background: #fff;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md);
          padding: 20px 18px;
          text-align: left;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .cd-metric-tile:hover { border-color: var(--color-brand-blue-600); }
        .cd-metric-active {
          border-color: var(--color-brand-blue-600) !important;
          box-shadow: 0 0 0 3px rgba(31,95,191,0.12);
        }
        .cd-metric-warning { border-left: 4px solid #F59E0B; }
        .cd-metric-info    { border-left: 4px solid var(--color-brand-blue-600); }
        .cd-metric-success { border-left: 4px solid #16A34A; }
        .cd-metric-label {
          font-size: 0.78rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }
        .cd-metric-value {
          font-size: 2rem;
          font-weight: 900;
          color: var(--color-navy-900);
          font-family: var(--font-mono);
          line-height: 1.1;
        }
        .cd-metric-sub {
          font-size: 0.72rem;
          color: var(--color-neutral-400);
        }

        /* ── FEED CARD ── */
        .cd-feed-card {
          background: #fff;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg);
          overflow: hidden;
          box-shadow: var(--shadow-sm);
        }
        .cd-feed-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 16px;
          padding: 20px 24px;
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .cd-feed-title {
          font-size: 1.1rem;
          font-weight: 700;
          color: var(--color-navy-900);
          margin: 0 0 3px;
        }
        .cd-feed-sub {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
          margin: 0;
        }
        .cd-filter-row {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .cd-filter-icon { color: var(--color-neutral-400); flex-shrink: 0; }
        .cd-filter-chip {
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          color: var(--color-neutral-700);
          font-size: 0.78rem;
          font-weight: 600;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: all 0.15s ease;
          min-height: 30px;
        }
        .cd-filter-chip:hover { border-color: var(--color-navy-900); color: var(--color-navy-900); }
        .cd-filter-active {
          background: var(--color-navy-900) !important;
          color: #fff !important;
          border-color: var(--color-navy-900) !important;
        }

        /* ── COMPLAINT CARDS ── */
        .cd-complaints-list { padding: 16px 20px; display: flex; flex-direction: column; gap: 14px; }
        .cd-complaint-card {
          background: #fff;
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-md);
          padding: 20px;
          transition: border-color 0.15s ease;
        }
        .cd-complaint-card:hover { border-color: var(--color-neutral-300); }
        .cd-card-otp {
          border: 2px solid var(--color-warning-border);
          background: #FFFDF5;
        }
        .cd-card-resolved {
          border-color: var(--color-success-border);
          background: #FAFFFE;
        }
        .cd-card-top-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 10px;
        }
        .cd-card-ids {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }
        .cd-case-id {
          font-family: var(--font-mono);
          font-size: 0.82rem;
          font-weight: 700;
          color: var(--color-navy-900);
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }
        .cd-category-chip {
          background: var(--color-brand-blue-100);
          color: var(--color-brand-blue-600);
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .cd-related-chip {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: #F3E8FF;
          color: #6B21A8;
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-pill);
        }
        .cd-card-status {
          display: flex;
          align-items: center;
          gap: 7px;
          flex-wrap: wrap;
        }
        .cd-stage-chip {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          font-size: 0.75rem;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
          white-space: nowrap;
        }
        .cd-stage-warning { background: var(--color-warning-bg); color: var(--color-warning-text); border: 1px solid var(--color-warning-border); }
        .cd-stage-success { background: var(--color-success-bg); color: var(--color-success-text); border: 1px solid var(--color-success-border); }
        .cd-stage-info    { background: var(--color-info-bg);    color: var(--color-info-text);    border: 1px solid var(--color-info-border); }
        .cd-stage-danger  { background: var(--color-danger-bg);  color: var(--color-danger-text);  border: 1px solid var(--color-danger-border); }
        .cd-sla-pill {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.72rem;
          color: var(--color-neutral-600);
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-200);
          padding: 2px 8px;
          border-radius: var(--radius-sm);
        }
        .cd-card-title {
          font-size: 1rem;
          font-weight: 700;
          color: var(--color-navy-900);
          margin: 0 0 6px;
          line-height: 1.35;
        }
        .cd-card-desc {
          font-size: 0.875rem;
          color: var(--color-neutral-700);
          line-height: 1.5;
          margin: 0 0 12px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .cd-inst-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          background: var(--color-neutral-100);
          border-radius: var(--radius-sm);
          padding: 7px 12px;
          font-size: 0.78rem;
          color: var(--color-neutral-700);
          margin-bottom: 14px;
          flex-wrap: wrap;
        }
        .cd-inst-left {
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
          flex: 1;
          min-width: 0;
        }
        .cd-inst-left svg { color: var(--color-neutral-400); flex-shrink: 0; }
        .cd-inst-id {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          color: var(--color-neutral-600);
        }
        .cd-inst-sep { color: var(--color-neutral-300); }
        .cd-proof-count {
          display: flex;
          align-items: center;
          gap: 4px;
          font-weight: 700;
          color: var(--color-brand-blue-600);
          white-space: nowrap;
        }

        /* ATR preview */
        .cd-atr-preview {
          background: var(--color-success-bg);
          border: 1px solid var(--color-success-border);
          border-radius: var(--radius-sm);
          padding: 12px 14px;
          margin-bottom: 14px;
        }
        .cd-atr-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 5px;
          flex-wrap: wrap;
        }
        .cd-atr-label {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-success-text);
        }
        .cd-atr-amount {
          font-size: 0.78rem;
          color: #15803D;
        }
        .cd-atr-amount strong { color: #14532D; }
        .cd-atr-summary {
          font-size: 0.8125rem;
          color: #14532D;
          line-height: 1.45;
          margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* Action buttons */
        .cd-card-actions {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          gap: 10px;
          flex-wrap: wrap;
        }
        .cd-action-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          font-size: 0.825rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 36px;
          font-family: var(--font-sans);
          transition: all 0.15s ease;
          white-space: nowrap;
        }
        .cd-action-secondary {
          background: transparent;
          color: var(--color-neutral-700);
          border: 1px solid var(--color-neutral-300);
        }
        .cd-action-secondary:hover {
          border-color: var(--color-navy-900);
          color: var(--color-navy-900);
        }
        .cd-action-primary {
          background: var(--color-navy-900);
          color: #fff;
          border: none;
        }
        .cd-action-primary:hover { background: #0E3673; }
        .cd-action-primary-otp {
          background: var(--color-action-600);
          color: #fff;
          border: none;
        }
        .cd-action-primary-otp:hover { background: var(--color-action-700); }

        /* Empty state */
        .cd-empty-state {
          text-align: center;
          padding: 48px 24px;
          color: var(--color-neutral-400);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          font-size: 0.9rem;
        }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .cd-metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .cd-profile-card { flex-direction: column; align-items: flex-start; }
        }
        @media (max-width: 600px) {
          .cd-metrics-grid { grid-template-columns: repeat(2, 1fr); }
          .cd-profile-actions { width: 100%; }
          .cd-btn-primary, .cd-btn-outline { flex: 1; justify-content: center; }
        }
      `}</style>
    </div>
  );
};

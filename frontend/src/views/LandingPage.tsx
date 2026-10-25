import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Institution } from '../types';
import { Icon } from '../components/Icon';

interface LandingPageProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  institutions: Institution[];
  onSelectInstitutionForComplaint?: (inst: Institution) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  lang,
  setActiveTab,
  institutions,
  onSelectInstitutionForComplaint
}) => {
  const t = translations[lang];
  const [searchQuery, setSearchQuery] = useState('');
  const [trackQuery, setTrackQuery] = useState('');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [searchResults, setSearchResults] = useState<Institution[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) { setSearchResults([]); return; }
    const q = query.toLowerCase();
    setSearchResults(
      institutions.filter(inst =>
        inst.name.toLowerCase().includes(q) ||
        inst.permanentId.toLowerCase().includes(q) ||
        inst.city.toLowerCase().includes(q) ||
        inst.state.toLowerCase().includes(q)
      )
    );
  };

  const simulateVoiceSearch = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      const query = 'Delhi Technological University';
      setSearchQuery(query);
      handleSearch(query);
      setIsVoiceListening(false);
    }, 1200);
  };

  return (
    <div className="lp-root" id="main-content">

      {/* ── MANDATE TICKER ── */}
      <div className="lp-ticker" role="alert" aria-live="polite">
        <div className="container lp-ticker-inner">
          <span className="lp-ticker-badge">AICTE MANDATE 2026</span>
          <span className="lp-ticker-text">
            <strong>Mandatory Citizen OTP Closure:</strong> No institution may close a grievance without student/faculty OTP authorisation per AICTE Grievance Regulations Ch.7. 72-Hour SLA strictly enforced across all 12,000+ institutions.
          </span>
          <button type="button" className="lp-ticker-link" onClick={() => setActiveTab('admin')}>
            Administration Portal <Icon e="›" size={13} />
          </button>
        </div>
      </div>

      {/* ── HERO ── */}
      <section className="lp-hero" aria-labelledby="lp-hero-heading">
        <div className="container lp-hero-inner">

          {/* Left: Brand + Copy */}
          <div className="lp-hero-left">
            <div className="lp-hero-brand">
              <img src="/aicte-nivaran-logo.png" alt="AICTE NIVARAN" className="lp-hero-logo" />
              <div className="lp-hero-brand-text">
                <span className="lp-hero-brand-name">AICTE NIVARAN</span>
                <span className="lp-hero-brand-sub">अखिल भारतीय तकनीकी शिक्षा परिषद</span>
              </div>
            </div>

            <div className="lp-sih-pill">
              <Icon e="⚡" size={13} />
              <span>Smart India Hackathon · Problem Statement SIH26264</span>
            </div>

            <h1 id="lp-hero-heading" className="lp-hero-h1">
              One Portal for Every<br />
              <span className="lp-hero-accent">Technical Grievance</span>
            </h1>

            <p className="lp-hero-desc">
              Moving from fragmented complaint records to connected, accountable oversight for India's 12,000+ approved technical colleges. File, track, and enforce resolution — all in one place.
            </p>

            {/* CTA row */}
            <div className="lp-hero-ctas">
              <button
                type="button"
                className="lp-btn-primary"
                onClick={() => setActiveTab('citizen-login')}
              >
                <Icon e="📝" size={18} />
                <span>File a Grievance</span>
              </button>
              <button
                type="button"
                className="lp-btn-secondary"
                onClick={() => setActiveTab('track')}
              >
                <Icon e="🔍" size={18} />
                <span>Track Existing Case</span>
              </button>
            </div>

            {/* Trust badges */}
            <div className="lp-trust-row">
              <div className="lp-trust-item">
                <Icon e="✅" size={15} />
                <span>WCAG 2.1 AA</span>
              </div>
              <div className="lp-trust-item">
                <Icon e="🔒" size={15} />
                <span>256-Bit SSL</span>
              </div>
              <div className="lp-trust-item">
                <Icon e="🌐" size={15} />
                <span>GIGW 3.0 Compliant</span>
              </div>
              <div className="lp-trust-item">
                <Icon e="🔑" size={15} />
                <span>OTP Protected Closure</span>
              </div>
            </div>
          </div>

          {/* Right: Search + Quick Track */}
          <div className="lp-hero-right">
            <div className="lp-search-card">
              <div className="lp-search-card-head">
                <Icon e="🏛️" size={20} />
                <div>
                  <strong>Find Your Institution</strong>
                  <span>Search by name, city or AICTE ID</span>
                </div>
              </div>

              <div className="lp-search-bar">
                <Icon e="🔍" size={18} className="lp-search-icon" />
                <input
                  type="text"
                  className="lp-search-input"
                  placeholder="e.g. Delhi Technological University…"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Search institution by name or ID"
                />
                <button
                  type="button"
                  className={`lp-voice-btn ${isVoiceListening ? 'listening' : ''}`}
                  onClick={simulateVoiceSearch}
                  title={isVoiceListening ? 'Listening…' : 'Voice Search'}
                  aria-label="Voice search"
                >
                  <Icon e="🎤" size={16} />
                </button>
                <button
                  type="button"
                  className="lp-search-go"
                  onClick={() => handleSearch(searchQuery)}
                >
                  Search
                </button>
              </div>

              {/* Dropdown results */}
              {searchResults.length > 0 && (
                <div className="lp-search-dropdown" role="listbox" aria-label="Search results">
                  <div className="lp-dropdown-hdr">
                    {searchResults.length} institution(s) found
                  </div>
                  {searchResults.map((inst) => (
                    <button
                      key={inst.id}
                      type="button"
                      role="option"
                      className="lp-result-item"
                      onClick={() => {
                        if (onSelectInstitutionForComplaint) onSelectInstitutionForComplaint(inst);
                        setActiveTab('file-complaint');
                      }}
                    >
                      <div className="lp-result-left">
                        <strong className="lp-result-name">{inst.name}</strong>
                        <span className="lp-result-meta">
                          <code>{inst.permanentId}</code> · {inst.city}, {inst.state}
                        </span>
                      </div>
                      <div className="lp-result-right">
                        <span className="lp-compliance-chip">{inst.complianceRating}</span>
                        <Icon e="→" size={14} />
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="lp-divider-or"><span>or track an existing case</span></div>

              {/* Quick track */}
              <div className="lp-quick-track">
                <input
                  type="text"
                  className="lp-track-input"
                  placeholder="Case ID: AICTE-2026-GRV-84920"
                  value={trackQuery}
                  onChange={(e) => setTrackQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') setActiveTab('track'); }}
                  aria-label="Enter case ID to track"
                />
                <button
                  type="button"
                  className="lp-track-btn"
                  onClick={() => setActiveTab('track')}
                >
                  <Icon e="🔍" size={16} />
                  <span>Track</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS STRIP ── */}
      <div className="lp-stats-strip">
        <div className="container lp-stats-inner">
          {[
            { value: '98.4%', label: 'Disposal Compliance' },
            { value: '72 Hrs', label: 'Maximum SLA' },
            { value: '12,000+', label: 'Institutions Covered' },
            { value: '100%', label: 'OTP-Verified Closures' },
          ].map((s) => (
            <div key={s.label} className="lp-stat-item">
              <span className="lp-stat-value">{s.value}</span>
              <span className="lp-stat-label">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── PORTAL GATEWAY CARDS ── */}
      <section className="lp-portals-section" aria-labelledby="lp-portals-heading">
        <div className="container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">TWO DEDICATED GATEWAYS</span>
            <h2 id="lp-portals-heading">Choose Your Portal</h2>
            <p className="lp-section-lead">
              Separate, purpose-built portals for complainants and authorised AICTE officers.
            </p>
          </div>

          <div className="lp-portal-grid">
            {/* Citizen Portal */}
            <div className="lp-portal-card lp-portal-citizen">
              <div className="lp-portal-top">
                <div className="lp-portal-icon lp-portal-icon-blue">
                  <Icon e="🎓" size={32} />
                </div>
                <div className="lp-portal-label lp-portal-label-blue">For Students, Parents & Faculty</div>
              </div>
              <h3 className="lp-portal-heading">Citizen Portal</h3>
              <p className="lp-portal-desc">
                Lodge grievances, track live stages, communicate with assigned officers, and authenticate resolution via Citizen OTP.
              </p>
              <ul className="lp-portal-features">
                <li><Icon e="✅" size={15} /><span><strong>5-Step Guided Wizard</strong> — autosaved draft with institution lookup</span></li>
                <li><Icon e="✅" size={15} /><span><strong>Cryptographic Evidence Vault</strong> — SHA-256 tamper-proof hashing</span></li>
                <li><Icon e="✅" size={15} /><span><strong>Citizen OTP Gateway</strong> — college cannot close cases unilaterally</span></li>
                <li><Icon e="✅" size={15} /><span><strong>Officer Direct Chat</strong> — real-time messaging with bureau officer</span></li>
              </ul>
              <div className="lp-portal-actions">
                <button
                  type="button"
                  className="lp-btn-portal-primary"
                  onClick={() => setActiveTab('citizen-login')}
                >
                  <span>Sign In / Register</span>
                  <Icon e="→" size={16} />
                </button>
                <button
                  type="button"
                  className="lp-btn-portal-outline"
                  onClick={() => setActiveTab('file-complaint')}
                >
                  File Without Login
                </button>
              </div>
            </div>

            {/* Administration Portal */}
            <div className="lp-portal-card lp-portal-admin">
              <div className="lp-portal-top">
                <div className="lp-portal-icon lp-portal-icon-orange">
                  <Icon e="🛡️" size={32} />
                </div>
                <div className="lp-portal-label lp-portal-label-orange">For AICTE Officials & Committees</div>
              </div>
              <h3 className="lp-portal-heading">Administration Portal</h3>
              <p className="lp-portal-desc">
                Central bureau grievance dossier, intelligent cross-bureau case linking, institutional notices, and 72h SLA radar.
              </p>
              <ul className="lp-portal-features">
                <li><Icon e="✅" size={15} /><span><strong>Bureau Grievance Ledger</strong> — live cases across all AICTE cells</span></li>
                <li><Icon e="✅" size={15} /><span><strong>Intelligent Case Linker</strong> — multi-case institutional clusters (SIH26264)</span></li>
                <li><Icon e="✅" size={15} /><span><strong>Compliance Matrix</strong> — monitor colleges with repeat complaints</span></li>
                <li><Icon e="✅" size={15} /><span><strong>72h SLA Radar</strong> — auto-escalation to State Ombudsman</span></li>
              </ul>
              <div className="lp-portal-actions">
                <button
                  type="button"
                  className="lp-btn-portal-admin"
                  onClick={() => setActiveTab('admin-login')}
                >
                  <Icon e="🔒" size={15} />
                  <span>Officer Sign In</span>
                  <Icon e="→" size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section className="lp-how-section" aria-labelledby="lp-how-heading">
        <div className="container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">TRANSPARENT LIFECYCLE</span>
            <h2 id="lp-how-heading">How Your Grievance is Resolved</h2>
            <p className="lp-section-lead">A tamper-evident workflow ensuring every complaint receives an enforceable resolution.</p>
          </div>

          <div className="lp-steps-grid">
            <div className="lp-step-card">
              <div className="lp-step-num">01</div>
              <div className="lp-step-icon-wrap lp-step-orange">
                <Icon e="🔐" size={26} />
              </div>
              <h3 className="lp-step-title">Lodge & Cryptographically Verify</h3>
              <p className="lp-step-desc">
                Your grievance is registered with SHA-256 evidence digests and dispatched to the designated AICTE bureau with an immutable audit hash.
              </p>
            </div>

            <div className="lp-step-connector" aria-hidden="true">
              <Icon e="→" size={22} />
            </div>

            <div className="lp-step-card">
              <div className="lp-step-num">02</div>
              <div className="lp-step-icon-wrap lp-step-blue">
                <Icon e="⏱️" size={26} />
              </div>
              <h3 className="lp-step-title">72h Monitored Investigation</h3>
              <p className="lp-step-desc">
                A statutory notice is served to the registrar. Assigned bureau officers coordinate hearings with live SLA countdown.
              </p>
            </div>

            <div className="lp-step-connector" aria-hidden="true">
              <Icon e="→" size={22} />
            </div>

            <div className="lp-step-card lp-step-card-highlight">
              <div className="lp-step-num lp-step-num-green">03</div>
              <div className="lp-step-icon-wrap lp-step-green">
                <Icon e="🔑" size={26} />
              </div>
              <h3 className="lp-step-title">Mandatory Citizen OTP Closure</h3>
              <p className="lp-step-desc">
                The institution cannot close a case unilaterally. Only when you enter your 6-digit confirmation OTP is resolution finalised.
              </p>
              <div className="lp-step-highlight-badge">Unique Protection</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CASE LINKER FEATURE HIGHLIGHT ── */}
      <section className="lp-linker-section" aria-labelledby="lp-linker-heading">
        <div className="container">
          <div className="lp-linker-card">
            <div className="lp-linker-left">
              <span className="lp-linker-eyebrow">SIH26264 SIGNATURE INNOVATION</span>
              <h2 id="lp-linker-heading" className="lp-linker-h2">
                Intelligent Multi-Case<br />Institutional Linking
              </h2>
              <p className="lp-linker-desc">
                Turning scattered individual grievances into coordinated, accountable administrative action. When multiple students file similar complaints against the same college, NIVARAN detects the pattern and escalates jointly.
              </p>
              <div className="lp-linker-phases">
                <div className="lp-phase-item">
                  <div className="lp-phase-dot lp-phase-dot-1"></div>
                  <div>
                    <strong>Automated Discovery</strong>
                    <span>Extracts institution ID, category, and grievance vector to find overlaps</span>
                  </div>
                </div>
                <div className="lp-phase-item">
                  <div className="lp-phase-dot lp-phase-dot-2"></div>
                  <div>
                    <strong>Similarity Linking</strong>
                    <span>Flags candidate dockets with correlation rationale (e.g. 94% fee refund match)</span>
                  </div>
                </div>
                <div className="lp-phase-item">
                  <div className="lp-phase-dot lp-phase-dot-3"></div>
                  <div>
                    <strong>Coordinated Inquiry</strong>
                    <span>AICTE serves one unified statutory notice while preserving individual student IDs</span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="lp-linker-btn"
                onClick={() => setActiveTab('admin')}
              >
                Inspect Linker in Administration
                <Icon e="↗️" size={15} />
              </button>
            </div>
            <div className="lp-linker-right" aria-hidden="true">
              <div className="lp-linker-visual">
                <div className="lp-linker-node lp-linker-node-primary">
                  <div className="lp-node-label">AICTE-2026-GRV-84920</div>
                  <div className="lp-node-sub">Aarav Sharma · Fee Refund</div>
                </div>
                <div className="lp-linker-connect">
                  <Icon e="🔗" size={20} />
                  <span>94% match</span>
                </div>
                <div className="lp-linker-node lp-linker-node-secondary">
                  <div className="lp-node-label">AICTE-2026-GRV-84931</div>
                  <div className="lp-node-sub">Tanya Verma · Fee Refund</div>
                </div>
                <div className="lp-linker-inst">
                  <Icon e="🏫" size={16} />
                  <span>Delhi Technological University · Joint Inquiry</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="lp-categories-section" aria-labelledby="lp-categories-heading">
        <div className="container">
          <div className="lp-section-head">
            <span className="lp-eyebrow">DEDICATED BUREAU DESKS</span>
            <h2 id="lp-categories-heading">{t.categoriesTitle}</h2>
            <p className="lp-section-lead">Select your grievance area for specialised triage and expedited disposal.</p>
          </div>

          <div className="lp-cat-grid">
            {[
              {
                icon: <Icon e="💳" size={22} />,
                title: t.catFees,
                desc: 'Caution money non-refund, seat surrender deductions, excess library fees, unapproved bus fee hikes.',
                badge: 'High Volume',
                badgeType: 'blue',
                urgent: false,
              },
              {
                icon: <Icon e="🚨" size={22} />,
                title: t.catRagging,
                desc: 'Physical intimidation, hostel harassment, psychological bullying. Confidential reporting available.',
                badge: '24h Mandatory FIR',
                badgeType: 'red',
                urgent: true,
              },
              {
                icon: <Icon e="🎓" size={22} />,
                title: t.catScholarship,
                desc: 'Pragati (Girls), Saksham (Specially-Abled), PMSSS J&K/Ladakh stipend delay or verification freeze.',
                badge: 'Direct Bureau',
                badgeType: 'blue',
                urgent: false,
              },
              {
                icon: <Icon e="🛡️" size={22} />,
                title: t.catHarassment,
                desc: 'Forwarded to AICTE Central ICC Nodal Cell. Strict identity protection protocol.',
                badge: 'Confidential',
                badgeType: 'purple',
                urgent: false,
              },
              {
                icon: <Icon e="🔬" size={22} />,
                title: t.catFaculty,
                desc: 'Substandard laboratories, deficient faculty ratio, missing computer centres, textbook shortages.',
                badge: 'Approval Review',
                badgeType: 'blue',
                urgent: false,
              },
              {
                icon: <Icon e="📜" size={22} />,
                title: t.catAdmission,
                desc: 'Withholding of original degree or marksheets, unapproved curriculum changes, exam malpractice.',
                badge: 'Academics',
                badgeType: 'blue',
                urgent: false,
              },
            ].map((cat) => (
              <button
                key={cat.title}
                type="button"
                className={`lp-cat-card ${cat.urgent ? 'lp-cat-urgent' : ''}`}
                onClick={() => setActiveTab('file-complaint')}
                aria-label={`File a grievance: ${cat.title}`}
              >
                <div className="lp-cat-top">
                  <div className={`lp-cat-icon ${cat.urgent ? 'lp-cat-icon-red' : 'lp-cat-icon-blue'}`}>
                    {cat.icon}
                  </div>
                  <span className={`lp-cat-badge lp-cat-badge-${cat.badgeType}`}>{cat.badge}</span>
                </div>
                <h4 className="lp-cat-title">{cat.title}</h4>
                <p className="lp-cat-desc">{cat.desc}</p>
                <span className="lp-cat-link">
                  {cat.urgent ? 'Emergency Filing' : 'File in this desk'} <Icon e="›" size={14} />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── HELPLINES ── */}
      <section className="lp-helplines-section" aria-labelledby="lp-helplines-heading">
        <div className="container lp-helplines-inner">
          <div className="lp-helplines-left">
            <div className="lp-helpline-icon-wrap">
              <Icon e="📞" size={22} />
            </div>
            <div>
              <h2 id="lp-helplines-heading" className="lp-helplines-h2">
                National 24×7 Emergency Helplines
              </h2>
              <p className="lp-helplines-sub">
                Immediate intervention for ragging, harassment, or safety emergencies.
              </p>
            </div>
          </div>
          <div className="lp-helplines-right">
            <a href="tel:18001805522" className="lp-hl-pill lp-hl-red">
              <Icon e="📞" size={14} />
              <span>Anti-Ragging</span>
              <strong>1800-180-5522</strong>
            </a>
            <a href="tel:1091" className="lp-hl-pill lp-hl-pink">
              <Icon e="📞" size={14} />
              <span>Women Safety</span>
              <strong>1091</strong>
            </a>
            <a href="tel:14416" className="lp-hl-pill lp-hl-blue">
              <Icon e="📞" size={14} />
              <span>Tele-MANAS</span>
              <strong>14416</strong>
            </a>
          </div>
        </div>
      </section>

      {/* ─────────── STYLES ─────────── */}
      <style>{`
        /* ── ROOT ── */
        .lp-root {
          background-color: var(--color-neutral-100);
        }

        /* ── TICKER ── */
        .lp-ticker {
          background-color: #FEF3C7;
          border-bottom: 1px solid #FDE68A;
          padding: 7px 0;
        }
        .lp-ticker-inner {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lp-ticker-badge {
          background-color: var(--color-action-600);
          color: #fff;
          font-size: 0.68rem;
          font-weight: 800;
          padding: 2px 8px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
          letter-spacing: 0.5px;
        }
        .lp-ticker-text {
          flex: 1;
          font-size: 0.8125rem;
          color: #78350F;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .lp-ticker-link {
          background: none;
          border: none;
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-action-600);
          cursor: pointer;
          white-space: nowrap;
          display: inline-flex;
          align-items: center;
          gap: 2px;
          text-decoration: underline;
        }

        /* ── HERO ── */
        .lp-hero {
          background: #fff;
          border-bottom: 1px solid var(--color-neutral-200);
          padding: 56px 0 48px;
        }
        .lp-hero-inner {
          display: grid;
          grid-template-columns: 1fr 420px;
          gap: 48px;
          align-items: center;
        }
        .lp-hero-brand {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 18px;
        }
        .lp-hero-logo {
          height: 72px;
          width: 72px;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(11,42,91,0.18));
        }
        .lp-hero-brand-text {
          display: flex;
          flex-direction: column;
        }
        .lp-hero-brand-name {
          font-size: 1.5rem;
          font-weight: 900;
          color: var(--color-navy-900);
          letter-spacing: -0.5px;
          line-height: 1;
        }
        .lp-hero-brand-sub {
          font-size: 0.78rem;
          color: var(--color-action-600);
          font-weight: 700;
          margin-top: 3px;
        }
        .lp-sih-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          color: var(--color-brand-blue-600);
          font-size: 0.78rem;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: var(--radius-pill);
          margin-bottom: 20px;
        }
        .lp-hero-h1 {
          font-size: 2.6rem;
          font-weight: 900;
          color: var(--color-navy-900);
          line-height: 1.15;
          margin: 0 0 16px;
        }
        .lp-hero-accent {
          color: var(--color-action-600);
        }
        .lp-hero-desc {
          font-size: 1.05rem;
          color: var(--color-neutral-600);
          line-height: 1.6;
          max-width: 560px;
          margin-bottom: 28px;
        }
        .lp-hero-ctas {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 24px;
        }
        .lp-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-action-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 44px;
          transition: background-color 0.15s ease;
          font-family: var(--font-sans);
        }
        .lp-btn-primary:hover { background-color: var(--color-action-700); }
        .lp-btn-secondary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: transparent;
          color: var(--color-navy-900);
          border: 2px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 12px 24px;
          font-size: 0.95rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 44px;
          transition: border-color 0.15s ease;
          font-family: var(--font-sans);
        }
        .lp-btn-secondary:hover { border-color: var(--color-navy-900); }
        .lp-trust-row {
          display: flex;
          align-items: center;
          gap: 20px;
          flex-wrap: wrap;
        }
        .lp-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.78rem;
          color: var(--color-neutral-600);
          font-weight: 600;
        }
        .lp-trust-item svg { color: var(--color-action-600); }

        /* Hero right card */
        .lp-search-card {
          background: #fff;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-lg);
          padding: 24px;
          box-shadow: var(--shadow-soft);
        }
        .lp-search-card-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          margin-bottom: 18px;
          color: var(--color-navy-900);
        }
        .lp-search-card-head svg { color: var(--color-brand-blue-600); flex-shrink: 0; margin-top: 2px; }
        .lp-search-card-head strong { display: block; font-size: 0.95rem; color: var(--color-navy-900); }
        .lp-search-card-head span { font-size: 0.8rem; color: var(--color-neutral-600); }
        .lp-search-bar {
          display: flex;
          align-items: center;
          border: 2px solid var(--color-brand-blue-600);
          border-radius: var(--radius-md);
          padding: 6px 6px 6px 12px;
          gap: 6px;
          background: #fff;
          position: relative;
        }
        .lp-search-icon { color: var(--color-neutral-400); flex-shrink: 0; }
        .lp-search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.9rem;
          background: transparent;
          min-width: 0;
          font-family: var(--font-sans);
        }
        .lp-voice-btn {
          background: none;
          border: none;
          color: var(--color-neutral-600);
          cursor: pointer;
          padding: 6px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background-color 0.15s ease;
        }
        .lp-voice-btn:hover { background-color: var(--color-neutral-100); }
        .lp-voice-btn.listening { color: #DC2626; animation: lp-pulse-red 1s infinite; }
        @keyframes lp-pulse-red { 0%,100% { opacity:1; } 50% { opacity:0.5; } }
        .lp-search-go {
          background-color: var(--color-brand-blue-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-sm);
          padding: 8px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          min-height: 36px;
          font-family: var(--font-sans);
        }
        .lp-search-go:hover { background-color: #1A4FA8; }
        .lp-search-dropdown {
          background: #fff;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-modal);
          margin-top: 6px;
          overflow: hidden;
          max-height: 260px;
          overflow-y: auto;
        }
        .lp-dropdown-hdr {
          padding: 8px 14px;
          background: var(--color-neutral-100);
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .lp-result-item {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 10px 14px;
          background: #fff;
          border: none;
          border-bottom: 1px solid var(--color-neutral-200);
          cursor: pointer;
          text-align: left;
          transition: background-color 0.15s ease;
          font-family: var(--font-sans);
        }
        .lp-result-item:hover { background-color: var(--color-brand-blue-100); }
        .lp-result-left { flex: 1; min-width: 0; }
        .lp-result-name { display: block; font-size: 0.875rem; font-weight: 700; color: var(--color-navy-900); }
        .lp-result-meta { font-size: 0.75rem; color: var(--color-neutral-600); margin-top: 2px; display: block; }
        .lp-result-meta code { font-family: var(--font-mono); background: var(--color-neutral-100); padding: 0 3px; border-radius: 2px; }
        .lp-result-right { display: flex; align-items: center; gap: 8px; flex-shrink: 0; color: var(--color-neutral-600); }
        .lp-compliance-chip {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: var(--radius-pill);
          background: #DCFCE7;
          color: #166534;
        }
        .lp-divider-or {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 18px 0 14px;
          color: var(--color-neutral-400);
          font-size: 0.8rem;
        }
        .lp-divider-or::before,.lp-divider-or::after {
          content:'';
          flex:1;
          height:1px;
          background: var(--color-neutral-200);
        }
        .lp-quick-track {
          display: flex;
          gap: 8px;
        }
        .lp-track-input {
          flex: 1;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 9px 12px;
          font-size: 0.85rem;
          font-family: var(--font-mono);
          outline: none;
          background: #fff;
          color: var(--color-navy-900);
          min-width: 0;
        }
        .lp-track-input:focus { border-color: var(--color-brand-blue-600); }
        .lp-track-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background-color: var(--color-navy-900);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 9px 16px;
          font-size: 0.85rem;
          font-weight: 700;
          cursor: pointer;
          white-space: nowrap;
          font-family: var(--font-sans);
        }
        .lp-track-btn:hover { background-color: #0E3673; }

        /* ── STATS STRIP ── */
        .lp-stats-strip {
          background: var(--color-navy-900);
          padding: 28px 0;
          border-bottom: 3px solid var(--color-brand-orange-500);
        }
        .lp-stats-inner {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
        }
        .lp-stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 0 24px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .lp-stat-item:last-child { border-right: none; }
        .lp-stat-value {
          font-size: 2rem;
          font-weight: 900;
          color: var(--color-brand-orange-500);
          font-family: var(--font-mono);
          line-height: 1;
          margin-bottom: 6px;
        }
        .lp-stat-label {
          font-size: 0.8rem;
          color: #94A3B8;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        /* ── PORTAL GATEWAY ── */
        .lp-portals-section {
          padding: 72px 0;
          background: var(--color-neutral-100);
        }
        .lp-section-head {
          text-align: center;
          margin-bottom: 48px;
        }
        .lp-eyebrow {
          display: inline-block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: var(--color-action-600);
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .lp-section-head h2 {
          font-size: 1.9rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0 0 12px;
        }
        .lp-section-lead {
          font-size: 1rem;
          color: var(--color-neutral-600);
          max-width: 540px;
          margin: 0 auto;
          line-height: 1.55;
        }
        .lp-portal-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
        }
        .lp-portal-card {
          background: #fff;
          border-radius: var(--radius-lg);
          padding: 32px;
          border: 1px solid var(--color-neutral-200);
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          transition: box-shadow 0.2s ease;
        }
        .lp-portal-card:hover { box-shadow: var(--shadow-soft); }
        .lp-portal-citizen { border-top: 4px solid var(--color-brand-blue-600); }
        .lp-portal-admin   { border-top: 4px solid var(--color-action-600); }
        .lp-portal-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }
        .lp-portal-icon {
          width: 56px;
          height: 56px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-portal-icon-blue { background: #EFF6FF; color: var(--color-brand-blue-600); }
        .lp-portal-icon-orange { background: #FFF7ED; color: var(--color-action-600); }
        .lp-portal-label {
          font-size: 0.75rem;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: var(--radius-pill);
        }
        .lp-portal-label-blue { background: #EFF6FF; color: var(--color-brand-blue-600); }
        .lp-portal-label-orange { background: #FFF7ED; color: var(--color-action-600); }
        .lp-portal-heading {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-navy-900);
          margin: 0 0 10px;
        }
        .lp-portal-desc {
          font-size: 0.9rem;
          color: var(--color-neutral-600);
          line-height: 1.55;
          margin-bottom: 22px;
        }
        .lp-portal-features {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 28px;
          flex: 1;
        }
        .lp-portal-features li {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 0.875rem;
          color: var(--color-neutral-700);
        }
        .lp-portal-features li svg {
          color: var(--color-action-600);
          flex-shrink: 0;
          margin-top: 2px;
        }
        .lp-portal-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lp-btn-portal-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-brand-blue-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 11px 22px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 44px;
          transition: background-color 0.15s ease;
          font-family: var(--font-sans);
          flex: 1;
        }
        .lp-btn-portal-primary:hover { background-color: #1A4FA8; }
        .lp-btn-portal-outline {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          background-color: transparent;
          color: var(--color-navy-900);
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 11px 18px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          min-height: 44px;
          transition: border-color 0.15s ease;
          font-family: var(--font-sans);
          white-space: nowrap;
        }
        .lp-btn-portal-outline:hover { border-color: var(--color-navy-900); }
        .lp-btn-portal-admin {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background-color: var(--color-action-600);
          color: #fff;
          border: none;
          border-radius: var(--radius-md);
          padding: 11px 22px;
          font-size: 0.9rem;
          font-weight: 700;
          cursor: pointer;
          min-height: 44px;
          transition: background-color 0.15s ease;
          font-family: var(--font-sans);
          flex: 1;
        }
        .lp-btn-portal-admin:hover { background-color: var(--color-action-700); }

        /* ── HOW IT WORKS ── */
        .lp-how-section {
          padding: 72px 0;
          background: #fff;
          border-top: 1px solid var(--color-neutral-200);
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .lp-steps-grid {
          display: flex;
          align-items: stretch;
          gap: 0;
        }
        .lp-step-card {
          flex: 1;
          background: var(--color-neutral-100);
          border-radius: var(--radius-lg);
          padding: 28px 24px;
          border: 1px solid var(--color-neutral-200);
          position: relative;
        }
        .lp-step-card-highlight {
          background: #F0FDF4;
          border-color: #86EFAC;
        }
        .lp-step-num {
          font-size: 2.5rem;
          font-weight: 900;
          color: var(--color-neutral-200);
          font-family: var(--font-mono);
          line-height: 1;
          margin-bottom: 16px;
        }
        .lp-step-num-green { color: #BBF7D0; }
        .lp-step-icon-wrap {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .lp-step-orange { background: #FFF7ED; color: var(--color-action-600); }
        .lp-step-blue   { background: #EFF6FF; color: var(--color-brand-blue-600); }
        .lp-step-green  { background: #DCFCE7; color: #16A34A; }
        .lp-step-title {
          font-size: 1.05rem;
          font-weight: 700;
          color: var(--color-navy-900);
          margin: 0 0 10px;
        }
        .lp-step-desc {
          font-size: 0.875rem;
          color: var(--color-neutral-600);
          line-height: 1.55;
        }
        .lp-step-highlight-badge {
          display: inline-block;
          margin-top: 14px;
          background: #DCFCE7;
          color: #166534;
          font-size: 0.72rem;
          font-weight: 800;
          padding: 3px 10px;
          border-radius: var(--radius-pill);
        }
        .lp-step-connector {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0 16px;
          color: var(--color-neutral-300);
          flex-shrink: 0;
        }

        /* ── LINKER ── */
        .lp-linker-section {
          padding: 72px 0;
          background: var(--color-neutral-100);
        }
        .lp-linker-card {
          background: var(--color-navy-900);
          border-radius: var(--radius-lg);
          padding: 48px;
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 48px;
          align-items: center;
        }
        .lp-linker-eyebrow {
          display: block;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 1.5px;
          color: var(--color-brand-orange-500);
          text-transform: uppercase;
          margin-bottom: 12px;
        }
        .lp-linker-h2 {
          font-size: 1.8rem;
          font-weight: 900;
          color: #FFFFFF;
          line-height: 1.2;
          margin: 0 0 16px;
        }
        .lp-linker-desc {
          font-size: 0.9rem;
          color: #94A3B8;
          line-height: 1.6;
          margin-bottom: 28px;
        }
        .lp-linker-phases {
          display: flex;
          flex-direction: column;
          gap: 16px;
          margin-bottom: 28px;
        }
        .lp-phase-item {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .lp-phase-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          flex-shrink: 0;
          margin-top: 5px;
        }
        .lp-phase-dot-1 { background: var(--color-brand-orange-500); }
        .lp-phase-dot-2 { background: #60A5FA; }
        .lp-phase-dot-3 { background: #34D399; }
        .lp-phase-item strong { display: block; font-size: 0.875rem; color: #E2E8F0; margin-bottom: 2px; }
        .lp-phase-item span { font-size: 0.8rem; color: #94A3B8; }
        .lp-linker-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          color: var(--color-brand-orange-500);
          border: 1px solid var(--color-brand-orange-500);
          border-radius: var(--radius-md);
          padding: 10px 20px;
          font-size: 0.875rem;
          font-weight: 700;
          cursor: pointer;
          transition: background-color 0.15s ease;
          font-family: var(--font-sans);
        }
        .lp-linker-btn:hover { background-color: rgba(242,137,94,0.1); }
        .lp-linker-visual {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: var(--radius-md);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          align-items: center;
        }
        .lp-linker-node {
          width: 100%;
          padding: 12px 14px;
          border-radius: var(--radius-md);
          border: 1px solid rgba(255,255,255,0.15);
        }
        .lp-linker-node-primary { background: rgba(31,95,191,0.2); border-color: #60A5FA; }
        .lp-linker-node-secondary { background: rgba(194,87,12,0.2); border-color: var(--color-brand-orange-500); }
        .lp-node-label { font-size: 0.78rem; font-weight: 700; color: #E2E8F0; font-family: var(--font-mono); }
        .lp-node-sub { font-size: 0.72rem; color: #94A3B8; margin-top: 3px; }
        .lp-linker-connect {
          display: flex;
          align-items: center;
          gap: 8px;
          color: #34D399;
          font-size: 0.78rem;
          font-weight: 700;
        }
        .lp-linker-inst {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #94A3B8;
          border-top: 1px solid rgba(255,255,255,0.1);
          padding-top: 10px;
          width: 100%;
          text-align: center;
          justify-content: center;
        }

        /* ── CATEGORIES ── */
        .lp-categories-section {
          padding: 72px 0;
          background: #fff;
          border-top: 1px solid var(--color-neutral-200);
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .lp-cat-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .lp-cat-card {
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-200);
          border-radius: var(--radius-lg);
          padding: 24px;
          text-align: left;
          cursor: pointer;
          font-family: var(--font-sans);
          transition: border-color 0.15s ease, box-shadow 0.15s ease;
          display: flex;
          flex-direction: column;
        }
        .lp-cat-card:hover {
          border-color: var(--color-brand-blue-600);
          box-shadow: var(--shadow-soft);
          background: #fff;
        }
        .lp-cat-urgent {
          border-color: #FCA5A5;
          background: #FFF5F5;
        }
        .lp-cat-urgent:hover {
          border-color: #DC2626;
          background: #FFF;
        }
        .lp-cat-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 14px;
        }
        .lp-cat-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .lp-cat-icon-blue { background: #EFF6FF; color: var(--color-brand-blue-600); }
        .lp-cat-icon-red  { background: #FEE2E2; color: #DC2626; }
        .lp-cat-badge {
          font-size: 0.7rem;
          font-weight: 700;
          padding: 3px 8px;
          border-radius: var(--radius-pill);
        }
        .lp-cat-badge-blue   { background: #EFF6FF; color: var(--color-brand-blue-600); }
        .lp-cat-badge-red    { background: #FEE2E2; color: #DC2626; }
        .lp-cat-badge-purple { background: #F3E8FF; color: #7E22CE; }
        .lp-cat-title {
          font-size: 0.975rem;
          font-weight: 700;
          color: var(--color-navy-900);
          margin: 0 0 8px;
        }
        .lp-cat-desc {
          font-size: 0.825rem;
          color: var(--color-neutral-600);
          line-height: 1.5;
          flex: 1;
          margin: 0 0 14px;
        }
        .lp-cat-link {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-action-600);
        }
        .lp-cat-urgent .lp-cat-link { color: #DC2626; }

        /* ── HELPLINES ── */
        .lp-helplines-section {
          background: var(--color-navy-900);
          padding: 28px 0;
        }
        .lp-helplines-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
          flex-wrap: wrap;
        }
        .lp-helplines-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }
        .lp-helpline-icon-wrap {
          width: 44px;
          height: 44px;
          background: rgba(242,137,94,0.2);
          border: 1px solid var(--color-brand-orange-500);
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--color-brand-orange-500);
          flex-shrink: 0;
        }
        .lp-helplines-h2 {
          font-size: 1rem;
          font-weight: 700;
          color: #FFFFFF;
          margin: 0 0 4px;
        }
        .lp-helplines-sub {
          font-size: 0.8rem;
          color: #94A3B8;
        }
        .lp-helplines-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }
        .lp-hl-pill {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          border-radius: var(--radius-md);
          text-decoration: none;
          font-size: 0.85rem;
          font-weight: 700;
          min-height: 44px;
          transition: opacity 0.15s ease;
        }
        .lp-hl-pill:hover { opacity: 0.85; }
        .lp-hl-pill span { font-size: 0.72rem; font-weight: 600; opacity: 0.85; }
        .lp-hl-pill strong { font-size: 1rem; font-family: var(--font-mono); }
        .lp-hl-red  { background: rgba(220,38,38,0.2); border: 1px solid #F87171; color: #FCA5A5; }
        .lp-hl-pink { background: rgba(219,39,119,0.2); border: 1px solid #F472B6; color: #FBCFE8; }
        .lp-hl-blue { background: rgba(59,130,246,0.2); border: 1px solid #60A5FA; color: #BFDBFE; }

        /* ── RESPONSIVE ── */
        @media (max-width: 900px) {
          .lp-hero-inner {
            grid-template-columns: 1fr;
            gap: 32px;
          }
          .lp-hero-h1 { font-size: 1.9rem; }
          .lp-portal-grid { grid-template-columns: 1fr; }
          .lp-cat-grid { grid-template-columns: 1fr 1fr; }
          .lp-stats-inner { grid-template-columns: repeat(2, 1fr); }
          .lp-linker-card { grid-template-columns: 1fr; }
          .lp-linker-right { display: none; }
          .lp-steps-grid { flex-direction: column; }
          .lp-step-connector { transform: rotate(90deg); padding: 8px 0; }
        }
        @media (max-width: 600px) {
          .lp-hero { padding: 36px 0 32px; }
          .lp-cat-grid { grid-template-columns: 1fr; }
          .lp-stats-inner { grid-template-columns: repeat(2,1fr); }
          .lp-portals-section, .lp-how-section, .lp-linker-section, .lp-categories-section { padding: 48px 0; }
          .lp-helplines-inner { flex-direction: column; align-items: flex-start; }
          .lp-ticker-text { display: none; }
        }
      `}</style>
    </div>
  );
};

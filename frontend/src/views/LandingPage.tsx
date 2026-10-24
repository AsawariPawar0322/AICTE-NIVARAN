import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Institution } from '../types';
import { 
  Search, 
  Mic, 
  FilePlus2, 
  SearchCheck, 
  ShieldCheck, 
  Clock, 
  KeyRound, 
  Building2, 
  CreditCard, 
  AlertTriangle, 
  GraduationCap, 
  Users, 
  Wrench, 
  FileText, 
  ArrowRight,
  ExternalLink,
  Sparkles
} from 'lucide-react';

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
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [searchResults, setSearchResults] = useState<Institution[]>([]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const q = query.toLowerCase();
    const matches = institutions.filter(inst => 
      inst.name.toLowerCase().includes(q) || 
      inst.permanentId.toLowerCase().includes(q) ||
      inst.city.toLowerCase().includes(q) ||
      inst.state.toLowerCase().includes(q)
    );
    setSearchResults(matches);
  };

  const simulateVoiceSearch = () => {
    setIsVoiceListening(true);
    setTimeout(() => {
      setSearchQuery('Delhi Technological University');
      handleSearch('Delhi Technological University');
      setIsVoiceListening(false);
    }, 1200);
  };

  return (
    <div className="landing-page" id="main-content">
      {/* Official AICTE Gazette Redressal Directive Banner */}
      <section className="notice-ticker" aria-label="Official Announcements">
        <div className="container flex items-center gap-3">
          <span className="ticker-badge">AICTE NOTIFICATION 2026</span>
          <div className="ticker-content">
            <span className="ticker-text">
              <strong>Mandatory Citizen OTP Closure:</strong> Pursuant to AICTE Grievance Regulations Chapter 7, no institution is permitted to close grievances without student/faculty OTP authorization. 72-Hour maximum first-response SLA strictly monitored.
            </span>
          </div>
          <a href="#circulars" className="ticker-link flex items-center gap-1">
            <span>Read Circular</span>
            <ExternalLink size={12} />
          </a>
        </div>
      </section>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="container">
          <div className="hero-content">
            <div className="hero-logo-lockup flex items-center justify-center gap-3 mb-3">
              <img 
                src="/aicte-nivaran-logo.png" 
                alt="AICTE NIVARAN Emblem" 
                className="hero-emblem-img"
              />
              <div className="hero-brand-meta text-left">
                <span className="hero-brand-name">AICTE NIVARAN</span>
                <span className="hero-brand-motto">अखिल भारतीय तकनीकी शिक्षा परिषद · योगः कर्मसु कौशलम्</span>
              </div>
            </div>
            <div className="hero-pill-tag flex items-center gap-2">
              <Sparkles size={14} className="text-warning" />
              <span>Unified National Technical Redressal Portal · SIH26264</span>
            </div>
            <h1 className="hero-heading">{t.heroTitle}</h1>
            <p className="hero-desc">{t.heroSubtitle}</p>

            {/* AICTE Institution Search Bar with Voice Feature */}
            <div className="institution-search-box">
              <div className="search-bar-inner">
                <Search size={22} className="search-icon" />
                <input
                  type="text"
                  className="search-input"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  aria-label="Search Institute by Name or Permanent ID"
                />
                <button
                  type="button"
                  className={`voice-btn ${isVoiceListening ? 'listening' : ''}`}
                  onClick={simulateVoiceSearch}
                  title={isVoiceListening ? 'Listening...' : t.voiceSearchTooltip}
                >
                  <Mic size={18} />
                  {isVoiceListening && <span className="voice-wave">Listening...</span>}
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary search-action-btn"
                  onClick={() => handleSearch(searchQuery)}
                >
                  {t.findInstituteBtn}
                </button>
              </div>

              {/* Instant Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="search-dropdown-results" role="listbox">
                  <div className="dropdown-header">
                    Found {searchResults.length} Verified AICTE Approved Institution(s):
                  </div>
                  {searchResults.map((inst) => (
                    <div 
                      key={inst.id} 
                      className="result-item flex items-center justify-between"
                      onClick={() => {
                        if (onSelectInstitutionForComplaint) {
                          onSelectInstitutionForComplaint(inst);
                        }
                        setActiveTab('file-complaint');
                      }}
                    >
                      <div className="inst-meta">
                        <strong className="inst-name">{inst.name}</strong>
                        <span className="inst-sub">
                          AICTE Permanent ID: <code className="mono">{inst.permanentId}</code> · {inst.city}, {inst.state}
                        </span>
                      </div>
                      <div className="inst-action flex items-center gap-2">
                        <span className="status-chip chip-info">{inst.complianceRating}</span>
                        <button type="button" className="btn btn-outline btn-sm">
                          File Grievance Against College <ArrowRight size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Two Primary Front Door Action Cards */}
          <div className="grid grid-cols-2 gap-6 hero-action-cards">
            {/* Card 1: File a Complaint */}
            <div className="action-card card-file flex flex-col justify-between">
              <div>
                <div className="card-badge-row flex items-center justify-between">
                  <div className="icon-badge badge-orange">
                    <FilePlus2 size={26} />
                  </div>
                  <span className="step-tag">1-Click Front Door</span>
                </div>
                <h2 className="card-title">{t.fileCardTitle}</h2>
                <p className="card-desc">{t.fileCardDesc}</p>
                <ul className="card-features-list">
                  <li>✓ Guided 5-Step autosaved lodging wizard</li>
                  <li>✓ Cryptographic SHA-256 evidence proof vault</li>
                  <li>✓ Optional 100% confidential & anonymous reporting</li>
                </ul>
              </div>
              <button
                type="button"
                className="btn btn-primary btn-block card-cta-btn"
                onClick={() => setActiveTab('file-complaint')}
              >
                <span>{t.fileCardBtn}</span>
                <ArrowRight size={18} />
              </button>
            </div>

            {/* Card 2: Track Existing Case */}
            <div className="action-card card-track flex flex-col justify-between">
              <div>
                <div className="card-badge-row flex items-center justify-between">
                  <div className="icon-badge badge-blue">
                    <SearchCheck size={26} />
                  </div>
                  <span className="step-tag tag-blue">Real-Time Stages</span>
                </div>
                <h2 className="card-title">{t.trackCardTitle}</h2>
                <p className="card-desc">{t.trackCardDesc}</p>
                <ul className="card-features-list">
                  <li>✓ 6-Stage visual progress timeline</li>
                  <li>✓ 72-Hour live SLA countdown timer</li>
                  <li>✓ <strong>Citizen OTP Gateway:</strong> Confirm resolution satisfaction</li>
                </ul>
              </div>
              <button
                type="button"
                className="btn btn-secondary btn-block card-cta-btn"
                onClick={() => setActiveTab('track')}
              >
                <span>{t.trackCardBtn}</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step Process Explainer */}
      <section className="explainer-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-eyebrow">TRANSPARENT LIFECYCLE</span>
            <h2>How Your Grievance is Handled & Resolved</h2>
            <p className="section-lead">A tamper-evident workflow ensuring every complaint receives an enforceable resolution.</p>
          </div>

          <div className="grid grid-cols-3 gap-6 explainer-cards">
            <div className="card step-card">
              <div className="step-num">01</div>
              <div className="step-icon-wrap">
                <ShieldCheck size={28} className="text-orange" />
              </div>
              <h3>{t.step1Title}</h3>
              <p>{t.step1Desc}</p>
            </div>

            <div className="card step-card">
              <div className="step-num">02</div>
              <div className="step-icon-wrap">
                <Clock size={28} className="text-blue" />
              </div>
              <h3>{t.step2Title}</h3>
              <p>{t.step2Desc}</p>
            </div>

            <div className="card step-card highlight-step">
              <div className="step-num highlight-num">03</div>
              <div className="step-icon-wrap">
                <KeyRound size={28} className="text-green" />
              </div>
              <h3>{t.step3Title}</h3>
              <p>{t.step3Desc}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Redressal Category Desks */}
      <section className="categories-section">
        <div className="container">
          <div className="section-head text-center">
            <span className="section-eyebrow">DEDICATED BUREAU DESKS</span>
            <h2>{t.categoriesTitle}</h2>
            <p className="section-lead">Select your grievance area for specialized triage and expedited disposal.</p>
          </div>

          <div className="grid grid-cols-3 gap-4 category-cards-grid">
            <div 
              className="card cat-card flex flex-col justify-between"
              onClick={() => setActiveTab('file-complaint')}
            >
              <div>
                <div className="cat-icon-row flex items-center justify-between">
                  <CreditCard size={24} className="cat-icon-style icon-fees" />
                  <span className="cat-badge">High Volume</span>
                </div>
                <h4>{t.catFees}</h4>
                <p className="cat-desc">Caution money non-refund, seat surrender deductions, excess library fees, unapproved bus fee hikes.</p>
              </div>
              <span className="cat-action-link">File in this desk →</span>
            </div>

            <div 
              className="card cat-card cat-urgent flex flex-col justify-between"
              onClick={() => setActiveTab('file-complaint')}
            >
              <div>
                <div className="cat-icon-row flex items-center justify-between">
                  <AlertTriangle size={24} className="cat-icon-style icon-ragging" />
                  <span className="cat-badge badge-urgent">24h Mandatory FIR</span>
                </div>
                <h4>{t.catRagging}</h4>
                <p className="cat-desc">Physical intimidation, hostel harassment, psychological bullying. 100% confidential reporting available.</p>
              </div>
              <span className="cat-action-link link-urgent">Instant Emergency Filing →</span>
            </div>

            <div 
              className="card cat-card flex flex-col justify-between"
              onClick={() => setActiveTab('file-complaint')}
            >
              <div>
                <div className="cat-icon-row flex items-center justify-between">
                  <GraduationCap size={24} className="cat-icon-style icon-scholarship" />
                  <span className="cat-badge">Direct Bureau</span>
                </div>
                <h4>{t.catScholarship}</h4>
                <p className="cat-desc">Pragati (Girls in Tech), Saksham (Specially-Abled), PMSSS J&K/Ladakh stipend delay or college verification freeze.</p>
              </div>
              <span className="cat-action-link">File in this desk →</span>
            </div>

            <div 
              className="card cat-card flex flex-col justify-between"
              onClick={() => setActiveTab('file-complaint')}
            >
              <div>
                <div className="cat-icon-row flex items-center justify-between">
                  <Users size={24} className="cat-icon-style icon-icc" />
                  <span className="cat-badge">Confidential</span>
                </div>
                <h4>{t.catHarassment}</h4>
                <p className="cat-desc">Complaints forwarded straight to AICTE Central ICC Nodal Cell. Strict identity protection protocol.</p>
              </div>
              <span className="cat-action-link">File in this desk →</span>
            </div>

            <div 
              className="card cat-card flex flex-col justify-between"
              onClick={() => setActiveTab('file-complaint')}
            >
              <div>
                <div className="cat-icon-row flex items-center justify-between">
                  <Wrench size={24} className="cat-icon-style icon-infra" />
                  <span className="cat-badge">Approval Review</span>
                </div>
                <h4>{t.catFaculty}</h4>
                <p className="cat-desc">Substandard laboratories, deficient faculty ratio, missing computer centers, library textbook shortages.</p>
              </div>
              <span className="cat-action-link">File in this desk →</span>
            </div>

            <div 
              className="card cat-card flex flex-col justify-between"
              onClick={() => setActiveTab('file-complaint')}
            >
              <div>
                <div className="cat-icon-row flex items-center justify-between">
                  <FileText size={24} className="cat-icon-style icon-admission" />
                  <span className="cat-badge">Academics</span>
                </div>
                <h4>{t.catAdmission}</h4>
                <p className="cat-desc">Withholding of original degree or marksheets, unapproved curriculum changes, examination schedule malpractice.</p>
              </div>
              <span className="cat-action-link">File in this desk →</span>
            </div>
          </div>
        </div>
      </section>

      {/* National Portal Statistics Strip */}
      <section className="stats-section">
        <div className="container">
          <div className="grid grid-cols-4 gap-4 stats-grid">
            <div className="stat-card">
              <span className="stat-number">{t.statResolved}</span>
              <span className="stat-label">{t.statResolvedLabel}</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{t.statSla}</span>
              <span className="stat-label">{t.statSlaLabel}</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{t.statInstitutes}</span>
              <span className="stat-label">{t.statInstitutesLabel}</span>
            </div>
            <div className="stat-card">
              <span className="stat-number">{t.statSatisfaction}</span>
              <span className="stat-label">{t.statSatisfactionLabel}</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .notice-ticker {
          background-color: #FEF3C7;
          border-bottom: 1px solid #FDE68A;
          padding: 8px 0;
          font-size: 0.825rem;
        }
        .ticker-badge {
          background-color: var(--color-action-600);
          color: #FFFFFF;
          font-weight: 700;
          font-size: 0.7rem;
          padding: 2px 6px;
          border-radius: var(--radius-sm);
          white-space: nowrap;
        }
        .ticker-content {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #78350F;
          flex: 1;
        }
        .ticker-link {
          font-weight: 600;
          color: var(--color-action-600);
          text-decoration: underline;
          white-space: nowrap;
        }

        .hero-section {
          background: linear-gradient(180deg, #FFFFFF 0%, #F3F5F8 100%);
          padding: 48px 0 36px 0;
          border-bottom: 1px solid var(--color-neutral-300);
        }
        .hero-content {
          max-width: 860px;
          margin: 0 auto 36px auto;
          text-align: center;
        }
        .hero-logo-lockup {
          margin-bottom: 16px;
        }
        .hero-emblem-img {
          height: 84px;
          width: auto;
          object-fit: contain;
          filter: drop-shadow(0 4px 12px rgba(11, 42, 91, 0.22));
          transition: transform 0.25s ease;
        }
        .hero-emblem-img:hover {
          transform: scale(1.05) rotate(3deg);
        }
        .hero-brand-meta {
          display: flex;
          flex-direction: column;
        }
        .hero-brand-name {
          font-size: 1.6rem;
          font-weight: 800;
          color: var(--color-navy-900);
          letter-spacing: -0.5px;
          line-height: 1.1;
        }
        .hero-brand-motto {
          font-size: 0.85rem;
          color: var(--color-action-600);
          font-weight: 700;
        }
        .hero-pill-tag {
          display: inline-flex;
          align-items: center;
          padding: 4px 12px;
          background: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-pill);
          color: var(--color-brand-blue-600);
          font-size: 0.8125rem;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .hero-heading {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--color-navy-900);
          letter-spacing: -0.5px;
          margin-bottom: 12px;
        }
        .hero-desc {
          font-size: 1.1rem;
          color: var(--color-neutral-600);
          margin-bottom: 24px;
        }

        .institution-search-box {
          position: relative;
          max-width: 760px;
          margin: 0 auto;
        }
        .search-bar-inner {
          display: flex;
          align-items: center;
          background: #FFFFFF;
          border: 2px solid var(--color-brand-blue-600);
          border-radius: var(--radius-pill);
          padding: 6px 8px 6px 18px;
          box-shadow: 0 4px 20px rgba(31, 95, 191, 0.12);
        }
        .search-icon {
          color: var(--color-brand-blue-600);
          margin-right: 10px;
          flex-shrink: 0;
        }
        .search-input {
          flex: 1;
          border: none;
          outline: none;
          font-size: 0.95rem;
          font-family: var(--font-sans);
          color: var(--color-neutral-900);
          min-width: 120px;
        }
        .voice-btn {
          background: #F1F5F9;
          border: 1px solid #CBD5E1;
          color: var(--color-neutral-700);
          padding: 8px 12px;
          border-radius: var(--radius-pill);
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          font-weight: 600;
          margin-right: 6px;
          transition: all 0.15s ease;
        }
        .voice-btn:hover {
          background-color: #E2E8F0;
        }
        .voice-btn.listening {
          background-color: #FEE2E2;
          color: #B91C1C;
          border-color: #F87171;
          animation: pulseVoice 1s infinite alternate;
        }
        @keyframes pulseVoice {
          from { transform: scale(1); }
          to { transform: scale(1.05); }
        }
        .search-action-btn {
          border-radius: var(--radius-pill);
          padding: 10px 22px;
        }

        .search-dropdown-results {
          position: absolute;
          top: calc(100% + 8px);
          left: 0;
          right: 0;
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          box-shadow: var(--shadow-modal);
          z-index: 50;
          text-align: left;
          max-height: 380px;
          overflow-y: auto;
        }
        .dropdown-header {
          padding: 10px 16px;
          background: var(--color-neutral-100);
          font-size: 0.8rem;
          font-weight: 700;
          color: var(--color-neutral-600);
          border-bottom: 1px solid var(--color-neutral-200);
        }
        .result-item {
          padding: 12px 16px;
          border-bottom: 1px solid var(--color-neutral-200);
          cursor: pointer;
          transition: background 0.1s ease;
        }
        .result-item:hover {
          background-color: var(--color-brand-blue-100);
        }
        .inst-name {
          font-size: 0.95rem;
          color: var(--color-navy-900);
          display: block;
        }
        .inst-sub {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
        }
        .btn-sm {
          min-height: 32px;
          padding: 4px 10px;
          font-size: 0.8rem;
        }

        .hero-action-cards {
          margin-top: 16px;
        }
        .action-card {
          background: #FFFFFF;
          border: 2px solid var(--color-neutral-300);
          border-radius: var(--radius-lg);
          padding: 28px;
          box-shadow: var(--shadow-soft);
          transition: transform 0.15s ease, border-color 0.15s ease;
        }
        .action-card:hover {
          border-color: var(--color-brand-blue-600);
          transform: translateY(-2px);
        }
        .card-file {
          border-top: 5px solid var(--color-action-600);
        }
        .card-track {
          border-top: 5px solid var(--color-brand-blue-600);
        }
        .icon-badge {
          width: 52px;
          height: 52px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 16px;
        }
        .badge-orange {
          background-color: #FFF7ED;
          color: var(--color-action-600);
          border: 1px solid #FFEDD5;
        }
        .badge-blue {
          background-color: #EFF6FF;
          color: var(--color-brand-blue-600);
          border: 1px solid #DBEAFE;
        }
        .step-tag {
          font-size: 0.75rem;
          font-weight: 700;
          color: var(--color-action-600);
          background: #FFF7ED;
          padding: 4px 8px;
          border-radius: var(--radius-pill);
        }
        .tag-blue {
          color: var(--color-brand-blue-600);
          background: #EFF6FF;
        }
        .card-title {
          font-size: 1.4rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .card-desc {
          font-size: 0.95rem;
          color: var(--color-neutral-600);
          margin-bottom: 16px;
        }
        .card-features-list {
          list-style: none;
          margin-bottom: 24px;
        }
        .card-features-list li {
          font-size: 0.875rem;
          color: var(--color-neutral-700);
          margin-bottom: 6px;
        }
        .card-cta-btn {
          width: 100%;
          font-size: 1rem;
          font-weight: 700;
        }

        .explainer-section {
          padding: 56px 0;
          background: #FFFFFF;
          border-bottom: 1px solid var(--color-neutral-300);
        }
        .section-head {
          margin-bottom: 40px;
        }
        .section-eyebrow {
          font-size: 0.78rem;
          font-weight: 800;
          letter-spacing: 1px;
          color: var(--color-action-600);
          display: block;
          margin-bottom: 6px;
        }
        .section-lead {
          font-size: 1.05rem;
          color: var(--color-neutral-600);
          margin-top: 6px;
        }
        .step-card {
          position: relative;
          padding: 32px 24px;
          background: var(--color-neutral-100);
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
        }
        .step-num {
          font-size: 2.2rem;
          font-weight: 900;
          color: var(--color-neutral-300);
          position: absolute;
          top: 16px;
          right: 20px;
          font-family: var(--font-mono);
        }
        .step-icon-wrap {
          margin-bottom: 16px;
        }
        .step-card h3 {
          font-size: 1.15rem;
          font-weight: 700;
          margin-bottom: 8px;
        }
        .step-card p {
          font-size: 0.9rem;
          color: var(--color-neutral-600);
        }
        .highlight-step {
          background: #F0FDF4;
          border-color: #86EFAC;
        }
        .highlight-num {
          color: #BBF7D0;
        }
        .text-orange { color: var(--color-action-600); }
        .text-blue { color: var(--color-brand-blue-600); }
        .text-green { color: #16A34A; }

        .categories-section {
          padding: 56px 0;
          background: var(--color-neutral-100);
        }
        .cat-card {
          cursor: pointer;
          transition: transform 0.15s ease, border-color 0.15s ease;
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
        }
        .cat-card:hover {
          border-color: var(--color-brand-blue-600);
          transform: translateY(-2px);
        }
        .cat-urgent {
          border-left: 4px solid var(--color-danger-text);
          background: #FFFDFD;
        }
        .cat-icon-row {
          margin-bottom: 12px;
        }
        .cat-badge {
          font-size: 0.72rem;
          font-weight: 700;
          padding: 2px 8px;
          background: var(--color-neutral-100);
          color: var(--color-neutral-700);
          border-radius: var(--radius-pill);
        }
        .badge-urgent {
          background: #FEE2E2;
          color: #B91C1C;
        }
        .cat-icon-style {
          color: var(--color-navy-900);
        }
        .icon-ragging { color: #DC2626; }
        .icon-fees { color: #D97706; }
        .icon-scholarship { color: #2563EB; }
        .icon-icc { color: #7C3AED; }
        .icon-infra { color: #4B5563; }
        .icon-admission { color: #059669; }
        .cat-card h4 {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 6px;
        }
        .cat-desc {
          font-size: 0.85rem;
          color: var(--color-neutral-600);
          margin-bottom: 16px;
        }
        .cat-action-link {
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--color-brand-blue-600);
        }
        .link-urgent {
          color: #DC2626;
        }

        .stats-section {
          background-color: var(--color-navy-900);
          color: #FFFFFF;
          padding: 40px 0;
        }
        .stat-card {
          text-align: center;
          padding: 12px;
        }
        .stat-number {
          display: block;
          font-size: 2.2rem;
          font-weight: 800;
          color: #F8FAFC;
          font-family: var(--font-mono);
          letter-spacing: -0.5px;
        }
        .stat-label {
          font-size: 0.85rem;
          color: #94A3B8;
        }

        @media (max-width: 768px) {
          .hero-heading {
            font-size: 1.6rem;
          }
          .hero-action-cards {
            grid-template-columns: 1fr;
          }
          .explainer-cards {
            grid-template-columns: 1fr;
          }
          .category-cards-grid {
            grid-template-columns: 1fr;
          }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }
      `}</style>
    </div>
  );
};

import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint, GrievanceCategory, Institution, EvidenceFile } from '../types';
import { Icon } from '../components/Icon';
import {
  GraduationCap,
  ChalkboardTeacher,
  UsersThree,
  Detective,
  CreditCard,
  Siren,
  Medal,
  ShieldCheck,
  Flask,
  Certificate,
  Question
} from '@phosphor-icons/react';

interface FileComplaintViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  institutions: Institution[];
  onAddNewComplaint: (newComplaint: Complaint) => void;
  selectedInstitution?: Institution | null;
}

const CATEGORIES: {
  key: GrievanceCategory;
  label: string;
  desc: string;
  icon: React.ReactNode;
  urgent?: boolean;
}[] = [
  { key: 'FEES_REFUND',       label: 'Fee Refund & Excess Charges',         desc: 'Seat withdrawal refund, caution money, hostel deposits, unauthorised fees.',      icon: <CreditCard   size={22} weight="duotone" /> },
  { key: 'ANTI_RAGGING',      label: 'Anti-Ragging & Harassment',           desc: 'Hostel intimidation, verbal abuse, psychological bullying. 24h FIR mandatory.',   icon: <Siren        size={22} weight="duotone" />, urgent: true },
  { key: 'SCHOLARSHIP_AICTE', label: 'AICTE Scholarship (Pragati/Saksham)', desc: 'Disbursement delay, PFMS verification freeze, portal mismatch.',                  icon: <Medal        size={22} weight="duotone" /> },
  { key: 'SEXUAL_HARASSMENT', label: 'Internal Complaints Committee (ICC)', desc: 'Gender harassment, workplace misconduct. Strictly confidential routing.',          icon: <ShieldCheck  size={22} weight="duotone" /> },
  { key: 'FACULTY_INFRA',     label: 'Faculty & Lab Infrastructure',        desc: 'Deficient lab apparatus, absenteeism, library deficiencies.',                      icon: <Flask        size={22} weight="duotone" /> },
  { key: 'ADMISSION_EXAM',    label: 'Admissions, Marks & Certificates',    desc: 'Withholding marksheets, transcript denial, exam malpractice.',                     icon: <Certificate  size={22} weight="duotone" /> },
  { key: 'OTHER_UNSURE',      label: 'Other / Not Sure',                    desc: 'Our triage desk will route to the correct bureau.',                                 icon: <Question     size={22} weight="duotone" /> },
];

const STEP_LABELS = ['Who You Are', 'Category', 'Institution', 'Proof Vault', 'Review'];

export const FileComplaintView: React.FC<FileComplaintViewProps> = ({
  lang,
  setActiveTab,
  institutions,
  onAddNewComplaint,
  selectedInstitution
}) => {
  const t = translations[lang];
  const [step, setStep] = useState(1);

  // Step 1
  const [role, setRole] = useState<'Student' | 'Faculty' | 'Parent' | 'Anonymous'>('Student');
  const [name, setName] = useState('Aarav Sharma');
  const [rollNo, setRollNo] = useState('2024-CS-108');
  const [mobile, setMobile] = useState('+91 98712 34567');
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [isAnon, setIsAnon] = useState(false);

  // Step 2
  const [category, setCategory] = useState<GrievanceCategory>('FEES_REFUND');
  const [categoryLabel, setCategoryLabel] = useState('Fee Refund & Excess Charges');

  // Step 3
  const [instSearch, setInstSearch] = useState(selectedInstitution?.name ?? '');
  const [selectedInst, setSelectedInst] = useState<Institution | null>(selectedInstitution ?? institutions[0]);

  // Step 4
  const [title, setTitle] = useState('Withholding of caution money and library fee deduction despite formal seat withdrawal');
  const [details, setDetails] = useState('I formally withdrew my admission before the national cutoff on 14th August. The college accounts office refused to disburse the caution fee of ₹44,000 in direct contravention of AICTE Chapter 10 norms.');
  const [evidences, setEvidences] = useState<EvidenceFile[]>([{
    id: 'proof-1',
    name: 'Fee_Receipt_Tuition_Caution_Paid.pdf',
    size: 1240000,
    type: 'application/pdf',
    sha256Hash: 'a9f24e98bc01d120a84e910248fca89b120489ba1029384756abcdef9182345a',
    uploadDate: 'Just now'
  }]);
  const [isDragging, setIsDragging] = useState(false);

  // Step 5
  const [linkRelated, setLinkRelated] = useState(true);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const filteredInsts = instSearch.trim()
    ? institutions.filter(i =>
        i.name.toLowerCase().includes(instSearch.toLowerCase()) ||
        i.permanentId.toLowerCase().includes(instSearch.toLowerCase()) ||
        i.city.toLowerCase().includes(instSearch.toLowerCase())
      )
    : institutions;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    const file = e.target.files[0];
    const hexChars = '0123456789abcdef';
    let hash = '';
    for (let i = 0; i < 64; i++) hash += hexChars[Math.floor(Math.random() * 16)];
    setEvidences(prev => [...prev, {
      id: `proof-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'application/octet-stream',
      sha256Hash: hash,
      uploadDate: 'Just now'
    }]);
  };

  const handleSubmit = () => {
    const id = `AICTE-2026-GRV-${Math.floor(10000 + Math.random() * 90000)}`;
    const complaint: Complaint = {
      id,
      title,
      category,
      categoryLabel,
      institutionName: selectedInst?.name ?? 'Delhi Technological University (DTU)',
      aictePermanentId: selectedInst?.permanentId ?? '1-10928341',
      city: selectedInst?.city ?? 'New Delhi',
      state: selectedInst?.state ?? 'Delhi',
      complainantName: isAnon ? 'Confidential Complainant' : name,
      complainantRole: isAnon ? 'Anonymous' : role,
      contactMobile: mobile,
      contactEmail: email,
      isAnonymous: isAnon,
      details,
      currentStage: 'REGISTERED',
      stageNumber: 1,
      slaHoursRemaining: 72,
      assignedOfficer: {
        name: 'Dr. Ramesh Chandra Verma',
        designation: 'Director, PGRC',
        bureau: 'AICTE HQ New Delhi',
        badgeVerified: true
      },
      evidenceList: evidences,
      timeline: [{
        id: `tl-${Date.now()}`,
        title: 'Grievance Formally Registered',
        description: `Case logged with ${evidences.length} cryptographically hashed evidence file(s). 72-Hour SLA activated.`,
        actor: 'Citizen Portal Vault',
        role: 'System Gateway',
        timestamp: 'Just now',
        stage: 'REGISTERED'
      }],
      relatedCaseCount: linkRelated ? 3 : 0
    };
    onAddNewComplaint(complaint);
    setSubmittedId(id);
  };

  const copyId = () => {
    if (submittedId) {
      navigator.clipboard.writeText(submittedId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const progress = ((step - 1) / 4) * 100;

  // ── CONFIRMATION SCREEN ──
  if (submittedId) {
    return (
      <div className="fc-root" id="main-content">
        <div className="container fc-container">
          <div className="fc-confirm-card">
            <div className="fc-confirm-icon">
              <Icon e="?" size={56} />
            </div>
            <span className="fc-confirm-badge">Formally Registered &amp; Cryptographically Timestamped</span>
            <h2 className="fc-confirm-heading">Grievance Successfully Lodged</h2>
            <p className="fc-confirm-lead">
              Your complaint has been submitted with an active 72-hour first-response SLA. The institution cannot close this case without your OTP.
            </p>

            <div className="fc-case-id-box">
              <div>
                <span className="fc-case-id-label">Your Case Reference ID</span>
                <code className="fc-case-id-value">{submittedId}</code>
              </div>
              <button type="button" className="fc-copy-btn" onClick={copyId} aria-label="Copy case ID">
                {copied ? <Icon e="?" size={16} /> : <Icon e="??" size={16} />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>

            <div className="fc-confirm-details">
              <div className="fc-detail-row">
                <span className="fc-detail-label">Institution</span>
                <span className="fc-detail-value">{selectedInst?.name} <code className="fc-mono">({selectedInst?.permanentId})</code></span>
              </div>
              <div className="fc-detail-row">
                <span className="fc-detail-label">Assigned Bureau</span>
                <span className="fc-detail-value">AICTE Public Grievance Redressal Cell (PGRC)</span>
              </div>
              <div className="fc-detail-row">
                <span className="fc-detail-label">Evidence Filed</span>
                <span className="fc-detail-value">{evidences.length} document(s) with SHA-256 tamper-proof digest</span>
              </div>
              <div className="fc-detail-row">
                <span className="fc-detail-label">SLA Deadline</span>
                <span className="fc-detail-value">First response within 72 working hours</span>
              </div>
              <div className="fc-detail-row fc-detail-otp">
                <span className="fc-detail-label">Citizen Protection</span>
                <span className="fc-detail-value">
                  Institution cannot close this case without a 6-digit OTP delivered to <strong>{mobile}</strong>.
                </span>
              </div>
            </div>

            <div className="fc-confirm-actions">
              <button type="button" className="fc-btn-primary" onClick={() => setActiveTab('track')}>
                <span>Track Live Stages</span>
                <Icon e="?" size={16} />
              </button>
              <button type="button" className="fc-btn-outline" onClick={() => setActiveTab('dashboard')}>
                My Grievances
              </button>
            </div>
          </div>
        </div>
        <style>{FC_STYLES}</style>
      </div>
    );
  }

  return (
    <div className="fc-root" id="main-content">
      <div className="container fc-container">

        {/* ── STEPPER ── */}
        <div className="fc-stepper" aria-label="Filing progress">
          <div className="fc-stepper-track">
            <div className="fc-stepper-fill" style={{ width: `${progress}%` }} />
          </div>
          <div className="fc-stepper-nodes">
            {STEP_LABELS.map((label, i) => {
              const num = i + 1;
              const isDone = num < step;
              const isCurrent = num === step;
              return (
                <div key={num} className={`fc-step-node ${isCurrent ? 'fc-step-current' : isDone ? 'fc-step-done' : ''}`}>
                  <div className="fc-step-circle" aria-current={isCurrent ? 'step' : undefined}>
                    {isDone ? <Icon e="?" size={14} /> : num}
                  </div>
                  <span className="fc-step-label">{label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 1: Who Are You ── */}
        {step === 1 && (
          <div className="fc-card">
            <div className="fc-panel-head">
              <span className="fc-step-eyebrow">Step 1 of 5</span>
              <h3 className="fc-panel-title">Who is Filing this Grievance?</h3>
              <p className="fc-panel-sub">Specify your affiliation. You may also file confidentially with identity masking.</p>
            </div>

            <div className="fc-role-grid">
              {(['Student', 'Faculty', 'Parent', 'Anonymous'] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  className={`fc-role-box ${role === r ? 'fc-role-selected' : ''}`}
                  onClick={() => { setRole(r); setIsAnon(r === 'Anonymous'); }}
                >
                  <span className="fc-role-emoji">
                    {r === 'Student' ? <GraduationCap size={26} weight="duotone" /> :
                     r === 'Faculty' ? <ChalkboardTeacher size={26} weight="duotone" /> :
                     r === 'Parent'  ? <UsersThree size={26} weight="duotone" /> :
                                       <Detective size={26} weight="duotone" />}
                  </span>
                  <strong className="fc-role-name">{r}</strong>
                  {r === 'Anonymous' && <span className="fc-anon-tag">Identity Masked</span>}
                </button>
              ))}
            </div>

            <div className="fc-form-grid">
              <div className="fc-field">
                <label className="fc-label" htmlFor="fc-name">Full Name {isAnon && <span className="fc-field-note">(masked from institution)</span>}</label>
                <input id="fc-name" type="text" className="fc-input" value={name} onChange={e => setName(e.target.value)} disabled={isAnon} />
              </div>
              <div className="fc-field">
                <label className="fc-label" htmlFor="fc-roll">Enrolment / Roll / Employee ID</label>
                <input id="fc-roll" type="text" className="fc-input fc-mono" value={rollNo} onChange={e => setRollNo(e.target.value)} disabled={isAnon} />
              </div>
              <div className="fc-field">
                <label className="fc-label" htmlFor="fc-mobile">Mobile (required for OTP closure)</label>
                <input id="fc-mobile" type="text" className="fc-input" value={mobile} onChange={e => setMobile(e.target.value)} />
                <small className="fc-helper">Used only to send the 6-digit closure OTP.</small>
              </div>
              <div className="fc-field">
                <label className="fc-label" htmlFor="fc-email">Email Address</label>
                <input id="fc-email" type="email" className="fc-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>
            </div>

            <label className="fc-checkbox-row">
              <input type="checkbox" checked={isAnon} onChange={e => { setIsAnon(e.target.checked); setRole(e.target.checked ? 'Anonymous' : 'Student'); }} />
              <span><strong>Whistleblower / Identity Protection</strong> — hide my name from the institution during inquiry</span>
            </label>

            <div className="fc-footer-nav">
              <button type="button" className="fc-btn-ghost" onClick={() => setActiveTab('home')}>
                <Icon e="?" size={15} /> Cancel
              </button>
              <button type="button" className="fc-btn-primary" onClick={() => setStep(2)}>
                Proceed to Category <Icon e="?" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Category ── */}
        {step === 2 && (
          <div className="fc-card">
            <div className="fc-panel-head">
              <span className="fc-step-eyebrow">Step 2 of 5</span>
              <h3 className="fc-panel-title">Select Grievance Category</h3>
              <p className="fc-panel-sub">Categories are mapped directly to AICTE statutory cells for correct bureau routing.</p>
            </div>

            <div className="fc-category-list">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  className={`fc-cat-row ${category === cat.key ? 'fc-cat-active' : ''} ${cat.urgent ? 'fc-cat-urgent' : ''}`}
                  onClick={() => { setCategory(cat.key); setCategoryLabel(cat.label); }}
                >
                  <span className="fc-cat-emoji">{cat.icon}</span>
                  <div className="fc-cat-text">
                    <strong className="fc-cat-name">{cat.label}</strong>
                    <span className="fc-cat-desc">{cat.desc}</span>
                  </div>
                  <span className={`fc-radio ${category === cat.key ? 'fc-radio-checked' : ''}`} aria-hidden="true" />
                </button>
              ))}
            </div>

            <div className="fc-footer-nav">
              <button type="button" className="fc-btn-ghost" onClick={() => setStep(1)}>
                <Icon e="?" size={15} /> Back
              </button>
              <button type="button" className="fc-btn-primary" onClick={() => setStep(3)}>
                Select Institution <Icon e="?" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Institution ── */}
        {step === 3 && (
          <div className="fc-card">
            <div className="fc-panel-head">
              <span className="fc-step-eyebrow">Step 3 of 5</span>
              <h3 className="fc-panel-title">Select AICTE Approved Institution</h3>
              <p className="fc-panel-sub">Find your college via name, city, or AICTE Permanent ID.</p>
            </div>

            <div className="fc-field fc-inst-search-wrap">
              <label className="fc-label" htmlFor="fc-inst-search">Search Institution</label>
              <div className="fc-inst-search-bar">
                <Icon e="??" size={16} className="fc-inst-search-icon" />
                <input
                  id="fc-inst-search"
                  type="text"
                  className="fc-input fc-inst-search-input"
                  placeholder="Search by name, city, or AICTE ID…"
                  value={instSearch}
                  onChange={e => setInstSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="fc-inst-list">
              {filteredInsts.map(inst => {
                const isSelected = selectedInst?.id === inst.id;
                return (
                  <button
                    key={inst.id}
                    type="button"
                    className={`fc-inst-row ${isSelected ? 'fc-inst-selected' : ''}`}
                    onClick={() => { setSelectedInst(inst); setInstSearch(inst.name); }}
                    aria-pressed={isSelected}
                  >
                    <div className="fc-inst-row-left">
                      <strong className="fc-inst-name">{inst.name}</strong>
                      <span className="fc-inst-meta">
                        <code className="fc-mono">{inst.permanentId}</code> · {inst.city}, {inst.state}
                      </span>
                    </div>
                    <div className="fc-inst-row-right">
                      <span className="fc-compliance-chip">{inst.complianceRating}</span>
                      <span className={`fc-radio ${isSelected ? 'fc-radio-checked' : ''}`} aria-hidden="true" />
                    </div>
                  </button>
                );
              })}
            </div>

            {selectedInst && (
              <div className="fc-selected-inst-banner">
                <Icon e="???" size={20} />
                <div>
                  <strong>{selectedInst.name}</strong>
                  <span className="fc-selected-inst-sub">AICTE ID: {selectedInst.permanentId} · Nodal Grievance Office Attached</span>
                </div>
              </div>
            )}

            <div className="fc-footer-nav">
              <button type="button" className="fc-btn-ghost" onClick={() => setStep(2)}>
                <Icon e="?" size={15} /> Back
              </button>
              <button type="button" className="fc-btn-primary" onClick={() => setStep(4)} disabled={!selectedInst}>
                Provide Narrative &amp; Proof <Icon e="?" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 4: Proof Vault ── */}
        {step === 4 && (
          <div className="fc-card">
            <div className="fc-panel-head">
              <span className="fc-step-eyebrow">Step 4 of 5</span>
              <h3 className="fc-panel-title">Grievance Narrative &amp; Evidence Vault</h3>
              <p className="fc-panel-sub">Provide clear facts and upload supporting proof. Every file receives a SHA-256 cryptographic digest.</p>
            </div>

            <div className="fc-field">
              <label className="fc-label" htmlFor="fc-title">Grievance Subject / Title</label>
              <input
                id="fc-title"
                type="text"
                className="fc-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Non-refund of Caution Deposit following Seat Surrender"
              />
            </div>

            <div className="fc-field">
              <label className="fc-label" htmlFor="fc-details">Detailed Narrative</label>
              <textarea
                id="fc-details"
                className="fc-input fc-textarea"
                rows={4}
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Include relevant dates, communications, fees paid, and exact rules violated…"
              />
              <small className="fc-helper">Please stick to verifiable facts. Avoid unsubstantiated claims.</small>
            </div>

            {/* Upload zone */}
            <div className="fc-vault-section">
              <div className="fc-vault-header">
                <div className="fc-vault-title-row">
                  <Icon e="??" size={16} />
                  <span className="fc-vault-label">Evidence Vault</span>
                </div>
                <span className="fc-vault-limit">Max 10 MB · PDF, PNG, JPG, MP3</span>
              </div>

              <div
                className={`fc-drop-zone ${isDragging ? 'fc-drop-active' : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={e => { e.preventDefault(); setIsDragging(false); }}
                role="region"
                aria-label="File upload drop zone"
              >
                <Icon e="??" size={32} className="fc-drop-icon" />
                <strong className="fc-drop-title">Drag &amp; Drop proof documents here</strong>
                <p className="fc-drop-sub">fee challans, receipts, correspondence letters</p>
                <label className="fc-browse-btn">
                  Browse Files
                  <input type="file" hidden onChange={handleFileUpload} accept=".pdf,.png,.jpg,.jpeg,.mp3" />
                </label>
              </div>

              {evidences.length > 0 && (
                <div className="fc-evidence-list">
                  <span className="fc-evidence-count">{evidences.length} file{evidences.length !== 1 ? 's' : ''} attached</span>
                  {evidences.map(ev => (
                    <div key={ev.id} className="fc-evidence-row">
                      <div className="fc-evidence-left">
                        <Icon e="??" size={18} className="fc-ev-icon" />
                        <div>
                          <strong className="fc-ev-name">{ev.name}</strong>
                          <div className="fc-ev-meta">
                            <span>{(ev.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span className="fc-ev-sep">·</span>
                            <code className="fc-mono fc-ev-hash" title={ev.sha256Hash}>
                              SHA-256: {ev.sha256Hash.slice(0, 20)}…
                            </code>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="fc-remove-btn"
                        onClick={() => setEvidences(prev => prev.filter(e => e.id !== ev.id))}
                        aria-label={`Remove ${ev.name}`}
                      >
                        <Icon e="???" size={15} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="fc-footer-nav">
              <button type="button" className="fc-btn-ghost" onClick={() => setStep(3)}>
                <Icon e="?" size={15} /> Back
              </button>
              <button type="button" className="fc-btn-primary" onClick={() => setStep(5)}>
                Review &amp; Submit <Icon e="?" size={15} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 5: Review ── */}
        {step === 5 && (
          <div className="fc-card">
            <div className="fc-panel-head">
              <span className="fc-step-eyebrow">Step 5 of 5</span>
              <h3 className="fc-panel-title">Review &amp; Submit</h3>
              <p className="fc-panel-sub">Verify your submission details before final lodgement.</p>
            </div>

            {/* Related case linker */}
            <div className="fc-related-box">
              <div className="fc-related-left">
                <Icon e="??" size={20} />
                <div>
                  <strong className="fc-related-title">2 Similar Cases Detected Against This Institution</strong>
                  <p className="fc-related-desc">
                    Our semantic matching engine found unresolved grievances regarding <strong>Fee Refund / Caution Money</strong> against {selectedInst?.name}. Linking increases priority and collective scrutiny.
                  </p>
                  <label className="fc-checkbox-row fc-link-checkbox">
                    <input type="checkbox" checked={linkRelated} onChange={e => setLinkRelated(e.target.checked)} />
                    <span>Link my complaint to the Institutional Joint Hearing Queue</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="fc-summary-card">
              <h4 className="fc-summary-heading">Submission Summary</h4>
              <div className="fc-summary-grid">
                <div className="fc-summary-field">
                  <span className="fc-sum-label">Complainant</span>
                  <span className="fc-sum-value">{isAnon ? 'Anonymous / Masked' : name} <em>({role})</em></span>
                </div>
                <div className="fc-summary-field">
                  <span className="fc-sum-label">Contact</span>
                  <code className="fc-mono fc-sum-value">{mobile}</code>
                </div>
                <div className="fc-summary-field">
                  <span className="fc-sum-label">Category</span>
                  <span className="fc-sum-value fc-cat-chip">{categoryLabel}</span>
                </div>
                <div className="fc-summary-field">
                  <span className="fc-sum-label">Institution</span>
                  <span className="fc-sum-value">{selectedInst?.name} <code className="fc-mono">({selectedInst?.permanentId})</code></span>
                </div>
              </div>
              <div className="fc-summary-narrative">
                <span className="fc-sum-label">Subject</span>
                <p className="fc-sum-title">{title}</p>
                <span className="fc-sum-label">Narrative</span>
                <p className="fc-sum-body">{details}</p>
              </div>
              <div className="fc-summary-footer-row">
                <span className="fc-summary-proof-count">
                  <Icon e="??" size={15} />
                  {evidences.length} proof file(s) with SHA-256 digest
                </span>
                <span className="fc-summary-sla">72-Hour Response SLA Guaranteed</span>
              </div>
            </div>

            <div className="fc-footer-nav">
              <button type="button" className="fc-btn-ghost" onClick={() => setStep(4)}>
                <Icon e="?" size={15} /> Back
              </button>
              <button type="button" className="fc-btn-submit" onClick={handleSubmit}>
                <Icon e="?" size={17} />
                Submit Grievance
              </button>
            </div>
          </div>
        )}
      </div>
      <style>{FC_STYLES}</style>
    </div>
  );
};

const FC_STYLES = `
  /* ── ROOT ── */
  .fc-root {
    background: var(--color-neutral-100);
    padding: 32px 0 72px;
    min-height: calc(100vh - 160px);
  }
  .fc-container { max-width: 760px; }

  /* ── STEPPER ── */
  .fc-stepper {
    margin-bottom: 28px;
    position: relative;
  }
  .fc-stepper-track {
    position: absolute;
    top: 18px;
    left: 40px;
    right: 40px;
    height: 3px;
    background: var(--color-neutral-300);
    z-index: 0;
    border-radius: 2px;
  }
  .fc-stepper-fill {
    height: 100%;
    background: var(--color-action-600);
    border-radius: 2px;
    transition: width 0.3s ease;
  }
  .fc-stepper-nodes {
    display: flex;
    justify-content: space-between;
    position: relative;
    z-index: 1;
  }
  .fc-step-node {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    flex: 1;
  }
  .fc-step-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    background: #fff;
    border: 2px solid var(--color-neutral-300);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.875rem;
    font-weight: 700;
    color: var(--color-neutral-600);
    transition: all 0.2s ease;
  }
  .fc-step-done .fc-step-circle {
    background: var(--color-brand-blue-600);
    border-color: var(--color-brand-blue-600);
    color: #fff;
  }
  .fc-step-current .fc-step-circle {
    background: var(--color-action-600);
    border-color: var(--color-action-600);
    color: #fff;
    box-shadow: 0 0 0 4px rgba(194,87,12,0.2);
  }
  .fc-step-label {
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--color-neutral-500);
    text-align: center;
    line-height: 1.2;
  }
  .fc-step-current .fc-step-label { color: var(--color-action-600); font-weight: 700; }
  .fc-step-done .fc-step-label { color: var(--color-brand-blue-600); }

  /* ── CARD ── */
  .fc-card {
    background: #fff;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-lg);
    padding: 32px;
    box-shadow: var(--shadow-sm);
  }
  .fc-panel-head { margin-bottom: 24px; }
  .fc-step-eyebrow {
    display: inline-block;
    font-size: 0.72rem;
    font-weight: 800;
    color: var(--color-action-600);
    background: #FFF7ED;
    border: 1px solid #FFEDD5;
    padding: 2px 10px;
    border-radius: var(--radius-pill);
    margin-bottom: 8px;
    letter-spacing: 0.3px;
  }
  .fc-panel-title {
    font-size: 1.25rem;
    font-weight: 800;
    color: var(--color-navy-900);
    margin: 0 0 6px;
  }
  .fc-panel-sub {
    font-size: 0.875rem;
    color: var(--color-neutral-600);
    margin: 0;
    line-height: 1.5;
  }

  /* ── ROLE SELECTOR ── */
  .fc-role-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 12px;
    margin-bottom: 24px;
  }
  .fc-role-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
    padding: 18px 10px;
    background: var(--color-neutral-100);
    border: 2px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-family: var(--font-sans);
    transition: all 0.15s ease;
    min-height: 44px;
  }
  .fc-role-box:hover { border-color: var(--color-action-600); }
  .fc-role-selected {
    border-color: var(--color-action-600) !important;
    background: #FFF7ED !important;
  }
  .fc-role-emoji { display: flex; align-items: center; justify-content: center; color: var(--color-action-600); }
  .fc-role-name { font-size: 0.875rem; font-weight: 700; color: var(--color-navy-900); }
  .fc-anon-tag {
    font-size: 0.65rem;
    background: var(--color-danger-bg);
    color: var(--color-danger-text);
    padding: 1px 6px;
    border-radius: var(--radius-pill);
    font-weight: 700;
  }

  /* ── FORM FIELDS ── */
  .fc-form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
    margin-bottom: 20px;
  }
  .fc-field { display: flex; flex-direction: column; gap: 5px; }
  .fc-field-note { font-size: 0.72rem; color: var(--color-neutral-500); font-weight: 400; }
  .fc-label {
    font-size: 0.8125rem;
    font-weight: 700;
    color: var(--color-neutral-700);
  }
  .fc-input {
    width: 100%;
    border: 1px solid var(--color-neutral-300);
    border-radius: var(--radius-md);
    padding: 9px 12px;
    font-size: 0.875rem;
    font-family: var(--font-sans);
    color: var(--color-neutral-900);
    background: #fff;
    outline: none;
    transition: border-color 0.15s ease;
    box-sizing: border-box;
  }
  .fc-input:focus { border-color: var(--color-brand-blue-600); box-shadow: 0 0 0 3px rgba(31,95,191,0.1); }
  .fc-input:disabled { background: var(--color-neutral-100); color: var(--color-neutral-400); cursor: not-allowed; }
  .fc-mono { font-family: var(--font-mono); }
  .fc-textarea { resize: vertical; min-height: 100px; line-height: 1.5; }
  .fc-helper { font-size: 0.75rem; color: var(--color-neutral-500); }

  .fc-checkbox-row {
    display: flex;
    align-items: flex-start;
    gap: 9px;
    font-size: 0.8125rem;
    color: var(--color-neutral-700);
    cursor: pointer;
    line-height: 1.45;
    margin-bottom: 20px;
  }
  .fc-checkbox-row input[type=checkbox] { flex-shrink: 0; margin-top: 2px; accent-color: var(--color-action-600); }

  /* ── CATEGORY LIST ── */
  .fc-category-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
  }
  .fc-cat-row {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    padding: 14px 16px;
    background: #fff;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    cursor: pointer;
    text-align: left;
    font-family: var(--font-sans);
    transition: border-color 0.15s ease, background-color 0.15s ease;
  }
  .fc-cat-row:hover { border-color: var(--color-brand-blue-600); background: #FAFCFF; }
  .fc-cat-active { border-color: var(--color-action-600) !important; background: #FFF7ED !important; }
  .fc-cat-urgent { border-color: #FCA5A5; background: #FFF5F5; }
  .fc-cat-urgent:hover { border-color: #DC2626; }
  .fc-cat-emoji { display: flex; align-items: center; justify-content: center; flex-shrink: 0; color: var(--color-action-600); }
  .fc-cat-text { flex: 1; min-width: 0; }
  .fc-cat-name { display: block; font-size: 0.925rem; font-weight: 700; color: var(--color-navy-900); margin-bottom: 2px; }
  .fc-cat-desc { font-size: 0.78rem; color: var(--color-neutral-600); }

  /* ── RADIO ── */
  .fc-radio {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    border: 2px solid var(--color-neutral-300);
    flex-shrink: 0;
    position: relative;
    display: inline-block;
    transition: border-color 0.15s ease;
  }
  .fc-radio-checked {
    border-color: var(--color-action-600);
  }
  .fc-radio-checked::after {
    content: '';
    position: absolute;
    top: 3px; left: 3px;
    width: 8px; height: 8px;
    border-radius: 50%;
    background: var(--color-action-600);
  }

  /* ── INSTITUTION LIST ── */
  .fc-inst-search-wrap { margin-bottom: 14px; }
  .fc-inst-search-bar {
    position: relative;
    display: flex;
    align-items: center;
  }
  .fc-inst-search-icon { position: absolute; left: 12px; color: var(--color-neutral-400); pointer-events: none; }
  .fc-inst-search-input { padding-left: 36px; }

  .fc-inst-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
    max-height: 280px;
    overflow-y: auto;
    margin-bottom: 16px;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    padding: 6px;
    background: var(--color-neutral-100);
  }
  .fc-inst-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 11px 14px;
    background: #fff;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    cursor: pointer;
    text-align: left;
    font-family: var(--font-sans);
    transition: border-color 0.15s ease;
    width: 100%;
  }
  .fc-inst-row:hover { border-color: var(--color-brand-blue-600); }
  .fc-inst-selected { border-color: var(--color-action-600) !important; background: #FFF7ED !important; }
  .fc-inst-row-left { flex: 1; min-width: 0; }
  .fc-inst-name { display: block; font-size: 0.875rem; font-weight: 700; color: var(--color-navy-900); }
  .fc-inst-meta { font-size: 0.75rem; color: var(--color-neutral-600); display: block; margin-top: 2px; }
  .fc-inst-row-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; }
  .fc-compliance-chip {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 2px 7px;
    border-radius: var(--radius-pill);
    background: var(--color-success-bg);
    color: var(--color-success-text);
  }
  .fc-selected-inst-banner {
    display: flex;
    align-items: center;
    gap: 12px;
    background: var(--color-brand-blue-100);
    border: 1px solid #BFDBFE;
    border-radius: var(--radius-sm);
    padding: 12px 16px;
    font-size: 0.875rem;
    color: var(--color-brand-blue-600);
    margin-bottom: 24px;
  }
  .fc-selected-inst-banner strong { display: block; color: var(--color-navy-900); }
  .fc-selected-inst-sub { font-size: 0.78rem; color: var(--color-neutral-600); margin-top: 2px; display: block; }

  /* ── VAULT ── */
  .fc-vault-section {
    background: var(--color-neutral-100);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    padding: 18px;
    margin-top: 4px;
  }
  .fc-vault-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }
  .fc-vault-title-row {
    display: flex;
    align-items: center;
    gap: 7px;
    color: var(--color-neutral-700);
  }
  .fc-vault-title-row svg { color: var(--color-action-600); }
  .fc-vault-label { font-size: 0.875rem; font-weight: 700; }
  .fc-vault-limit { font-size: 0.72rem; color: var(--color-neutral-500); background: var(--color-neutral-200); padding: 2px 8px; border-radius: var(--radius-pill); }
  .fc-drop-zone {
    border: 2px dashed var(--color-neutral-300);
    border-radius: var(--radius-md);
    padding: 28px 16px;
    text-align: center;
    background: #fff;
    transition: all 0.15s ease;
    cursor: default;
  }
  .fc-drop-active { border-color: var(--color-brand-blue-600); background: var(--color-brand-blue-100); }
  .fc-drop-icon { color: var(--color-brand-blue-600); margin-bottom: 8px; }
  .fc-drop-title { display: block; font-size: 0.9rem; font-weight: 700; color: var(--color-navy-900); margin-bottom: 4px; }
  .fc-drop-sub { font-size: 0.8rem; color: var(--color-neutral-600); margin-bottom: 12px; }
  .fc-browse-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--color-brand-blue-600);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    padding: 8px 18px;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    font-family: var(--font-sans);
    transition: background-color 0.15s ease;
  }
  .fc-browse-btn:hover { background: #1A4FA8; }
  .fc-evidence-list { margin-top: 14px; display: flex; flex-direction: column; gap: 8px; }
  .fc-evidence-count { font-size: 0.78rem; font-weight: 700; color: var(--color-neutral-600); display: block; margin-bottom: 4px; }
  .fc-evidence-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background: #fff;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    padding: 9px 12px;
    gap: 10px;
  }
  .fc-evidence-left { display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 0; }
  .fc-ev-icon { color: #16A34A; flex-shrink: 0; margin-top: 2px; }
  .fc-ev-name { display: block; font-size: 0.82rem; font-weight: 700; color: var(--color-navy-900); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .fc-ev-meta { display: flex; align-items: center; gap: 4px; font-size: 0.72rem; color: var(--color-neutral-600); flex-wrap: wrap; }
  .fc-ev-sep { color: var(--color-neutral-300); }
  .fc-ev-hash { font-size: 0.7rem; color: var(--color-neutral-500); }
  .fc-remove-btn {
    background: none;
    border: none;
    color: var(--color-danger-text);
    cursor: pointer;
    padding: 4px;
    border-radius: var(--radius-sm);
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transition: background-color 0.15s ease;
  }
  .fc-remove-btn:hover { background: var(--color-danger-bg); }

  /* ── RELATED BOX ── */
  .fc-related-box {
    background: #FAF5FF;
    border: 1px solid #C084FC;
    border-radius: var(--radius-md);
    padding: 16px 18px;
    margin-bottom: 18px;
    display: flex;
    align-items: flex-start;
    gap: 14px;
  }
  .fc-related-box > svg { color: #9333EA; flex-shrink: 0; margin-top: 2px; }
  .fc-related-left { flex: 1; }
  .fc-related-title { display: block; font-size: 0.9rem; font-weight: 700; color: #6B21A8; margin-bottom: 5px; }
  .fc-related-desc { font-size: 0.8125rem; color: #581C87; line-height: 1.45; margin: 0 0 10px; }
  .fc-link-checkbox { margin: 0; }

  /* ── SUMMARY ── */
  .fc-summary-card {
    background: var(--color-neutral-100);
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-md);
    padding: 20px;
    margin-bottom: 24px;
  }
  .fc-summary-heading {
    font-size: 1rem;
    font-weight: 700;
    color: var(--color-navy-900);
    margin: 0 0 16px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--color-neutral-200);
  }
  .fc-summary-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
  .fc-summary-field { display: flex; flex-direction: column; gap: 3px; }
  .fc-sum-label {
    font-size: 0.7rem;
    font-weight: 800;
    color: var(--color-neutral-500);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  .fc-sum-value { font-size: 0.85rem; color: var(--color-neutral-900); }
  .fc-cat-chip {
    display: inline-block;
    background: var(--color-brand-blue-100);
    color: var(--color-brand-blue-600);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 2px 8px;
    border-radius: var(--radius-pill);
  }
  .fc-summary-narrative { margin-bottom: 14px; display: flex; flex-direction: column; gap: 4px; }
  .fc-sum-title { font-size: 0.9rem; font-weight: 700; color: var(--color-navy-900); margin: 0; }
  .fc-sum-body {
    font-size: 0.8125rem;
    color: var(--color-neutral-700);
    background: #fff;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-sm);
    padding: 8px 12px;
    margin: 0;
    line-height: 1.5;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .fc-summary-footer-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    font-size: 0.8rem;
    flex-wrap: wrap;
    gap: 8px;
    border-top: 1px solid var(--color-neutral-200);
    padding-top: 12px;
  }
  .fc-summary-proof-count {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--color-success-text);
    font-weight: 700;
  }
  .fc-summary-proof-count svg { color: #16A34A; }
  .fc-summary-sla { color: var(--color-brand-blue-600); font-weight: 600; }

  /* ── FOOTER NAV ── */
  .fc-footer-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-top: 20px;
    border-top: 1px solid var(--color-neutral-200);
    margin-top: 24px;
    gap: 10px;
  }
  .fc-btn-ghost {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: none;
    border: 1px solid var(--color-neutral-300);
    color: var(--color-neutral-700);
    border-radius: var(--radius-md);
    padding: 9px 16px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    min-height: 40px;
    font-family: var(--font-sans);
    transition: border-color 0.15s ease;
  }
  .fc-btn-ghost:hover { border-color: var(--color-navy-900); color: var(--color-navy-900); }
  .fc-btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--color-action-600);
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    padding: 9px 20px;
    font-size: 0.9rem;
    font-weight: 700;
    cursor: pointer;
    min-height: 40px;
    font-family: var(--font-sans);
    transition: background-color 0.15s ease;
  }
  .fc-btn-primary:hover { background: var(--color-action-700); }
  .fc-btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .fc-btn-submit {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: #166534;
    color: #fff;
    border: none;
    border-radius: var(--radius-md);
    padding: 10px 24px;
    font-size: 0.95rem;
    font-weight: 700;
    cursor: pointer;
    min-height: 44px;
    font-family: var(--font-sans);
    transition: background-color 0.15s ease;
  }
  .fc-btn-submit:hover { background: #14532D; }

  /* ── CONFIRMATION SCREEN ── */
  .fc-confirm-card {
    background: #fff;
    border: 1px solid var(--color-neutral-200);
    border-radius: var(--radius-lg);
    padding: 48px 36px;
    text-align: center;
    box-shadow: var(--shadow-soft);
    max-width: 640px;
    margin: 0 auto;
  }
  .fc-confirm-icon { color: #16A34A; margin-bottom: 14px; }
  .fc-confirm-badge {
    display: inline-block;
    background: var(--color-success-bg);
    color: var(--color-success-text);
    border: 1px solid var(--color-success-border);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 3px 12px;
    border-radius: var(--radius-pill);
    margin-bottom: 12px;
  }
  .fc-confirm-heading {
    font-size: 1.6rem;
    font-weight: 900;
    color: var(--color-navy-900);
    margin: 0 0 10px;
  }
  .fc-confirm-lead {
    font-size: 0.95rem;
    color: var(--color-neutral-600);
    line-height: 1.55;
    margin: 0 auto 24px;
    max-width: 500px;
  }
  .fc-case-id-box {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    background: #EFF6FF;
    border: 2px dashed var(--color-brand-blue-600);
    border-radius: var(--radius-md);
    padding: 16px 20px;
    margin-bottom: 22px;
    text-align: left;
  }
  .fc-case-id-label { display: block; font-size: 0.75rem; color: var(--color-brand-blue-600); font-weight: 700; margin-bottom: 4px; }
  .fc-case-id-value { font-size: 1.3rem; font-weight: 900; color: var(--color-navy-900); font-family: var(--font-mono); }
  .fc-copy-btn {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: #fff;
    border: 1px solid var(--color-brand-blue-600);
    color: var(--color-brand-blue-600);
    border-radius: var(--radius-sm);
    padding: 6px 12px;
    font-size: 0.8rem;
    font-weight: 700;
    cursor: pointer;
    white-space: nowrap;
    font-family: var(--font-sans);
    flex-shrink: 0;
    transition: all 0.15s ease;
  }
  .fc-copy-btn:hover { background: var(--color-brand-blue-600); color: #fff; }
  .fc-confirm-details {
    background: var(--color-neutral-100);
    border-radius: var(--radius-md);
    padding: 16px 18px;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-bottom: 24px;
  }
  .fc-detail-row { display: flex; align-items: flex-start; gap: 10px; font-size: 0.8125rem; }
  .fc-detail-label { font-size: 0.72rem; font-weight: 800; color: var(--color-neutral-500); text-transform: uppercase; letter-spacing: 0.3px; width: 110px; flex-shrink: 0; margin-top: 2px; }
  .fc-detail-value { color: var(--color-neutral-800); line-height: 1.4; }
  .fc-detail-otp { background: #FEF3C7; border-left: 3px solid #F59E0B; padding: 8px 10px; border-radius: 2px; }
  .fc-detail-otp .fc-detail-label { color: #92400E; }
  .fc-detail-otp .fc-detail-value { color: #78350F; }
  .fc-confirm-actions { display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap; }
  .fc-btn-outline {
    display: inline-flex;
    align-items: center;
    gap: 6px;
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
  .fc-btn-outline:hover { border-color: var(--color-navy-900); }

  /* ── RESPONSIVE ── */
  @media (max-width: 640px) {
    .fc-role-grid { grid-template-columns: repeat(2,1fr); }
    .fc-form-grid  { grid-template-columns: 1fr; }
    .fc-summary-grid { grid-template-columns: 1fr; }
    .fc-card { padding: 24px 18px; }
    .fc-step-label { display: none; }
  }
`;

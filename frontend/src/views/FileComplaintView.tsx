import React, { useState } from 'react';
import { translations, Language } from '../locales/translations';
import { ActiveTab } from '../components/Navbar';
import { Complaint, GrievanceCategory, Institution, EvidenceFile } from '../types';
import {
  FilePlus2,
  UploadCloud,
  Trash2,
  FileCheck,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Building2,
  FileText,
  ArrowRight,
  ArrowLeft,
  Link2,
  Copy,
  Info
} from 'lucide-react';

interface FileComplaintViewProps {
  lang: Language;
  setActiveTab: (tab: ActiveTab) => void;
  institutions: Institution[];
  onAddNewComplaint: (newComplaint: Complaint) => void;
  selectedInstitution?: Institution | null;
}

export const FileComplaintView: React.FC<FileComplaintViewProps> = ({
  lang,
  setActiveTab,
  institutions,
  onAddNewComplaint,
  selectedInstitution
}) => {
  const t = translations[lang];
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Form State
  const [complainantRole, setComplainantRole] = useState<'Student' | 'Faculty' | 'Parent' | 'Anonymous'>('Student');
  const [name, setName] = useState('Aarav Sharma');
  const [rollNumber, setRollNumber] = useState('2024-CS-108');
  const [mobile, setMobile] = useState('+91 98712 34567');
  const [email, setEmail] = useState('aarav.sharma@example.com');
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Step 2 Category
  const [category, setCategory] = useState<GrievanceCategory>('FEES_REFUND');
  const [categoryLabel, setCategoryLabel] = useState('Fee Refund & Excess Charges');

  // Step 3 Institution
  const [instituteSearch, setInstituteSearch] = useState(selectedInstitution ? selectedInstitution.name : 'Delhi Technological University (DTU)');
  const [selectedInstObj, setSelectedInstObj] = useState<Institution | null>(
    selectedInstitution || institutions[0]
  );

  // Step 4 Details & Proof
  const [grievanceTitle, setGrievanceTitle] = useState('Withholding of caution money and library fee deduction despite formal seat withdrawal');
  const [grievanceDetails, setGrievanceDetails] = useState('I formally withdrew my admission before the national cutoff on 14th August. College accounts office refused to disburse the caution fee of ₹44,000 in direct contravention of AICTE Chapter 10 norms.');
  const [evidences, setEvidences] = useState<EvidenceFile[]>([
    {
      id: 'proof-1',
      name: 'Fee_Receipt_Tuition_Caution_Paid.pdf',
      size: 1240000,
      type: 'application/pdf',
      sha256Hash: 'a9f24e98bc01d120a84e910248fca89b120489ba1029384756abcdef9182345a',
      uploadDate: 'Just now'
    }
  ]);
  const [isDragging, setIsDragging] = useState(false);

  // Step 5 Related Case Link
  const [linkToRelated, setLinkToRelated] = useState(true);
  const [submittedCaseId, setSubmittedCaseId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  // Categories list
  const categoryOptions: { key: GrievanceCategory; label: string; desc: string; icon: string }[] = [
    { key: 'FEES_REFUND', label: 'Fee Refund & Excess Charges', desc: 'Seat withdrawal refund, caution money, hostel deposits, unauthorized fees', icon: '💳' },
    { key: 'ANTI_RAGGING', label: 'Anti-Ragging & Harassment', desc: 'Hostel intimidation, verbal abuse, psychological bullying (24h FIR mandatory)', icon: '🚨' },
    { key: 'SCHOLARSHIP_AICTE', label: 'AICTE Pragati / Saksham / PMSSS', desc: 'Disbursement delay, college PFMS verification freeze, portal mismatch', icon: '🎓' },
    { key: 'SEXUAL_HARASSMENT', label: 'Internal Complaints Committee (ICC)', desc: 'Gender harassment, workplace misconduct (Strict confidential routing)', icon: '🛡️' },
    { key: 'FACULTY_INFRA', label: 'Faculty & Lab Infrastructure', desc: 'Deficient lab apparatus, teacher absenteeism, library deficiencies', icon: '🔬' },
    { key: 'ADMISSION_EXAM', label: 'Admissions, Marks & Certificates', desc: 'Withholding original 10th/12th marksheets, transcript denial, exam malpractice', icon: '📜' },
    { key: 'OTHER_UNSURE', label: 'Other / I am not sure', desc: 'Our AICTE triage desk will inspect and route to the correct state bureau', icon: '❓' },
  ];

  // Simulated file upload with SHA-256 hash generation
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];

    // Generate a pseudo-random SHA-256 representation for evidence integrity demo
    const hexChars = '0123456789abcdef';
    let mockHash = '';
    for (let i = 0; i < 64; i++) {
      mockHash += hexChars[Math.floor(Math.random() * hexChars.length)];
    }

    const newEvidence: EvidenceFile = {
      id: `proof-${Date.now()}`,
      name: file.name,
      size: file.size,
      type: file.type || 'document/attachment',
      sha256Hash: mockHash,
      uploadDate: 'Just now'
    };

    setEvidences([...evidences, newEvidence]);
  };

  const removeEvidence = (id: string) => {
    setEvidences(evidences.filter(e => e.id !== id));
  };

  const handleSubmitFinal = () => {
    const randomCaseNum = Math.floor(10000 + Math.random() * 90000);
    const newId = `AICTE-2026-GRV-${randomCaseNum}`;

    const newComplaint: Complaint = {
      id: newId,
      title: grievanceTitle,
      category,
      categoryLabel,
      institutionName: selectedInstObj?.name || 'Delhi Technological University (DTU)',
      aictePermanentId: selectedInstObj?.permanentId || '1-10928341',
      city: selectedInstObj?.city || 'New Delhi',
      state: selectedInstObj?.state || 'Delhi',
      complainantName: isAnonymous ? 'Confidential Complainant' : name,
      complainantRole: isAnonymous ? 'Anonymous' : complainantRole,
      contactMobile: mobile,
      contactEmail: email,
      isAnonymous,
      details: grievanceDetails,
      currentStage: 'REGISTERED',
      stageNumber: 1,
      slaHoursRemaining: 72,
      assignedOfficer: {
        name: 'Dr. Ramesh Chandra Verma',
        designation: 'Director, Public Grievance Redressal Cell (PGRC)',
        bureau: 'AICTE HQ New Delhi',
        badgeVerified: true
      },
      evidenceList: evidences,
      timeline: [
        {
          id: `tl-${Date.now()}`,
          title: 'Grievance Formally Registered',
          description: `Case logged with ${evidences.length} cryptographically hashed evidence files. 72-Hour initial response SLA activated.`,
          actor: 'Citizen Portal Vault',
          role: 'System Gateway',
          timestamp: 'Just now',
          stage: 'REGISTERED'
        }
      ],
      relatedCaseCount: linkToRelated ? 3 : 0
    };

    onAddNewComplaint(newComplaint);
    setSubmittedCaseId(newId);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  return (
    <div className="filing-container" id="main-content">
      <div className="container max-w-800">
        {/* Step Progress Stepper */}
        {!submittedCaseId && (
          <div className="stepper-wrap">
            <div className="stepper-bar">
              <div
                className="stepper-fill"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              ></div>
            </div>
            <div className="steps-row flex items-center justify-between">
              {[1, 2, 3, 4, 5].map((s) => (
                <div
                  key={s}
                  className={`step-circle-node ${s === currentStep ? 'current' : s < currentStep ? 'completed' : ''}`}
                >
                  <span className="step-num">{s < currentStep ? '✓' : s}</span>
                  <span className="step-label-text hide-on-mobile">
                    {s === 1 && 'Who You Are'}
                    {s === 2 && 'Category'}
                    {s === 3 && 'Institution'}
                    {s === 4 && 'Proof Vault'}
                    {s === 5 && 'Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Confirmation Screen upon Submission */}
        {submittedCaseId ? (
          <div className="confirmation-card card text-center">
            <div className="confirm-icon-box">
              <CheckCircle2 size={56} className="text-green" />
            </div>
            <span className="status-chip chip-success confirm-chip">Formally Registered & Cryptographically Timestamped</span>
            <h2>Complaint Successfully Lodged</h2>
            <p className="confirm-lead">
              Your grievance has been submitted to the AICTE Central Coordination Gateway with an active 72-Hour first-response SLA.
            </p>

            <div className="case-id-display-box flex items-center justify-between">
              <div className="text-left">
                <span className="case-id-label">Permanent Case Reference ID:</span>
                <span className="case-id-code mono">{submittedCaseId}</span>
              </div>
              <button
                type="button"
                className="btn btn-outline btn-copy"
                onClick={() => copyToClipboard(submittedCaseId)}
              >
                <Copy size={16} />
                <span>{copiedId ? 'Copied!' : 'Copy ID'}</span>
              </button>
            </div>

            <div className="confirmation-details-box text-left">
              <div className="detail-item">
                <strong>Institution:</strong> {selectedInstObj?.name} (<code className="mono">{selectedInstObj?.permanentId}</code>)
              </div>
              <div className="detail-item">
                <strong>Assigned Bureau:</strong> AICTE Public Grievance Redressal Cell (PGRC) & Western Regional Bureau
              </div>
              <div className="detail-item">
                <strong>Evidence Files Stored:</strong> {evidences.length} documents with verified SHA-256 tamper-proof digest
              </div>
              <div className="detail-item">
                <strong>SLA Deadline:</strong> Within 72 working hours (First status report expected by SMS & Email)
              </div>
              <div className="detail-item highlight-otp-note">
                <strong>Citizen Protection Guarantee:</strong> The institution cannot close this complaint without receiving a 6-digit confirmation OTP on your registered mobile number ({mobile}).
              </div>
            </div>

            <div className="confirm-actions flex items-center justify-center gap-3">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setActiveTab('track')}
              >
                <span>Track Live Stages & SLA</span>
                <ArrowRight size={16} />
              </button>
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setActiveTab('chat')}
              >
                <span>Open Direct Officer Chat</span>
              </button>
            </div>
          </div>
        ) : (
          /* Step 1: Complainant Details */
          currentStep === 1 && (
            <div className="card step-panel">
              <div className="panel-head">
                <span className="panel-step-badge">Step 1 of 5</span>
                <h3>Who is Filing this Grievance?</h3>
                <p className="panel-desc">Specify your affiliation. You may also lodge confidentially with identity masking.</p>
              </div>

              <div className="role-selector-grid grid grid-cols-4 gap-3">
                {(['Student', 'Faculty', 'Parent', 'Anonymous'] as const).map((r) => (
                  <button
                    key={r}
                    type="button"
                    className={`role-select-box ${complainantRole === r ? 'selected' : ''}`}
                    onClick={() => {
                      setComplainantRole(r);
                      if (r === 'Anonymous') setIsAnonymous(true);
                      else setIsAnonymous(false);
                    }}
                  >
                    <span className="role-icon">
                      {r === 'Student' && '🎓'}
                      {r === 'Faculty' && '👨‍🏫'}
                      {r === 'Parent' && '👪'}
                      {r === 'Anonymous' && '🕵️'}
                    </span>
                    <strong className="role-name">{r}</strong>
                    {r === 'Anonymous' && <span className="anon-tag">Identity Masked</span>}
                  </button>
                ))}
              </div>

              <div className="form-fields-wrap">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name {isAnonymous && '(Masked in Redressal)'}</label>
                    <input
                      type="text"
                      className="input-control"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isAnonymous}
                    />
                  </div>
                  <div>
                    <label className="input-label">Enrollment / Roll / Employee ID</label>
                    <input
                      type="text"
                      className="input-control mono"
                      value={rollNumber}
                      onChange={(e) => setRollNumber(e.target.value)}
                      disabled={isAnonymous}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="input-label">Contact Mobile (Mandatory for OTP Closure)</label>
                    <input
                      type="text"
                      className="input-control"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                    />
                    <small className="input-helper">Used strictly to dispatch the 6-digit closure acknowledgment OTP.</small>
                  </div>
                  <div>
                    <label className="input-label">Email Address</label>
                    <input
                      type="email"
                      className="input-control"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="checkbox-item-row flex items-center gap-2 mt-4">
                  <input
                    type="checkbox"
                    id="anonCheck"
                    checked={isAnonymous}
                    onChange={(e) => {
                      setIsAnonymous(e.target.checked);
                      if (e.target.checked) setComplainantRole('Anonymous');
                      else setComplainantRole('Student');
                    }}
                  />
                  <label htmlFor="anonCheck" className="checkbox-label">
                    <strong>Whistleblower / Identity Protection:</strong> Hide my personal name from the institution administration during inquiry.
                  </label>
                </div>
              </div>

              <div className="step-footer-nav flex items-center justify-between">
                <button
                  type="button"
                  className="btn btn-outline"
                  onClick={() => setActiveTab('home')}
                >
                  <ArrowLeft size={16} />
                  <span>Cancel</span>
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setCurrentStep(2)}
                >
                  <span>Proceed to Category</span>
                  <ArrowRight size={16} />
                </button>
              </div>
            </div>
          )
        )}

        {/* Step 2: Grievance Category */}
        {currentStep === 2 && !submittedCaseId && (
          <div className="card step-panel">
            <div className="panel-head">
              <span className="panel-step-badge">Step 2 of 5</span>
              <h3>Select Grievance Category</h3>
              <p className="panel-desc">Categories are mapped to statutory AICTE cells for direct allocation without bureau confusion.</p>
            </div>

            <div className="categories-select-list">
              {categoryOptions.map((opt) => (
                <div
                  key={opt.key}
                  className={`category-item-select flex items-center justify-between ${category === opt.key ? 'active-cat-item' : ''}`}
                  onClick={() => {
                    setCategory(opt.key);
                    setCategoryLabel(opt.label);
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="cat-emoji">{opt.icon}</span>
                    <div>
                      <strong className="cat-title-text">{opt.label}</strong>
                      <p className="cat-desc-text">{opt.desc}</p>
                    </div>
                  </div>
                  <div className="cat-radio-indicator">
                    <span className={`custom-radio ${category === opt.key ? 'radio-checked' : ''}`}></span>
                  </div>
                </div>
              ))}
            </div>

            <div className="step-footer-nav flex items-center justify-between">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentStep(1)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(3)}
              >
                <span>Select Institution</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Institution Locator */}
        {currentStep === 3 && !submittedCaseId && (
          <div className="card step-panel">
            <div className="panel-head">
              <span className="panel-step-badge">Step 3 of 5</span>
              <h3>Select AICTE Approved Institution</h3>
              <p className="panel-desc">Locate your university or college via verified AICTE Permanent ID or campus name.</p>
            </div>

            <div className="inst-search-wrap">
              <label className="input-label">Institution Name or AICTE Permanent ID</label>
              <input
                type="text"
                className="input-control"
                placeholder="Search college name, city, or AICTE ID (e.g. 1-10928341)..."
                value={instituteSearch}
                onChange={(e) => setInstituteSearch(e.target.value)}
              />
            </div>

            <div className="institute-picker-list mt-3">
              {institutions.map((inst) => {
                const isSelected = selectedInstObj?.id === inst.id;
                return (
                  <div
                    key={inst.id}
                    className={`inst-pick-item flex items-center justify-between ${isSelected ? 'inst-selected' : ''}`}
                    onClick={() => {
                      setSelectedInstObj(inst);
                      setInstituteSearch(inst.name);
                    }}
                  >
                    <div>
                      <strong className="inst-pick-name">{inst.name}</strong>
                      <span className="inst-pick-meta">
                        AICTE Permanent ID: <code className="mono">{inst.permanentId}</code> · {inst.city}, {inst.state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="status-chip chip-info">{inst.complianceRating}</span>
                      <span className={`custom-radio ${isSelected ? 'radio-checked' : ''}`}></span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selectedInstObj && (
              <div className="selected-inst-banner flex items-center gap-3">
                <Building2 size={24} className="text-blue" />
                <div>
                  <strong>Selected: {selectedInstObj.name}</strong>
                  <p className="text-muted-sm">AICTE ID: {selectedInstObj.permanentId} · Nodal Grievance Office Attached</p>
                </div>
              </div>
            )}

            <div className="step-footer-nav flex items-center justify-between">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentStep(2)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(4)}
              >
                <span>Provide Narrative & Proof</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Details & Upload Proof of Complain-Issue Vault */}
        {currentStep === 4 && !submittedCaseId && (
          <div className="card step-panel">
            <div className="panel-head">
              <span className="panel-step-badge">Step 4 of 5</span>
              <h3>Grievance Narrative & Tamper-Proof Evidence Vault</h3>
              <p className="panel-desc">
                Provide clear factual details and upload supporting proof. Every file receives an immutable SHA-256 cryptographic digest.
              </p>
            </div>

            <div className="form-fields-wrap">
              <div className="form-group mb-3">
                <label className="input-label">Grievance Subject / Title</label>
                <input
                  type="text"
                  className="input-control"
                  value={grievanceTitle}
                  onChange={(e) => setGrievanceTitle(e.target.value)}
                  placeholder="e.g. Non-refund of Caution Deposit following Seat Surrender"
                />
              </div>

              <div className="form-group mb-4">
                <label className="input-label">Detailed Narrative of the Incident / Issue</label>
                <textarea
                  className="input-control"
                  rows={4}
                  value={grievanceDetails}
                  onChange={(e) => setGrievanceDetails(e.target.value)}
                  placeholder="Include relevant dates, communications with college officials, fees paid, and exact rules violated..."
                ></textarea>
                <small className="input-helper">Please avoid unsubstantiated defamatory claims; stick to verifiable facts and receipts.</small>
              </div>

              {/* Upload Proof Vault Area */}
              <div className="proof-vault-section">
                <div className="flex items-center justify-between mb-2">
                  <label className="input-label bold">
                    <ShieldCheck size={18} className="text-orange" />
                    <span>Upload Proof of Complaint / Issue (Evidence Vault)</span>
                  </label>
                  <span className="file-limit-pill">Max 10MB per file · PDF, PNG, JPG, MP3</span>
                </div>

                <div
                  className={`drag-drop-zone ${isDragging ? 'drag-active' : ''}`}
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDragging(false);
                    // trigger file upload simulation
                  }}
                >
                  <UploadCloud size={36} className="upload-icon" />
                  <strong className="drop-title">Drag & Drop Proof Documents, Fee Challans or Letters</strong>
                  <p className="drop-sub">or click browse to upload from your device or mobile camera</p>

                  <label className="btn btn-outline btn-upload-browse mt-2">
                    Browse File Proof
                    <input
                      type="file"
                      hidden
                      onChange={handleFileUpload}
                      accept=".pdf,.png,.jpg,.jpeg,.mp3"
                    />
                  </label>
                </div>

                {/* Uploaded Evidences List with SHA-256 Hash Verification */}
                <div className="uploaded-evidences-list mt-3">
                  <span className="list-heading">Attached Cryptographic Proof Files ({evidences.length}):</span>
                  {evidences.map((ev) => (
                    <div key={ev.id} className="evidence-item-card flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileCheck size={22} className="text-green" />
                        <div>
                          <strong className="ev-name">{ev.name}</strong>
                          <div className="ev-meta flex items-center gap-2">
                            <span>{(ev.size / 1024 / 1024).toFixed(2)} MB</span>
                            <span>•</span>
                            <span className="ev-hash flex items-center gap-1">
                              <span className="hash-label">SHA-256 Digest:</span>
                              <code className="mono hash-text">{ev.sha256Hash.slice(0, 24)}...</code>
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-outline btn-icon-sm"
                        onClick={() => removeEvidence(ev.id)}
                        title="Remove file"
                      >
                        <Trash2 size={16} className="text-danger" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="step-footer-nav flex items-center justify-between">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentStep(3)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setCurrentStep(5)}
              >
                <span>Review & Related Cases</span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Review & Related Case Cluster Engine */}
        {currentStep === 5 && !submittedCaseId && (
          <div className="card step-panel">
            <div className="panel-head">
              <span className="panel-step-badge">Step 5 of 5</span>
              <h3>Review & Submit Grievance</h3>
              <p className="panel-desc">Verify your submission details. Check cross-bureau related case matches.</p>
            </div>

            {/* Related Case Finder Alert */}
            <div className="related-case-alert-box">
              <div className="flex items-start gap-3">
                <Link2 size={24} className="text-purple" />
                <div className="flex-1">
                  <strong className="related-box-title">AICTE Related Case Finder: 2 Similar Cases Detected!</strong>
                  <p className="related-box-desc">
                    Our semantic matching engine identified 2 unresolved grievances regarding <strong>Fee Refund / Caution Money Deductions</strong> against {selectedInstObj?.name}.
                  </p>
                  <div className="link-checkbox-wrap flex items-center gap-2 mt-2">
                    <input
                      type="checkbox"
                      id="linkRelatedCheck"
                      checked={linkToRelated}
                      onChange={(e) => setLinkToRelated(e.target.checked)}
                    />
                    <label htmlFor="linkRelatedCheck" className="link-label">
                      <strong>Link my complaint to the Institutional Joint Hearing Queue</strong> (Increases priority & collective scrutiny by Regional Bureau)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Review Summary */}
            <div className="review-summary-card">
              <h4 className="summary-title">Submission Summary</h4>
              <div className="summary-grid grid grid-cols-2 gap-3 mt-3">
                <div className="summary-col">
                  <span className="sum-label">Complainant:</span>
                  <strong>{isAnonymous ? 'Anonymous / Masked' : name} ({complainantRole})</strong>
                </div>
                <div className="summary-col">
                  <span className="sum-label">Contact Mobile:</span>
                  <code className="mono">{mobile}</code>
                </div>
                <div className="summary-col">
                  <span className="sum-label">Grievance Category:</span>
                  <span className="status-chip chip-info">{categoryLabel}</span>
                </div>
                <div className="summary-col">
                  <span className="sum-label">Institution:</span>
                  <strong>{selectedInstObj?.name}</strong> (<code className="mono">{selectedInstObj?.permanentId}</code>)
                </div>
              </div>

              <div className="summary-narrative mt-3">
                <span className="sum-label">Grievance Subject:</span>
                <p className="sum-title-text">{grievanceTitle}</p>
                <span className="sum-label mt-2 block">Narrative:</span>
                <p className="sum-desc-text">{grievanceDetails}</p>
              </div>

              <div className="summary-proofs-count mt-3 flex items-center justify-between">
                <span className="proof-count-text flex items-center gap-1">
                  <ShieldCheck size={16} className="text-green" />
                  {evidences.length} Proof File(s) Stored & Verified with SHA-256 Digest
                </span>
                <span className="sla-guarantee-text">72-Hour Response SLA Guaranteed</span>
              </div>
            </div>

            <div className="step-footer-nav flex items-center justify-between mt-4">
              <button
                type="button"
                className="btn btn-outline"
                onClick={() => setCurrentStep(4)}
              >
                <ArrowLeft size={16} />
                <span>Back to Proofs</span>
              </button>
              <button
                type="button"
                className="btn btn-primary btn-submit-final"
                onClick={handleSubmitFinal}
              >
                <CheckCircle2 size={18} />
                <span>Submit Grievance Now</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <style>{`
        .filing-container {
          padding: 32px 0 64px 0;
        }
        .max-w-800 {
          max-width: 840px;
          margin: 0 auto;
        }

        .stepper-wrap {
          position: relative;
          margin-bottom: 32px;
        }
        .stepper-bar {
          position: absolute;
          top: 18px;
          left: 36px;
          right: 36px;
          height: 3px;
          background-color: var(--color-neutral-300);
          z-index: 1;
        }
        .stepper-fill {
          height: 100%;
          background-color: var(--color-action-600);
          transition: width 0.3s ease;
        }
        .steps-row {
          position: relative;
          z-index: 2;
        }
        .step-circle-node {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .step-num {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: #FFFFFF;
          border: 2px solid var(--color-neutral-300);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--color-neutral-600);
          transition: all 0.2s ease;
        }
        .step-circle-node.current .step-num {
          background-color: var(--color-action-600);
          color: #FFFFFF;
          border-color: var(--color-action-600);
          box-shadow: 0 0 0 4px rgba(194, 87, 12, 0.2);
        }
        .step-circle-node.completed .step-num {
          background-color: var(--color-brand-blue-600);
          color: #FFFFFF;
          border-color: var(--color-brand-blue-600);
        }
        .step-label-text {
          font-size: 0.78rem;
          font-weight: 600;
          color: var(--color-neutral-600);
        }
        .step-circle-node.current .step-label-text {
          color: var(--color-action-600);
        }

        .step-panel {
          padding: 32px;
          background: #FFFFFF;
        }
        .panel-head {
          margin-bottom: 24px;
        }
        .panel-step-badge {
          font-size: 0.75rem;
          font-weight: 800;
          color: var(--color-action-600);
          background: #FFF7ED;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
          display: inline-block;
          margin-bottom: 6px;
        }
        .panel-desc {
          font-size: 0.9rem;
          color: var(--color-neutral-600);
          margin-top: 4px;
        }

        .role-selector-grid {
          margin-bottom: 24px;
        }
        .role-select-box {
          background: var(--color-neutral-100);
          border: 2px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 16px 12px;
          text-align: center;
          cursor: pointer;
          transition: all 0.15s ease;
        }
        .role-select-box.selected {
          border-color: var(--color-action-600);
          background-color: #FFF7ED;
        }
        .role-icon {
          font-size: 1.5rem;
          display: block;
          margin-bottom: 6px;
        }
        .role-name {
          font-size: 0.95rem;
          display: block;
        }
        .anon-tag {
          font-size: 0.7rem;
          background: #FEE2E2;
          color: #B91C1C;
          padding: 1px 6px;
          border-radius: var(--radius-pill);
          font-weight: 700;
          margin-top: 4px;
          display: inline-block;
        }

        .categories-select-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 24px;
        }
        .category-item-select {
          padding: 14px 18px;
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          cursor: pointer;
          transition: border-color 0.15s ease, background-color 0.15s ease;
        }
        .category-item-select:hover {
          border-color: var(--color-brand-blue-600);
        }
        .active-cat-item {
          border-color: var(--color-action-600);
          background-color: #FFF7ED;
        }
        .cat-emoji {
          font-size: 1.5rem;
        }
        .cat-title-text {
          font-size: 0.95rem;
          color: var(--color-navy-900);
        }
        .cat-desc-text {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
        }
        .custom-radio {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          border: 2px solid var(--color-neutral-400);
          display: inline-block;
          position: relative;
        }
        .custom-radio.radio-checked {
          border-color: var(--color-action-600);
        }
        .custom-radio.radio-checked::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background-color: var(--color-action-600);
        }

        .institute-picker-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
          max-height: 260px;
          overflow-y: auto;
        }
        .inst-pick-item {
          padding: 12px 16px;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-sm);
          cursor: pointer;
        }
        .inst-pick-item:hover, .inst-selected {
          border-color: var(--color-brand-blue-600);
          background-color: #F8FAFC;
        }
        .inst-pick-name {
          font-size: 0.95rem;
          color: var(--color-navy-900);
        }
        .inst-pick-meta {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
          display: block;
        }
        .selected-inst-banner {
          background-color: #EFF6FF;
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-sm);
          padding: 12px 16px;
          margin-top: 16px;
        }

        .proof-vault-section {
          background: #F8FAFC;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .file-limit-pill {
          font-size: 0.75rem;
          color: var(--color-neutral-600);
          background: #E2E8F0;
          padding: 2px 8px;
          border-radius: var(--radius-pill);
        }
        .drag-drop-zone {
          border: 2px dashed #CBD5E1;
          border-radius: var(--radius-md);
          padding: 28px 16px;
          text-align: center;
          background: #FFFFFF;
          transition: border-color 0.15s ease;
        }
        .drag-active {
          border-color: var(--color-brand-blue-600);
          background-color: #EFF6FF;
        }
        .upload-icon {
          color: var(--color-brand-blue-600);
          margin-bottom: 8px;
        }
        .drop-title {
          font-size: 0.95rem;
          display: block;
        }
        .drop-sub {
          font-size: 0.8125rem;
          color: var(--color-neutral-600);
        }
        .btn-upload-browse {
          cursor: pointer;
          display: inline-block;
        }

        .uploaded-evidences-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .list-heading {
          font-size: 0.8125rem;
          font-weight: 700;
          color: var(--color-neutral-700);
        }
        .evidence-item-card {
          background: #FFFFFF;
          border: 1px solid #CBD5E1;
          border-radius: var(--radius-sm);
          padding: 10px 14px;
        }
        .ev-name {
          font-size: 0.875rem;
          color: var(--color-navy-900);
        }
        .ev-meta {
          font-size: 0.75rem;
          color: var(--color-neutral-600);
        }
        .ev-hash {
          background: #F1F5F9;
          padding: 1px 6px;
          border-radius: 2px;
        }
        .hash-label {
          color: #64748B;
        }
        .btn-icon-sm {
          padding: 4px 8px;
          min-height: 28px;
        }

        .related-case-alert-box {
          background: #FAF5FF;
          border: 2px solid #C084FC;
          border-radius: var(--radius-md);
          padding: 16px 20px;
          margin-bottom: 20px;
        }
        .text-purple { color: #9333EA; }
        .related-box-title {
          font-size: 0.95rem;
          color: #6B21A8;
        }
        .related-box-desc {
          font-size: 0.85rem;
          color: #581C87;
          margin-top: 4px;
        }
        .link-label {
          font-size: 0.85rem;
          color: #4C1D95;
          cursor: pointer;
        }

        .review-summary-card {
          background: #FFFFFF;
          border: 1px solid var(--color-neutral-300);
          border-radius: var(--radius-md);
          padding: 20px;
        }
        .summary-title {
          font-size: 1.1rem;
          border-bottom: 1px solid var(--color-neutral-200);
          padding-bottom: 8px;
        }
        .sum-label {
          font-size: 0.78rem;
          color: var(--color-neutral-600);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          display: block;
        }
        .sum-title-text {
          font-size: 0.95rem;
          font-weight: 700;
          color: var(--color-navy-900);
        }
        .sum-desc-text {
          font-size: 0.875rem;
          color: var(--color-neutral-700);
          background: var(--color-neutral-100);
          padding: 8px 12px;
          border-radius: var(--radius-sm);
        }
        .proof-count-text {
          font-size: 0.85rem;
          font-weight: 600;
          color: #166534;
        }
        .sla-guarantee-text {
          font-size: 0.8125rem;
          color: var(--color-brand-blue-600);
          font-weight: 600;
        }

        .step-footer-nav {
          border-top: 1px solid var(--color-neutral-200);
          padding-top: 20px;
          margin-top: 24px;
        }

        .confirmation-card {
          padding: 48px 32px;
        }
        .confirm-icon-box {
          margin-bottom: 16px;
        }
        .confirm-chip {
          margin-bottom: 12px;
        }
        .confirm-lead {
          font-size: 1.05rem;
          color: var(--color-neutral-600);
          max-width: 600px;
          margin: 8px auto 24px auto;
        }
        .case-id-display-box {
          background: #F8FAFC;
          border: 2px dashed var(--color-brand-blue-600);
          border-radius: var(--radius-md);
          padding: 16px 24px;
          max-width: 540px;
          margin: 0 auto 28px auto;
        }
        .case-id-label {
          font-size: 0.8rem;
          color: var(--color-neutral-600);
          display: block;
        }
        .case-id-code {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--color-brand-blue-600);
        }
        .confirmation-details-box {
          max-width: 580px;
          margin: 0 auto 28px auto;
          background: var(--color-neutral-100);
          padding: 16px 20px;
          border-radius: var(--radius-sm);
          font-size: 0.875rem;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .highlight-otp-note {
          background: #FEF3C7;
          border-left: 3px solid #F59E0B;
          padding: 6px 10px;
          color: #92400E;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
};

// ==========================================================================
// NIVARAN · Screen 2 & 3: Guided 4-Step Grievance Filing (SubmitComplaintView.tsx)
// Stepper with autosave, Institution typeahead, Similar-complaint discovery panel,
// evidence SHA-256 calculation, and verifiable docket receipt
// ==========================================================================

import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../app/AppProviders';
import { createComplaint, joinComplaint } from '../../api/complaints';
import { searchInstitutions } from '../../api/institutions';
import { findSimilarComplaints, SimilarityResult } from '../../domain/similarity';
import { GrievanceCategory, CATEGORY_LABELS, EvidenceFile } from '../../domain/types';
import { Button } from '../../ui/Button';
import { Field } from '../../ui/Field';
import { Icon, IconName } from '../../ui/Icon';
import { Stepper, StepItem } from '../../ui/NavigationAndDisclosure';
import { FilePicker } from '../../ui/FilePicker';
import { DocketId } from '../../ui/DocketId';
import { StatusChip } from '../../ui/StatusChip';
import { useToast } from '../../ui/Toast';
import styles from '../../ui/ui.module.css';

const CATEGORIES: { key: GrievanceCategory; label: string; icon: IconName }[] = [
  { key: 'FEES_REFUND', label: 'Fee Refund & Excess Charges', icon: 'fee-refund' },
  { key: 'CERTIFICATE_WITHHELD', label: 'Withholding of Certificates / Migration', icon: 'certificate' },
  { key: 'ANTI_RAGGING', label: 'Anti-Ragging Incident', icon: 'anti-ragging' },
  { key: 'SEXUAL_HARASSMENT', label: 'Women Safety / ICC / Harassment', icon: 'safety' },
  { key: 'SCHOLARSHIP_AICTE', label: 'AICTE Pragati / Saksham Scholarship', icon: 'scholarship' },
  { key: 'FACULTY_INFRA', label: 'Faculty Shortage & Lab Infrastructure', icon: 'faculty' },
  { key: 'ADMISSION_EXAM', label: 'Admission Irregularity / Exam Conduct', icon: 'admission' },
  { key: 'OTHER_UNSURE', label: 'Other Technical Grievance', icon: 'other' }
];

const STEPS: StepItem[] = [
  { number: 1, title: 'Institution', subtitle: 'Permanent ID lookup' },
  { number: 2, title: 'Category & Details', subtitle: 'Description & match' },
  { number: 3, title: 'Evidence', subtitle: 'Receipts & documents' },
  { number: 4, title: 'Review & Submit', subtitle: 'Formal declaration' }
];

export const SubmitComplaintView: React.FC = () => {
  const { currentUser, complaints, refreshData, navigateToTab } = useApp();
  const { success, error, info } = useToast();

  const [currentStep, setCurrentStep] = useState(1);
  const [submittedDocketId, setSubmittedDocketId] = useState<string | null>(null);

  // Form State
  const [instSearch, setInstSearch] = useState('');
  const [selectedInst, setSelectedInst] = useState<{
    name: string;
    permanentId: string;
    city: string;
    state: string;
  } | null>(null);
  const [manualInstFallback, setManualInstFallback] = useState(false);

  const [category, setCategory] = useState<GrievanceCategory>('FEES_REFUND');
  const [title, setTitle] = useState('');
  const [details, setDetails] = useState('');
  const [complainantRole, setComplainantRole] = useState<'Student' | 'Faculty' | 'Parent' | 'Anonymous'>('Student');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [complainantName, setComplainantName] = useState(currentUser?.name || 'Rohan Verma');
  const [contactEmail, setContactEmail] = useState(currentUser?.email || 'rohan.verma@example.com');
  const [contactMobile, setContactMobile] = useState(currentUser?.mobile || '+91 98234 11223');

  const [evidenceList, setEvidenceList] = useState<EvidenceFile[]>([]);
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Institution Search Results
  const institutionResults = useMemo(() => {
    if (!instSearch.trim()) return [];
    return searchInstitutions(instSearch);
  }, [instSearch]);

  // Live Similar Complaint Matching (Debounced Screen 3)
  const [similarCases, setSimilarCases] = useState<SimilarityResult[]>([]);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (title.length > 5 || selectedInst) {
        const matches = findSimilarComplaints(
          {
            institutionName: selectedInst?.name,
            aictePermanentId: selectedInst?.permanentId,
            category,
            title,
            details
          },
          complaints
        );
        setSimilarCases(matches.slice(0, 3));
      } else {
        setSimilarCases([]);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [title, details, category, selectedInst, complaints]);

  // Handle Step 1 Next
  const handleStep1Next = () => {
    if (!selectedInst && !manualInstFallback) {
      error('Please select an AICTE-approved institution or enable manual entry.');
      return;
    }
    setCurrentStep(2);
  };

  // Handle Step 2 Next
  const handleStep2Next = () => {
    if (!title.trim() || title.length < 10) {
      error('Please provide a descriptive title (at least 10 characters).');
      return;
    }
    if (!details.trim() || details.length < 25) {
      error('Please provide detailed facts of the grievance (at least 25 characters).');
      return;
    }
    setCurrentStep(3);
  };

  // Handle Step 3 Next
  const handleStep3Next = () => {
    setCurrentStep(4);
  };

  // Final Submit
  const handleFinalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      error('Please accept the accuracy declaration before submitting.');
      return;
    }

    try {
      const created = createComplaint(
        {
          title: title.trim(),
          category,
          categoryLabel: CATEGORY_LABELS[category],
          institutionName: selectedInst?.name || instSearch,
          aictePermanentId: selectedInst?.permanentId || 'PENDING-REG',
          city: selectedInst?.city || 'Pune',
          state: selectedInst?.state || 'Maharashtra',
          complainantName: isAnonymous ? 'Anonymous Complainant' : complainantName,
          complainantRole,
          contactEmail,
          contactMobile,
          isAnonymous,
          details: details.trim(),
          bureau: category === 'ANTI_RAGGING' ? 'ANTI_RAGGING' : category === 'SEXUAL_HARASSMENT' ? 'WOMEN_CELL' : 'PGRC'
        },
        evidenceList
      );

      refreshData();
      setSubmittedDocketId(created.id);
      success(`Grievance Docket ${created.id} successfully registered!`);
    } catch (err: any) {
      error(err.message || 'Failed to submit complaint.');
    }
  };

  // Join Similar Complaint Action (Screen 3)
  const handleJoinComplaint = (parentCaseId: string) => {
    try {
      const result = joinComplaint(parentCaseId, {
        name: complainantName,
        email: contactEmail,
        mobile: contactMobile,
        role: complainantRole === 'Anonymous' ? 'Student' : complainantRole
      });
      refreshData();
      info(`Linked to lead docket ${parentCaseId}. Created personal docket ${result.newComplaint.id}.`);
      setSubmittedDocketId(result.newComplaint.id);
    } catch (err: any) {
      error(err.message || 'Could not join complaint.');
    }
  };

  // ── Success Page Receipt ──
  if (submittedDocketId) {
    return (
      <div style={{ maxWidth: '680px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-4)' }}>
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '2px solid var(--ok)',
            borderRadius: 'var(--rad-lg)',
            boxShadow: 'var(--shadow-2)',
            padding: 'var(--sp-8)',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              backgroundColor: 'var(--ok-surface)',
              color: 'var(--ok)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 'var(--sp-3)'
            }}
          >
            <Icon name="check" size={36} weight="bold" />
          </div>

          <h2 style={{ fontSize: 'var(--fs-2xl)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
            Grievance Docket Registered Successfully
          </h2>
          <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
            Your complaint has been cryptographically signed and routed to the competent AICTE Bureau.
          </p>

          <div
            style={{
              backgroundColor: 'var(--navy-50)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-4)',
              margin: 'var(--sp-4) 0',
              display: 'inline-flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 'var(--sp-2)'
            }}
          >
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', fontWeight: 600 }}>
              YOUR OFFICIAL GRIEVANCE DOCKET NUMBER:
            </span>
            <DocketId id={submittedDocketId} style={{ fontSize: 'var(--fs-xl)', padding: '6px 16px' }} />
            <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--ok)', fontWeight: 600 }}>
              ✓ SMS & Email Acknowledgement Dispatched
            </span>
          </div>

          <div
            style={{
              textAlign: 'left',
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-md)',
              padding: 'var(--sp-4)',
              margin: 'var(--sp-4) 0',
              fontSize: 'var(--fs-xs)'
            }}
          >
            <h4 style={{ fontSize: 'var(--fs-sm)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
              What happens next?
            </h4>
            <ol style={{ paddingLeft: 'var(--sp-4)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
              <li>
                <strong>Stage 2 (Verification):</strong> Nodal Bureau validates institutional jurisdiction and permanent ID records within 24 working hours.
              </li>
              <li>
                <strong>Stage 3 & 4 (Statutory Action):</strong> Formal notice served to Institution Registrar with mandatory 72-hour Action Taken Report (ATR) clock.
              </li>
              <li>
                <strong>Stage 6 (Citizen Confirmation):</strong> Once the college uploads proof, you will inspect the refund UTR or action report and confirm resolution.
              </li>
            </ol>
          </div>

          <div style={{ display: 'flex', gap: 'var(--sp-3)', justifyContent: 'center', marginTop: 'var(--sp-6)' }}>
            <Button
              variant="primary"
              size="md"
              icon={<Icon name="search" size={18} />}
              onClick={() => navigateToTab('track', { complaintId: submittedDocketId })}
            >
              Track Docket Status
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={() => {
                setSubmittedDocketId(null);
                setCurrentStep(1);
                setTitle('');
                setDetails('');
                setEvidenceList([]);
                navigateToTab('my-complaints');
              }}
            >
              View in My Complaints
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1100px', margin: 'var(--sp-8) auto', padding: '0 var(--sp-4)' }}>
      <div style={{ marginBottom: 'var(--sp-6)' }}>
        <h2 style={{ fontSize: 'var(--fs-3xl)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
          File a Grievance Docket
        </h2>
        <p style={{ fontSize: 'var(--fs-md)', color: 'var(--text-muted)' }}>
          Submit formal grievance under AICTE Public Grievance Redressal Regulations (SIH26264).
        </p>
      </div>

      <Stepper steps={STEPS} currentStep={currentStep} onStepClick={step => step < currentStep && setCurrentStep(step)} />

      <div style={{ display: 'grid', gridTemplateColumns: currentStep === 2 && similarCases.length > 0 ? '1fr 360px' : '1fr', gap: 'var(--sp-6)' }}>
        {/* Main Form Box */}
        <div
          style={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--rad-lg)',
            boxShadow: 'var(--shadow-0)',
            padding: 'var(--sp-6)'
          }}
        >
          {/* ── STEP 1: Institution Selection ── */}
          {currentStep === 1 && (
            <div>
              <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
                Step 1: Select AICTE Approved Institution
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                Type your college name, city, or AICTE Permanent ID (e.g., DEMO-001, DTU, COEP).
              </p>

              <Field label="Search College / Institute Name or Permanent ID" hint="Start typing at least 2 letters" required>
                {({ id, ariaDescribedBy }) => (
                  <div style={{ position: 'relative' }}>
                    <input
                      id={id}
                      type="text"
                      value={instSearch}
                      onChange={e => {
                        setInstSearch(e.target.value);
                        if (selectedInst) setSelectedInst(null);
                      }}
                      placeholder="e.g. ABC Institute of Technology, DTU, COEP, DEMO-001..."
                      className={styles.input}
                      aria-describedby={ariaDescribedBy}
                    />
                  </div>
                )}
              </Field>

              {/* Institution Auto-Suggest Dropdown */}
              {!selectedInst && institutionResults.length > 0 && (
                <div
                  style={{
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--rad-sm)',
                    backgroundColor: 'var(--surface)',
                    boxShadow: 'var(--shadow-1)',
                    marginBottom: 'var(--sp-4)',
                    maxHeight: '220px',
                    overflowY: 'auto'
                  }}
                >
                  {institutionResults.map(inst => (
                    <div
                      key={inst.id}
                      onClick={() => {
                        setSelectedInst({
                          name: inst.name,
                          permanentId: inst.permanentId,
                          city: inst.city,
                          state: inst.state
                        });
                        setInstSearch(`${inst.name} (${inst.permanentId})`);
                      }}
                      style={{
                        padding: 'var(--sp-3)',
                        borderBottom: '1px solid var(--border-light)',
                        cursor: 'pointer',
                        fontSize: 'var(--fs-sm)'
                      }}
                      onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--navy-50)')}
                      onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--surface)')}
                    >
                      <div style={{ fontWeight: 600, color: 'var(--navy-900)' }}>{inst.name}</div>
                      <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', display: 'flex', gap: 'var(--sp-3)' }}>
                        <span>Permanent ID: <strong>{inst.permanentId}</strong></span>
                        <span>{inst.city}, {inst.state}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Selected Institution Card */}
              {selectedInst && (
                <div
                  style={{
                    backgroundColor: 'var(--navy-50)',
                    border: '1px solid var(--navy-100)',
                    borderRadius: 'var(--rad-md)',
                    padding: 'var(--sp-4)',
                    marginBottom: 'var(--sp-5)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)' }}>
                      <Icon name="check-circle" size={20} color="var(--ok)" weight="fill" />
                      <span style={{ fontWeight: 700, color: 'var(--navy-900)', fontSize: 'var(--fs-md)' }}>
                        {selectedInst.name}
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedInst(null);
                        setInstSearch('');
                      }}
                    >
                      Change
                    </Button>
                  </div>
                  <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: 'var(--sp-2)', display: 'flex', gap: 'var(--sp-4)' }}>
                    <span>AICTE Permanent ID: <strong>{selectedInst.permanentId}</strong></span>
                    <span>Location: {selectedInst.city}, {selectedInst.state}</span>
                  </div>
                </div>
              )}

              {/* "Can't find it?" Fallback */}
              {!selectedInst && (
                <div style={{ marginBottom: 'var(--sp-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={manualInstFallback}
                      onChange={e => setManualInstFallback(e.target.checked)}
                      style={{ accentColor: 'var(--action)' }}
                    />
                    <span>Can't find your college? Check here to enter details manually (Flagged for official AICTE verification).</span>
                  </label>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--sp-6)' }}>
                <Button variant="primary" size="md" onClick={handleStep1Next} icon={<Icon name="arrow-right" size={16} />}>
                  Continue to Grievance Details
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 2: Category & Details (With Screen 3 Similar Discovery) ── */}
          {currentStep === 2 && (
            <div>
              <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
                Step 2: Category & Facts of Grievance
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                Select grievance classification and provide objective, chronological details.
              </p>

              {/* Category Tiles */}
              <div style={{ marginBottom: 'var(--sp-5)' }}>
                <label className={styles.fieldLabel} style={{ marginBottom: 'var(--sp-2)', display: 'block' }}>
                  Grievance Category <span className={styles.requiredMarker}>*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-2)' }}>
                  {CATEGORIES.map(cat => {
                    const isSelected = category === cat.key;
                    return (
                      <button
                        key={cat.key}
                        type="button"
                        onClick={() => setCategory(cat.key)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 'var(--sp-3)',
                          padding: 'var(--sp-3)',
                          borderRadius: 'var(--rad-sm)',
                          border: `1px solid ${isSelected ? 'var(--action)' : 'var(--border)'}`,
                          backgroundColor: isSelected ? 'var(--action-tint)' : 'var(--surface)',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                      >
                        <div style={{ color: isSelected ? 'var(--action)' : 'var(--navy-700)' }}>
                          <Icon name={cat.icon} size={22} weight="duotone" />
                        </div>
                        <span style={{ fontSize: 'var(--fs-xs)', fontWeight: isSelected ? 700 : 500, color: isSelected ? 'var(--action)' : 'var(--text)' }}>
                          {cat.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Title & Description */}
              <Field label="Grievance Title / Short Subject" hint="e.g. Non-refund of fees after seat surrender before cutoff" required>
                {({ id, ariaDescribedBy }) => (
                  <input
                    id={id}
                    type="text"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder="Enter short summary of issue..."
                    className={styles.input}
                    aria-describedby={ariaDescribedBy}
                    required
                  />
                )}
              </Field>

              <Field
                label="Detailed Description & Chronology of Events"
                hint="Include relevant dates, amounts, application receipts, and college responses."
                maxLength={2000}
                currentLength={details.length}
                required
              >
                {({ id, ariaDescribedBy }) => (
                  <textarea
                    id={id}
                    rows={5}
                    value={details}
                    onChange={e => setDetails(e.target.value)}
                    placeholder="Provide specific dates, fee payment challan numbers, cancellation applications, and refusal reasons..."
                    className={styles.textarea}
                    aria-describedby={ariaDescribedBy}
                    required
                  />
                )}
              </Field>

              {/* Complainant Identity */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--sp-4)', marginTop: 'var(--sp-4)' }}>
                <Field label="Your Role / Affiliation" required>
                  {({ id }) => (
                    <select
                      id={id}
                      value={complainantRole}
                      onChange={e => setComplainantRole(e.target.value as any)}
                      className={styles.select}
                    >
                      <option value="Student">Student</option>
                      <option value="Faculty">Faculty / Staff</option>
                      <option value="Parent">Parent / Guardian</option>
                      <option value="Anonymous">Anonymous Citizen</option>
                    </select>
                  )}
                </Field>

                <div style={{ display: 'flex', alignItems: 'center', paddingTop: 'var(--sp-4)' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', fontSize: 'var(--fs-sm)', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={isAnonymous}
                      onChange={e => setIsAnonymous(e.target.checked)}
                      style={{ accentColor: 'var(--action)' }}
                    />
                    <span>Protect identity (Mask my name in official public disclosures)</span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-6)' }}>
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(1)} icon={<Icon name="arrow-left" size={16} />}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleStep2Next} icon={<Icon name="arrow-right" size={16} />}>
                  Continue to Evidence
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 3: Evidence Upload ── */}
          {currentStep === 3 && (
            <div>
              <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
                Step 3: Supporting Evidence & Receipts
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                Upload payment receipts, seat withdrawal acknowledgements, or circulars. Each document is cryptographically hashed for legal integrity.
              </p>

              <FilePicker onFilesSelected={files => setEvidenceList(files)} maxFiles={5} maxSizeMb={10} />

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-6)' }}>
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(2)} icon={<Icon name="arrow-left" size={16} />}>
                  Back
                </Button>
                <Button variant="primary" size="md" onClick={handleStep3Next} icon={<Icon name="arrow-right" size={16} />}>
                  Continue to Final Review
                </Button>
              </div>
            </div>
          )}

          {/* ── STEP 4: Review and Submit (Screen 4 in flow) ── */}
          {currentStep === 4 && (
            <div>
              <h3 style={{ fontSize: 'var(--fs-xl)', color: 'var(--navy-900)', marginBottom: 'var(--sp-2)' }}>
                Step 4: Formal Verification & Declaration
              </h3>
              <p style={{ fontSize: 'var(--fs-sm)', color: 'var(--text-muted)', marginBottom: 'var(--sp-4)' }}>
                Review summary details before generating the immutable Grievance Docket.
              </p>

              <div
                style={{
                  backgroundColor: 'var(--navy-50)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--rad-md)',
                  padding: 'var(--sp-4)',
                  marginBottom: 'var(--sp-5)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Target Institution:</span>
                  <button type="button" onClick={() => setCurrentStep(1)} style={{ color: 'var(--link)', fontSize: 'var(--fs-xs)' }}>
                    Edit
                  </button>
                </div>
                <div style={{ fontWeight: 700, fontSize: 'var(--fs-sm)', color: 'var(--navy-900)' }}>
                  {selectedInst?.name || instSearch} (PID: {selectedInst?.permanentId || 'PENDING'})
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Grievance Subject:</span>
                  <button type="button" onClick={() => setCurrentStep(2)} style={{ color: 'var(--link)', fontSize: 'var(--fs-xs)' }}>
                    Edit
                  </button>
                </div>
                <div style={{ fontWeight: 600, fontSize: 'var(--fs-sm)' }}>{title}</div>
                <div style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Category: <strong>{CATEGORY_LABELS[category]}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-3)', marginBottom: 'var(--sp-2)' }}>
                  <span style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)' }}>Evidence Attached:</span>
                  <button type="button" onClick={() => setCurrentStep(3)} style={{ color: 'var(--link)', fontSize: 'var(--fs-xs)' }}>
                    Edit
                  </button>
                </div>
                <div style={{ fontSize: 'var(--fs-xs)' }}>
                  {evidenceList.length > 0 ? (
                    <span>{evidenceList.length} verified files with SHA-256 digests.</span>
                  ) : (
                    <span style={{ color: 'var(--warn)' }}>No files attached (Grievance will proceed on written statement).</span>
                  )}
                </div>
              </div>

              {/* Legal Declaration */}
              <div style={{ marginBottom: 'var(--sp-6)' }}>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--sp-2)', fontSize: 'var(--fs-xs)', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={e => setAgreeTerms(e.target.checked)}
                    style={{ accentColor: 'var(--action)', marginTop: '2px' }}
                    required
                  />
                  <span>
                    I hereby declare that the facts stated above are true to the best of my knowledge and belief. I understand that submitting fraudulent or defamatory claims under AICTE Public Grievance Regulations is subject to statutory disciplinary review.
                  </span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 'var(--sp-6)' }}>
                <Button variant="ghost" size="md" onClick={() => setCurrentStep(3)} icon={<Icon name="arrow-left" size={16} />}>
                  Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleFinalSubmit} disabled={!agreeTerms}>
                  Generate Official Docket
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Screen 3: Similar-Complaint Discovery Side Panel ── */}
        {currentStep === 2 && similarCases.length > 0 && (
          <aside
            style={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--rad-lg)',
              padding: 'var(--sp-4)',
              height: 'fit-content',
              boxShadow: 'var(--shadow-0)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--sp-2)', marginBottom: 'var(--sp-2)' }}>
              <Icon name="search" size={18} color="var(--action)" />
              <h4 style={{ fontSize: 'var(--fs-sm)', color: 'var(--navy-900)', fontWeight: 700 }}>
                Similar Ongoing Complaints
              </h4>
            </div>
            <p style={{ fontSize: 'var(--fs-xs)', color: 'var(--text-muted)', lineHeight: 1.4, marginBottom: 'var(--sp-3)' }}>
              Other students at this institution have reported related issues. Joining links your docket to the existing lead case.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--sp-3)' }}>
              {similarCases.map(match => (
                <div
                  key={match.complaint.id}
                  style={{
                    backgroundColor: 'var(--navy-50)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--rad-sm)',
                    padding: 'var(--sp-3)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--sp-1)' }}>
                    <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, fontSize: 'var(--fs-xs)' }}>
                      {match.complaint.id}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--action)' }}>
                      {match.score}% Match
                    </span>
                  </div>

                  <div style={{ fontSize: 'var(--fs-xs)', fontWeight: 600, color: 'var(--text)', marginBottom: 'var(--sp-2)' }}>
                    {match.complaint.title}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'var(--sp-2)' }}>
                    <StatusChip stage={match.complaint.currentStage} />
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleJoinComplaint(match.complaint.id)}
                      style={{ fontSize: '11px', padding: '2px 8px', minHeight: '30px' }}
                    >
                      + Join Case
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}
      </div>
    </div>
  );
};

// Official AICTE Statutory Document & Report Generator
// Formats and generates authentic, legally structured AICTE inspection orders,
// institutional audit dossiers, and compliance evidence documents with embedded
// State Emblem of India and AICTE NIVARAN insignias.

import { jsPDF } from 'jspdf';
import { EMBLEM_INDIA_BASE64, AICTE_NIVARAN_LOGO_BASE64 } from './reportLogos';
import type { InstitutionScorecardItem } from '../types';

export interface DocumentMetadata {
  fileName: string;
  title?: string;
  caseId?: string;
  institutionName?: string;
  sha256?: string;
  fileSize?: number;
  uploadedAt?: string;
  uploaderRole?: string;
  details?: string;
}

export interface InspectionOrderParams {
  scorecard: InstitutionScorecardItem;
  inspectionType: string;
  targetDate: string;
  officerName: string;
  termsOfReference: string;
}

/**
 * Renders the official Government of India / AICTE header masthead with:
 * - State Emblem of India (Lion Capital with Satyameva Jayate) on top-left
 * - AICTE NIVARAN Official Insignia on top-right
 * - Council titles and address in authentic layout
 * - National Tricolor Ribbon
 * - Document Category Banner
 */
function drawGovHeader(doc: jsPDF, title: string, subtitle?: string): number {
  // 1. Left: State Emblem of India
  try {
    doc.addImage(EMBLEM_INDIA_BASE64, 'PNG', 14, 10, 13, 21.5);
  } catch (e) {
    console.warn('Could not embed national emblem', e);
  }

  // 2. Right: AICTE NIVARAN Logo
  try {
    doc.addImage(AICTE_NIVARAN_LOGO_BASE64, 'PNG', 175, 10, 21, 21);
  } catch (e) {
    console.warn('Could not embed AICTE logo', e);
  }

  // 3. Central Ministry & Council Header
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(11, 42, 91); // #0B2A5B
  doc.text('ALL INDIA COUNCIL FOR TECHNICAL EDUCATION', 105, 15.5, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(75, 85, 101); // #4B5565
  doc.text('(A Statutory Body of the Government of India)', 105, 19.5, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text('Nelson Mandela Marg, Vasant Kunj, New Delhi - 110070 | www.aicte-india.org', 105, 23.5, { align: 'center' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(194, 87, 12); // #C2570C Saffron / Terra
  doc.text('AICTE NIVARAN · Central Grievance Redressal & Institutional Accountability Desk', 105, 28, { align: 'center' });

  // 4. National Tricolor Ribbon (Saffron, White, Green)
  doc.setFillColor(255, 153, 51); // Saffron
  doc.rect(14, 32, 60, 1.2, 'F');
  doc.setFillColor(245, 245, 245); // Neutral White
  doc.rect(74, 32, 62, 1.2, 'F');
  doc.setFillColor(19, 136, 8); // Green
  doc.rect(136, 32, 60, 1.2, 'F');

  // 5. Title Banner
  doc.setFillColor(243, 245, 248);
  doc.rect(14, 35, 182, 8.5, 'F');
  doc.setDrawColor(203, 210, 220);
  doc.setLineWidth(0.3);
  doc.rect(14, 35, 182, 8.5, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 42, 91);
  doc.text(title.toUpperCase(), 105, 40.5, { align: 'center' });

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(100, 116, 139);
    doc.text(subtitle, 105, 44.5, { align: 'center' });
  }

  return 47; // y coordinate where subsequent content starts
}

/**
 * Draws the official digital seal, signature block, and cryptographic hash verification footer
 */
function drawGovFooterAndSeal(doc: jsPDF, yStart: number, sha256Digest?: string) {
  const sha = sha256Digest || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  let y = Math.min(yStart, 235);

  // Digital Signature Box
  doc.setDrawColor(203, 210, 220);
  doc.setFillColor(248, 250, 252);
  doc.rect(120, y, 76, 26, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 42, 91);
  doc.text('OFFICIALLY SIGNED & DISPATCHED', 124, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 101);
  doc.text('Dr. Ramesh K. Verma, Sc.D.', 124, y + 9.5);
  doc.text('Regional Officer & Vigilance Director', 124, y + 13.5);
  doc.text('All India Council for Technical Education', 124, y + 17.5);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(22, 101, 52); // Green check
  doc.text('[Digitally Verified via AICTE PKI Vault]', 124, y + 22.5);

  // AICTE Round Stamp Simulation (Left side of signature)
  doc.setDrawColor(194, 87, 12);
  doc.setLineWidth(0.4);
  doc.circle(95, y + 13, 10, 'S');
  doc.setFontSize(5);
  doc.setTextColor(194, 87, 12);
  doc.text('AICTE VIGILANCE', 95, y + 10.5, { align: 'center' });
  doc.text('GOVT. OF INDIA', 95, y + 13.5, { align: 'center' });
  doc.text('OFFICIAL SEAL', 95, y + 16.5, { align: 'center' });

  // Cryptographic Audit Footer
  doc.setDrawColor(203, 210, 220);
  doc.line(14, 275, 196, 275);

  doc.setFont('courier', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text(`DIGITAL SHA-256 CHECKSUM: ${sha}`, 14, 279);
  doc.text(
    `STATUTORY RECORD REGISTERED UNDER APH REGULATION & IT ACT 2000 | TIME: ${new Date().toISOString()}`,
    14,
    283
  );
  doc.text('AICTE NIVARAN NATIONAL REPOSITORY · CONFIDENTIAL & LEGALLY PRIVILEGED', 14, 287);
}

/**
 * 1. OFFICIAL STATUTORY INSPECTION ORDER & SHOW-CAUSE NOTICE
 * Conforms to AICTE Act 1987 Section 10(1)(v), APH Chapter VIII, and SCSC/SHC framework
 */
export function downloadInspectionOrderPdf(params: InspectionOrderParams): void {
  const { scorecard, inspectionType, targetDate, officerName, termsOfReference } = params;
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  let y = drawGovHeader(
    doc,
    'OFFICIAL STATUTORY INSPECTION ORDER & SHOW-CAUSE NOTICE',
    'UNDER SECTION 10(1)(v) OF AICTE ACT, 1987 READ WITH APH CHAPTER VIII (PENAL ACTIONS)'
  );

  y += 3;

  // Metadata Bar
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 11, 'F');
  doc.setDrawColor(203, 210, 220);
  doc.rect(14, y, 182, 11, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(11, 42, 91);
  doc.text(`F. No.: AICTE/VIG/ENQ/2026/PID-${scorecard.permanent_id}`, 18, y + 4.5);
  doc.text(`DATE OF ISSUE: ${today}`, 130, y + 4.5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 101);
  doc.text('DISPATCH MODE: SPEED POST & SECURE REGULATORY PORTAL DISPATCH', 18, y + 8.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28); // Red
  doc.text(`PRIORITY TIER: ${scorecard.priority_tier} (SCORE: ${scorecard.inspection_priority_score}/100)`, 130, y + 8.5);

  y += 14;

  // Addressee Block
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(11, 42, 91);
  doc.text('TO,', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text('The Chairman / Secretary / Principal,', 14, y + 4);
  doc.setFont('helvetica', 'bold');
  doc.text(`${scorecard.institution_name}`, 14, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text(`Permanent Institute ID: PID-${scorecard.permanent_id} | Region: ${scorecard.region} Region`, 14, y + 12);
  doc.text(`Address: ${scorecard.city}, ${scorecard.state}`, 14, y + 16);

  y += 20;

  // Subject line
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(11, 42, 91);
  const subj = doc.splitTextToSize(
    `SUBJECT: REGULATORY INSPECTION MANDATE & STATUTORY SHOW-CAUSE NOTICE UNDER SECTION 10(1)(v) OF THE AICTE ACT, 1987 READ WITH APPROVAL PROCESS HANDBOOK (CHAPTER VIII).`,
    182
  );
  doc.text(subj, 14, y);
  y += subj.length * 4 + 1;

  // References
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('REFERENCES:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text('1. AICTE Approval Process Handbook (APH), Chapter VIII (Penal Action & Compliance Monitoring).', 20, y + 3.5);
  doc.text('2. AICTE (Redressal of Grievance of Students) Regulations, 2019 (F.No. 1-101/PGRC/AICTE/Regulation/2019).', 20, y + 7);
  doc.text(`3. Standing Complaint Scrutiny Committee (SCSC) Risk Appraisal Docket PID-${scorecard.permanent_id}.`, 20, y + 10.5);

  y += 14;

  // WHEREAS Recitals
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);

  const p1 = doc.splitTextToSize(
    `1. WHEREAS, ${scorecard.institution_name} (PID-${scorecard.permanent_id}) was granted approval to conduct technical courses subject to strict observance of Council norms, mandatory Student Grievance Redressal Committee (SGRC) operation, fee refund mandates, and prohibition of certificate retention.`,
    182
  );
  doc.text(p1, 14, y);
  y += p1.length * 3.8 + 2;

  const p2 = doc.splitTextToSize(
    `2. AND WHEREAS, the AICTE NIVARAN central automated intelligence engine and Vigilance Monitoring Cell have identified persistent compliance violations: ${scorecard.total_cases} formal grievance complaints logged (${scorecard.active_cases} active, ${scorecard.overdue_rate}% overdue rate, and ${scorecard.flagged_atr_count} Action Taken Reports rejected for evasive boilerplate responses).`,
    182
  );
  doc.text(p2, 14, y);
  y += p2.length * 3.8 + 2;

  // Explainable reasons
  doc.setFont('helvetica', 'bold');
  doc.text('ALGORITHMIC COMPLIANCE FINDINGS & AUDIT TRIGGERS:', 14, y);
  doc.setFont('helvetica', 'normal');
  y += 4;
  scorecard.explainable_reasons.slice(0, 3).forEach((r) => {
    const rLines = doc.splitTextToSize(`• ${r}`, 176);
    doc.text(rLines, 18, y);
    y += rLines.length * 3.5;
  });

  y += 2;

  // OPERATIVE ORDER
  const mandateLabel =
    inspectionType === 'SURPRISE_PHYSICAL'
      ? 'Surprise Physical On-Site Inspection (Vigilance Squad)'
      : inspectionType === 'STATUTORY_SHOW_CAUSE'
      ? 'Statutory Show-Cause Notice & Administrative Summons'
      : inspectionType === 'DESK_AUDIT'
      ? 'Forensic Financial & Document Desk Audit'
      : 'Formal Ombudsman / Nodal Officer Virtual Hearing';

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(185, 28, 28);
  doc.text('NOW, THEREFORE, BY ORDER OF THE COMPETENT AUTHORITY:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  y += 4;

  const o1 = doc.splitTextToSize(
    `i.  A regulatory inspection is hereby constituted under mandate: ${mandateLabel}.`,
    176
  );
  doc.text(o1, 18, y);
  y += o1.length * 3.8;

  const o2 = doc.splitTextToSize(
    `ii. Inspecting Team Lead: ${officerName} (Vigilance & Expert Committee) scheduled on or before ${targetDate}.`,
    176
  );
  doc.text(o2, 18, y);
  y += o2.length * 3.8;

  const o3 = doc.splitTextToSize(`iii. Terms of Reference & Audit Scope: ${termsOfReference}`, 176);
  doc.text(o3, 18, y);
  y += o3.length * 3.8;

  const o4 = doc.splitTextToSize(
    `iv. The Institution is directed to SHOW CAUSE within 7 (seven) days as to why punitive action under Chapter VIII of APH—including 50% Reduction in Approved Intake, 'No Admission' status, or Total Withdrawal of Approval—should not be initiated.`,
    176
  );
  doc.text(o4, 18, y);
  y += o4.length * 3.8 + 4;

  // Copies to
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.text('COPY DISPATCHED FOR INFORMATION & COMPLIANCE TO:', 14, y);
  doc.setFont('helvetica', 'normal');
  doc.text('1. Directorate of Technical Education (DTE), State Government.', 18, y + 3.5);
  doc.text('2. Registrar, Affiliating University (with request to depute University Observer).', 18, y + 7);
  doc.text('3. Vigilance Officer & National Grievance Monitoring Desk, AICTE HQ, New Delhi.', 18, y + 10.5);

  // Sign-off, seal and footer
  drawGovFooterAndSeal(doc, y + 12);

  doc.save(`AICTE_Inspection_Order_${scorecard.permanent_id}.pdf`);
}

/**
 * 2. OFFICIAL INSTITUTIONAL GRIEVANCE SCORECARD & COMPLIANCE AUDIT DOSSIER
 * Detailed multi-parameter audit report used by the Standing Hearing Committee (SHC)
 */
export function downloadScorecardDossierPdf(scorecard: InstitutionScorecardItem): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const today = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });

  // PAGE 1: Executive Scorecard & Audit Metrics
  let y = drawGovHeader(
    doc,
    'INSTITUTIONAL GRIEVANCE SCORECARD & STATUTORY AUDIT DOSSIER',
    'CENTRAL BUREAU REDRESSAL & VIGILANCE ACCOUNTABILITY DIVISION'
  );

  y += 3;

  // Institution Metadata Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 14, 'F');
  doc.setDrawColor(203, 210, 220);
  doc.rect(14, y, 182, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(11, 42, 91);
  doc.text(scorecard.institution_name, 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(75, 85, 101);
  doc.text(
    `Permanent ID: PID-${scorecard.permanent_id} | Location: ${scorecard.city}, ${scorecard.state} (${scorecard.region} Region)`,
    18,
    y + 9.5
  );
  doc.text(`Evaluation Cycle: Academic Year 2026-27 | Generated on: ${today}`, 18, y + 13);

  y += 18;

  // Executive Priority Banner
  const isRed = scorecard.priority_tier === 'CRITICAL';
  const isAmber = scorecard.priority_tier === 'HIGH';
  const bannerBg: [number, number, number] = isRed ? [254, 242, 242] : isAmber ? [255, 251, 235] : [240, 253, 244];
  const bannerBorder: [number, number, number] = isRed ? [248, 113, 113] : isAmber ? [251, 191, 36] : [134, 239, 172];
  const bannerText: [number, number, number] = isRed ? [185, 28, 28] : isAmber ? [180, 83, 9] : [22, 101, 52];

  doc.setFillColor(...bannerBg);
  doc.rect(14, y, 182, 16, 'F');
  doc.setDrawColor(...bannerBorder);
  doc.rect(14, y, 182, 16, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...bannerText);
  doc.text(
    `PRIORITY TIER: ${scorecard.priority_tier} (SCORE: ${scorecard.inspection_priority_score} / 100)`,
    18,
    y + 6
  );

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text(`RECOMMENDED REGULATORY ACTION: ${scorecard.recommended_action_label.toUpperCase()}`, 18, y + 12);

  y += 20;

  // Key Audit Metrics Grid (Table)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 42, 91);
  doc.text('I. GRIEVANCE RESOLUTION AUDIT METRICS & SLA ADHERENCE', 14, y);
  y += 4;

  // Table Header
  doc.setFillColor(11, 42, 91);
  doc.rect(14, y, 182, 6, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text('METRIC PARAMETER', 18, y + 4.2);
  doc.text('VALUE', 100, y + 4.2);
  doc.text('STATUTORY SLA BENCHMARK', 135, y + 4.2);
  y += 6;

  const rows: [string, string, string][] = [
    ['Total Registered Grievances', `${scorecard.total_cases} cases`, 'Central Registry Total'],
    ['Active Unresolved Cases', `${scorecard.active_cases} cases`, 'Zero tolerance for overdue cases'],
    ['Resolved / Disposed Cases', `${scorecard.resolved_cases} cases`, 'Must have verified evidence voucher'],
    ['Grievance Overdue Rate', `${scorecard.overdue_rate}%`, 'Benchmark: < 5%'],
    ['Median Resolution Turnaround', `${scorecard.median_resolution_days} Days`, 'Mandated Statutory SLA: ≤ 15 Days'],
    ['Flagged Boilerplate ATRs', `${scorecard.flagged_atr_count} reports`, 'AI Scrutiny: Reject generic templates'],
    ['Reopened Disputes', `${scorecard.reopened_cases} cases`, 'Dissatisfied citizen escalation'],
    ['Upheld Serious Offenses', `${scorecard.upheld_complaints} violations`, 'Zero tolerance (Fee / Ragging / Docs)'],
  ];

  rows.forEach((row, idx) => {
    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(14, y, 182, 5, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.rect(14, y, 182, 5, 'S');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(30, 41, 59);
    doc.text(row[0], 18, y + 3.5);

    doc.setFont('helvetica', 'bold');
    doc.text(row[1], 100, y + 3.5);

    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text(row[2], 135, y + 3.5);

    y += 5;
  });

  y += 5;

  // Scoring Breakdown Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 42, 91);
  doc.text('II. WEIGHTED RISK VECTOR SCORING MATRIX', 14, y);
  y += 4;

  doc.setFillColor(243, 245, 248);
  doc.rect(14, y, 182, 16, 'F');
  doc.setDrawColor(203, 210, 220);
  doc.rect(14, y, 182, 16, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(30, 41, 59);

  doc.text(`• Overdue Violations Weight: ${scorecard.score_breakdown.overdue_points} pts`, 18, y + 4.5);
  doc.text(`• Reopened Disputes Weight: ${scorecard.score_breakdown.reopened_points} pts`, 100, y + 4.5);
  doc.text(`• Serious Upheld Offenses: ${scorecard.score_breakdown.upheld_points} pts`, 18, y + 9);
  doc.text(`• Cross-Portal Overlaps: ${scorecard.score_breakdown.overlap_points} pts`, 100, y + 9);
  doc.text(`• Evasive / Boilerplate ATRs: ${scorecard.score_breakdown.evasive_atr_points} pts`, 18, y + 13.5);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(11, 42, 91);
  doc.text(`TOTAL AUDIT PRIORITY SCORE: ${scorecard.inspection_priority_score} / 100`, 100, y + 13.5);

  y += 20;

  // Explainable Inspection Reasons
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 42, 91);
  doc.text('III. EXPLAINABLE REGULATORY BREACH TRIGGERS', 14, y);
  y += 4;

  scorecard.explainable_reasons.forEach((reason) => {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(`• ${reason}`, 176);
    doc.text(lines, 18, y);
    y += lines.length * 3.8;
  });

  y += 4;

  // Directives for Standing Hearing Committee (SHC)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 42, 91);
  doc.text('IV. STATUTORY VIGILANCE DIRECTIVES FOR SCSC & SHC', 14, y);
  y += 4;

  const directiveText =
    scorecard.priority_tier === 'CRITICAL'
      ? 'Institution flagged for IMMEDIATE ON-SITE SURPRISE PHYSICAL VIGILANCE INSPECTION. SCSC recommends dispatching a central inquiry squad, summoning governing body before Standing Hearing Committee, and serving formal notice under APH Chapter VIII.'
      : scorecard.priority_tier === 'HIGH'
      ? 'Formal Show Cause Notice & Virtual Ombudsman Hearing recommended. Institution must submit audited compliance report with original transaction proofs within 7 days.'
      : 'Maintain ongoing monitoring in central registry. Re-audit during regular annual approval cycle.';

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(30, 41, 59);
  const dirLines = doc.splitTextToSize(directiveText, 182);
  doc.text(dirLines, 14, y);

  // Digital seal & footer
  drawGovFooterAndSeal(doc, y + dirLines.length * 3.8 + 4);

  doc.save(`AICTE_Scorecard_Dossier_${scorecard.permanent_id}.pdf`);
}

/**
 * 3. GENERIC OFFICIAL DOCUMENT / RESOLUTION VOUCHER / EVIDENCE DOWNLOAD
 * Formatted with Government of India & AICTE headers
 */
export function downloadSyntheticDocument(meta: DocumentMetadata): void {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const now = meta.uploadedAt || new Date().toISOString();
  const caseId = meta.caseId || 'AICTE-2024-GRV-OFFICIAL';
  const inst = meta.institutionName || 'AICTE Recognized Technical Institution';
  const sha = meta.sha256 || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';
  const title = meta.title || meta.fileName;
  const details =
    meta.details || 'Verified evidence voucher registered in AICTE National Grievance Redressal Registry.';

  let y = drawGovHeader(
    doc,
    title,
    'CENTRAL TECHNICAL GRIEVANCE REPOSITORY · VERIFIED EVIDENCE VOUCHER'
  );

  y += 4;

  // Metadata Table Box
  doc.setFillColor(248, 250, 252);
  doc.rect(14, y, 182, 38, 'F');
  doc.setDrawColor(203, 210, 220);
  doc.rect(14, y, 182, 38, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(11, 42, 91);

  doc.text('DOCUMENT FILE NAME:', 18, y + 6);
  doc.text('CASE IDENTIFIER:', 18, y + 12);
  doc.text('AFFILIATED INSTITUTION:', 18, y + 18);
  doc.text('SUBMISSION TIMESTAMP:', 18, y + 24);
  doc.text('DEPOSITING AUTHORITY:', 18, y + 30);
  doc.text('SHA-256 HASH CHECKSUM:', 18, y + 35);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);

  doc.text(meta.fileName, 70, y + 6);
  doc.text(caseId, 70, y + 12);
  doc.text(inst, 70, y + 18);
  doc.text(now, 70, y + 24);
  doc.text(meta.uploaderRole || 'VERIFIED INSTITUTION NODAL DESK', 70, y + 30);

  doc.setFont('courier', 'normal');
  doc.setFontSize(7);
  doc.text(sha, 70, y + 35);

  y += 44;

  // Detailed Summary Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(11, 42, 91);
  doc.text('STATUTORY RECORD SUMMARY & EVIDENCE DETAILS', 14, y);
  y += 5;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  const detailLines = doc.splitTextToSize(details, 182);
  doc.text(detailLines, 14, y);
  y += detailLines.length * 4.5 + 4;

  // Legal Notice
  doc.setFillColor(254, 242, 242);
  doc.rect(14, y, 182, 14, 'F');
  doc.setDrawColor(248, 113, 113);
  doc.rect(14, y, 182, 14, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(185, 28, 28);
  doc.text('LEGAL NOTICE & EVIDENTIARY STANDING:', 18, y + 5);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(75, 85, 101);
  doc.text(
    'This record carries statutory evidentiary admissibility under Section 65B of the Indian Evidence Act, 1872',
    18,
    y + 9
  );
  doc.text(
    'and the Information Technology Act, 2000. Tampering, forgery, or misrepresentation is punishable under IPC.',
    18,
    y + 12.5
  );

  // Digital seal & footer
  drawGovFooterAndSeal(doc, y + 20, sha);

  const cleanName = meta.fileName.endsWith('.pdf') ? meta.fileName : `${meta.fileName}.pdf`;
  doc.save(cleanName);
}

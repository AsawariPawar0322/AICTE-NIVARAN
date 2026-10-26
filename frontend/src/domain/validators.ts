// ==========================================================================
// NIVARAN · Domain Validation & ATR Proof Review Rules (validators.ts)
// ==========================================================================

import { ResolutionDetails, Complaint } from './types';

export const MIN_REASON_LENGTH = 15;

export function validateReason(reason: string): { isValid: boolean; error?: string } {
  const trimmed = reason.trim();
  if (!trimmed) {
    return { isValid: false, error: 'A formal reason is required for administrative accountability.' };
  }
  if (trimmed.length < MIN_REASON_LENGTH) {
    return {
      isValid: false,
      error: `Reason must be at least ${MIN_REASON_LENGTH} characters (currently ${trimmed.length}).`
    };
  }
  return { isValid: true };
}

export interface AtrAuditFinding {
  code: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  title: string;
  description: string;
}

export function evaluateAtrQuality(
  complaint: Complaint,
  resolution: ResolutionDetails
): AtrAuditFinding[] {
  const findings: AtrAuditFinding[] = [];

  // Check 1: Proof document attached
  if (!resolution.proofDocument) {
    findings.push({
      code: 'MISSING_EVIDENCE',
      severity: 'HIGH',
      title: 'No Verification Document Attached',
      description: 'The Action Taken Report does not contain an attached evidence memo, challan, or receipt.'
    });
  }

  // Check 2: Fee refund complaints require concrete bank transaction reference (UTR)
  if (complaint.category === 'FEES_REFUND') {
    const textToCheck = `${resolution.atrSummary} ${resolution.claimedAction} ${resolution.refundAmount || ''}`;
    const hasUtr = /UTR|NEFT|RTGS|IMPS|TXN/i.test(textToCheck);
    if (!hasUtr) {
      findings.push({
        code: 'MISSING_UTR',
        severity: 'HIGH',
        title: 'Missing Bank Transaction Reference (UTR)',
        description: 'Fee refund claimed without verifiable NEFT/RTGS UTR or transaction confirmation number.'
      });
    }
  }

  // Check 3: Generic boilerplate phrases
  const boilerplateRegex = /(matter is resolved|under consideration|will be looked into|amicably settled|initiated processing)/i;
  if (boilerplateRegex.test(resolution.atrSummary) && !resolution.checklist.noBoilerplate) {
    findings.push({
      code: 'GENERIC_BOILERPLATE',
      severity: 'MEDIUM',
      title: 'Boilerplate / Evasive Phrase Detected',
      description: 'ATR summary matches generic non-committal closure phrasing.'
    });
  }

  // Check 4: Unresolved cross-bureau overlap
  if (complaint.overlapInfo?.hasOverlap && complaint.overlapInfo.status === 'UNREVIEWED') {
    findings.push({
      code: 'UNRESOLVED_OVERLAP',
      severity: 'HIGH',
      title: 'Unresolved Cross-Bureau Linked Case',
      description: 'This docket is linked to pending case(s). Closing without coordinating may leave identical grievances unresolved.'
    });
  }

  return findings;
}

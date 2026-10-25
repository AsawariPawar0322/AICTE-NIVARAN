export type ComplaintStatus =
  | 'REGISTERED'
  | 'UNDER_REVIEW'
  | 'INFO_REQUESTED'
  | 'ASSIGNED'
  | 'ACTION_IN_PROGRESS'
  | 'ESCALATED'
  | 'RESOLVED'
  | 'REJECTED';

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type BureauName =
  | 'Policy & Academic Planning Bureau (P&AP)'
  | 'Approval Bureau'
  | 'Student Development Bureau'
  | 'Faculty Development Bureau'
  | 'Finance & Accounts Bureau'
  | 'Skill Development Bureau';

export type ComplaintCategory =
  | 'Fee & Refund Irregularity'
  | 'Ragging & Harassment'
  | 'Admission Malpractice'
  | 'Scholarship & Financial Aid'
  | 'Faculty & Academic Misconduct'
  | 'Infrastructure & Safety Deficit'
  | 'Degree & Certificate Withholding'
  | 'Reservation & Quota Violation'
  | 'Other Grievance';

export type ComplainantRole = 'STUDENT' | 'FACULTY' | 'PARENT' | 'STAFF' | 'ALUMNI';

export interface EvidenceFile {
  id: string;
  name: string;
  fileType: string;
  sizeBytes: number;
  uploadedAt: string;
  sha256Hash: string;
  uploaderRole: 'COMPLAINANT' | 'INSTITUTION' | 'OFFICIAL';
  description: string;
  status: 'PENDING_REVIEW' | 'VERIFIED' | 'QUESTIONED' | 'DISMISSED';
}

export interface CaseStageEvent {
  id: string;
  stageName: string;
  timestamp: string;
  performedByRole: string;
  performedByName: string;
  actionTaken: string;
  nextExpectedStep: string;
  deadlineDate: string;
  isEscalated?: boolean;
  remarks?: string;
}

export interface InternalNote {
  id: string;
  authorName: string;
  authorBureau: string;
  timestamp: string;
  noteText: string;
  isConfidential: boolean;
}

export interface Complaint {
  id: string; // Noto Sans Mono, e.g. "AICTE-2024-GRV-8102"
  title: string;
  description: string;
  category: ComplaintCategory;
  urgency: UrgencyLevel;
  status: ComplaintStatus;
  complainantType: ComplainantRole;
  complainantName: string; // synthetic demo name or Anonymous
  complainantPhoneMasked: string; // e.g. +91 98*** **421
  complainantEmailMasked: string;
  
  problemId?: string;
  problemTitle?: string;
  pov?: string;
  similarityScore?: number;

  institutionId: string;
  institutionName: string;
  institutionPermanentId: string; // e.g. 1-332918231
  city: string;
  state: string;

  assignedBureau: BureauName;
  assignedOfficerName?: string;
  assignedOfficerRole?: string;

  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  daysRemaining: number;
  isOverdue: boolean;
  overdueDays?: number;

  evidenceCount: number;
  evidence: EvidenceFile[];

  timeline: CaseStageEvent[];
  notes: InternalNote[];

  relatedCaseIds: string[];
  overlapReasons?: string[];
  isPoolMember?: boolean;
  poolId?: string;
}

export interface OverlapCandidate {
  pairId: string;
  problemId: string;
  problemTitle: string;
  primaryCase: Complaint;
  relatedCase: Complaint;
  matchReasons: string[];
  confidenceScore: number;
  isLinked: boolean;
  tier?: 'PRIORITIZED' | 'MANUAL_REVIEW' | 'NO_MATCH';
  breakdown?: {
    permanent_id_match: boolean;
    institution_score: number;
    category_match: boolean;
    category_score: number;
    extracted_amount_match?: boolean | null;
    extracted_amount_str?: string | null;
    temporal_proximity_days: number;
    semantic_similarity_score: number;
    shared_keyphrases: string[];
  };
}

export interface Institution {
  id: string;
  permanentId: string; // AICTE Permanent ID (e.g. "1-45892110")
  name: string;
  institutionType: 'Engineering & Technology' | 'Management' | 'Pharmacy' | 'Architecture' | 'Polytechnic';
  address: string;
  city: string;
  state: string;
  pincode: string;
  region: 'Northern' | 'North-Western' | 'Central' | 'Western' | 'Eastern' | 'Southern' | 'South-Western';
  lat: number;
  lng: number;
  nodalOfficerName: string;
  nodalOfficerEmail: string;
  nodalOfficerPhone: string;
  activeCasesCount: number;
  resolvedCasesCount: number;
  oldestPendingDays: number;
  bureausInvolved: BureauName[];
  complianceScore: number; // 0 to 100
}

export interface ResolutionProofItem {
  id: string;
  complaintId: string;
  complaintTitle: string;
  institutionName: string;
  permanentId: string;
  submittedAt: string;
  submittedBy: string;
  proposedResolutionSummary: string;
  proofDocumentName: string;
  proofSha256: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'ACCEPTED_FOR_OTP' | 'DISPUTED' | 'REJECTED';
  reviewerRemarks?: string;
  reviewedAt?: string;
  reviewedBy?: string;
  complainantDisputeFiled?: boolean;
  disputeReason?: string;
  // Closure-Quality Scrutiny Metadata
  qualityScore?: number;
  qualityVerdict?: 'PASSED_QUALITY_GATE' | 'SUSPICIOUS_LOW_QUALITY' | 'FLAGGED_EVASIVE_CLOSURE';
  statusLabel?: string;
  canDispatchOtp?: boolean;
  extractedUtr?: string | null;
  riskFlags?: string[];
  scrutinyReasons?: string[];
  similarityToPastAtr?: number;
}

export interface ComplaintPoolGroup {
  id: string;
  title: string;
  category: ComplaintCategory;
  institutionName: string;
  permanentId: string;
  caseCount: number;
  voteCount: number;
  thresholdReached: boolean;
  thresholdCount: number;
  createdDate: string;
  lastVoteDate: string;
  status: 'OPEN_POOL' | 'UNDER_REVIEW' | 'FLAGGED_HIGH_CONCERN' | 'DISPERSED';
  summary: string;
  sampleCaseIds: string[];
}

export interface AdminMessage {
  id: string;
  complaintId: string;
  senderRole: 'AICTE_OFFICER' | 'INSTITUTION_NODAL' | 'COMPLAINANT';
  senderName: string;
  recipientRole: 'AICTE_OFFICER' | 'INSTITUTION_NODAL' | 'COMPLAINANT';
  messageText: string;
  sentAt: string;
  isRead: boolean;
  hasAttachment?: boolean;
  attachmentName?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorName: string;
  actorRole: string;
  bureau: string;
  action:
    | 'CASE_TRIAGED'
    | 'CASE_ASSIGNED'
    | 'STATUS_UPDATED'
    | 'INFO_REQUESTED'
    | 'CASE_ESCALATED'
    | 'RESOLUTION_APPROVED'
    | 'RESOLUTION_DISPUTED'
    | 'EVIDENCE_VERIFIED'
    | 'CASE_TRANSFERRED'
    | 'POOL_VOTED'
    | 'CONFIDENTIAL_NOTE_ADDED';
  targetCaseId?: string;
  targetEntity: string;
  details: string;
  ipAddress: string;
}

export interface AnalyticsSummary {
  totalReceived: number;
  totalResolved: number;
  totalPending: number;
  dueIn3Days: number;
  overdueCases: number;
  avgResolutionDays: number;
  bureauBreakdown: { bureau: string; count: number; overdue: number }[];
  categoryBreakdown: { category: string; count: number }[];
  monthlyTrend: { month: string; received: number; resolved: number }[];
  statusDistribution: { status: string; count: number }[];
  regionDistribution: { region: string; count: number }[];
}

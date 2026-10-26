// ==========================================================================
// NIVARAN · Unified Technical Grievance Coordination & Accountability System
// Core Domain Types & Data Contracts (SIH26264)
// ==========================================================================

export type GrievanceCategory =
  | 'FEES_REFUND'
  | 'CERTIFICATE_WITHHELD'
  | 'ANTI_RAGGING'
  | 'SEXUAL_HARASSMENT'
  | 'SCHOLARSHIP_AICTE'
  | 'FACULTY_INFRA'
  | 'ADMISSION_EXAM'
  | 'OTHER_UNSURE';

export const CATEGORY_LABELS: Record<GrievanceCategory, string> = {
  FEES_REFUND: 'Fee Refund & Excess Charges',
  CERTIFICATE_WITHHELD: 'Withholding of Certificates / Migration',
  ANTI_RAGGING: 'Anti-Ragging Incident',
  SEXUAL_HARASSMENT: 'Women Safety / ICC / Harassment',
  SCHOLARSHIP_AICTE: 'AICTE Pragati / Saksham / PMSSS Scholarship',
  FACULTY_INFRA: 'Faculty Shortage & Lab Infrastructure',
  ADMISSION_EXAM: 'Admission Irregularity / Exam Conduct',
  OTHER_UNSURE: 'General Technical Grievance / Other'
};

export type StageKey =
  | 'SUBMITTED'             // Stage 1: Created, receipt acknowledged
  | 'VERIFICATION'          // Stage 2: Jurisdiction & AICTE Permanent ID validated
  | 'ASSIGNED'              // Stage 3: Bureau and Officer allocated
  | 'UNDER_ACTION'          // Stage 4: Investigation & statutory inquiries
  | 'RESOLUTION_PROPOSED'   // Stage 5: ATR submitted by college/officer
  | 'AWAITING_CONFIRMATION' // Stage 6: ATR proof verified; Complainant confirmation pending
  | 'DISPUTED'              // Stage 7: Complainant disputed resolution; escalated
  | 'CLOSED';               // Stage 8: Verified resolution closed with tamper-evident audit

export interface StageMeta {
  label: string;
  step: number;
  description: string;
  badgeClass: string;
}

export const STAGE_CONFIG: Record<StageKey, StageMeta> = {
  SUBMITTED: {
    label: 'Submitted',
    step: 1,
    description: 'Docket registered and cryptographically stamped',
    badgeClass: 'badge-submitted'
  },
  VERIFICATION: {
    label: 'Verification',
    step: 2,
    description: 'Jurisdiction & AICTE Permanent ID checks',
    badgeClass: 'badge-verification'
  },
  ASSIGNED: {
    label: 'Assigned',
    step: 3,
    description: 'Allocated to Bureau and Nodal Officer',
    badgeClass: 'badge-assigned'
  },
  UNDER_ACTION: {
    label: 'Under Action',
    step: 4,
    description: 'Statutory inquiries & formal notice issued',
    badgeClass: 'badge-investigation'
  },
  RESOLUTION_PROPOSED: {
    label: 'Resolution Proposed',
    step: 5,
    description: 'Action Taken Report (ATR) received from institution',
    badgeClass: 'badge-proposed'
  },
  AWAITING_CONFIRMATION: {
    label: 'Awaiting Confirmation',
    step: 6,
    description: 'ATR verified; Complainant validation required',
    badgeClass: 'badge-confirmation'
  },
  DISPUTED: {
    label: 'Disputed / Escalated',
    step: 7,
    description: 'Complainant contested outcome; escalated to PGRC Higher Bench',
    badgeClass: 'badge-disputed'
  },
  CLOSED: {
    label: 'Closed & Verified',
    step: 8,
    description: 'Verified resolution archived in immutable audit log',
    badgeClass: 'badge-resolved'
  }
};

export type BureauKey =
  | 'PGRC'
  | 'REGIONAL_OFFICE'
  | 'APPROVAL_BUREAU'
  | 'ANTI_RAGGING'
  | 'WOMEN_CELL'
  | 'STUDENT_WELFARE';

export const BUREAU_LABELS: Record<BureauKey, string> = {
  PGRC: 'Public Grievance Redressal Cell (PGRC)',
  REGIONAL_OFFICE: 'AICTE Regional Office',
  APPROVAL_BUREAU: 'Quality Assurance & Approval Bureau',
  ANTI_RAGGING: 'Central Anti-Ragging Cell',
  WOMEN_CELL: 'Internal Complaints Committee (ICC)',
  STUDENT_WELFARE: 'Student Welfare & Scholarship Bureau'
};

export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  sha256Hash: string;
  uploadDate: string;
  previewUrl?: string;
  verificationStatus?: 'VERIFIED' | 'SUSPECT' | 'PENDING';
}

export interface TimelineEvent {
  id: string;
  title: string;
  description: string;
  actor: string;
  role: string;
  timestamp: string;
  stage: StageKey;
}

export interface AuditEvent {
  id: string;
  caseId: string;
  actor: string;
  role: string;
  action: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
  timestamp: string;
  previousHash: string;
  currentHash: string;
}

export type MessageKind =
  | 'text'                // normal message from either side
  | 'clarification'       // official remark issued by the officer
  | 'document_request'    // officer asks the complainant for files
  | 'document_submission' // complainant answers a request with files
  | 'system';             // automated notice

export interface DocumentRequest {
  id: string;
  items: string[];
  note?: string;
  dueDate?: string;
  status: 'pending' | 'fulfilled';
  fulfilledAt?: string;
  fulfilledFileIds?: string[];
}

export interface UserAdminMessage {
  id: string;
  caseId?: string;
  complaintId?: string;
  kind?: MessageKind;
  senderRole: 'complainant' | 'officer' | 'system';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachmentName?: string;
  attachments?: EvidenceFile[];
  documentRequest?: DocumentRequest;
  replyToRequestId?: string;
  isOfficialNote?: boolean;
  readByOfficer?: boolean;
  readByComplainant?: boolean;
}

export type ConversationMap = Record<string, UserAdminMessage[]>;
export type ConversationReader = 'officer' | 'complainant';
export type NewTimelineEvent = Omit<TimelineEvent, 'id' | 'timestamp' | 'stage'> & { stage?: StageKey };

export interface DiscordServer {
  id: string;
  name: string;
  iconText: string;
  unreadCount?: number;
  category: string;
}

export interface DiscordChannel {
  id: string;
  serverId: string;
  name: string;
  type: 'text' | 'voice';
  description?: string;
}

export interface DiscordMessage {
  id: string;
  channelId: string;
  author: {
    name: string;
    roleTag: string;
    roleColor: string;
    avatarBg: string;
  };
  timestamp: string;
  content: string;
  embedCard?: {
    title: string;
    description: string;
    color: string;
    fields?: { name: string; value: string }[];
  };
}

export interface DiscordMember {
  id: string;
  name: string;
  roleTag: string;
  roleColor: string;
  isOnline: boolean;
  statusText?: string;
}

export interface SlaClock {
  hoursRemaining: number;
  isOverdue: boolean;
  overdueHours?: number;
  ageingDays: number;
  dueTimestamp: string;
  status: 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE' | 'PAUSED';
}

export interface OverlapInfo {
  hasOverlap: boolean;
  relatedCaseIds: string[];
  matchScore: number; // e.g. 91
  matchRationale: string[];
  status: 'UNREVIEWED' | 'CONFIRMED' | 'REJECTED';
  leadBureau?: BureauKey;
  decisionReason?: string;
  decidedBy?: string;
  decidedAt?: string;
}

export interface ResolutionDetails {
  atrSummary: string;
  claimedAction: string;
  refundAmount?: string;
  officialOrderRef?: string;
  proposedAt: string;
  proofDocument?: EvidenceFile;
  
  checklist: {
    supportingProofAttached: boolean;
    correspondsToComplaint: boolean;
    concreteOutcome: boolean;
    noBoilerplate: boolean;
    noUnresolvedLinkedCases: boolean;
  };

  validatorFindings: {
    status: 'PASS' | 'FLAGGED' | 'NEEDS_VERIFICATION';
    notes: string;
    details?: string[];
  };

  complainantConfirmation?: {
    status: 'CONFIRMED' | 'DISPUTED' | 'PENDING';
    feedback?: string;
    disputeReason?: string;
    rating?: number;
    confirmedAt?: string;
  };
}

export interface Complaint {
  id: string; // e.g. NIV-2026-1042
  title: string;
  category: GrievanceCategory;
  categoryLabel: string;
  institutionName: string;
  aictePermanentId: string;
  city: string;
  state: string;

  // Complainant Details (Role-masked when viewed by unauthorized viewers)
  complainantName: string;
  complainantRole: 'Student' | 'Faculty' | 'Parent' | 'Anonymous';
  contactMobile: string;
  contactEmail: string;
  isAnonymous: boolean;
  details: string;

  // Lifecycle
  currentStage: StageKey;
  stageNumber: number; // 1 to 8
  bureau: BureauKey;

  assignedOfficer: {
    name: string;
    designation: string;
    bureau: string;
    badgeVerified: boolean;
    email?: string;
    phone?: string;
  };

  slaClock: SlaClock;
  overlapInfo?: OverlapInfo;
  resolutionDetails?: ResolutionDetails;
  evidenceList: EvidenceFile[];
  timeline: TimelineEvent[];
  auditEvents: AuditEvent[];
  messages: UserAdminMessage[];

  joinedComplainantsCount?: number;
  parentCaseId?: string;
  submittedAt: string;
  lastActivity: string;

  // Compatibility fields for citizen views and tests
  resolutionProposedDetails?: {
    atrSummary: string;
    proposedRemedy: string;
    refundAmount?: string;
    officialOrderRef: string;
    proposedAt: string;
  };
  otpVerification?: {
    generatedOtp: string;
    isVerified: boolean;
    verifiedAt?: string;
    citizenFeedback?: string;
    rating?: number;
  };
  relatedCaseCount?: number;
  slaHoursRemaining?: number;
}

export interface Institution {
  id: string;
  permanentId: string;
  name: string;
  state: string;
  city: string;
  category: 'Technical' | 'Management' | 'Pharmacy' | 'Architecture';
  openCasesCount: number;
  overdueCasesCount: number;
  reopenedCasesCount: number;
  overlapClustersCount: number;
  complianceRating: string;
  inspectionPriority: 'Low' | 'Medium' | 'High';
  contributingRiskIndicators: string[];
  lastInspectionDate?: string;
}

export interface UserProfile {
  id: string;
  name: string;
  role: 'Student' | 'Faculty' | 'Parent' | 'AICTE Official' | 'Institute Nodal Officer';
  portalType: 'citizen' | 'official';
  email: string;
  mobile?: string;
  institutionName?: string;
  aictePermanentId?: string;
  bureau?: BureauKey;
  designation?: string;
}

// Navigation & Routing Types
export type NavTab =
  | 'home'
  | 'submit'
  | 'my-complaints'
  | 'complaint-detail'
  | 'track'
  | 'discovery'
  | 'resolution-confirm'
  | 'admin'
  | 'admin-inbox'
  | 'hub'
  | 'citizen-login'
  | 'admin-login'
  | 'ui';

export interface RouteMeta {
  tab: NavTab;
  title: string;
  roleRequired?: 'citizen' | 'official' | 'any';
  breadcrumb: string[];
}

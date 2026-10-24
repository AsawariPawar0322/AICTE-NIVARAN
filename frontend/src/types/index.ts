// ==========================================================================
// AICTE Grievance Coordination System · Data Type Definitions
// ==========================================================================

export type GrievanceCategory = 
  | 'FEES_REFUND'
  | 'ANTI_RAGGING'
  | 'SEXUAL_HARASSMENT'
  | 'SCHOLARSHIP_AICTE'
  | 'FACULTY_INFRA'
  | 'ADMISSION_EXAM'
  | 'OTHER_UNSURE';

export type StageKey = 
  | 'REGISTERED'
  | 'ALLOTTED'
  | 'INVESTIGATION'
  | 'RESOLUTION_PROPOSED'
  | 'PENDING_OTP'
  | 'RESOLVED'
  | 'ESCALATED';

export interface EvidenceFile {
  id: string;
  name: string;
  size: number;
  type: string;
  sha256Hash: string;
  uploadDate: string;
  previewUrl?: string;
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

export interface Complaint {
  id: string; // e.g. AICTE-2026-GRV-84920
  title: string;
  category: GrievanceCategory;
  categoryLabel: string;
  institutionName: string;
  aictePermanentId: string;
  city: string;
  state: string;
  complainantName: string;
  complainantRole: 'Student' | 'Faculty' | 'Parent' | 'Anonymous';
  contactMobile: string;
  contactEmail: string;
  isAnonymous: boolean;
  details: string;
  currentStage: StageKey;
  stageNumber: number; // 1 to 6
  slaHoursRemaining: number;
  assignedOfficer: {
    name: string;
    designation: string;
    bureau: string;
    badgeVerified: boolean;
  };
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
  evidenceList: EvidenceFile[];
  timeline: TimelineEvent[];
  relatedCaseCount?: number;
}

export interface Institution {
  id: string;
  permanentId: string;
  name: string;
  state: string;
  city: string;
  category: 'Technical' | 'Management' | 'Pharmacy' | 'Architecture';
  openCasesCount: number;
  complianceRating: string;
}

export interface UserAdminMessage {
  id: string;
  senderRole: 'complainant' | 'officer' | 'system';
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachmentName?: string;
  isOfficialNote?: boolean;
}

// Discord Replica Hub Types
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
    roleTag: string; // 'AICTE Officer', 'Student Rep', 'Bot', 'Counsel'
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

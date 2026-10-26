// ==========================================================================
// Institutional Grievance Graph · Data Models & Type Definitions
// ==========================================================================
export type ClusterStatus = 'NEEDS_REVIEW' | 'CONFIRMED_LINK' | 'UNDER_INVESTIGATION' | 'CLOSED';
export type RecommendationTier = 'PRIORITIZED' | 'MANUAL_REVIEW' | 'NO_MATCH';

export interface TimelineEvent {
  date: string;
  type: 'COMPLAINT_FILED' | 'AI_CORRELATION' | 'OFFICER_REVIEW' | 'INQUIRY_OPENED' | 'EVIDENCE_VERIFIED' | 'DECISION_ISSUED';
  label: string;
  docketId?: string;
  description: string;
}

export interface GraphGrievanceNode {
  id: string; // e.g. "AICTE-2024-GRV-8102"
  shortId: string; // e.g. "G-8102"
  clusterId: string;
  title: string;
  category: string;
  status: string;
  urgency: string;
  submittedAt: string;
  complainantName: string;
  complainantRole: 'STUDENT' | 'PARENT' | 'FACULTY' | 'ALUMNI';
  disputedAmount?: string;
  assignedBureau: string;
  description: string;
  evidenceCount: number;
}

export interface GraphClusterNode {
  id: string; // e.g. "cluster-diet-fee"
  institutionId: string;
  title: string;
  category: string;
  status: ClusterStatus;
  tier: RecommendationTier;
  confidenceScore: number;
  firstDetected: string;
  complaintsCount: number;
  disputedAmount?: string;
  whyLinked: string[];
  timeline: TimelineEvent[];
  complaintIds: string[];
}

export interface GraphInstitutionNode {
  id: string;
  name: string;
  shortName: string;
  permanentId: string;
  city: string;
  state: string;
  totalGrievances: number;
  openInvestigations: number;
  confirmedClusters: number;
  clusters: GraphClusterNode[];
}

export type SelectedNodeType = 'INSTITUTION' | 'CLUSTER' | 'GRIEVANCE' | null;

export interface SelectedNodeState {
  type: SelectedNodeType;
  institution?: GraphInstitutionNode;
  cluster?: GraphClusterNode;
  grievance?: GraphGrievanceNode;
}

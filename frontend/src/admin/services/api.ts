import {
  Complaint,
  Institution,
  ResolutionProofItem,
  ComplaintPoolGroup,
  AdminMessage,
  AuditLogEntry,
  AnalyticsSummary,
  ComplaintStatus,
  BureauName,
  OverlapCandidate,
} from '../types';
import {
  MOCK_COMPLAINTS,
  MOCK_INSTITUTIONS,
  MOCK_RESOLUTION_PROOFS,
  MOCK_COMPLAINT_POOLS,
  MOCK_MESSAGES,
  MOCK_AUDIT_LOGS,
  MOCK_ANALYTICS,
} from '../mock/data';

const STORAGE_KEYS = {
  COMPLAINTS: 'aicte_grievance_complaints_v4',
  PROOFS: 'aicte_grievance_proofs_v2',
  POOLS: 'aicte_grievance_pools_v2',
  MESSAGES: 'aicte_grievance_messages_v2',
  AUDIT: 'aicte_grievance_audit_v2',
  INSTITUTIONS: 'aicte_grievance_institutions_v2',
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Storage save failed:', err);
  }
}

// In-memory data initialized from mock or localStorage
let complaintsCache: Complaint[] = loadFromStorage(STORAGE_KEYS.COMPLAINTS, MOCK_COMPLAINTS);
if (!complaintsCache.some((c) => c.id === 'AICTE-2026-GRV-84920')) {
  complaintsCache = [...MOCK_COMPLAINTS];
  saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
}
let institutionsCache: Institution[] = loadFromStorage(STORAGE_KEYS.INSTITUTIONS, MOCK_INSTITUTIONS);
let proofsCache: ResolutionProofItem[] = loadFromStorage(STORAGE_KEYS.PROOFS, MOCK_RESOLUTION_PROOFS);
let poolsCache: ComplaintPoolGroup[] = loadFromStorage(STORAGE_KEYS.POOLS, MOCK_COMPLAINT_POOLS);
let messagesCache: AdminMessage[] = loadFromStorage(STORAGE_KEYS.MESSAGES, MOCK_MESSAGES);
let auditCache: AuditLogEntry[] = loadFromStorage(STORAGE_KEYS.AUDIT, MOCK_AUDIT_LOGS);

export interface ComplaintFilterParams {
  status?: string;
  bureau?: string;
  query?: string;
  urgency?: string;
  isOverdue?: boolean;
  dueSoon?: boolean;
  institutionId?: string;
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'slaDeadline' | 'urgency' | 'status' | 'id';
  sortDir?: 'asc' | 'desc';
}

export const apiService = {
  // Complaints
  async getComplaints(params: ComplaintFilterParams = {}) {
    let result = [...complaintsCache];

    if (params.query) {
      const q = params.query.toLowerCase().trim();
      result = result.filter(
        (c) =>
          c.id.toLowerCase().includes(q) ||
          c.title.toLowerCase().includes(q) ||
          c.institutionName.toLowerCase().includes(q) ||
          c.institutionPermanentId.toLowerCase().includes(q) ||
          c.city.toLowerCase().includes(q) ||
          c.category.toLowerCase().includes(q)
      );
    }

    if (params.status && params.status !== 'ALL') {
      result = result.filter((c) => c.status === params.status);
    }

    if (params.bureau && params.bureau !== 'ALL') {
      result = result.filter((c) => c.assignedBureau.includes(params.bureau!));
    }

    if (params.urgency && params.urgency !== 'ALL') {
      result = result.filter((c) => c.urgency === params.urgency);
    }

    if (params.institutionId) {
      result = result.filter((c) => c.institutionId === params.institutionId);
    }

    if (params.isOverdue) {
      result = result.filter((c) => c.isOverdue);
    }

    if (params.dueSoon) {
      result = result.filter((c) => !c.isOverdue && c.daysRemaining <= 3 && c.daysRemaining >= 0 && c.status !== 'RESOLVED');
    }

    // Sort
    const sortBy = params.sortBy || 'createdAt';
    const sortDir = params.sortDir || 'desc';
    result.sort((a, b) => {
      let valA = a[sortBy] ?? '';
      let valB = b[sortBy] ?? '';
      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const page = params.page || 1;
    const limit = params.limit || 10;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      items: paginated,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    };
  },

  async getComplaintById(id: string): Promise<Complaint | null> {
    const found = complaintsCache.find((c) => c.id.toLowerCase() === id.toLowerCase());
    return found ? { ...found } : null;
  },

  async getVerificationQueue() {
    return complaintsCache.filter(
      (c) => c.status === 'REGISTERED' || c.status === 'UNDER_REVIEW'
    );
  },

  async verifyComplaint(
    id: string,
    action: 'APPROVE' | 'REJECT' | 'REQUEST_INFO',
    reason?: string
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    let newStatus: ComplaintStatus = current.status;
    let actionLabel = '';

    if (action === 'APPROVE') {
      newStatus = 'ASSIGNED';
      actionLabel = 'Verified and admitted into active investigation queue';
    } else if (action === 'REJECT') {
      newStatus = 'REJECTED';
      actionLabel = `Rejected during initial intake triage: ${reason || 'Outside AICTE statutory mandate'}`;
    } else {
      newStatus = 'INFO_REQUESTED';
      actionLabel = `Clarification requested from complainant: ${reason || 'Additional supporting documentation required'}`;
    }

    const updatedTimeline = [
      ...current.timeline,
      {
        id: `st-${Date.now()}`,
        stageName: action === 'APPROVE' ? 'Intake Verified' : action === 'REJECT' ? 'Intake Rejected' : 'Clarification Requested',
        timestamp: new Date().toISOString(),
        performedByRole: 'Central Grievance Verification Officer',
        performedByName: 'Officer S. Khurana',
        actionTaken: actionLabel,
        nextExpectedStep: action === 'APPROVE' ? 'Notice to Institution Nodal Officer' : 'Awaiting Complainant Clarification',
        deadlineDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
    ];

    const updated: Complaint = {
      ...current,
      status: newStatus,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: current.assignedBureau,
      action: action === 'APPROVE' ? 'CASE_TRIAGED' : 'STATUS_UPDATED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Action: ${action}. ${reason || ''}`,
    });

    return updated;
  },

  async updateComplaintStatus(
    id: string,
    status: ComplaintStatus,
    reason: string
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    const updatedTimeline = [
      ...current.timeline,
      {
        id: `st-${Date.now()}`,
        stageName: `Status changed to ${status.replace(/_/g, ' ')}`,
        timestamp: new Date().toISOString(),
        performedByRole: current.assignedOfficerRole || 'Central Bureau Officer',
        performedByName: current.assignedOfficerName || 'Assigned Officer',
        actionTaken: reason,
        nextExpectedStep: 'Follow-up on institutional compliance action',
        deadlineDate: new Date(Date.now() + 7 * 86400000).toISOString(),
      },
    ];

    const updated: Complaint = {
      ...current,
      status,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
      isOverdue: status === 'RESOLVED' ? false : current.isOverdue,
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: current.assignedBureau,
      action: 'STATUS_UPDATED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Updated status to ${status}. Reason: ${reason}`,
    });

    return updated;
  },

  async requestAdditionalInfo(
    id: string,
    question: string,
    recipient: 'COMPLAINANT' | 'INSTITUTION'
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    const updatedTimeline = [
      ...current.timeline,
      {
        id: `st-${Date.now()}`,
        stageName: `Information Requested from ${recipient}`,
        timestamp: new Date().toISOString(),
        performedByRole: current.assignedOfficerRole || 'AICTE Officer',
        performedByName: current.assignedOfficerName || 'Central Officer',
        actionTaken: `Notice dispatched: "${question}"`,
        nextExpectedStep: `Response due from ${recipient} within 72 hours`,
        deadlineDate: new Date(Date.now() + 3 * 86400000).toISOString(),
      },
    ];

    const updated: Complaint = {
      ...current,
      status: 'INFO_REQUESTED',
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    // Also inject mock message
    const msg: AdminMessage = {
      id: `msg-${Date.now()}`,
      complaintId: id,
      senderRole: 'AICTE_OFFICER',
      senderName: 'Dr. Sanjeev Khurana',
      recipientRole: recipient === 'COMPLAINANT' ? 'COMPLAINANT' : 'INSTITUTION_NODAL',
      messageText: `[OFFICIAL NOTICE - 72 HOUR SLA] ${question}`,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    messagesCache.push(msg);
    saveToStorage(STORAGE_KEYS.MESSAGES, messagesCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: current.assignedBureau,
      action: 'INFO_REQUESTED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Dispatched formal clarification query to ${recipient}: ${question}`,
    });

    return updated;
  },

  async transferComplaint(
    id: string,
    targetBureau: BureauName,
    targetOfficer: string,
    reason: string
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    const updatedTimeline = [
      ...current.timeline,
      {
        id: `st-${Date.now()}`,
        stageName: `Transferred to ${targetBureau}`,
        timestamp: new Date().toISOString(),
        performedByRole: current.assignedOfficerRole || 'Central Desk',
        performedByName: 'Officer S. Khurana',
        actionTaken: `Case jurisdiction reassigned to ${targetBureau}. Reason: ${reason}`,
        nextExpectedStep: `Primary review by ${targetOfficer}`,
        deadlineDate: new Date(Date.now() + 5 * 86400000).toISOString(),
      },
    ];

    const updated: Complaint = {
      ...current,
      assignedBureau: targetBureau,
      assignedOfficerName: targetOfficer,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: targetBureau,
      action: 'CASE_TRANSFERRED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Jurisdiction transferred to ${targetBureau} (${targetOfficer}). Reason: ${reason}`,
    });

    return updated;
  },

  async escalateComplaint(
    id: string,
    level: string,
    reason: string
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    const updatedTimeline = [
      ...current.timeline,
      {
        id: `st-${Date.now()}`,
        stageName: `Escalated to ${level}`,
        timestamp: new Date().toISOString(),
        performedByRole: 'Accountability Engine / Nodal Officer',
        performedByName: 'Dr. Sanjeev Khurana',
        actionTaken: `Escalated due to SLA non-compliance or critical nature. Reason: ${reason}`,
        nextExpectedStep: `Executive directive from ${level}`,
        deadlineDate: new Date(Date.now() + 3 * 86400000).toISOString(),
        isEscalated: true,
      },
    ];

    const updated: Complaint = {
      ...current,
      status: 'ESCALATED',
      urgency: 'CRITICAL',
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: current.assignedBureau,
      action: 'CASE_ESCALATED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Escalated to ${level}. Reason: ${reason}`,
    });

    return updated;
  },

  async recordDecision(
    id: string,
    decision: 'RESOLVED' | 'REJECTED',
    justification: string
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    const updatedTimeline = [
      ...current.timeline,
      {
        id: `st-${Date.now()}`,
        stageName: decision === 'RESOLVED' ? 'Final Resolution Recorded' : 'Final Rejection Recorded',
        timestamp: new Date().toISOString(),
        performedByRole: 'Bureau Appellate Authority',
        performedByName: 'Dr. Sanjeev Khurana',
        actionTaken: justification,
        nextExpectedStep: 'Case closed. 30-day appellate window active.',
        deadlineDate: new Date().toISOString(),
      },
    ];

    const updated: Complaint = {
      ...current,
      status: decision,
      isOverdue: false,
      updatedAt: new Date().toISOString(),
      timeline: updatedTimeline,
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: current.assignedBureau,
      action: decision === 'RESOLVED' ? 'RESOLUTION_APPROVED' : 'STATUS_UPDATED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Formal ${decision} order recorded. Justification: ${justification}`,
    });

    return updated;
  },

  async addInternalNote(
    id: string,
    noteText: string,
    isConfidential: boolean
  ): Promise<Complaint> {
    const idx = complaintsCache.findIndex((c) => c.id === id);
    if (idx === -1) throw new Error(`Complaint ${id} not found`);

    const current = complaintsCache[idx];
    const newNote = {
      id: `note-${Date.now()}`,
      authorName: 'Dr. Sanjeev Khurana',
      authorBureau: current.assignedBureau,
      timestamp: new Date().toISOString(),
      noteText,
      isConfidential,
    };

    const updated: Complaint = {
      ...current,
      notes: [newNote, ...current.notes],
      updatedAt: new Date().toISOString(),
    };

    complaintsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Central Grievance Officer',
      bureau: current.assignedBureau,
      action: 'CONFIDENTIAL_NOTE_ADDED',
      targetCaseId: id,
      targetEntity: current.institutionName,
      details: `Appended internal note (Confidential: ${isConfidential})`,
    });

    return updated;
  },

  // Related Cases
  async linkCases(primaryId: string, relatedId: string) {
    const c1 = complaintsCache.find((c) => c.id === primaryId);
    const c2 = complaintsCache.find((c) => c.id === relatedId);
    if (c1 && !c1.relatedCaseIds.includes(relatedId)) {
      c1.relatedCaseIds.push(relatedId);
    }
    if (c2 && !c2.relatedCaseIds.includes(primaryId)) {
      c2.relatedCaseIds.push(primaryId);
    }
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
    return true;
  },

  async unlinkCases(primaryId: string, targetId: string) {
    const c1 = complaintsCache.find((c) => c.id === primaryId);
    const c2 = complaintsCache.find((c) => c.id === targetId);
    if (c1) {
      c1.relatedCaseIds = c1.relatedCaseIds.filter((id) => id !== targetId);
    }
    if (c2) {
      c2.relatedCaseIds = c2.relatedCaseIds.filter((id) => id !== primaryId);
    }
    saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
    return true;
  },

  async getOverlapCandidates(): Promise<OverlapCandidate[]> {
    const items = [...complaintsCache];
    const pairs: OverlapCandidate[] = [];
    const seenPairs = new Set<string>();

    // 1. Group by problemId where two cases represent the same problem from different POVs
    const problemMap = new Map<string, Complaint[]>();
    for (const c of items) {
      if (c.problemId) {
        if (!problemMap.has(c.problemId)) {
          problemMap.set(c.problemId, []);
        }
        problemMap.get(c.problemId)!.push(c);
      }
    }

    // Generate candidates for each problem cluster
    for (const [probId, list] of problemMap.entries()) {
      if (list.length >= 2) {
        for (let i = 0; i < list.length; i++) {
          for (let j = i + 1; j < list.length; j++) {
            const c1 = list[i];
            const c2 = list[j];
            const pairKey = [c1.id, c2.id].sort().join('__');
            if (seenPairs.has(pairKey)) continue;
            seenPairs.add(pairKey);

            const isLinked = c1.relatedCaseIds.includes(c2.id) || c2.relatedCaseIds.includes(c1.id);
            const score = c1.similarityScore || c2.similarityScore || 85;

            const reasons: string[] = [];
            if (c1.overlapReasons && c1.overlapReasons.length > 0) {
              reasons.push(...c1.overlapReasons);
            } else {
              reasons.push(`Same respondent institution (${c1.institutionName})`);
              reasons.push(`Identical problem: ${c1.problemTitle || c1.title}`);
              if (c1.pov && c2.pov) {
                reasons.push(`Different POV: ${c1.pov} ↔ ${c2.pov}`);
              }
            }

            pairs.push({
              pairId: `${c1.id}__${c2.id}`,
              problemId: probId,
              problemTitle: c1.problemTitle || c2.problemTitle || c1.title,
              primaryCase: c1,
              relatedCase: c2,
              matchReasons: reasons,
              confidenceScore: score,
              isLinked,
            });
          }
        }
      }
    }

    // 2. Also check any cases that are already explicitly linked via relatedCaseIds but might not have problemId
    for (let i = 0; i < items.length; i++) {
      for (let j = i + 1; j < items.length; j++) {
        const c1 = items[i];
        const c2 = items[j];
        const pairKey = [c1.id, c2.id].sort().join('__');
        if (seenPairs.has(pairKey)) continue;

        const isLinked = c1.relatedCaseIds.includes(c2.id) || c2.relatedCaseIds.includes(c1.id);
        if (isLinked) {
          seenPairs.add(pairKey);
          pairs.push({
            pairId: `${c1.id}__${c2.id}`,
            problemId: c1.problemId || c2.problemId || 'PROB-CROSS-BUREAU',
            problemTitle: c1.problemTitle || c1.title,
            primaryCase: c1,
            relatedCase: c2,
            matchReasons: c1.overlapReasons || [
              `Directly coordinated docket association`,
              `Bureau overlap: ${c1.assignedBureau} ↔ ${c2.assignedBureau}`,
            ],
            confidenceScore: c1.similarityScore || 80,
            isLinked: true,
          });
        }
      }
    }

    // Sort by confidenceScore descending
    pairs.sort((a, b) => b.confidenceScore - a.confidenceScore);
    return pairs;
  },

  // Institutions
  async getInstitutions(query?: string, region?: string) {
    let result = [...institutionsCache];
    if (query) {
      const q = query.toLowerCase().trim();
      result = result.filter(
        (inst) =>
          inst.name.toLowerCase().includes(q) ||
          inst.permanentId.toLowerCase().includes(q) ||
          inst.city.toLowerCase().includes(q) ||
          inst.state.toLowerCase().includes(q)
      );
    }
    if (region && region !== 'ALL') {
      result = result.filter((inst) => inst.region === region);
    }
    return result;
  },

  async getInstitutionById(id: string): Promise<Institution | null> {
    const found = institutionsCache.find(
      (inst) => inst.id === id || inst.permanentId === id
    );
    return found ? { ...found } : null;
  },

  // Resolution Proofs
  async getResolutionProofs() {
    return [...proofsCache];
  },

  async reviewResolutionProof(
    proofId: string,
    decision: 'ACCEPTED' | 'DISPUTED' | 'REJECTED',
    remarks: string
  ) {
    const idx = proofsCache.findIndex((p) => p.id === proofId);
    if (idx === -1) throw new Error(`Proof ${proofId} not found`);

    const current = proofsCache[idx];
    const updated: ResolutionProofItem = {
      ...current,
      status: decision,
      reviewerRemarks: remarks,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Dr. Sanjeev Khurana (Reviewing Officer)',
    };

    proofsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.PROOFS, proofsCache);

    // If accepted, update related complaint to RESOLVED
    if (decision === 'ACCEPTED') {
      const cIdx = complaintsCache.findIndex((c) => c.id === current.complaintId);
      if (cIdx !== -1) {
        complaintsCache[cIdx].status = 'RESOLVED';
        complaintsCache[cIdx].isOverdue = false;
        saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
      }
    }

    this.addAuditLog({
      actorName: 'Dr. Sanjeev Khurana',
      actorRole: 'Resolution Proof Inspector',
      bureau: 'Central Bureau',
      action: decision === 'DISPUTED' ? 'RESOLUTION_DISPUTED' : 'RESOLUTION_APPROVED',
      targetCaseId: current.complaintId,
      targetEntity: current.institutionName,
      details: `Resolution proof marked as ${decision}. Remarks: ${remarks}`,
    });

    return updated;
  },

  // Pools
  async getComplaintPools() {
    return [...poolsCache];
  },

  async voteInPool(poolId: string) {
    const idx = poolsCache.findIndex((p) => p.id === poolId);
    if (idx === -1) throw new Error(`Pool ${poolId} not found`);

    const pool = poolsCache[idx];
    pool.voteCount += 1;
    pool.lastVoteDate = new Date().toISOString().split('T')[0];
    if (pool.voteCount >= pool.thresholdCount) {
      pool.thresholdReached = true;
      if (pool.status === 'OPEN_POOL') {
        pool.status = 'FLAGGED_HIGH_CONCERN';
      }
    }

    saveToStorage(STORAGE_KEYS.POOLS, poolsCache);

    this.addAuditLog({
      actorName: 'Community Voting Module',
      actorRole: 'Voter System',
      bureau: 'Autonomous Pool Engine',
      action: 'POOL_VOTED',
      targetCaseId: poolId,
      targetEntity: pool.institutionName,
      details: `Affinity vote cast. Total votes: ${pool.voteCount} (Threshold: ${pool.thresholdCount})`,
    });

    return pool;
  },

  // Messages
  async getMessages(complaintId?: string) {
    if (complaintId) {
      return messagesCache.filter((m) => m.complaintId === complaintId);
    }
    return [...messagesCache];
  },

  async sendMessage(
    complaintId: string,
    messageText: string,
    recipientRole: 'INSTITUTION_NODAL' | 'COMPLAINANT' | 'AICTE_OFFICER'
  ) {
    const newMsg: AdminMessage = {
      id: `msg-${Date.now()}`,
      complaintId,
      senderRole: 'AICTE_OFFICER',
      senderName: 'Dr. Sanjeev Khurana (AICTE Regional Nodal Officer)',
      recipientRole,
      messageText,
      sentAt: new Date().toISOString(),
      isRead: false,
    };
    messagesCache.push(newMsg);
    saveToStorage(STORAGE_KEYS.MESSAGES, messagesCache);
    return newMsg;
  },

  // Audit Logs
  async getAuditLogs() {
    return [...auditCache].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  },

  addAuditLog(entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'ipAddress'>) {
    const fullEntry: AuditLogEntry = {
      ...entry,
      id: `aud-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      ipAddress: '10.24.8.19 (AICTE HQ LAN)',
    };
    auditCache = [fullEntry, ...auditCache];
    saveToStorage(STORAGE_KEYS.AUDIT, auditCache);
  },

  // Analytics
  async getAnalyticsSummary(): Promise<AnalyticsSummary> {
    const totalReceived = complaintsCache.length;
    const totalResolved = complaintsCache.filter((c) => c.status === 'RESOLVED').length;
    const totalPending = totalReceived - totalResolved;
    const overdueCases = complaintsCache.filter((c) => c.isOverdue).length;
    const dueIn3Days = complaintsCache.filter(
      (c) => !c.isOverdue && c.daysRemaining <= 3 && c.daysRemaining >= 0 && c.status !== 'RESOLVED'
    ).length;

    return {
      ...MOCK_ANALYTICS,
      totalReceived,
      totalResolved,
      totalPending,
      overdueCases,
      dueIn3Days,
    };
  },

  // Export to CSV helper
  exportComplaintsToCSV(items: Complaint[]) {
    const headers = [
      'Complaint ID',
      'Title',
      'Category',
      'Urgency',
      'Status',
      'Complainant Role',
      'Institution Name',
      'Permanent ID',
      'City',
      'State',
      'Assigned Bureau',
      'Assigned Officer',
      'Created Date',
      'SLA Deadline',
      'Days Remaining',
      'Overdue',
    ];

    const rows = items.map((c) => [
      `"${c.id}"`,
      `"${c.title.replace(/"/g, '""')}"`,
      `"${c.category}"`,
      `"${c.urgency}"`,
      `"${c.status}"`,
      `"${c.complainantType}"`,
      `"${c.institutionName.replace(/"/g, '""')}"`,
      `"${c.institutionPermanentId}"`,
      `"${c.city}"`,
      `"${c.state}"`,
      `"${c.assignedBureau}"`,
      `"${c.assignedOfficerName || 'Unassigned'}"`,
      `"${c.createdAt.split('T')[0]}"`,
      `"${c.slaDeadline.split('T')[0]}"`,
      c.daysRemaining,
      c.isOverdue ? 'YES' : 'NO',
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `AICTE_Grievance_Complaints_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};

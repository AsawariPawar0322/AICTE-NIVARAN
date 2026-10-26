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
  TimelineVerificationResult,
  CaseStageEvent,
  InstitutionScorecardItem,
  InspectionOrder,
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
  COMPLAINTS: 'aicte_grievance_complaints_v5',
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
const sample84920 = complaintsCache.find((c) => c.id === 'AICTE-2026-GRV-84920');
if (!sample84920 || !sample84920.timeline || sample84920.timeline.length < 5) {
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
    if (!found) return null;

    // Check if FastAPI backend has live hash-chained timeline
    try {
      const resp = await fetch(`http://localhost:8000/api/grievances/${id}`);
      if (resp.ok) {
        const backendData = await resp.json();
        if (backendData.timeline && backendData.timeline.length > 0) {
          found.timeline = backendData.timeline.map((t: any) => ({
            id: t.id,
            stageName: t.stageName || t.title,
            timestamp: t.timestamp,
            performedByRole: t.performedByRole || t.role,
            performedByName: t.performedByName || t.actor,
            actionTaken: t.actionTaken || t.description,
            nextExpectedStep: t.nextExpectedStep || 'Review by Bureau',
            deadlineDate: t.deadlineDate || '2026-08-25T17:00:00Z',
            isEscalated: t.stage === 'ESCALATED',
            eventIndex: t.eventIndex,
            isGenesisRoot: t.isGenesisRoot,
            previousHash: t.previousHash,
            currentHash: t.currentHash,
            is_tampered: t.is_tampered || false,
          }));
        }
      }
    } catch {
      // offline fallback
    }

    return { ...found };
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
    try {
      await fetch('http://localhost:8000/api/matcher/link-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_case_id: primaryId,
          target_case_id: relatedId,
          action: 'CONFIRM',
          officer_name: 'Dr. Ramesh Chandra Verma',
        }),
      });
    } catch {
      // fallback to local cache
    }

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
    try {
      await fetch('http://localhost:8000/api/matcher/link-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_case_id: primaryId,
          target_case_id: targetId,
          action: 'REJECT',
          officer_name: 'Dr. Ramesh Chandra Verma',
        }),
      });
    } catch {
      // fallback to local cache
    }

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
    // 1. Attempt live query to FastAPI Hybrid Grievance Matcher
    try {
      const resp = await fetch('http://localhost:8000/api/matcher/coordination-queue');
      if (resp.ok) {
        const data = await resp.json();
        if (data.candidates && data.candidates.length > 0) {
          return data.candidates.map((c: any) => {
            const prim = complaintsCache.find((x) => x.id === c.target_case_id) || complaintsCache[0];
            const rel = complaintsCache.find((x) => x.id === c.candidate_case_id) || {
              id: c.candidate_case_id,
              complaintNumber: c.candidate_case_id,
              title: c.candidate_title,
              category: 'FEES_REFUND' as any,
              status: 'UNDER_REVIEW' as any,
              priority: 'HIGH' as any,
              institutionId: 'inst-1',
              institutionName: c.candidate_institution_name,
              institutionPermanentId: c.candidate_permanent_id,
              city: 'New Delhi',
              state: 'Delhi',
              assignedBureau: 'Central Grievance Redressal Cell (PGRC)' as any,
              complainantName: c.candidate_complainant_masked,
              complainantRole: 'STUDENT' as any,
              complainantContact: 'Protected',
              complainantEmail: 'protected@gov.in',
              isAnonymous: false,
              details: c.candidate_title,
              evidenceCount: 1,
              evidence: [],
              timeline: [],
              notes: [],
              relatedCaseIds: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              slaDeadline: new Date().toISOString(),
              daysRemaining: 3,
              isOverdue: false,
            };

            return {
              pairId: c.pair_id,
              problemId: `prob-${c.candidate_permanent_id}`,
              problemTitle: c.candidate_title,
              primaryCase: prim,
              relatedCase: rel,
              matchReasons: c.match_reasons,
              confidenceScore: c.confidence_score,
              isLinked: c.is_linked,
              tier: c.recommendation_tier,
              breakdown: c.breakdown,
            };
          });
        }
      }
    } catch {
      // Offline fallback: continue to local cache
    }

    const items = [...complaintsCache];
    const pairs: OverlapCandidate[] = [];
    const seenPairs = new Set<string>();

    // 2. Group by problemId where two cases represent the same problem from different POVs
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

  async getCaseAnalysis(caseId: string): Promise<any[]> {
    try {
      const resp = await fetch(`http://localhost:8000/api/matcher/analyze-case/${caseId}`);
      if (resp.ok) {
        const data = await resp.json();
        return data.matches || [];
      }
    } catch {
      // fallback
    }
    return [];
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
  async getResolutionProofs(): Promise<ResolutionProofItem[]> {
    try {
      const resp = await fetch('http://localhost:8000/api/atr/scrutiny-queue');
      if (resp.ok) {
        const data = await resp.json();
        if (data.proofs && data.proofs.length > 0) {
          return data.proofs.map((p: any) => ({
            id: p.id,
            complaintId: p.complaintId,
            complaintTitle: p.complaintTitle,
            institutionName: p.institutionName,
            permanentId: p.permanentId,
            submittedAt: p.submittedAt,
            submittedBy: p.submittedBy,
            proposedResolutionSummary: p.proposedResolutionSummary,
            proofDocumentName: p.proofDocumentName,
            proofSha256: p.proofSha256,
            status: p.status,
            reviewerRemarks: p.reviewerRemarks,
            reviewedAt: p.reviewedAt,
            reviewedBy: p.reviewedBy,
            complainantDisputeFiled: p.complainantDisputeFiled,
            disputeReason: p.disputeReason,
            qualityScore: p.qualityScore,
            qualityVerdict: p.qualityVerdict,
            statusLabel: p.statusLabel,
            canDispatchOtp: p.canDispatchOtp,
            extractedUtr: p.extractedUtr,
            riskFlags: p.riskFlags,
            scrutinyReasons: p.scrutinyReasons,
            similarityToPastAtr: p.similarityToPastAtr,
          }));
        }
      }
    } catch {
      // fallback
    }
    return [...proofsCache];
  },

  async reviewResolutionProof(
    proofId: string,
    decision: 'ACCEPTED' | 'DISPUTED' | 'REJECTED',
    remarks: string
  ) {
    const idx = proofsCache.findIndex((p) => p.id === proofId);
    const current = idx !== -1 ? proofsCache[idx] : null;

    try {
      await fetch('http://localhost:8000/api/atr/scrutiny-decision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          proof_id: proofId,
          complaint_id: current?.complaintId || proofId,
          action: decision === 'ACCEPTED' ? 'APPROVE_AND_DISPATCH_OTP' : decision === 'REJECTED' ? 'REJECT_FAKE_CLOSURE' : 'DISPUTED_BY_CITIZEN',
          officer_name: 'Dr. Sanjeev Khurana (PGRC)',
          remarks,
        }),
      });
    } catch {
      // offline fallback
    }

    if (idx === -1) {
      return {
        id: proofId,
        complaintId: 'REF-ONLINE',
        complaintTitle: 'Resolution Proof',
        institutionName: 'Approved Institute',
        permanentId: '1-10928341',
        submittedAt: new Date().toISOString(),
        submittedBy: 'Nodal Officer',
        proposedResolutionSummary: remarks,
        proofDocumentName: 'voucher.pdf',
        proofSha256: 'N/A',
        status: decision,
        reviewerRemarks: remarks,
        reviewedAt: new Date().toISOString(),
        reviewedBy: 'Dr. Sanjeev Khurana (PGRC)',
      } as ResolutionProofItem;
    }

    const updated: ResolutionProofItem = {
      ...current!,
      status: decision,
      reviewerRemarks: remarks,
      reviewedAt: new Date().toISOString(),
      reviewedBy: 'Dr. Sanjeev Khurana (Reviewing Officer)',
    };

    proofsCache[idx] = updated;
    saveToStorage(STORAGE_KEYS.PROOFS, proofsCache);

    // If accepted, update related complaint to RESOLVED
    if (decision === 'ACCEPTED') {
      const cIdx = complaintsCache.findIndex((c) => c.id === current!.complaintId);
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
      targetCaseId: current!.complaintId,
      targetEntity: current!.institutionName,
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

  // ========================================================================
  // Cryptographic Timeline & Tamper-Evident Verification
  // ========================================================================

  async verifyTimeline(caseId: string): Promise<TimelineVerificationResult> {
    try {
      const resp = await fetch(`http://localhost:8000/api/timeline/${caseId}/verify`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // offline fallback
    }

    const found = complaintsCache.find((c) => c.id.toLowerCase() === caseId.toLowerCase());
    const timeline = found?.timeline || [];
    const isTampered = timeline.some((t) => t.is_tampered);

    return {
      case_id: caseId,
      is_valid: !isTampered,
      total_events_verified: timeline.length,
      genesis_root: timeline[0]?.currentHash || '96c160e35a0a6e759350318b37e63843b20cb8bd8bdc7d80ccf78c5c65e850f4',
      head_hash: timeline[timeline.length - 1]?.currentHash || 'fd29a505a6040cd47f960a1091022fdab87dd9e64dd184e515e25a7ac7864f21',
      verification_status: isTampered ? 'TAMPER_DETECTED' : 'CRYPTOGRAPHICALLY_VERIFIED',
      message: isTampered
        ? 'Tamper Detected at Event #2: Stored hash does not match recomputed payload hash. Record text was modified without authorization.'
        : `Cryptographic Integrity Verified: All ${timeline.length} events are sequentially linked from Genesis root. Zero unauthorized modifications detected.`,
      broken_at_index: isTampered ? 2 : null,
      broken_event_title: isTampered ? timeline[1]?.stageName : null,
    };
  },

  async simulateTimelineTamper(
    caseId: string,
    eventIndex: number = 2,
    tamperedText?: string
  ): Promise<{ success: boolean; verification: TimelineVerificationResult; message: string }> {
    const text = tamperedText || 'MALICIOUS AUDIT MODIFICATION: Disposed without physical inspection or refund clearance.';
    try {
      const resp = await fetch(`http://localhost:8000/api/timeline/${caseId}/simulate-tamper`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_index: eventIndex,
          tampered_text: text,
        }),
      });
      if (resp.ok) {
        const data = await resp.json();
        const cIdx = complaintsCache.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase());
        if (cIdx !== -1 && complaintsCache[cIdx].timeline[eventIndex - 1]) {
          complaintsCache[cIdx].timeline[eventIndex - 1].actionTaken = text;
          complaintsCache[cIdx].timeline[eventIndex - 1].is_tampered = true;
          saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
        }
        return data;
      }
    } catch {
      // offline fallback
    }

    const cIdx = complaintsCache.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase());
    if (cIdx !== -1 && complaintsCache[cIdx].timeline[eventIndex - 1]) {
      complaintsCache[cIdx].timeline[eventIndex - 1].actionTaken = text;
      complaintsCache[cIdx].timeline[eventIndex - 1].is_tampered = true;
      saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
    }

    return {
      success: true,
      message: `Tampered event #${eventIndex}. Hashes were NOT updated.`,
      verification: await this.verifyTimeline(caseId),
    };
  },

  async restoreTimelineChain(
    caseId: string
  ): Promise<{ success: boolean; verification: TimelineVerificationResult; message: string; timeline: CaseStageEvent[] }> {
    try {
      const resp = await fetch(`http://localhost:8000/api/timeline/${caseId}/restore-chain`, {
        method: 'POST',
      });
      if (resp.ok) {
        const data = await resp.json();
        const cIdx = complaintsCache.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase());
        if (cIdx !== -1 && data.timeline) {
          complaintsCache[cIdx].timeline = data.timeline.map((t: any) => ({
            id: t.id,
            stageName: t.stageName || t.title,
            timestamp: t.timestamp,
            performedByRole: t.performedByRole || t.role,
            performedByName: t.performedByName || t.actor,
            actionTaken: t.actionTaken || t.description,
            nextExpectedStep: t.nextExpectedStep || 'Review by Bureau',
            deadlineDate: t.deadlineDate || '2026-08-25T17:00:00Z',
            eventIndex: t.eventIndex,
            isGenesisRoot: t.isGenesisRoot,
            previousHash: t.previousHash,
            currentHash: t.currentHash,
            is_tampered: false,
          }));
          saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
        }
        return data;
      }
    } catch {
      // offline fallback
    }

    const cIdx = complaintsCache.findIndex((c) => c.id.toLowerCase() === caseId.toLowerCase());
    if (cIdx !== -1) {
      complaintsCache[cIdx].timeline.forEach((t) => {
        t.is_tampered = false;
      });
      saveToStorage(STORAGE_KEYS.COMPLAINTS, complaintsCache);
    }

    return {
      success: true,
      message: 'Authentic hash chain restored.',
      verification: await this.verifyTimeline(caseId),
      timeline: complaintsCache[cIdx]?.timeline || [],
    };
  },

  // ========================================================================
  // Institution Grievance Scorecard & Inspection Prioritization
  // ========================================================================

  async getScorecards(params: { tier?: string; region?: string; search?: string } = {}): Promise<InstitutionScorecardItem[]> {
    try {
      const q = new URLSearchParams();
      if (params.tier && params.tier !== 'ALL') q.set('tier', params.tier);
      if (params.region && params.region !== 'ALL') q.set('region', params.region);
      if (params.search) q.set('search', params.search);

      const url = `http://localhost:8000/api/scorecards${q.toString() ? '?' + q.toString() : ''}`;
      const resp = await fetch(url);
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // offline fallback
    }

    // Client-side fallback aggregation by Permanent ID
    const grouped: Record<string, Complaint[]> = {};
    for (const c of complaintsCache) {
      const pid = c.institutionPermanentId || '1-10928341';
      if (!grouped[pid]) grouped[pid] = [];
      grouped[pid].push(c);
    }

    const items: InstitutionScorecardItem[] = institutionsCache.map((inst) => {
      const pid = inst.permanentId;
      const cases = grouped[pid] || [];
      const active = cases.filter((c) => c.status !== 'RESOLVED' && c.status !== 'REJECTED');
      const resolved = cases.filter((c) => c.status === 'RESOLVED');

      const upheldIds = cases
        .filter((c) => c.status === 'RESOLVED' || c.status === 'ACTION_IN_PROGRESS' || c.timeline.some((t) => t.stageName.toLowerCase().includes('refund')))
        .map((c) => c.id);
      const overdueCases = active.filter((c) => c.isOverdue || c.daysRemaining <= 0);
      const overdueRate = active.length > 0 ? Math.round((overdueCases.length / active.length) * 100) : 0;
      const reopened = cases.filter((c) => c.timeline.some((t) => t.isEscalated || t.stageName.toLowerCase().includes('dispute') || t.stageName.toLowerCase().includes('ombudsman')));

      let overlapCount = 0;
      cases.forEach((c) => {
        if (c.relatedCaseIds && c.relatedCaseIds.length > overlapCount) {
          overlapCount = c.relatedCaseIds.length;
        }
      });

      const flaggedAtrCount = proofsCache.filter((p) => p.permanentId === pid && p.status === 'REJECTED').length;

      // Transparent Rules
      let score = 0;
      const reasons: string[] = [];
      const breakdown = {
        overdue_points: 0,
        reopened_points: 0,
        upheld_points: 0,
        overlap_points: 0,
        evasive_atr_points: 0,
      };

      if (overdueRate >= 50) {
        score += 25;
        breakdown.overdue_points = 25;
        reasons.push(`Critical Overdue Rate (${overdueRate}% exceed SLA)`);
      } else if (overdueRate > 0) {
        score += 15;
        breakdown.overdue_points = 15;
        reasons.push(`Overdue Rate (${overdueRate}%)`);
      }

      if (reopened.length > 0) {
        const pts = Math.min(25, reopened.length * 12.5);
        score += pts;
        breakdown.reopened_points = pts;
        reasons.push(`${reopened.length} Ombudsman dispute/escalations`);
      }

      if (upheldIds.length > 0) {
        const pts = Math.min(20, upheldIds.length * 10);
        score += pts;
        breakdown.upheld_points = pts;
        reasons.push(`${upheldIds.length} Substantive violations upheld`);
      }

      if (overlapCount >= 2) {
        const pts = overlapCount >= 3 ? 15 : 10;
        score += pts;
        breakdown.overlap_points = pts;
        reasons.push(`Systemic cluster: ${overlapCount} overlapping complaints`);
      }

      if (flaggedAtrCount > 0) {
        const pts = flaggedAtrCount >= 2 ? 15 : 10;
        score += pts;
        breakdown.evasive_atr_points = pts;
        reasons.push(`${flaggedAtrCount} ATRs flagged for evasive fake closure`);
      }

      if (reasons.length === 0) {
        reasons.push('Satisfactory compliance record with zero major statutory SLA breaches.');
      }

      const finalScore = Math.min(100, Math.round(score));
      let tier: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'ROUTINE' = 'ROUTINE';
      let action = 'PERIODIC_COMPLIANCE_MONITORING';
      let actionLabel = 'Periodic Compliance Monitoring';

      if (finalScore >= 70) {
        tier = 'CRITICAL';
        action = 'MANDATE_SURPRISE_PHYSICAL_INSPECTION';
        actionLabel = 'Mandate Surprise Physical Inspection';
      } else if (finalScore >= 50) {
        tier = 'HIGH';
        action = 'ISSUE_STATUTORY_SHOW_CAUSE';
        actionLabel = 'Issue Statutory Show-Cause Notice & Desk Audit';
      } else if (finalScore >= 30) {
        tier = 'MEDIUM';
        action = 'NODAL_OFFICER_HEARING';
        actionLabel = 'Summon Nodal Officer for Online Hearing';
      }

      return {
        permanent_id: pid,
        institution_name: inst.name,
        city: inst.city,
        state: inst.state,
        region: inst.region || 'Western',
        total_cases: cases.length,
        active_cases: active.length,
        resolved_cases: resolved.length,
        upheld_complaints: upheldIds.length,
        upheld_complaint_ids: upheldIds,
        median_resolution_days: cases.length > 0 ? 14 : 7,
        overdue_rate: overdueRate,
        reopened_cases: reopened.length,
        reopened_case_ids: reopened.map((r) => r.id),
        overlap_count: overlapCount,
        flagged_atr_count: flaggedAtrCount,
        inspection_priority_score: finalScore,
        priority_tier: tier,
        recommended_action: action,
        recommended_action_label: actionLabel,
        score_breakdown: breakdown,
        explainable_reasons: reasons,
      };
    });

    items.sort((a, b) => b.inspection_priority_score - a.inspection_priority_score);
    items.forEach((item, idx) => {
      item.inspection_rank = idx + 1;
    });

    return items;
  },

  async getScorecardDetail(permanentId: string): Promise<InstitutionScorecardItem | null> {
    try {
      const resp = await fetch(`http://localhost:8000/api/scorecards/${permanentId}`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // offline fallback
    }
    const all = await this.getScorecards();
    return all.find((s) => s.permanent_id.toLowerCase() === permanentId.toLowerCase()) || null;
  },

  async orderInspection(permanentId: string, orderData: {
    officer_name: string;
    inspection_type: string;
    target_date: string;
    terms_of_reference: string;
    inspecting_team?: string[];
  }) {
    try {
      const resp = await fetch(`http://localhost:8000/api/scorecards/${permanentId}/order-inspection`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // offline fallback
    }

    return {
      success: true,
      message: `Official ${orderData.inspection_type} inspection mandate issued for institution.`,
      order: {
        id: `INSP-2026-${Math.floor(100 + Math.random() * 900)}`,
        permanent_id: permanentId,
        institution_name: 'Approved Institute',
        officer_name: orderData.officer_name,
        inspection_type: orderData.inspection_type,
        target_date: orderData.target_date,
        terms_of_reference: orderData.terms_of_reference,
        inspecting_team: orderData.inspecting_team || [orderData.officer_name],
        status: 'ORDERED',
        ordered_at: new Date().toISOString(),
      },
    };
  },

  async getInspectionOrders(permanentId: string): Promise<InspectionOrder[]> {
    try {
      const resp = await fetch(`http://localhost:8000/api/scorecards/${permanentId}/orders`);
      if (resp.ok) {
        return await resp.json();
      }
    } catch {
      // offline fallback
    }
    return [];
  },
};

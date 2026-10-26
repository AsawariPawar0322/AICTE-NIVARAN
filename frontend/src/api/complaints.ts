// ==========================================================================
// NIVARAN · Complaints Management Service (complaints.ts)
// ==========================================================================

import { Complaint, StageKey, BureauKey, EvidenceFile, UserAdminMessage } from '../domain/types';
import { INITIAL_COMPLAINTS } from './mockStore';
import { createAuditEvent } from './audit';
import { STAGE_CONFIG } from '../domain/types';

const STORAGE_KEY = 'nivaran_complaints_v2';

export function getComplaints(): Complaint[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Failed reading complaints from localStorage', err);
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_COMPLAINTS));
  return INITIAL_COMPLAINTS;
}

export function saveComplaints(complaints: Complaint[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(complaints));
}

export function getComplaintById(id: string): Complaint | undefined {
  const list = getComplaints();
  const cleanId = id.trim().toUpperCase();
  return list.find(c => c.id.toUpperCase() === cleanId);
}

export function createComplaint(
  draft: Omit<Complaint, 'id' | 'currentStage' | 'stageNumber' | 'slaClock' | 'evidenceList' | 'timeline' | 'auditEvents' | 'messages' | 'submittedAt' | 'lastActivity' | 'assignedOfficer'> & { assignedOfficer?: Complaint['assignedOfficer'] },
  initialEvidence: EvidenceFile[] = []
): Complaint {
  const all = getComplaints();
  const nextNum = 1000 + all.length + Math.floor(Math.random() * 800);
  const newId = `NIV-2026-${nextNum}`;

  const genesisAudit = createAuditEvent(
    newId,
    draft.complainantName || 'Citizen Complainant',
    'Citizen',
    'SUBMIT_COMPLAINT',
    {
      newValue: 'Stage: SUBMITTED',
      reason: 'Fresh docket registered through citizen intake portal.'
    }
  );

  const newComplaint: Complaint = {
    ...draft,
    id: newId,
    currentStage: 'SUBMITTED',
    stageNumber: 1,
    bureau: draft.bureau || 'PGRC',
    assignedOfficer: draft.assignedOfficer || {
      name: 'Central Triage Desk',
      designation: 'Nodal Officer · Public Grievance Redressal Cell',
      bureau: 'AICTE Headquarters, New Delhi',
      badgeVerified: true,
      email: 'pgrc@aicte-india.org'
    },
    slaClock: {
      hoursRemaining: 72,
      isOverdue: false,
      ageingDays: 0,
      dueTimestamp: 'In 72 hours',
      status: 'ON_TRACK'
    },
    evidenceList: initialEvidence,
    timeline: [
      {
        id: `t-${Date.now()}-1`,
        title: 'Complaint Registered',
        description: `Grievance docket registered for ${draft.institutionName}. Jurisdiction verified against AICTE Permanent ID: ${draft.aictePermanentId}.`,
        actor: 'Citizen Gateway',
        role: 'Automated System',
        timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        stage: 'SUBMITTED'
      }
    ],
    auditEvents: [genesisAudit],
    messages: [],
    submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastActivity: 'Just now'
  };

  saveComplaints([newComplaint, ...all]);
  return newComplaint;
}

export function joinComplaint(
  parentCaseId: string,
  user: { name: string; email: string; mobile?: string; role: 'Student' | 'Faculty' | 'Parent' }
): { newComplaint: Complaint; parentComplaint: Complaint } {
  const all = getComplaints();
  const parent = all.find(c => c.id === parentCaseId);
  if (!parent) {
    throw new Error(`Parent case ${parentCaseId} not found`);
  }

  // Increment joined count on parent
  parent.joinedComplainantsCount = (parent.joinedComplainantsCount || 0) + 1;

  // Create citizen's own docket linked to parent
  const nextNum = 2000 + all.length + Math.floor(Math.random() * 500);
  const newId = `NIV-2026-${nextNum}`;

  const genesisAudit = createAuditEvent(
    newId,
    user.name,
    'Citizen',
    'JOIN_COMPLAINT_POOL',
    {
      newValue: `Linked to Lead Case: ${parentCaseId}`,
      reason: `Complainant joined collective grievance for ${parent.institutionName}.`
    }
  );

  const joinedDocket: Complaint = {
    ...parent,
    id: newId,
    complainantName: user.name,
    complainantRole: user.role,
    contactEmail: user.email,
    contactMobile: user.mobile || '+91 99999 00000',
    parentCaseId,
    joinedComplainantsCount: 0,
    evidenceList: [],
    timeline: [
      {
        id: `t-${Date.now()}-join`,
        title: 'Joined Existing Grievance Docket',
        description: `Complainant joined collective resolution docket under Lead Case ${parentCaseId}.`,
        actor: user.name,
        role: 'Citizen',
        timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        stage: parent.currentStage
      }
    ],
    auditEvents: [genesisAudit],
    messages: [],
    submittedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
    lastActivity: 'Just now'
  };

  saveComplaints([joinedDocket, ...all]);
  return { newComplaint: joinedDocket, parentComplaint: parent };
}

export function updateComplaintStage(
  caseId: string,
  newStage: StageKey,
  actor: string,
  role: string,
  reason: string
): Complaint {
  const all = getComplaints();
  const c = all.find(item => item.id === caseId);
  if (!c) throw new Error(`Complaint ${caseId} not found`);

  const prevStage = c.currentStage;
  c.currentStage = newStage;
  c.stageNumber = STAGE_CONFIG[newStage]?.step ?? c.stageNumber;
  c.lastActivity = 'Just now';

  const lastHash = c.auditEvents.length > 0 ? c.auditEvents[c.auditEvents.length - 1].currentHash : undefined;
  const audit = createAuditEvent(caseId, actor, role, 'STAGE_TRANSITION', {
    previousValue: `Stage: ${prevStage}`,
    newValue: `Stage: ${newStage}`,
    reason,
    lastHash
  });
  c.auditEvents.push(audit);

  c.timeline.push({
    id: `t-${Date.now()}`,
    title: `Stage Updated: ${STAGE_CONFIG[newStage]?.label ?? newStage}`,
    description: reason,
    actor,
    role,
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    stage: newStage
  });

  saveComplaints(all);
  return c;
}

export function confirmResolution(
  caseId: string,
  feedback?: string,
  rating: number = 5
): Complaint {
  const all = getComplaints();
  const c = all.find(item => item.id === caseId);
  if (!c) throw new Error(`Complaint ${caseId} not found`);

  c.currentStage = 'CLOSED';
  c.stageNumber = 8;
  c.lastActivity = 'Just now';
  if (c.resolutionDetails) {
    c.resolutionDetails.complainantConfirmation = {
      status: 'CONFIRMED',
      feedback,
      rating,
      confirmedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  }

  const lastHash = c.auditEvents.length > 0 ? c.auditEvents[c.auditEvents.length - 1].currentHash : undefined;
  const audit = createAuditEvent(caseId, c.complainantName, 'Citizen', 'CONFIRM_RESOLUTION', {
    previousValue: 'Stage: AWAITING_CONFIRMATION',
    newValue: 'Stage: CLOSED',
    reason: feedback || 'Complainant confirmed resolution satisfaction.',
    lastHash
  });
  c.auditEvents.push(audit);

  c.timeline.push({
    id: `t-${Date.now()}-conf`,
    title: 'Resolution Confirmed by Complainant',
    description: `Citizen verified remedial action. Grievance docket successfully closed. Rating: ${rating}/5 stars.`,
    actor: c.complainantName,
    role: 'Citizen',
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    stage: 'CLOSED'
  });

  saveComplaints(all);
  return c;
}

export function disputeResolution(
  caseId: string,
  disputeReason: string
): Complaint {
  const all = getComplaints();
  const c = all.find(item => item.id === caseId);
  if (!c) throw new Error(`Complaint ${caseId} not found`);

  c.currentStage = 'DISPUTED';
  c.stageNumber = 7;
  c.lastActivity = 'Just now';
  if (c.resolutionDetails) {
    c.resolutionDetails.complainantConfirmation = {
      status: 'DISPUTED',
      disputeReason,
      confirmedAt: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    };
  }

  const lastHash = c.auditEvents.length > 0 ? c.auditEvents[c.auditEvents.length - 1].currentHash : undefined;
  const audit = createAuditEvent(caseId, c.complainantName, 'Citizen', 'DISPUTE_RESOLUTION', {
    previousValue: 'Stage: AWAITING_CONFIRMATION',
    newValue: 'Stage: DISPUTED',
    reason: disputeReason,
    lastHash
  });
  c.auditEvents.push(audit);

  c.timeline.push({
    id: `t-${Date.now()}-disp`,
    title: 'Resolution Contested / Escalated',
    description: `Citizen disputed Action Taken Report: "${disputeReason}". Docket escalated to Central PGRC Higher Bench.`,
    actor: c.complainantName,
    role: 'Citizen',
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
    stage: 'DISPUTED'
  });

  saveComplaints(all);
  return c;
}

export function updateOverlapDecision(
  caseId: string,
  decision: 'CONFIRMED' | 'REJECTED',
  reason: string,
  officerName: string,
  leadBureau?: BureauKey
): Complaint {
  const all = getComplaints();
  const c = all.find(item => item.id === caseId);
  if (!c) throw new Error(`Complaint ${caseId} not found`);

  if (!c.overlapInfo) {
    c.overlapInfo = {
      hasOverlap: true,
      relatedCaseIds: [],
      matchScore: 85,
      matchRationale: [],
      status: decision
    };
  }

  c.overlapInfo.status = decision;
  c.overlapInfo.decisionReason = reason;
  c.overlapInfo.decidedBy = officerName;
  c.overlapInfo.decidedAt = new Date().toISOString();
  if (leadBureau) {
    c.overlapInfo.leadBureau = leadBureau;
  }

  const lastHash = c.auditEvents.length > 0 ? c.auditEvents[c.auditEvents.length - 1].currentHash : undefined;
  const audit = createAuditEvent(caseId, officerName, 'Official', `OVERLAP_${decision}`, {
    previousValue: 'Overlap: UNREVIEWED',
    newValue: `Overlap: ${decision} (Lead: ${leadBureau || 'Unchanged'})`,
    reason,
    lastHash
  });
  c.auditEvents.push(audit);

  saveComplaints(all);
  return c;
}

export function addMessageToComplaint(
  caseId: string,
  message: Omit<UserAdminMessage, 'id' | 'timestamp'>
): UserAdminMessage {
  const all = getComplaints();
  const c = all.find(item => item.id === caseId);
  if (!c) throw new Error(`Complaint ${caseId} not found`);

  const newMsg: UserAdminMessage = {
    ...message,
    id: `msg-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    caseId,
    timestamp: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };

  c.messages.push(newMsg);
  c.lastActivity = 'Just now';
  saveComplaints(all);
  return newMsg;
}

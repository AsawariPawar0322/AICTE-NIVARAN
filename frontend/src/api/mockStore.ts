// ==========================================================================
// NIVARAN · Master Persistent Mock Store (mockStore.ts)
// Synchronized with localStorage with fallback seed data
// ==========================================================================

import { Complaint, Institution, UserProfile, AuditEvent } from '../domain/types';

export const INITIAL_INSTITUTIONS: Institution[] = [
  {
    id: 'inst-demo-001',
    permanentId: 'DEMO-001',
    name: 'ABC Institute of Technology, Pune',
    city: 'Pune',
    state: 'Maharashtra',
    category: 'Technical',
    openCasesCount: 14,
    overdueCasesCount: 3,
    reopenedCasesCount: 2,
    overlapClustersCount: 2,
    complianceRating: 'Review Recommended (High Priority)',
    inspectionPriority: 'High',
    contributingRiskIndicators: [
      '14 recurring fee refund complaints in last 60 days',
      'SLA breach rate at 21.4% (3 overdue dockets)',
      '1 Action Taken Report flagged for boilerplate phrases',
      'Cross-bureau overlap cluster indicating admission desk irregularities'
    ],
    lastInspectionDate: '14 Feb 2025'
  },
  {
    id: 'inst-1',
    permanentId: '1-10928341',
    name: 'Delhi Technological University (DTU)',
    city: 'New Delhi',
    state: 'Delhi',
    category: 'Technical',
    openCasesCount: 4,
    overdueCasesCount: 0,
    reopenedCasesCount: 1,
    overlapClustersCount: 0,
    complianceRating: 'Grade A+ (98.4%)',
    inspectionPriority: 'Low',
    contributingRiskIndicators: [
      'Isolated caution money accounting dispute during round 1 seat surrenders'
    ],
    lastInspectionDate: '10 Jan 2026'
  },
  {
    id: 'inst-2',
    permanentId: '1-29481903',
    name: 'College of Engineering Pune (COEP Tech)',
    city: 'Pune',
    state: 'Maharashtra',
    category: 'Technical',
    openCasesCount: 2,
    overdueCasesCount: 0,
    reopenedCasesCount: 0,
    overlapClustersCount: 0,
    complianceRating: 'Grade A+ (99.1%)',
    inspectionPriority: 'Low',
    contributingRiskIndicators: [
      'Minor PFMS scholarship verification portal batch delay'
    ],
    lastInspectionDate: '22 Nov 2025'
  },
  {
    id: 'inst-3',
    permanentId: '1-48201948',
    name: 'Veermata Jijabai Technological Institute (VJTI)',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'Technical',
    openCasesCount: 3,
    overdueCasesCount: 0,
    reopenedCasesCount: 0,
    overlapClustersCount: 0,
    complianceRating: 'Grade A (95.0%)',
    inspectionPriority: 'Low',
    contributingRiskIndicators: [
      'UTM equipment procurement completed'
    ],
    lastInspectionDate: '05 Aug 2025'
  },
  {
    id: 'inst-demo-002',
    permanentId: 'DEMO-002',
    name: 'XYZ College of Engineering & Research',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    category: 'Technical',
    openCasesCount: 18,
    overdueCasesCount: 5,
    reopenedCasesCount: 3,
    overlapClustersCount: 2,
    complianceRating: 'Under Scrutiny (Notice Served)',
    inspectionPriority: 'High',
    contributingRiskIndicators: [
      'Original 10th and 12th marksheet withholding reported by 8 students',
      'Non-compliance with Regional Office statutory directives',
      'High number of complainant disputes post-ATR submission'
    ],
    lastInspectionDate: '02 Sep 2024'
  }
];

export const INITIAL_COMPLAINTS: Complaint[] = [
  // Case 1: Core SIH Showcase Overlap Case A
  {
    id: 'NIV-2026-1042',
    title: 'Fee refund not received after seat surrender within cutoff',
    category: 'FEES_REFUND',
    categoryLabel: 'Fee Refund & Excess Charges',
    institutionName: 'ABC Institute of Technology, Pune',
    aictePermanentId: 'DEMO-001',
    city: 'Pune',
    state: 'Maharashtra',
    complainantName: 'Rohan Verma',
    complainantRole: 'Student',
    contactMobile: '+91 98234 11223',
    contactEmail: 'rohan.verma@example.com',
    isAnonymous: false,
    details: 'I formally cancelled my provisional B.Tech Computer Science admission on 12th October 2026 within the AICTE statutory cutoff date. The institute accounts office deducted Rs. 65,000 out of Rs. 95,000 paid, refusing to refund remaining fees.',
    currentStage: 'RESOLUTION_PROPOSED',
    stageNumber: 5,
    bureau: 'PGRC',
    assignedOfficer: {
      name: 'Dr. Ramesh Chandra Verma',
      designation: 'Director, Public Grievance Redressal Cell (PGRC)',
      bureau: 'AICTE Central HQ, New Delhi',
      badgeVerified: true,
      email: 'rc.verma@aicte-india.org',
      phone: '+91 11 2958 1000'
    },
    slaClock: {
      hoursRemaining: 14,
      isOverdue: false,
      ageingDays: 14,
      dueTimestamp: 'Tomorrow, 05:00 PM',
      status: 'DUE_SOON'
    },
    overlapInfo: {
      hasOverlap: true,
      relatedCaseIds: ['NIV-2026-1098'],
      matchScore: 91,
      matchRationale: [
        'Same AICTE Permanent ID: DEMO-001 (ABC Institute of Technology)',
        'Related fee-refund and seat surrender terminology',
        'Overlapping reporting period (October 2026)',
        'Different current Bureaus: PGRC vs Regional Office'
      ],
      status: 'UNREVIEWED',
      leadBureau: 'PGRC'
    },
    resolutionDetails: {
      atrSummary: 'The institution claims refund has been initiated and the matter is resolved.',
      claimedAction: 'Refund processed: The refund has been initiated and the matter is resolved.',
      refundAmount: '₹64,000 claimed (UTR pending verification)',
      officialOrderRef: 'ABC/ACCTS/2026/REF-94',
      proposedAt: '24 Oct 2026, 03:15 PM',
      proofDocument: {
        id: 'ev-atr-1042',
        name: 'ABC_Inst_Internal_Memo_Claiming_Refund.pdf',
        size: 420000,
        type: 'application/pdf',
        sha256Hash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        uploadDate: '24 Oct 2026 15:15 IST',
        verificationStatus: 'SUSPECT'
      },
      checklist: {
        supportingProofAttached: true,
        correspondsToComplaint: true,
        concreteOutcome: false,
        noBoilerplate: false,
        noUnresolvedLinkedCases: false
      },
      validatorFindings: {
        status: 'NEEDS_VERIFICATION',
        notes: 'Evidence needs verification: The ATR claims a refund, but only an internal ledger draft is attached. Bank UTR transaction receipt is missing and contains boilerplate language.'
      },
      complainantConfirmation: {
        status: 'PENDING'
      }
    },
    evidenceList: [
      {
        id: 'ev-1042-1',
        name: 'Fee_Challan_Paid_Receipt_95000.pdf',
        size: 1120000,
        type: 'application/pdf',
        sha256Hash: 'a8b79234e1208fb9281a94204857291048192038475839201948572019384758',
        uploadDate: '12 Oct 2026 10:30 IST',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'ev-1042-2',
        name: 'Cancellation_Application_Acknowledged.pdf',
        size: 680000,
        type: 'application/pdf',
        sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        uploadDate: '12 Oct 2026 10:35 IST',
        verificationStatus: 'VERIFIED'
      }
    ],
    timeline: [
      {
        id: 't-1042-1',
        title: 'Complaint Registered',
        description: 'Docket registered via Citizen Portal. AICTE Permanent ID DEMO-001 resolved.',
        actor: 'Citizen Gateway',
        role: 'System',
        timestamp: '12 Oct 2026, 10:36 AM',
        stage: 'SUBMITTED'
      },
      {
        id: 't-1042-2',
        title: 'Jurisdiction Verified & Allotted to PGRC',
        description: 'Auto-routed to Central PGRC Bureau based on fee dispute threshold.',
        actor: 'NIVARAN Triage Engine',
        role: 'System',
        timestamp: '12 Oct 2026, 11:00 AM',
        stage: 'ASSIGNED'
      },
      {
        id: 't-1042-3',
        title: 'Cross-Bureau Potential Overlap Detected',
        description: 'System identified 91% similarity with Regional Office case NIV-2026-1098.',
        actor: 'Similarity Engine',
        role: 'Automated Matcher',
        timestamp: '15 Oct 2026, 04:30 PM',
        stage: 'UNDER_ACTION'
      },
      {
        id: 't-1042-4',
        title: 'Action Taken Report (ATR) Submitted by College',
        description: 'College uploaded resolution memo claiming refund processed. Sent to Resolution Proof Review.',
        actor: 'Registrar, ABC Institute',
        role: 'Institute Nodal Officer',
        timestamp: '24 Oct 2026, 03:15 PM',
        stage: 'RESOLUTION_PROPOSED'
      }
    ],
    auditEvents: [
      {
        id: 'aud-1042-1',
        caseId: 'NIV-2026-1042',
        actor: 'Rohan Verma',
        role: 'Citizen',
        action: 'SUBMIT_COMPLAINT',
        newValue: 'Stage: SUBMITTED',
        timestamp: '2026-10-12T10:36:00Z',
        previousHash: 'GENESIS_ROOT_HASH_0000000000000000000000000000000000000000000000000',
        currentHash: 'b4920e83f98201a4829103847582910293847583920194857392019485720193'
      },
      {
        id: 'aud-1042-2',
        caseId: 'NIV-2026-1042',
        actor: 'AICTE Triage Bot',
        role: 'System',
        action: 'ROUTE_TO_BUREAU',
        previousValue: 'UNASSIGNED',
        newValue: 'Bureau: PGRC, Officer: Dr. Ramesh Chandra Verma',
        timestamp: '2026-10-12T11:00:00Z',
        previousHash: 'b4920e83f98201a4829103847582910293847583920194857392019485720193',
        currentHash: 'c719284758392019485720194857392019485720194857392019485720194857'
      },
      {
        id: 'aud-1042-3',
        caseId: 'NIV-2026-1042',
        actor: 'Registrar, ABC Institute',
        role: 'Institute Nodal Officer',
        action: 'SUBMIT_ATR_PROOF',
        previousValue: 'Stage: UNDER_ACTION',
        newValue: 'Stage: RESOLUTION_PROPOSED',
        reason: 'Internal memo uploaded citing refund initiated.',
        timestamp: '2026-10-24T15:15:00Z',
        previousHash: 'c719284758392019485720194857392019485720194857392019485720194857',
        currentHash: 'd820194857291029485739201948572019485739201948572019485739201948'
      }
    ],
    messages: [
      {
        id: 'msg-1042-1',
        caseId: 'NIV-2026-1042',
        senderRole: 'officer',
        senderName: 'Dr. Ramesh Chandra Verma (PGRC)',
        content: 'Statutory inquiry issued to Registrar, ABC Institute. Please provide bank UTR receipt or proof of crediting to student account within 48h.',
        timestamp: '16 Oct 2026, 11:20 AM',
        isOfficialNote: true
      }
    ],
    joinedComplainantsCount: 4,
    submittedAt: '12 Oct 2026',
    lastActivity: '24 Oct 2026, 03:15 PM'
  },

  // Case 2: Core SIH Showcase Overlap Case B
  {
    id: 'NIV-2026-1098',
    title: 'Arbitrary deduction of development fees upon course cancellation',
    category: 'FEES_REFUND',
    categoryLabel: 'Fee Refund & Excess Charges',
    institutionName: 'ABC Institute of Technology, Pune',
    aictePermanentId: 'DEMO-001',
    city: 'Pune',
    state: 'Maharashtra',
    complainantName: 'Tanvi Shinde',
    complainantRole: 'Student',
    contactMobile: '+91 94231 99887',
    contactEmail: 'tanvi.shinde@example.com',
    isAnonymous: false,
    details: 'Withdrew from MCA department on 15th October. The college informed me that development fees of 50,000 INR are non-refundable despite clearing AICTE cutoff guidelines.',
    currentStage: 'UNDER_ACTION',
    stageNumber: 4,
    bureau: 'REGIONAL_OFFICE',
    assignedOfficer: {
      name: 'Dr. S. Meenakshi',
      designation: 'Assistant Director · Western Regional Office',
      bureau: 'AICTE Western Regional Office, Mumbai',
      badgeVerified: true,
      email: 'wro.nodal@aicte-india.org',
      phone: '+91 22 2285 5412'
    },
    slaClock: {
      hoursRemaining: 48,
      isOverdue: false,
      ageingDays: 11,
      dueTimestamp: '28 Oct 2026, 05:00 PM',
      status: 'ON_TRACK'
    },
    overlapInfo: {
      hasOverlap: true,
      relatedCaseIds: ['NIV-2026-1042'],
      matchScore: 91,
      matchRationale: [
        'Same AICTE Permanent ID: DEMO-001 (ABC Institute of Technology)',
        'Related fee-refund and seat surrender terminology',
        'Overlapping reporting period (October 2026)',
        'Different current Bureaus: Regional Office vs PGRC'
      ],
      status: 'UNREVIEWED',
      leadBureau: 'PGRC'
    },
    evidenceList: [
      {
        id: 'ev-1098-1',
        name: 'MCA_Fee_Receipt_Tanvi.pdf',
        size: 890000,
        type: 'application/pdf',
        sha256Hash: '9a84f479836102be8d58a8a72b8c91a0c7e2b1029348f9810a9f821038b7610a',
        uploadDate: '15 Oct 2026 14:10 IST',
        verificationStatus: 'VERIFIED'
      }
    ],
    timeline: [
      {
        id: 't-1098-1',
        title: 'Complaint Registered',
        description: 'Direct citizen submission assigned to Western Regional Office.',
        actor: 'Citizen Gateway',
        role: 'System',
        timestamp: '15 Oct 2026, 02:15 PM',
        stage: 'SUBMITTED'
      },
      {
        id: 't-1098-2',
        title: 'Assigned to Western Regional Office',
        description: 'Allocated to Dr. S. Meenakshi for regional jurisdiction review.',
        actor: 'AICTE Regional Dispatch',
        role: 'System',
        timestamp: '16 Oct 2026, 10:00 AM',
        stage: 'ASSIGNED'
      },
      {
        id: 't-1098-3',
        title: 'Overlapping PGRC Case Detected (NIV-2026-1042)',
        description: 'Flagged for cross-bureau coordination. Awaiting lead bureau nomination.',
        actor: 'NIVARAN Coordination Engine',
        role: 'System',
        timestamp: '16 Oct 2026, 04:30 PM',
        stage: 'UNDER_ACTION'
      }
    ],
    auditEvents: [
      {
        id: 'aud-1098-1',
        caseId: 'NIV-2026-1098',
        actor: 'Tanvi Shinde',
        role: 'Citizen',
        action: 'SUBMIT_COMPLAINT',
        newValue: 'Stage: SUBMITTED',
        timestamp: '2026-10-15T14:15:00Z',
        previousHash: 'd820194857291029485739201948572019485739201948572019485739201948',
        currentHash: 'e930194857291029485739201948572019485739201948572019485739201949'
      }
    ],
    messages: [],
    joinedComplainantsCount: 1,
    submittedAt: '15 Oct 2026',
    lastActivity: '16 Oct 2026, 04:30 PM'
  },

  // Case 3: Overdue Action Case (Screen A Needs Action item)
  {
    id: 'NIV-2026-1038',
    title: 'Original Class 10 & 12 Marksheet Withheld after admission cancellation',
    category: 'CERTIFICATE_WITHHELD',
    categoryLabel: 'Withholding of Certificates / Migration',
    institutionName: 'XYZ College of Engineering & Research',
    aictePermanentId: 'DEMO-002',
    city: 'Bhopal',
    state: 'Madhya Pradesh',
    complainantName: 'Kunal Saxena',
    complainantRole: 'Student',
    contactMobile: '+91 97551 23456',
    contactEmail: 'kunal.saxena@example.com',
    isAnonymous: false,
    details: 'College administrative staff refused to return original mark sheets and transfer certificate after student withdrew admission, demanding full 4-year tuition fee as ransom.',
    currentStage: 'UNDER_ACTION',
    stageNumber: 4,
    bureau: 'REGIONAL_OFFICE',
    assignedOfficer: {
      name: 'Shri Manoj Tiwari',
      designation: 'Regional Officer · Central Regional Office',
      bureau: 'AICTE Central Regional Office, Bhopal',
      badgeVerified: true,
      email: 'cro.bhopal@aicte-india.org',
      phone: '+91 755 266 0380'
    },
    slaClock: {
      hoursRemaining: 0,
      isOverdue: true,
      overdueHours: 72,
      ageingDays: 22,
      dueTimestamp: 'Overdue by 3 days',
      status: 'OVERDUE'
    },
    evidenceList: [
      {
        id: 'ev-1038-1',
        name: 'Document_Deposit_Undertaking_XYZ.pdf',
        size: 740000,
        type: 'application/pdf',
        sha256Hash: '1f83c1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9011',
        uploadDate: '04 Oct 2026 11:20 IST',
        verificationStatus: 'VERIFIED'
      }
    ],
    timeline: [
      {
        id: 't-1038-1',
        title: 'Complaint Registered',
        description: 'Urgent certificate withholding reported.',
        actor: 'Citizen Gateway',
        role: 'System',
        timestamp: '04 Oct 2026, 11:25 AM',
        stage: 'SUBMITTED'
      },
      {
        id: 't-1038-2',
        title: 'Assigned to Central Regional Office',
        description: 'Allocated to Shri Manoj Tiwari.',
        actor: 'AICTE Triage Desk',
        role: 'System',
        timestamp: '05 Oct 2026, 09:30 AM',
        stage: 'ASSIGNED'
      },
      {
        id: 't-1038-3',
        title: 'SLA Breached — Flagged Overdue',
        description: 'No response from college within statutory 72h window. Urgent official action required.',
        actor: 'SLA Engine',
        role: 'System',
        timestamp: '10 Oct 2026, 05:00 PM',
        stage: 'UNDER_ACTION'
      }
    ],
    auditEvents: [],
    messages: [],
    submittedAt: '04 Oct 2026',
    lastActivity: '10 Oct 2026, 05:00 PM'
  },

  // Case 4: Awaiting Complainant Confirmation (Citizen Confirmation Screen 7 Showcase)
  {
    id: 'NIV-2026-84920',
    title: 'Excessive Caution Money Non-Refund after AICTE Round 1 Seat Withdrawal',
    category: 'FEES_REFUND',
    categoryLabel: 'Fee Refund & Excess Charges',
    institutionName: 'Delhi Technological University (DTU)',
    aictePermanentId: '1-10928341',
    city: 'New Delhi',
    state: 'Delhi',
    complainantName: 'Aarav Sharma',
    complainantRole: 'Student',
    contactMobile: '+91 98712 34567',
    contactEmail: 'aarav.sharma@example.com',
    isAnonymous: false,
    details: 'I formally surrendered my allotted seat on 14th August 2026 before the prescribed AICTE cutoff date. The college administration deducted 45,000 INR contrary to AICTE Fee Refund Guidelines Chapter 10 which permits max 1,000 processing fee.',
    currentStage: 'AWAITING_CONFIRMATION',
    stageNumber: 6,
    bureau: 'PGRC',
    assignedOfficer: {
      name: 'Dr. Ramesh Chandra Verma',
      designation: 'Director, Public Grievance Redressal Cell (PGRC)',
      bureau: 'AICTE Head Office, New Delhi',
      badgeVerified: true,
      email: 'rc.verma@aicte-india.org',
      phone: '+91 11 2958 1000'
    },
    slaClock: {
      hoursRemaining: 18,
      isOverdue: false,
      ageingDays: 8,
      dueTimestamp: 'Tomorrow, 04:30 PM',
      status: 'DUE_SOON'
    },
    resolutionDetails: {
      atrSummary: 'Institutional inquiry confirmed withdrawal within statutory cutoff. The college Finance Bureau has processed a net refund of Rs. 44,000 via NEFT to student account.',
      claimedAction: 'Direct bank transfer of remaining Rs. 44,000. Verified NEFT transaction receipt attached.',
      refundAmount: '₹44,000 (UTR: SBIN202609148201)',
      officialOrderRef: 'DTU/ACAD/REFUND/2026/894-B',
      proposedAt: '25 Oct 2026, 11:30 AM',
      proofDocument: {
        id: 'ev-dtu-refund-receipt',
        name: 'Bank_NEFT_Refund_Receipt_UTR_SBIN202609148201.pdf',
        size: 512000,
        type: 'application/pdf',
        sha256Hash: '9f83c1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9099',
        uploadDate: '25 Oct 2026 11:30 IST',
        verificationStatus: 'VERIFIED'
      },
      checklist: {
        supportingProofAttached: true,
        correspondsToComplaint: true,
        concreteOutcome: true,
        noBoilerplate: true,
        noUnresolvedLinkedCases: true
      },
      validatorFindings: {
        status: 'PASS',
        notes: 'Verified: Bank NEFT UTR confirmed with State Bank of India gateway. Concrete outcome achieved. Forwarded to complainant for confirmation.'
      },
      complainantConfirmation: {
        status: 'PENDING'
      }
    },
    evidenceList: [
      {
        id: 'ev-1',
        name: 'Fee_Payment_Receipt_75000.pdf',
        size: 1420500,
        type: 'application/pdf',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadDate: '2026-08-16 10:14 IST',
        verificationStatus: 'VERIFIED'
      },
      {
        id: 'ev-2',
        name: 'Seat_Surrender_Acknowledgement_Signed.pdf',
        size: 894000,
        type: 'application/pdf',
        sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        uploadDate: '2026-08-16 10:16 IST',
        verificationStatus: 'VERIFIED'
      }
    ],
    timeline: [
      {
        id: 't-1',
        title: 'Complaint Registered & Cryptographically Hashed',
        description: 'Case registered with AICTE central vault. SHA-256 evidence digests verified.',
        actor: 'Citizen Portal Gateway',
        role: 'Automated System',
        timestamp: '16 Aug 2026, 10:18 AM',
        stage: 'SUBMITTED'
      },
      {
        id: 't-2',
        title: 'Allotted to Public Grievance Redressal Cell (PGRC)',
        description: 'Assigned to Dr. Ramesh Chandra Verma (PGRC AICTE) with 72h first response SLA.',
        actor: 'AICTE Bureau Allotment Engine',
        role: 'Central Dispatch',
        timestamp: '16 Aug 2026, 02:30 PM',
        stage: 'ASSIGNED'
      },
      {
        id: 't-3',
        title: 'Statutory Notice Served to Institution Registrar',
        description: 'Notice served to Delhi Technological University Accounts section citing AICTE Circular 2026/FEE/14.',
        actor: 'Dr. Ramesh Chandra Verma',
        role: 'PGRC Officer',
        timestamp: '18 Aug 2026, 11:00 AM',
        stage: 'UNDER_ACTION'
      },
      {
        id: 't-4',
        title: 'Action Taken Report (ATR) Verified by Official',
        description: 'Institute confirmed release of refund with Bank UTR reference. Validator approved proof quality.',
        actor: 'Dr. Ramesh Chandra Verma',
        role: 'PGRC Director',
        timestamp: '25 Oct 2026, 11:30 AM',
        stage: 'AWAITING_CONFIRMATION'
      }
    ],
    auditEvents: [
      {
        id: 'aud-84920-1',
        caseId: 'NIV-2026-84920',
        actor: 'Aarav Sharma',
        role: 'Citizen',
        action: 'SUBMIT_COMPLAINT',
        newValue: 'Stage: SUBMITTED',
        timestamp: '2026-08-16T10:18:00Z',
        previousHash: 'GENESIS_ROOT_HASH_0000000000000000000000000000000000000000000000000',
        currentHash: 'f102938475829102938475829102938475829102938475829102938475829102'
      },
      {
        id: 'aud-84920-2',
        caseId: 'NIV-2026-84920',
        actor: 'Dr. Ramesh Chandra Verma',
        role: 'PGRC Director',
        action: 'VALIDATE_AND_FORWARD_ATR',
        previousValue: 'Stage: RESOLUTION_PROPOSED',
        newValue: 'Stage: AWAITING_CONFIRMATION',
        reason: 'NEFT UTR proof verified. Awaiting citizen confirmation.',
        timestamp: '2026-10-25T11:30:00Z',
        previousHash: 'f102938475829102938475829102938475829102938475829102938475829102',
        currentHash: 'a291029384758291029384758291029384758291029384758291029384758291'
      }
    ],
    messages: [
      {
        id: 'msg-84920-1',
        caseId: 'NIV-2026-84920',
        senderRole: 'officer',
        senderName: 'Dr. Ramesh Chandra Verma (PGRC)',
        content: 'Dear Complainant, DTU has submitted refund proof with UTR SBIN202609148201 for Rs. 44,000. Please verify crediting in your bank account and click "Confirm Resolution" to close this grievance.',
        timestamp: '25 Oct 2026, 11:32 AM',
        isOfficialNote: false
      }
    ],
    joinedComplainantsCount: 3,
    submittedAt: '16 Aug 2026',
    lastActivity: '25 Oct 2026, 11:30 AM'
  },

  // Case 5: Scholarship Delay
  {
    id: 'NIV-2026-79114',
    title: 'Delay in Pragati Scholarship Disbursement for 2nd Year B.Tech Women Scholars',
    category: 'SCHOLARSHIP_AICTE',
    categoryLabel: 'AICTE Pragati / Saksham / PMSSS Scholarship',
    institutionName: 'College of Engineering Pune (COEP Tech)',
    aictePermanentId: '1-29481903',
    city: 'Pune',
    state: 'Maharashtra',
    complainantName: 'Pooja Kulkarni',
    complainantRole: 'Student',
    contactMobile: '+91 94220 81923',
    contactEmail: 'pooja.k@example.com',
    isAnonymous: false,
    details: 'Aadhaar seeded bank verification successfully completed on PFMS portal in July. Scholarship grant of Rs. 50,000 for academic year 2026-27 still marked pending at college verification desk.',
    currentStage: 'UNDER_ACTION',
    stageNumber: 4,
    bureau: 'STUDENT_WELFARE',
    assignedOfficer: {
      name: 'Mrs. S. Meenakshi',
      designation: 'Assistant Director · Scholarship Bureau',
      bureau: 'AICTE HQ & Western Regional Office',
      badgeVerified: true,
      email: 'pragati.help@aicte-india.org',
      phone: '+91 11 2958 1022'
    },
    slaClock: {
      hoursRemaining: 34,
      isOverdue: false,
      ageingDays: 5,
      dueTimestamp: 'In 34 hours',
      status: 'ON_TRACK'
    },
    evidenceList: [
      {
        id: 'ev-3',
        name: 'PFMS_Aadhaar_Seeded_Status.png',
        size: 612400,
        type: 'image/png',
        sha256Hash: '9a84f479836102be8d58a8a72b8c91a0c7e2b1029348f9810a9f821038b7610a',
        uploadDate: '2026-09-02 14:05 IST',
        verificationStatus: 'VERIFIED'
      }
    ],
    timeline: [
      {
        id: 't-21',
        title: 'Grievance Registered',
        description: 'Registered under AICTE Pragati Girls Scholarship Scheme queue.',
        actor: 'Citizen Portal',
        role: 'System',
        timestamp: '02 Sep 2026, 02:10 PM',
        stage: 'SUBMITTED'
      },
      {
        id: 't-22',
        title: 'Assigned to Scholarship Bureau Officer',
        description: 'Assigned to Mrs. S. Meenakshi for college portal verification status review.',
        actor: 'Scholarship Desk',
        role: 'Bureau Allotment',
        timestamp: '03 Sep 2026, 09:30 AM',
        stage: 'ASSIGNED'
      },
      {
        id: 't-23',
        title: 'Verification Flagged to Institute Nodal Officer',
        description: 'College asked to approve the pending PFMS batch within 48 working hours.',
        actor: 'Mrs. S. Meenakshi',
        role: 'Assistant Director',
        timestamp: '04 Sep 2026, 11:45 AM',
        stage: 'UNDER_ACTION'
      }
    ],
    auditEvents: [],
    messages: [],
    submittedAt: '02 Sep 2026',
    lastActivity: '04 Sep 2026, 11:45 AM'
  },

  // Case 6: Closed & Verified Case (Screen I Hash Chain Showcase)
  {
    id: 'NIV-2026-65021',
    title: 'Lack of Core Metallurgy Lab Equipment & Broken Universal Testing Machine',
    category: 'FACULTY_INFRA',
    categoryLabel: 'Faculty Shortage & Lab Infrastructure',
    institutionName: 'Veermata Jijabai Technological Institute (VJTI)',
    aictePermanentId: '1-48201948',
    city: 'Mumbai',
    state: 'Maharashtra',
    complainantName: 'Rohan Deshmukh',
    complainantRole: 'Student',
    contactMobile: '+91 98201 54321',
    contactEmail: 'rohan.d@example.com',
    isAnonymous: false,
    details: 'Testing machines in the Strength of Materials lab non-functional for past 3 months causing practical exams to be held in dry runs.',
    currentStage: 'CLOSED',
    stageNumber: 8,
    bureau: 'APPROVAL_BUREAU',
    assignedOfficer: {
      name: 'Prof. Anil Sahasrabudhe',
      designation: 'Advisor · Quality Assurance & Approvals',
      bureau: 'AICTE Western Regional Bureau',
      badgeVerified: true,
      email: 'approvals.wro@aicte-india.org',
      phone: '+91 22 2285 5400'
    },
    slaClock: {
      hoursRemaining: 0,
      isOverdue: false,
      ageingDays: 19,
      dueTimestamp: 'Closed on schedule',
      status: 'ON_TRACK'
    },
    resolutionDetails: {
      atrSummary: 'College conducted emergency procurement and calibrated 2 new UTM sensors with NABL accredited certificate.',
      claimedAction: 'Machines commissioned on 10 Oct 2026. Practical schedule restored.',
      officialOrderRef: 'VJTI/MECH/LAB/2026/102',
      proposedAt: '12 Oct 2026',
      proofDocument: {
        id: 'ev-vjti-calib',
        name: 'NABL_Calibration_Certificate_UTM_Commissioned.pdf',
        size: 920000,
        type: 'application/pdf',
        sha256Hash: '5a84f479836102be8d58a8a72b8c91a0c7e2b1029348f9810a9f821038b76111',
        uploadDate: '12 Oct 2026 12:00 IST',
        verificationStatus: 'VERIFIED'
      },
      checklist: {
        supportingProofAttached: true,
        correspondsToComplaint: true,
        concreteOutcome: true,
        noBoilerplate: true,
        noUnresolvedLinkedCases: true
      },
      validatorFindings: {
        status: 'PASS',
        notes: 'NABL Certificate verified with accreditation council database. Complainant confirmed lab sessions restored.'
      },
      complainantConfirmation: {
        status: 'CONFIRMED',
        feedback: 'Lab sessions resumed and UTM machine is working properly now.',
        rating: 5,
        confirmedAt: '14 Oct 2026'
      }
    },
    evidenceList: [],
    timeline: [],
    auditEvents: [
      {
        id: 'aud-65021-1',
        caseId: 'NIV-2026-65021',
        actor: 'Rohan Deshmukh',
        role: 'Citizen',
        action: 'SUBMIT_COMPLAINT',
        newValue: 'Stage: SUBMITTED',
        timestamp: '2026-09-25T10:00:00Z',
        previousHash: 'GENESIS_ROOT_HASH_0000000000000000000000000000000000000000000000000',
        currentHash: '3102938475829102938475829102938475829102938475829102938475829102'
      },
      {
        id: 'aud-65021-2',
        caseId: 'NIV-2026-65021',
        actor: 'Prof. Anil Sahasrabudhe',
        role: 'Quality Advisor',
        action: 'CLOSE_AND_VERIFY',
        previousValue: 'Stage: AWAITING_CONFIRMATION',
        newValue: 'Stage: CLOSED',
        reason: 'Student confirmed resolution and calibration proof passed statutory check.',
        timestamp: '2026-10-14T16:00:00Z',
        previousHash: '3102938475829102938475829102938475829102938475829102938475829102',
        currentHash: '4291029384758291029384758291029384758291029384758291029384758291'
      }
    ],
    messages: [],
    submittedAt: '25 Sep 2026',
    lastActivity: '14 Oct 2026, 04:00 PM'
  }
];

export const DEMO_USERS: Record<string, UserProfile> = {
  citizen_rohan: {
    id: 'user-rohan',
    name: 'Rohan Verma',
    role: 'Student',
    portalType: 'citizen',
    email: 'rohan.verma@example.com',
    mobile: '+91 98234 11223',
    institutionName: 'ABC Institute of Technology, Pune',
    aictePermanentId: 'DEMO-001'
  },
  citizen_tanvi: {
    id: 'user-tanvi',
    name: 'Tanvi Shinde',
    role: 'Student',
    portalType: 'citizen',
    email: 'tanvi.shinde@example.com',
    mobile: '+91 94231 99887',
    institutionName: 'ABC Institute of Technology, Pune',
    aictePermanentId: 'DEMO-001'
  },
  citizen_aarav: {
    id: 'user-aarav',
    name: 'Aarav Sharma',
    role: 'Student',
    portalType: 'citizen',
    email: 'aarav.sharma@example.com',
    mobile: '+91 98712 34567',
    institutionName: 'Delhi Technological University (DTU)',
    aictePermanentId: '1-10928341'
  },
  official_pgrc: {
    id: 'off-pgrc-1',
    name: 'Dr. Ramesh Chandra Verma',
    role: 'AICTE Official',
    portalType: 'official',
    email: 'rc.verma@aicte-india.org',
    bureau: 'PGRC',
    designation: 'Director · Public Grievance Redressal Cell'
  },
  official_wro: {
    id: 'off-wro-1',
    name: 'Dr. S. Meenakshi',
    role: 'AICTE Official',
    portalType: 'official',
    email: 'wro.nodal@aicte-india.org',
    bureau: 'REGIONAL_OFFICE',
    designation: 'Assistant Director · Western Regional Office'
  },
  official_cro: {
    id: 'off-cro-1',
    name: 'Shri Manoj Tiwari',
    role: 'AICTE Official',
    portalType: 'official',
    email: 'cro.bhopal@aicte-india.org',
    bureau: 'REGIONAL_OFFICE',
    designation: 'Regional Officer · Central Regional Office'
  }
};

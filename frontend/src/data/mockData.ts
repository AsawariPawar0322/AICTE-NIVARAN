// ==========================================================================
// AICTE Grievance Coordination System · Master Mock Data
// ==========================================================================

import { Complaint, Institution, ConversationMap, DiscordServer, DiscordChannel, DiscordMessage, DiscordMember } from '../types';

export const mockInstitutions: Institution[] = [
  {
    id: 'inst-1',
    permanentId: '1-10928341',
    name: 'Delhi Technological University (DTU)',
    city: 'New Delhi',
    state: 'Delhi',
    category: 'Technical',
    openCasesCount: 4,
    complianceRating: 'Grade A+ (98.4%)'
  },
  {
    id: 'inst-2',
    permanentId: '1-29481903',
    name: 'College of Engineering Pune (COEP Tech)',
    city: 'Pune',
    state: 'Maharashtra',
    category: 'Technical',
    openCasesCount: 2,
    complianceRating: 'Grade A+ (99.1%)'
  },
  {
    id: 'inst-3',
    permanentId: '1-48201948',
    name: 'Veermata Jijabai Technological Institute (VJTI)',
    city: 'Mumbai',
    state: 'Maharashtra',
    category: 'Technical',
    openCasesCount: 3,
    complianceRating: 'Grade A (95.0%)'
  },
  {
    id: 'inst-4',
    permanentId: '1-85729104',
    name: 'National Institute of Technology Trichy (NITT)',
    city: 'Tiruchirappalli',
    state: 'Tamil Nadu',
    category: 'Technical',
    openCasesCount: 1,
    complianceRating: 'Grade A++ (99.7%)'
  },
  {
    id: 'inst-5',
    permanentId: '1-93810294',
    name: 'RV College of Engineering',
    city: 'Bengaluru',
    state: 'Karnataka',
    category: 'Technical',
    openCasesCount: 6,
    complianceRating: 'Grade A (94.2%)'
  }
];

export const initialComplaints: Complaint[] = [
  {
    id: 'AICTE-2026-GRV-84920',
    title: 'Excessive Caution Money & Tuition Fee Non-Refund after AICTE Round 1 Seat Withdrawal',
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
    currentStage: 'PENDING_OTP',
    stageNumber: 5,
    slaHoursRemaining: 18,
    assignedOfficer: {
      name: 'Dr. Ramesh Chandra Verma',
      designation: 'Director, Public Grievance Redressal Cell (PGRC)',
      bureau: 'AICTE Head Office, New Delhi',
      badgeVerified: true
    },
    resolutionProposedDetails: {
      atrSummary: 'Institutional inquiry confirmed withdrawal within statutory cutoff. The college Finance Bureau has processed a net refund of Rs. 44,000 via NEFT to student account.',
      proposedRemedy: 'Direct bank transfer of remaining Rs. 44,000. UTR reference attached in ATR.',
      refundAmount: '₹44,000 (UTR: SBIN202609148201)',
      officialOrderRef: 'DTU/ACAD/REFUND/2026/894-B',
      proposedAt: 'Today at 11:30 AM'
    },
    otpVerification: {
      generatedOtp: '849210',
      isVerified: false,
      citizenFeedback: ''
    },
    evidenceList: [
      {
        id: 'ev-1',
        name: 'Fee_Payment_Receipt_75000.pdf',
        size: 1420500,
        type: 'application/pdf',
        sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        uploadDate: '2026-08-16 10:14 IST'
      },
      {
        id: 'ev-2',
        name: 'Seat_Surrender_Acknowledgement_Signed.pdf',
        size: 894000,
        type: 'application/pdf',
        sha256Hash: '4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945',
        uploadDate: '2026-08-16 10:16 IST'
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
        stage: 'REGISTERED'
      },
      {
        id: 't-2',
        title: 'Allotted to Public Grievance Redressal Cell (PGRC)',
        description: 'Assigned to Dr. Ramesh Chandra Verma (PGRC AICTE) with 72h first response SLA.',
        actor: 'AICTE Bureau Allotment Engine',
        role: 'Central Dispatch',
        timestamp: '16 Aug 2026, 02:30 PM',
        stage: 'ALLOTTED'
      },
      {
        id: 't-3',
        title: 'Notice Served to Institution Registrar',
        description: 'Notice served to Delhi Technological University Accounts section citing AICTE Circular 2026/FEE/14.',
        actor: 'Dr. Ramesh Chandra Verma',
        role: 'PGRC Officer',
        timestamp: '18 Aug 2026, 11:00 AM',
        stage: 'INVESTIGATION'
      },
      {
        id: 't-4',
        title: 'Action Taken Report (ATR) Submitted by Institute',
        description: 'Institute confirmed release of refund with Bank UTR reference. Resolution proposed.',
        actor: 'Registrar, DTU',
        role: 'Institute Nodal Officer',
        timestamp: '24 Oct 2026, 11:30 AM',
        stage: 'RESOLUTION_PROPOSED'
      },
      {
        id: 't-5',
        title: 'Pending Citizen OTP Verification for Case Closure',
        description: 'System dispatched 6-digit confirmation OTP to complainant mobile to verify satisfaction before closure.',
        actor: 'Citizen Verification Service',
        role: 'Automated Security Service',
        timestamp: '24 Oct 2026, 11:32 AM',
        stage: 'PENDING_OTP'
      }
    ],
    relatedCaseCount: 3
  },
  {
    id: 'AICTE-2026-GRV-79114',
    title: 'Delay in Pragati Scholarship Disbursement for 2nd Year B.Tech Women Scholars',
    category: 'SCHOLARSHIP_AICTE',
    categoryLabel: 'AICTE Pragati / Saksham / PMSSS',
    institutionName: 'College of Engineering Pune (COEP Tech)',
    aictePermanentId: '1-29481903',
    city: 'Pune',
    state: 'Maharashtra',
    complainantName: 'Pooja Kulkarni',
    complainantRole: 'Student',
    contactMobile: '+91 94220 81923',
    contactEmail: 'pooja.k@example.com',
    isAnonymous: false,
    details: 'Aadhar seeded bank verification successfully completed on PFMS portal in July. Scholarship grant of Rs. 50,000 for academic year 2026-27 still marked pending at college verification desk.',
    currentStage: 'INVESTIGATION',
    stageNumber: 3,
    slaHoursRemaining: 34,
    assignedOfficer: {
      name: 'Mrs. S. Meenakshi',
      designation: 'Assistant Director, Scholarship Bureau',
      bureau: 'AICTE HQ & Western Regional Office',
      badgeVerified: true
    },
    evidenceList: [
      {
        id: 'ev-3',
        name: 'PFMS_Aadhaar_Seeded_Status.png',
        size: 612400,
        type: 'image/png',
        sha256Hash: '9a84f479836102be8d58a8a72b8c91a0c7e2b1029348f9810a9f821038b7610a',
        uploadDate: '2026-09-02 14:05 IST'
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
        stage: 'REGISTERED'
      },
      {
        id: 't-22',
        title: 'Assigned to Scholarship Bureau Officer',
        description: 'Assigned to Mrs. S. Meenakshi for college portal verification status review.',
        actor: 'Scholarship Desk',
        role: 'Bureau Allotment',
        timestamp: '03 Sep 2026, 09:30 AM',
        stage: 'ALLOTTED'
      },
      {
        id: 't-23',
        title: 'Verification Flagged to Institute Nodal Officer',
        description: 'College asked to approve the pending PFMS batch within 48 working hours.',
        actor: 'Mrs. S. Meenakshi',
        role: 'Assistant Director',
        timestamp: '04 Sep 2026, 11:45 AM',
        stage: 'INVESTIGATION'
      }
    ],
    relatedCaseCount: 1
  },
  {
    id: 'AICTE-2026-GRV-65021',
    title: 'Lack of Core Metallurgy Lab Equipment & Broken Universal Testing Machine',
    category: 'FACULTY_INFRA',
    categoryLabel: 'Faculty & Lab Infrastructure',
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
    currentStage: 'RESOLVED',
    stageNumber: 6,
    slaHoursRemaining: 0,
    assignedOfficer: {
      name: 'Prof. Anil Sahasrabudhe',
      designation: 'Advisor, Quality Assurance & Approvals',
      bureau: 'AICTE Western Regional Bureau',
      badgeVerified: true
    },
    resolutionProposedDetails: {
      atrSummary: 'College conducted emergency procurement and calibrated 2 new UTM sensors with NABL accredited certificate.',
      proposedRemedy: 'Machines commissioned on 10 Oct 2026. Practical schedule restored.',
      officialOrderRef: 'VJTI/MECH/LAB/2026/102',
      proposedAt: '12 Oct 2026'
    },
    otpVerification: {
      generatedOtp: '519204',
      isVerified: true,
      verifiedAt: '14 Oct 2026, 04:15 PM',
      citizenFeedback: 'Lab sensors inspected and found working during practical session. Very satisfied with prompt AICTE intervention!',
      rating: 5
    },
    evidenceList: [
      {
        id: 'ev-4',
        name: 'Lab_Photos_BrokenSensors.jpg',
        size: 2150000,
        type: 'image/jpeg',
        sha256Hash: 'c7b5a4128f802ea10e97b91b7204a91cfb8231904a8b7c91d8a1092837465abc',
        uploadDate: '2026-07-20 16:30 IST'
      }
    ],
    timeline: [
      {
        id: 't-31',
        title: 'Case Resolved & Citizen OTP Verified',
        description: 'Complainant authenticated closure with secure OTP and rated 5 stars.',
        actor: 'Citizen Aarav Sharma',
        role: 'Complainant',
        timestamp: '14 Oct 2026, 04:15 PM',
        stage: 'RESOLVED'
      }
    ]
  }
];

// Conversations are keyed by complaint id so every message stays linked to its case
export const initialConversations: ConversationMap = {
  'AICTE-2026-GRV-84920': [
    {
      id: 'msg-1',
      complaintId: 'AICTE-2026-GRV-84920',
      kind: 'system',
      senderRole: 'system',
      senderName: 'AICTE Grievance System',
      content: 'Welcome Aarav Sharma. You are connected to the official enquiry channel for case AICTE-2026-GRV-84920. All messages in this thread are securely logged into the official case audit trail.',
      timestamp: '16 Aug 2026, 10:19 AM',
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-2',
      complaintId: 'AICTE-2026-GRV-84920',
      kind: 'clarification',
      senderRole: 'officer',
      senderName: 'Dr. Ramesh Chandra Verma (PGRC)',
      content: 'Dear Complainant Aarav Sharma, I have reviewed your submission and the attached Fee Challan. We have dispatched an urgent statutory requisition to the Registrar of DTU regarding the ₹44,000 refund pursuant to AICTE guidelines. Could you please confirm if you received any written reply from the Dean Academics?',
      timestamp: '18 Aug 2026, 11:05 AM',
      isOfficialNote: true,
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-3',
      complaintId: 'AICTE-2026-GRV-84920',
      kind: 'text',
      senderRole: 'complainant',
      senderName: 'Aarav Sharma',
      content: 'Sir, I visited the accounts section twice on 22nd August. They verbally stated that institutional policy requires 3 months for caution money processing. However, as per AICTE handbook, seat withdrawal before cutoff mandates refund within 7 working days.',
      timestamp: '18 Aug 2026, 11:20 AM',
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-4',
      complaintId: 'AICTE-2026-GRV-84920',
      kind: 'clarification',
      senderRole: 'officer',
      senderName: 'Dr. Ramesh Chandra Verma (PGRC)',
      content: 'Noted. Institutional internal policy cannot supersede Central AICTE Regulations. We have summoned the College Accounts Nodal Officer for an online hearing tomorrow at 3:00 PM. We will push for direct NEFT clearance.',
      timestamp: '18 Aug 2026, 02:40 PM',
      isOfficialNote: true,
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-5',
      complaintId: 'AICTE-2026-GRV-84920',
      kind: 'system',
      senderRole: 'system',
      senderName: 'AICTE Settlement Gateway',
      content: '🔔 UPDATE: DTU has uploaded the Action Taken Report (ATR) along with NEFT UTR number SBIN202609148201 for ₹44,000. Please proceed to the "Track Status & Stages" tab to verify the OTP and close the case.',
      timestamp: 'Today at 11:32 AM',
      readByOfficer: true,
      readByComplainant: true
    }
  ],
  'AICTE-2026-GRV-79114': [
    {
      id: 'msg-21',
      complaintId: 'AICTE-2026-GRV-79114',
      kind: 'system',
      senderRole: 'system',
      senderName: 'AICTE Grievance System',
      content: 'Conversation opened for case AICTE-2026-GRV-79114. All messages in this thread are logged into the official case audit trail.',
      timestamp: '02 Sep 2026, 02:11 PM',
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-22',
      complaintId: 'AICTE-2026-GRV-79114',
      kind: 'document_request',
      senderRole: 'officer',
      senderName: 'Mrs. S. Meenakshi',
      content: 'To escalate the PFMS verification freeze with the institute, please upload the documents listed below.',
      timestamp: '04 Sep 2026, 11:50 AM',
      documentRequest: {
        id: 'docreq-79114-1',
        items: ['PFMS Aadhaar-seeding confirmation', 'Bank passbook (first page)'],
        note: 'A clear photo or PDF of each document is sufficient.',
        dueDate: '28 Oct 2026',
        status: 'pending'
      },
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-23',
      complaintId: 'AICTE-2026-GRV-79114',
      kind: 'text',
      senderRole: 'complainant',
      senderName: 'Pooja Kulkarni',
      content: 'Ma\'am, the college verification desk says the PFMS batch is still frozen from their side. My scholarship of ₹50,000 has not been released yet.',
      timestamp: 'Today at 10:32 AM',
      readByOfficer: false,
      readByComplainant: true
    },
    {
      id: 'msg-24',
      complaintId: 'AICTE-2026-GRV-79114',
      kind: 'text',
      senderRole: 'complainant',
      senderName: 'Pooja Kulkarni',
      content: 'Is the bank passbook front page enough, or do you also need a statement? I will upload today.',
      timestamp: 'Today at 10:40 AM',
      readByOfficer: false,
      readByComplainant: true
    }
  ],
  'AICTE-2026-GRV-65021': [
    {
      id: 'msg-31',
      complaintId: 'AICTE-2026-GRV-65021',
      kind: 'text',
      senderRole: 'complainant',
      senderName: 'Rohan Deshmukh',
      content: 'Sir, the new UTM sensors were used in today\'s practical session and are working properly.',
      timestamp: '14 Oct 2026, 03:50 PM',
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-32',
      complaintId: 'AICTE-2026-GRV-65021',
      kind: 'text',
      senderRole: 'officer',
      senderName: 'Prof. Anil Sahasrabudhe',
      content: 'Thank you for confirming. Please verify the closure OTP in the tracker so the case can be formally disposed.',
      timestamp: '14 Oct 2026, 04:02 PM',
      readByOfficer: true,
      readByComplainant: true
    },
    {
      id: 'msg-33',
      complaintId: 'AICTE-2026-GRV-65021',
      kind: 'system',
      senderRole: 'system',
      senderName: 'AICTE Settlement Gateway',
      content: 'Case formally disposed after citizen OTP verification. This conversation is now read-only for the record.',
      timestamp: '14 Oct 2026, 04:15 PM',
      readByOfficer: true,
      readByComplainant: true
    }
  ]
};

// Discord Coordination Hub Mock Data
export const mockDiscordServers: DiscordServer[] = [
  {
    id: 'srv-1',
    name: 'AICTE Central Grievance Hub',
    iconText: 'AICTE',
    unreadCount: 3,
    category: 'National Coordination'
  },
  {
    id: 'srv-2',
    name: 'National Student Rights & Support',
    iconText: 'NSRS',
    unreadCount: 5,
    category: 'Student Community'
  },
  {
    id: 'srv-3',
    name: 'PGRC & Bureau Officer Chamber',
    iconText: 'PGRC',
    unreadCount: 1,
    category: 'Official Bureau'
  },
  {
    id: 'srv-4',
    name: 'Anti-Ragging Crisis Squad',
    iconText: 'ARC',
    unreadCount: 0,
    category: 'Urgent Response'
  },
  {
    id: 'srv-5',
    name: 'ICC & Women Redressal Cell',
    iconText: 'ICC',
    unreadCount: 0,
    category: 'Internal Committee'
  }
];

export const mockDiscordChannels: DiscordChannel[] = [
  {
    id: 'ch-announcements',
    serverId: 'srv-1',
    name: 'announcements',
    type: 'text',
    description: 'Official AICTE gazette notifications, circulars and refund directives'
  },
  {
    id: 'ch-rules',
    serverId: 'srv-1',
    name: 'rules-and-rights',
    type: 'text',
    description: 'Guidelines on Fee Refund rules, 72h SLA, and Student Ombudsman mandate'
  },
  {
    id: 'ch-fee-help',
    serverId: 'srv-1',
    name: 'fee-and-scholarships',
    type: 'text',
    description: 'Community guidance on pending caution money, Pragati, Saksham & PMSSS'
  },
  {
    id: 'ch-peer-support',
    serverId: 'srv-1',
    name: 'peer-support-qna',
    type: 'text',
    description: 'Students helping students format grievance drafts and gather evidence'
  },
  {
    id: 'ch-anti-ragging',
    serverId: 'srv-1',
    name: 'anti-ragging-emergency',
    type: 'text',
    description: 'Confidential reporting, crisis hotlines, and instant helpline escalation'
  },
  {
    id: 'ch-voice-lounge',
    serverId: 'srv-1',
    name: 'Grievance Advisory Lounge',
    type: 'voice',
    description: 'Weekly live voice Q&A with AICTE regional legal advisors'
  }
];

export const mockDiscordMessages: Record<string, DiscordMessage[]> = {
  'ch-announcements': [
    {
      id: 'm-1',
      channelId: 'ch-announcements',
      author: {
        name: 'AICTE Circular Bot',
        roleTag: 'SYSTEM BOT',
        roleColor: '#5865F2',
        avatarBg: '#5865F2'
      },
      timestamp: 'Today at 09:00 AM',
      content: '📢 **OFFICIAL AICTE DIRECTIVE: Mandatory Citizen OTP for Case Disposal**\nAll AICTE approved institutions are hereby instructed that no grievance on the portal can be closed unilaterally without the complainant verifying their satisfaction via a 6-digit OTP.\nInstitutions violating this protocol are liable for punitive seat quota reductions.',
      embedCard: {
        title: 'Regulation Notification 2026/GCS/12-B',
        description: 'Gazette of India, Part III, Sec 4. Applicable to all 12,450 technical universities and colleges.',
        color: '#F2895E',
        fields: [
          { name: 'SLA Benchmark', value: '72 Working Hours' },
          { name: 'Ombudsman Access', value: 'Automatic upon OTP rejection' }
        ]
      }
    },
    {
      id: 'm-2',
      channelId: 'ch-announcements',
      author: {
        name: 'Dr. Ramesh Chandra Verma',
        roleTag: 'AICTE Officer',
        roleColor: '#F23F43',
        avatarBg: '#0B2A5B'
      },
      timestamp: 'Today at 10:15 AM',
      content: 'Welcome all students and faculty representatives to the AICTE Coordination Discord Space! Use `#peer-support-qna` to seek advice on filing your complaints or tracking evidence.'
    }
  ],
  'ch-rules': [
    {
      id: 'm-3',
      channelId: 'ch-rules',
      author: {
        name: 'Advocate Sneha Pillai',
        roleTag: 'Legal Counsel',
        roleColor: '#F0B232',
        avatarBg: '#9A4509'
      },
      timestamp: 'Yesterday at 04:20 PM',
      content: '📌 **Quick FAQ on Seat Withdrawal & Fee Refund:**\nIf you surrender your technical course seat before the AICTE cut-off date, the institute MUST refund your complete tuition and caution deposit minus an administrative fee of not more than ₹1,000.\nInstitutes cannot withhold original 10th/12th marksheets under any circumstances (Section 6.2).'
    }
  ],
  'ch-fee-help': [
    {
      id: 'm-4',
      channelId: 'ch-fee-help',
      author: {
        name: 'Aarav Sharma',
        roleTag: 'Student Rep',
        roleColor: '#23A55A',
        avatarBg: '#1F5FBF'
      },
      timestamp: 'Today at 11:05 AM',
      content: 'Hey everyone, DTU just refunded my ₹44,000 through this portal! Make sure when you file your grievance in the wizard, you upload the seat withdrawal acknowledgement stamped with date.'
    },
    {
      id: 'm-5',
      channelId: 'ch-fee-help',
      author: {
        name: 'Pooja Kulkarni',
        roleTag: 'Student Rep',
        roleColor: '#23A55A',
        avatarBg: '#C2570C'
      },
      timestamp: 'Today at 11:22 AM',
      content: 'That is great Aarav! I am currently tracking my Pragati scholarship grievance for COEP. The officer Mrs. Meenakshi replied on the official chatbox within 4 hours.'
    }
  ],
  'ch-peer-support': [
    {
      id: 'm-6',
      channelId: 'ch-peer-support',
      author: {
        name: 'Grievance Helper Bot',
        roleTag: 'SYSTEM BOT',
        roleColor: '#5865F2',
        avatarBg: '#5865F2'
      },
      timestamp: 'Today at 08:30 AM',
      content: '🤖 Need to look up your case status quickly? Type `/status <YOUR_CASE_ID>` or `/helpline` for immediate emergency contact details.'
    }
  ],
  'ch-anti-ragging': [
    {
      id: 'm-7',
      channelId: 'ch-anti-ragging',
      author: {
        name: 'National Anti-Ragging Cell',
        roleTag: 'AICTE Officer',
        roleColor: '#F23F43',
        avatarBg: '#B91C1C'
      },
      timestamp: 'Yesterday at 11:00 AM',
      content: '🚨 **Zero Tolerance to Ragging Policy:**\nIf you or any peer is facing intimidation, physical or verbal harassment in hostel or campus premises, call the 24x7 toll-free helpline `1800-180-5522` or file an Anonymous Complaint in the portal right away. FIRs are filed within 24 hours under the UGC/AICTE Anti-Ragging Act.'
    }
  ]
};

export const mockDiscordMembers: DiscordMember[] = [
  { id: 'u-1', name: 'Dr. Ramesh Chandra Verma', roleTag: 'AICTE Officer', roleColor: '#F23F43', isOnline: true, statusText: 'Managing PGRC inquiries' },
  { id: 'u-2', name: 'Advocate Sneha Pillai', roleTag: 'Legal Counsel', roleColor: '#F0B232', isOnline: true, statusText: 'Providing free student legal aid' },
  { id: 'u-3', name: 'AICTE Circular Bot', roleTag: 'SYSTEM BOT', roleColor: '#5865F2', isOnline: true, statusText: 'Listening for /status commands' },
  { id: 'u-4', name: 'Mrs. S. Meenakshi', roleTag: 'AICTE Officer', roleColor: '#F23F43', isOnline: true, statusText: 'Scholarship desk' },
  { id: 'u-5', name: 'Aarav Sharma', roleTag: 'Student Rep', roleColor: '#23A55A', isOnline: true, statusText: 'DTU CSE | Fee resolved!' },
  { id: 'u-6', name: 'Pooja Kulkarni', roleTag: 'Student Rep', roleColor: '#23A55A', isOnline: false, statusText: 'COEP Pune' }
];

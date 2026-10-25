# ==========================================================================
# AICTE NIVARAN (एआईसीटीई निवारण) · Backend Database & Storage
# ==========================================================================

from typing import List, Dict, Any, Optional
import datetime

# Seed database for AICTE Approved Institutions
mock_institutions: List[Dict[str, Any]] = [
    {
        "id": "inst-1",
        "permanent_id": "1-10928341",
        "name": "Delhi Technological University (DTU)",
        "city": "New Delhi",
        "state": "Delhi",
        "category": "Technical",
        "open_cases_count": 4,
        "compliance_rating": "Grade A+ (98.4%)"
    },
    {
        "id": "inst-2",
        "permanent_id": "1-29481903",
        "name": "College of Engineering Pune (COEP Tech)",
        "city": "Pune",
        "state": "Maharashtra",
        "category": "Technical",
        "open_cases_count": 2,
        "compliance_rating": "Grade A+ (99.1%)"
    },
    {
        "id": "inst-3",
        "permanent_id": "1-48201948",
        "name": "Veermata Jijabai Technological Institute (VJTI)",
        "city": "Mumbai",
        "state": "Maharashtra",
        "category": "Technical",
        "open_cases_count": 3,
        "compliance_rating": "Grade A (95.0%)"
    },
    {
        "id": "inst-4",
        "permanent_id": "1-85729104",
        "name": "National Institute of Technology Trichy (NITT)",
        "city": "Tiruchirappalli",
        "state": "Tamil Nadu",
        "category": "Technical",
        "open_cases_count": 1,
        "compliance_rating": "Grade A++ (99.7%)"
    },
    {
        "id": "inst-5",
        "permanent_id": "1-93810294",
        "name": "RV College of Engineering",
        "city": "Bengaluru",
        "state": "Karnataka",
        "category": "Technical",
        "open_cases_count": 6,
        "compliance_rating": "Grade A (94.2%)"
    }
]

# Seed grievances ledger with multi-stage lifecycle & citizen OTP
mock_grievances: List[Dict[str, Any]] = [
    {
        "id": "AICTE-2026-GRV-84920",
        "title": "Excessive Caution Money & Tuition Fee Non-Refund after AICTE Round 1 Seat Withdrawal",
        "category": "FEES_REFUND",
        "category_label": "Fee Refund & Excess Charges",
        "institution_name": "Delhi Technological University (DTU)",
        "aicte_permanent_id": "1-10928341",
        "city": "New Delhi",
        "state": "Delhi",
        "complainant_name": "Aarav Sharma",
        "complainant_role": "Student",
        "contact_mobile": "+91 98712 34567",
        "contact_email": "aarav.sharma@example.com",
        "is_anonymous": False,
        "details": "I formally surrendered my allotted seat on 14th August 2026 before the prescribed AICTE cutoff date. The college administration deducted 45,000 INR contrary to AICTE Fee Refund Guidelines Chapter 10 which permits max 1,000 processing fee.",
        "current_stage": "PENDING_OTP",
        "stage_number": 5,
        "sla_hours_remaining": 18,
        "assigned_officer": {
            "name": "Dr. Ramesh Chandra Verma",
            "designation": "Director, Public Grievance Redressal Cell (PGRC)",
            "bureau": "AICTE Head Office, New Delhi",
            "badge_verified": True
        },
        "resolution_proposed_details": {
            "atr_summary": "Institutional inquiry confirmed withdrawal within statutory cutoff. The college Finance Bureau has processed a net refund of Rs. 44,000 via NEFT to student account.",
            "proposed_remedy": "Direct bank transfer of remaining Rs. 44,000. UTR reference attached in ATR.",
            "refund_amount": "₹44,000 (UTR: SBIN202609148201)",
            "official_order_ref": "DTU/ACAD/REFUND/2026/894-B",
            "proposed_at": "Today at 11:30 AM"
        },
        "otp_verification": {
            "generated_otp": "849210",
            "is_verified": False,
            "citizen_feedback": ""
        },
        "evidence_list": [
            {
                "id": "ev-1",
                "name": "Fee_Payment_Receipt_75000.pdf",
                "size": 1420500,
                "type": "application/pdf",
                "sha256_hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
                "upload_date": "2026-08-16 10:14 IST"
            },
            {
                "id": "ev-2",
                "name": "Seat_Surrender_Acknowledgement_Signed.pdf",
                "size": 894000,
                "type": "application/pdf",
                "sha256_hash": "4f53cda18c2baa0c0354bb5f9a3ecbe5ed12ab4d8e11ba873c2f11161202b945",
                "upload_date": "2026-08-16 10:16 IST"
            }
        ],
        "timeline": [
            {
                "id": "t-1",
                "title": "Complaint Registered & Cryptographically Hashed",
                "description": "Case registered with AICTE central vault. SHA-256 evidence digests verified.",
                "actor": "Citizen Portal Gateway",
                "role": "Automated System",
                "timestamp": "16 Aug 2026, 10:18 AM",
                "stage": "REGISTERED"
            },
            {
                "id": "t-2",
                "title": "Allotted to Public Grievance Redressal Cell (PGRC)",
                "description": "Assigned to Dr. Ramesh Chandra Verma (PGRC AICTE) with 72h first response SLA.",
                "actor": "AICTE Bureau Allotment Engine",
                "role": "Central Dispatch",
                "timestamp": "16 Aug 2026, 02:30 PM",
                "stage": "ALLOTTED"
            },
            {
                "id": "t-3",
                "title": "Notice Served to Institution Registrar",
                "description": "Notice served to Delhi Technological University Accounts section citing AICTE Circular 2026/FEE/14.",
                "actor": "Dr. Ramesh Chandra Verma",
                "role": "PGRC Officer",
                "timestamp": "18 Aug 2026, 11:00 AM",
                "stage": "INVESTIGATION"
            },
            {
                "id": "t-4",
                "title": "Action Taken Report (ATR) Submitted by Institute",
                "description": "Institute confirmed release of refund with Bank UTR reference. Resolution proposed.",
                "actor": "Registrar, DTU",
                "role": "Institute Nodal Officer",
                "timestamp": "24 Oct 2026, 11:30 AM",
                "stage": "RESOLUTION_PROPOSED"
            },
            {
                "id": "t-5",
                "title": "Pending Citizen OTP Verification for Case Closure",
                "description": "System dispatched 6-digit confirmation OTP to complainant mobile to verify satisfaction before closure.",
                "actor": "Citizen Verification Service",
                "role": "Automated Security Service",
                "timestamp": "24 Oct 2026, 11:32 AM",
                "stage": "PENDING_OTP"
            }
        ],
        "related_case_count": 3
    }
]

# Seed active OTP sessions
mock_otp_sessions: Dict[str, str] = {
    "+91 98712 34567": "849210",
    "aarav.sharma@example.com": "849210"
}

# Seed case conversations, keyed by grievance id (complainant <-> officer)
mock_messages: Dict[str, List[Dict[str, Any]]] = {
    "AICTE-2026-GRV-84920": [
        {
            "id": "msg-1",
            "complaint_id": "AICTE-2026-GRV-84920",
            "kind": "system",
            "sender_role": "system",
            "sender_name": "AICTE Grievance System",
            "content": "Welcome Aarav Sharma. You are connected to the official enquiry channel for case AICTE-2026-GRV-84920. All messages in this thread are securely logged into the official case audit trail.",
            "timestamp": "16 Aug 2026, 10:19 AM",
            "read_by_officer": True,
            "read_by_complainant": True
        },
        {
            "id": "msg-2",
            "complaint_id": "AICTE-2026-GRV-84920",
            "kind": "clarification",
            "sender_role": "officer",
            "sender_name": "Dr. Ramesh Chandra Verma (PGRC)",
            "content": "Dear Complainant Aarav Sharma, I have reviewed your submission and the attached Fee Challan. We have dispatched an urgent statutory requisition to the Registrar of DTU regarding the ₹44,000 refund pursuant to AICTE guidelines. Could you please confirm if you received any written reply from the Dean Academics?",
            "timestamp": "18 Aug 2026, 11:05 AM",
            "read_by_officer": True,
            "read_by_complainant": True
        },
        {
            "id": "msg-3",
            "complaint_id": "AICTE-2026-GRV-84920",
            "kind": "text",
            "sender_role": "complainant",
            "sender_name": "Aarav Sharma",
            "content": "Sir, I visited the accounts section twice on 22nd August. They verbally stated that institutional policy requires 3 months for caution money processing. However, as per AICTE handbook, seat withdrawal before cutoff mandates refund within 7 working days.",
            "timestamp": "18 Aug 2026, 11:20 AM",
            "read_by_officer": True,
            "read_by_complainant": True
        },
        {
            "id": "msg-4",
            "complaint_id": "AICTE-2026-GRV-84920",
            "kind": "clarification",
            "sender_role": "officer",
            "sender_name": "Dr. Ramesh Chandra Verma (PGRC)",
            "content": "Noted. Institutional internal policy cannot supersede Central AICTE Regulations. We have summoned the College Accounts Nodal Officer for an online hearing tomorrow at 3:00 PM. We will push for direct NEFT clearance.",
            "timestamp": "18 Aug 2026, 02:40 PM",
            "read_by_officer": True,
            "read_by_complainant": True
        },
        {
            "id": "msg-5",
            "complaint_id": "AICTE-2026-GRV-84920",
            "kind": "system",
            "sender_role": "system",
            "sender_name": "AICTE Settlement Gateway",
            "content": "UPDATE: DTU has uploaded the Action Taken Report (ATR) along with NEFT UTR number SBIN202609148201 for ₹44,000. Please verify the OTP to close the case.",
            "timestamp": "Today at 11:32 AM",
            "read_by_officer": True,
            "read_by_complainant": True
        }
    ]
}

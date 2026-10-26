# ==========================================================================
# AICTE NIVARAN (एआईसीटीई निवारण) · FastAPI Central Coordination Server
# ==========================================================================

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any, Literal
import datetime
import random

from app.database import (
    mock_institutions,
    mock_grievances,
    mock_otp_sessions,
    mock_messages,
    mock_resolution_proofs,
    mock_inspection_orders,
    get_past_atrs_for_institution,
    verify_case_timeline,
    tamper_case_timeline,
    restore_case_timeline,
    add_chained_timeline_event,
    get_case_by_id
)
from app.schemas import (
    SendOtpRequest,
    VerifyOtpRequest,
    LoginRequest,
    CreateGrievanceRequest,
    VerifyClosureOtpRequest,
    EscalateRequest,
    ChatMessageRequest,
    MarkReadRequest,
    FulfillDocumentRequest,
    OverlapRecommendation,
    LinkActionRequest,
    AtrEvaluationRequest,
    AtrQualityResult,
    AtrScrutinyDecisionRequest,
    TimelineVerificationResponse,
    SimulateTamperRequest,
    InstitutionScorecardItem,
    IssueInspectionOrderRequest
)
from app.matcher import analyze_grievance_overlap, find_all_overlap_candidates
from app.atr_validator import evaluate_atr_quality
from app.scorecard import generate_all_scorecards, evaluate_institution_scorecard

app = FastAPI(
    title="AICTE NIVARAN API",
    description="Backend API for AICTE Grievance Coordination System · SIH26264",
    version="1.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "portal": "AICTE NIVARAN (एआईसीटीई निवारण)",
        "council": "All India Council For Technical Education",
        "motto": "योगः कर्मसु कौशलम्",
        "status": "online",
        "timestamp": datetime.datetime.now().isoformat(),
        "registered_institutions": len(mock_institutions),
        "active_cases": len(mock_grievances)
    }

# ==========================================================================
# Authentication & OTP Endpoints
# ==========================================================================

@app.post("/api/auth/send-otp")
def send_otp(req: SendOtpRequest):
    # Deterministic mock OTP for demonstration
    generated_otp = "849210" if "98712" in req.identifier or "aarav" in req.identifier else str(random.randint(100000, 999999))
    mock_otp_sessions[req.identifier] = generated_otp
    return {
        "success": True,
        "message": f"6-Digit OTP dispatched to {req.identifier}",
        "demo_hint_otp": generated_otp,
        "expires_in_seconds": 300
    }

@app.post("/api/auth/verify-otp")
def verify_otp(req: VerifyOtpRequest):
    expected_otp = mock_otp_sessions.get(req.identifier, "849210")
    if req.otp.strip() != expected_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the valid 6-digit code.")
    
    # Return simulated session profile
    user_name = "Aarav Sharma" if "98712" in req.identifier or "aarav" in req.identifier else "Verified Citizen"
    return {
        "success": True,
        "token": f"jwt_nivaran_{int(datetime.datetime.now().timestamp())}",
        "user": {
            "name": user_name,
            "role": req.role,
            "identifier": req.identifier,
            "institution": "Delhi Technological University (DTU)",
            "roll_or_id": "2024-CS-108",
            "is_authenticated": True
        }
    }

@app.post("/api/auth/login")
def login_user(req: LoginRequest):
    if req.is_demo:
        if req.role == "AICTE_OFFICER":
            return {
                "success": True,
                "token": "jwt_officer_verma_pgrc",
                "user": {
                    "name": "Dr. Ramesh Chandra Verma",
                    "role": "AICTE Official",
                    "designation": "Director, Public Grievance Redressal Cell (PGRC)",
                    "bureau": "AICTE Head Office, New Delhi",
                    "is_authenticated": True
                }
            }
        elif req.role == "COLLEGE_NODAL":
            return {
                "success": True,
                "token": "jwt_nodal_dtu_registrar",
                "user": {
                    "name": "Prof. K. S. Rao",
                    "role": "Institute Nodal Officer",
                    "designation": "Registrar, Academic Redressal Desk",
                    "institution": "Delhi Technological University (DTU)",
                    "is_authenticated": True
                }
            }
        else: # Student
            return {
                "success": True,
                "token": "jwt_student_aarav_sharma",
                "user": {
                    "name": "Aarav Sharma",
                    "role": "Student",
                    "institution": "Delhi Technological University (DTU)",
                    "roll_or_id": "2024-CS-108",
                    "mobile": "+91 98712 34567",
                    "is_authenticated": True
                }
            }
            
    return {
        "success": True,
        "token": f"jwt_custom_{int(datetime.datetime.now().timestamp())}",
        "user": {
            "name": req.identifier.split("@")[0].title() if "@" in req.identifier else "Verified User",
            "role": req.role,
            "is_authenticated": True
        }
    }

# ==========================================================================
# Grievance Coordination Endpoints
# ==========================================================================

@app.get("/api/grievances")
def get_grievances(
    status: Optional[str] = None,
    category: Optional[str] = None,
    institution: Optional[str] = None
):
    results = mock_grievances
    if status:
        results = [g for g in results if g["current_stage"].upper() == status.upper()]
    if category:
        results = [g for g in results if g["category"].upper() == category.upper()]
    if institution:
        results = [g for g in results if institution.lower() in g["institution_name"].lower()]
    return results

@app.get("/api/grievances/{case_id}")
def get_grievance_by_id(case_id: str):
    for g in mock_grievances:
        if g["id"].lower() == case_id.lower():
            return g
    raise HTTPException(status_code=404, detail="Grievance not found")

@app.post("/api/grievances")
def create_grievance(req: CreateGrievanceRequest):
    case_num = random.randint(10000, 99999)
    case_id = f"AICTE-2026-GRV-{case_num}"
    
    new_grievance = {
        "id": case_id,
        "title": req.title,
        "category": req.category,
        "category_label": req.category_label,
        "institution_name": req.institution_name,
        "aicte_permanent_id": req.aicte_permanent_id,
        "city": req.city,
        "state": req.state,
        "complainant_name": "Anonymous Whistleblower" if req.is_anonymous else req.complainant_name,
        "complainant_role": req.complainant_role,
        "contact_mobile": req.contact_mobile,
        "contact_email": req.contact_email,
        "is_anonymous": req.is_anonymous,
        "details": req.details,
        "current_stage": "REGISTERED",
        "stage_number": 1,
        "sla_hours_remaining": 72,
        "assigned_officer": {
            "name": "Dr. Ramesh Chandra Verma",
            "designation": "Director, Public Grievance Redressal Cell (PGRC)",
            "bureau": "AICTE HQ New Delhi",
            "badge_verified": True
        },
        "evidence_list": [ev.model_dump() for ev in req.evidence_list],
        "timeline": [
            {
                "id": f"t-{int(datetime.datetime.now().timestamp())}",
                "title": "Grievance Formally Registered",
                "description": f"Case registered with {len(req.evidence_list)} cryptographically hashed evidence files. 72-Hour SLA active.",
                "actor": "Citizen Portal Gateway",
                "role": "System Gateway",
                "timestamp": "Just now",
                "stage": "REGISTERED"
            }
        ],
        "related_case_count": 3 if req.link_to_related else 0
    }
    mock_grievances.insert(0, new_grievance)
    mock_messages[case_id] = [{
        "id": f"msg-{int(datetime.datetime.now().timestamp() * 1000)}",
        "complaint_id": case_id,
        "kind": "system",
        "sender_role": "system",
        "sender_name": "AICTE Grievance System",
        "content": f"Conversation opened for case {case_id}. All messages in this thread are logged into the official case audit trail.",
        "timestamp": "Just now",
        "read_by_officer": True,
        "read_by_complainant": True
    }]
    return {
        "success": True,
        "case_id": case_id,
        "grievance": new_grievance
    }

# CRITICAL FEATURE: CITIZEN OTP ACKNOWLEDGMENT FOR RESOLUTION CLOSURE
@app.post("/api/grievances/{case_id}/verify-closure-otp")
def verify_closure_otp(case_id: str, req: VerifyClosureOtpRequest):
    target = None
    for g in mock_grievances:
        if g["id"].lower() == case_id.lower():
            target = g
            break
            
    if not target:
        raise HTTPException(status_code=404, detail="Case not found")
        
    expected_otp = target.get("otp_verification", {}).get("generated_otp", "849210")
    if req.otp.strip() != expected_otp:
        raise HTTPException(status_code=400, detail="Invalid OTP code. Please enter the valid code sent to your mobile.")
        
    target["current_stage"] = "RESOLVED"
    target["stage_number"] = 6
    target["sla_hours_remaining"] = 0
    target["otp_verification"] = {
        "generated_otp": expected_otp,
        "is_verified": True,
        "verified_at": datetime.datetime.now().strftime("%d %b %Y, %I:%M %p"),
        "citizen_feedback": req.citizen_feedback,
        "rating": req.satisfaction_rating
    }
    _add_timeline_event(
        target,
        "Case Formally Disposed & Citizen OTP Verified",
        "Complainant verified satisfaction via 6-digit OTP. AICTE Certificate generated.",
        target["complainant_name"],
        "Citizen Verification"
    )
    
    return {
        "success": True,
        "message": "Citizen OTP successfully authenticated. Grievance marked RESOLVED.",
        "certificate_ref": f"CERT-NIVARAN-2026-{case_id[-5:]}",
        "case": target
    }

@app.post("/api/grievances/{case_id}/escalate")
def escalate_to_ombudsman(case_id: str, req: EscalateRequest):
    target = None
    for g in mock_grievances:
        if g["id"].lower() == case_id.lower():
            target = g
            break
            
    if not target:
        raise HTTPException(status_code=404, detail="Case not found")
        
    target["current_stage"] = "ESCALATED"
    _add_timeline_event(
        target,
        "Escalated to State Technical Ombudsman",
        f"Citizen rejected resolution: '{req.dissatisfied_reason}'. Reopened for Ombudsman inquiry.",
        target["complainant_name"],
        "Citizen Rejection"
    )
    
    return {
        "success": True,
        "message": "Case escalated to State Technical Ombudsman.",
        "case": target
    }

# ==========================================================================
# Institutions Directory
# ==========================================================================

@app.get("/api/institutions")
def get_institutions(search: Optional[str] = None):
    if not search:
        return mock_institutions
    q = search.lower()
    return [
        inst for inst in mock_institutions 
        if q in inst["name"].lower() or q in inst["permanent_id"].lower() or q in inst["city"].lower()
    ]

# ==========================================================================
# Support Inbox & Case Conversations
# ==========================================================================

def _find_grievance(case_id: str) -> Dict[str, Any]:
    for g in mock_grievances:
        if g["id"].lower() == case_id.lower():
            return g
    raise HTTPException(status_code=404, detail="Case not found")

def _new_id(prefix: str) -> str:
    return f"{prefix}-{int(datetime.datetime.now().timestamp() * 1000)}-{random.randint(100, 999)}"

def _add_timeline_event(case: Dict[str, Any], title: str, description: str, actor: str, role: str):
    return add_chained_timeline_event(case, title, description, actor, role)

@app.get("/api/inbox")
def get_inbox(
    filter: Literal["all", "unread", "awaiting", "docs_pending"] = "all",
    search: Optional[str] = None
):
    summaries = []
    for g in mock_grievances:
        thread = mock_messages.get(g["id"], [])
        from_parties = [m for m in thread if m["sender_role"] != "system"]
        last = thread[-1] if thread else None
        summaries.append({
            "case_id": g["id"],
            "title": g["title"],
            "complainant_name": g["complainant_name"],
            "institution_name": g["institution_name"],
            "current_stage": g["current_stage"],
            "sla_hours_remaining": g["sla_hours_remaining"],
            "last_message": last["content"] if last else None,
            "last_message_at": last["timestamp"] if last else None,
            "unread_for_officer": sum(1 for m in thread if not m["read_by_officer"]),
            "awaiting_reply": bool(from_parties) and from_parties[-1]["sender_role"] == "complainant",
            "pending_requests": sum(
                1 for m in thread
                if m.get("document_request") and m["document_request"]["status"] == "pending"
            )
        })

    if filter == "unread":
        summaries = [s for s in summaries if s["unread_for_officer"] > 0]
    elif filter == "awaiting":
        summaries = [s for s in summaries if s["awaiting_reply"]]
    elif filter == "docs_pending":
        summaries = [s for s in summaries if s["pending_requests"] > 0]

    if search:
        q = search.lower()
        summaries = [
            s for s in summaries
            if q in s["case_id"].lower() or q in s["complainant_name"].lower() or q in s["institution_name"].lower()
        ]

    # Unread first, then conversations waiting on the officer
    summaries.sort(key=lambda s: (s["unread_for_officer"] == 0, not s["awaiting_reply"]))
    return summaries

@app.get("/api/grievances/{case_id}/messages")
def get_messages(case_id: str):
    case = _find_grievance(case_id)
    return mock_messages.get(case["id"], [])

@app.post("/api/grievances/{case_id}/messages")
def send_message(case_id: str, req: ChatMessageRequest):
    case = _find_grievance(case_id)
    if req.kind == "document_request":
        if req.sender_role != "officer":
            raise HTTPException(status_code=403, detail="Only officers can request documents.")
        if not req.document_request or not req.document_request.items:
            raise HTTPException(status_code=400, detail="document_request with at least one item is required.")
    if req.kind == "clarification" and req.sender_role != "officer":
        raise HTTPException(status_code=403, detail="Only officers can issue clarifications.")

    is_officer = req.sender_role == "officer"
    message: Dict[str, Any] = {
        "id": _new_id("msg"),
        "complaint_id": case["id"],
        "kind": req.kind,
        "sender_role": req.sender_role,
        "sender_name": req.sender_name,
        "content": req.content,
        "timestamp": "Just now",
        "attachments": [a.model_dump() for a in req.attachments],
        "is_official_note": req.kind == "clarification",
        "read_by_officer": is_officer,
        "read_by_complainant": not is_officer
    }

    if req.kind == "document_request":
        message["document_request"] = {
            "id": _new_id("docreq"),
            "items": req.document_request.items,
            "note": req.document_request.note,
            "due_date": req.document_request.due_date,
            "status": "pending"
        }
        due = f" · Due by {req.document_request.due_date}" if req.document_request.due_date else ""
        _add_timeline_event(case, "Documents Requested from Complainant",
                            f"Requested: {', '.join(req.document_request.items)}{due}.",
                            req.sender_name, "AICTE Officer")
    elif req.kind == "clarification":
        _add_timeline_event(case, "Clarification Issued to Complainant",
                            req.content if len(req.content) <= 160 else req.content[:157] + "...",
                            req.sender_name, "AICTE Officer")

    if req.attachments:
        case["evidence_list"].extend(a.model_dump() for a in req.attachments)
        _add_timeline_event(case, "Supplementary Evidence Shared via Case Conversation",
                            f"{len(req.attachments)} file(s) shared with SHA-256 digests: {', '.join(a.name for a in req.attachments)}.",
                            req.sender_name, "AICTE Officer" if is_officer else "Complainant")

    mock_messages.setdefault(case["id"], []).append(message)
    return {"success": True, "message": message}

@app.post("/api/grievances/{case_id}/messages/read")
def mark_messages_read(case_id: str, req: MarkReadRequest):
    case = _find_grievance(case_id)
    flag = "read_by_officer" if req.reader_role == "officer" else "read_by_complainant"
    updated = 0
    for m in mock_messages.get(case["id"], []):
        if not m[flag]:
            m[flag] = True
            updated += 1
    return {"success": True, "marked_read": updated}

@app.post("/api/grievances/{case_id}/document-requests/{request_id}/fulfill")
def fulfill_document_request(case_id: str, request_id: str, req: FulfillDocumentRequest):
    case = _find_grievance(case_id)
    thread = mock_messages.get(case["id"], [])
    request_msg = next(
        (m for m in thread if m.get("document_request") and m["document_request"]["id"] == request_id),
        None
    )
    if not request_msg:
        raise HTTPException(status_code=404, detail="Document request not found")
    doc_request = request_msg["document_request"]
    if doc_request["status"] == "fulfilled":
        raise HTTPException(status_code=409, detail="Document request already fulfilled")
    if not req.attachments:
        raise HTTPException(status_code=400, detail="At least one attachment is required.")

    files = [a.model_dump() for a in req.attachments]
    doc_request["status"] = "fulfilled"
    doc_request["fulfilled_at"] = "Just now"
    doc_request["fulfilled_file_ids"] = [f["id"] for f in files]

    submission = {
        "id": _new_id("msg"),
        "complaint_id": case["id"],
        "kind": "document_submission",
        "sender_role": "complainant",
        "sender_name": req.sender_name,
        "content": f"Submitted {len(files)} document(s) for: {', '.join(doc_request['items'])}.",
        "timestamp": "Just now",
        "attachments": files,
        "reply_to_request_id": request_id,
        "read_by_officer": False,
        "read_by_complainant": True
    }
    thread.append(submission)
    case["evidence_list"].extend(files)
    _add_timeline_event(case, "Requested Documents Submitted by Complainant",
                        f"{len(files)} file(s) uploaded with SHA-256 digests in response to the request for: {', '.join(doc_request['items'])}.",
                        req.sender_name, "Complainant")
    return {"success": True, "message": submission, "document_request": doc_request}

# ==========================================================================
# Similar Grievance Detection & Case Linker Endpoints
# ==========================================================================

@app.get("/api/matcher/coordination-queue")
def get_coordination_queue():
    """Returns candidate overlap pairs for all active grievances."""
    candidates = find_all_overlap_candidates(mock_grievances)
    return {
        "success": True,
        "count": len(candidates),
        "candidates": candidates
    }

@app.get("/api/matcher/analyze-case/{case_id}")
def analyze_case_overlap(case_id: str):
    """Analyzes a specific grievance against all other grievances."""
    target = _find_grievance(case_id)
    matches = []
    for g in mock_grievances:
        if g["id"] == target["id"]:
            continue
        res = analyze_grievance_overlap(target, g)
        if res:
            matches.append(res)
    matches.sort(key=lambda m: m["confidence_score"], reverse=True)
    return {
        "success": True,
        "target_case_id": target["id"],
        "matches_count": len(matches),
        "matches": matches
    }

@app.post("/api/matcher/link-action")
def perform_link_action(req: LinkActionRequest):
    """Confirm or reject linking between two overlapping cases."""
    src = _find_grievance(req.source_case_id)
    tgt = _find_grievance(req.target_case_id)

    if req.action == "CONFIRM":
        # Add bidirectional links
        src_links = src.setdefault("related_case_ids", [])
        tgt_links = tgt.setdefault("related_case_ids", [])

        if tgt["id"] not in src_links:
            src_links.append(tgt["id"])
            src["related_case_count"] = len(src_links)
            _add_timeline_event(
                src,
                "Case Linked for Joint Coordination Inquiry",
                f"Statutory linkage confirmed with case {tgt['id']} ({tgt.get('institution_name')}). Bundled for joint institutional hearing.",
                req.officer_name,
                "AICTE Officer"
            )

        if src["id"] not in tgt_links:
            tgt_links.append(src["id"])
            tgt["related_case_count"] = len(tgt_links)
            _add_timeline_event(
                tgt,
                "Case Linked for Joint Coordination Inquiry",
                f"Statutory linkage confirmed with case {src['id']} ({src.get('institution_name')}). Bundled for joint institutional hearing.",
                req.officer_name,
                "AICTE Officer"
            )

        return {
            "success": True,
            "action": "CONFIRMED",
            "message": f"Successfully linked {src['id']} and {tgt['id']} into joint inquiry cluster."
        }

    else:
        # Rejection
        reason = req.rejection_reason or "Cases reviewed and determined to be separate individual disputes."
        _add_timeline_event(
            src,
            "Overlap Link Dismissed",
            f"Suggested link with {tgt['id']} dismissed: {reason}",
            req.officer_name,
            "AICTE Officer"
        )
        return {
            "success": True,
            "action": "REJECTED",
            "message": f"Overlap recommendation dismissed between {src['id']} and {tgt['id']}."
        }


# ==========================================================================
# FEATURE 2: CLOSURE-QUALITY VALIDATOR (ACTION TAKEN REPORT SCRUTINY)
# ==========================================================================

@app.get("/api/atr/scrutiny-queue")
def get_atr_scrutiny_queue():
    """
    Evaluates all submitted Action Taken Reports (ATRs) against the 5-factor
    quality validator (boilerplate, missing evidence, transfer runaround, duplicates).
    """
    evaluated_proofs = []
    for proof in mock_resolution_proofs:
        perm_id = proof.get("permanent_id", "")
        past_atrs = get_past_atrs_for_institution(perm_id)
        # Exclude current report text
        past_filtered = [p for p in past_atrs if p.strip() != proof.get("proposed_resolution_summary", "").strip()]

        quality = evaluate_atr_quality(
            category=proof.get("category", ""),
            atr_text=proof.get("proposed_resolution_summary", ""),
            voucher_name=proof.get("proof_document_name"),
            voucher_sha256=proof.get("proof_sha256"),
            past_atrs_for_institution=past_filtered
        )

        item = {
            "id": proof.get("id"),
            "complaintId": proof.get("complaint_id"),
            "complaintTitle": proof.get("complaint_title"),
            "institutionName": proof.get("institution_name"),
            "permanentId": proof.get("permanent_id"),
            "submittedAt": proof.get("submitted_at"),
            "submittedBy": proof.get("submitted_by"),
            "proposedResolutionSummary": proof.get("proposed_resolution_summary"),
            "proofDocumentName": proof.get("proof_document_name"),
            "proofSha256": proof.get("proof_sha256"),
            "status": proof.get("status"),
            "reviewerRemarks": proof.get("reviewer_remarks"),
            "reviewedAt": proof.get("reviewed_at"),
            "reviewedBy": proof.get("reviewed_by"),
            "complainantDisputeFiled": proof.get("complainant_dispute_filed", False),
            "disputeReason": proof.get("dispute_reason"),
            # Automated Quality Assessment
            "qualityScore": quality["quality_score"],
            "qualityVerdict": quality["verdict"],
            "statusLabel": quality["status_label"],
            "canDispatchOtp": quality["can_dispatch_otp"],
            "extractedUtr": quality["extracted_utr"],
            "riskFlags": quality["risk_flags"],
            "scrutinyReasons": quality["reasons"],
            "similarityToPastAtr": quality["similarity_to_past_atr"]
        }
        evaluated_proofs.append(item)

    # Sort so suspicious/flagged closures surface first
    evaluated_proofs.sort(key=lambda p: (p["qualityScore"], p["status"] == "PENDING_REVIEW"), reverse=False)

    return {
        "success": True,
        "count": len(evaluated_proofs),
        "proofs": evaluated_proofs
    }


@app.post("/api/atr/validate")
def validate_single_atr(req: AtrEvaluationRequest):
    """On-demand endpoint to test or validate an ATR before submission."""
    past_atrs = get_past_atrs_for_institution(req.institution_id or "") if req.institution_id else []
    quality = evaluate_atr_quality(
        category=req.category,
        atr_text=req.atr_text,
        voucher_name=req.voucher_name,
        voucher_sha256=req.voucher_sha256,
        past_atrs_for_institution=past_atrs
    )
    return {
        "success": True,
        "complaint_id": req.complaint_id,
        "assessment": quality
    }


@app.post("/api/atr/scrutiny-decision")
def record_atr_scrutiny_decision(req: AtrScrutinyDecisionRequest):
    """
    Bureau Officer either approves substantiated proof (dispatching OTP)
    or rejects evasive/fake closure (issuing a notice to the college).
    """
    target_proof = None
    for p in mock_resolution_proofs:
        if p["id"] == req.proof_id or p["complaint_id"] == req.complaint_id:
            target_proof = p
            break

    if not target_proof:
        raise HTTPException(status_code=404, detail="Resolution proof not found")

    target_case = _find_grievance(req.complaint_id)

    target_proof["reviewed_by"] = req.officer_name
    target_proof["reviewed_at"] = datetime.datetime.now().isoformat()
    target_proof["reviewer_remarks"] = req.remarks

    if req.action == "APPROVE_AND_DISPATCH_OTP":
        target_proof["status"] = "ACCEPTED_FOR_OTP"
        target_case["current_stage"] = "PENDING_OTP"
        target_case["stage_number"] = 5
        _add_timeline_event(
            target_case,
            "Resolution Proof Verified by Bureau Officer",
            f"Action Taken Report and payment vouchers cleared quality scrutiny. OTP dispatched to complainant for final closure verification. Remarks: {req.remarks}",
            req.officer_name,
            "AICTE PGRC Officer"
        )
        return {
            "success": True,
            "status": "ACCEPTED_FOR_OTP",
            "message": f"Resolution validated. Complainant OTP dispatched for case {req.complaint_id}."
        }

    elif req.action == "REJECT_FAKE_CLOSURE":
        target_proof["status"] = "REJECTED"
        target_case["current_stage"] = "UNDER_INVESTIGATION"
        target_case["stage_number"] = 3
        _add_timeline_event(
            target_case,
            "Resolution Proof Disallowed (Quality Gate Rejection)",
            f"Institutional Action Taken Report rejected as evasive/unsubstantiated by Quality Validator. Remarks: {req.remarks}. Formal compliance notice served to Institution Nodal Officer.",
            req.officer_name,
            "AICTE PGRC Officer"
        )
        return {
            "success": True,
            "status": "REJECTED",
            "message": f"Fake closure disallowed. Statutory warning issued to {target_proof.get('institution_name')}."
        }

    else:
        # Disputed by citizen
        target_proof["status"] = "DISPUTED"
        target_proof["complainant_dispute_filed"] = True
        target_proof["dispute_reason"] = req.remarks
        target_case["current_stage"] = "ESCALATED"
        target_case["stage_number"] = 4
        _add_timeline_event(
            target_case,
            "Complainant Refused OTP / Filed Dispute",
            f"Citizen contested institutional closure claim: '{req.remarks}'. Escalated to State Technical Ombudsman.",
            "Complainant",
            "Citizen"
        )
        return {
            "success": True,
            "status": "DISPUTED",
            "message": f"Dispute recorded. Case {req.complaint_id} escalated to Ombudsman tier."
        }


# ==========================================================================
# Tamper-Evident Timeline Cryptographic Verification Endpoints
# ==========================================================================

@app.get("/api/timeline/{case_id}/verify", response_model=TimelineVerificationResponse)
def verify_timeline(case_id: str):
    """
    Cryptographically verifies the SHA-256 hash chain of the grievance timeline.
    Checks each block's predecessor pointer and verifies payload integrity from Genesis to Head.
    """
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    res = verify_case_timeline(case_id)
    return res


@app.post("/api/timeline/{case_id}/simulate-tamper")
def simulate_tamper(case_id: str, req: SimulateTamperRequest):
    """
    Simulates unauthorized alteration of an event in the timeline (e.g. backdated remark).
    Demonstrates how the mathematical hash chain immediately detects tampering.
    """
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    result = tamper_case_timeline(case_id, req.event_index, req.tampered_text)
    return result


@app.post("/api/timeline/{case_id}/restore-chain")
def restore_timeline(case_id: str):
    """
    Restores the authentic, verified cryptographic hash chain from secure snapshot.
    """
    case = get_case_by_id(case_id)
    if not case:
        raise HTTPException(status_code=404, detail=f"Case {case_id} not found")

    result = restore_case_timeline(case_id)
    return result


# ==========================================================================
# Institution Grievance Scorecard & Inspection Priority Endpoints
# ==========================================================================

@app.get("/api/scorecards", response_model=List[InstitutionScorecardItem])
def get_institution_scorecards(
    tier: Optional[str] = Query(None, description="Filter by priority tier (CRITICAL, HIGH, MEDIUM, ROUTINE)"),
    region: Optional[str] = Query(None, description="Filter by geographic region"),
    search: Optional[str] = Query(None, description="Search by Permanent ID or Name")
):
    """
    Aggregates complaints by AICTE Permanent ID and produces an explainable,
    rule-based inspection priority ranking.
    """
    scorecards = generate_all_scorecards(
        mock_institutions,
        mock_grievances,
        mock_resolution_proofs
    )

    if tier and tier.upper() != "ALL":
        scorecards = [s for s in scorecards if s["priority_tier"].upper() == tier.upper()]

    if region and region.upper() != "ALL":
        scorecards = [s for s in scorecards if region.lower() in s["region"].lower()]

    if search:
        q = search.lower().strip()
        scorecards = [
            s for s in scorecards
            if q in s["permanent_id"].lower() or q in s["institution_name"].lower() or q in s["city"].lower()
        ]

    return scorecards


@app.get("/api/scorecards/{permanent_id}", response_model=InstitutionScorecardItem)
def get_scorecard_detail(permanent_id: str):
    """
    Retrieves the detailed scorecard and transparent scoring breakdown for a specific Permanent ID.
    """
    scorecards = generate_all_scorecards(
        mock_institutions,
        mock_grievances,
        mock_resolution_proofs
    )
    for s in scorecards:
        if s["permanent_id"].lower() == permanent_id.lower():
            return s
    raise HTTPException(status_code=404, detail=f"No institution found with Permanent ID {permanent_id}")


@app.post("/api/scorecards/{permanent_id}/order-inspection")
def order_inspection(permanent_id: str, req: IssueInspectionOrderRequest):
    """
    Issues an official AICTE Vigilance & Grievance Bureau inspection mandate or summons.
    """
    scorecards = generate_all_scorecards(
        mock_institutions,
        mock_grievances,
        mock_resolution_proofs
    )
    target_card = next((s for s in scorecards if s["permanent_id"].lower() == permanent_id.lower()), None)
    if not target_card:
        raise HTTPException(status_code=404, detail=f"Permanent ID {permanent_id} not found")

    new_order = {
        "id": f"INSP-2026-{random.randint(100, 999)}",
        "permanent_id": permanent_id,
        "institution_name": target_card["institution_name"],
        "officer_name": req.officer_name,
        "inspection_type": req.inspection_type,
        "target_date": req.target_date,
        "terms_of_reference": req.terms_of_reference,
        "inspecting_team": req.inspecting_team or [req.officer_name, "State Nodal Observer"],
        "status": "ORDERED",
        "ordered_at": datetime.datetime.now().isoformat(),
        "inspection_priority_score": target_card["inspection_priority_score"],
        "priority_tier": target_card["priority_tier"],
    }
    mock_inspection_orders.append(new_order)

    return {
        "success": True,
        "message": f"Official {req.inspection_type} inspection mandate issued for {target_card['institution_name']}.",
        "order": new_order
    }


@app.get("/api/scorecards/{permanent_id}/orders")
def get_inspection_orders(permanent_id: str):
    """Returns all past and active inspection orders for an institution."""
    return [
        o for o in mock_inspection_orders 
        if o["permanent_id"].lower() == permanent_id.lower()
    ]


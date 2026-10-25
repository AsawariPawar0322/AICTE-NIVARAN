# ==========================================================================
# AICTE NIVARAN (एआईसीटीई निवारण) · FastAPI Central Coordination Server
# ==========================================================================

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any, Literal
import datetime
import random

from app.database import mock_institutions, mock_grievances, mock_otp_sessions, mock_messages
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
    LinkActionRequest
)
from app.matcher import analyze_grievance_overlap, find_all_overlap_candidates

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
    target["timeline"].append({
        "id": f"t-close-{int(datetime.datetime.now().timestamp())}",
        "title": "Case Formally Disposed & Citizen OTP Verified",
        "description": "Complainant verified satisfaction via 6-digit OTP. AICTE Certificate generated.",
        "actor": target["complainant_name"],
        "role": "Citizen Verification",
        "timestamp": "Just now",
        "stage": "RESOLVED"
    })
    
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
    target["timeline"].append({
        "id": f"t-esc-{int(datetime.datetime.now().timestamp())}",
        "title": "Escalated to State Technical Ombudsman",
        "description": f"Citizen rejected resolution: '{req.dissatisfied_reason}'. Reopened for Ombudsman inquiry.",
        "actor": target["complainant_name"],
        "role": "Citizen Rejection",
        "timestamp": "Just now",
        "stage": "ESCALATED"
    })
    
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
    case["timeline"].append({
        "id": _new_id("t"),
        "title": title,
        "description": description,
        "actor": actor,
        "role": role,
        "timestamp": "Just now",
        "stage": case["current_stage"]
    })

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


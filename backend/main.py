# ==========================================================================
# AICTE NIVARAN (एआईसीटीई निवारण) · FastAPI Central Coordination Server
# ==========================================================================

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional, List, Dict, Any
import datetime
import random

from app.database import mock_institutions, mock_grievances, mock_otp_sessions
from app.schemas import (
    SendOtpRequest,
    VerifyOtpRequest,
    LoginRequest,
    CreateGrievanceRequest,
    VerifyClosureOtpRequest,
    EscalateRequest,
    ChatMessageRequest
)

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

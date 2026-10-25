# ==========================================================================
# AICTE NIVARAN · Pydantic Schemas
# ==========================================================================

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any, Literal

class SendOtpRequest(BaseModel):
    identifier: str  # Mobile number or Email
    role: Optional[str] = "Student"

class VerifyOtpRequest(BaseModel):
    identifier: str
    otp: str
    role: Optional[str] = "Student"

class LoginRequest(BaseModel):
    identifier: str
    role: str
    password_or_pin: Optional[str] = None
    is_demo: Optional[bool] = False

class EvidenceUploadItem(BaseModel):
    id: str
    name: str
    size: int
    type: str
    sha256_hash: str
    upload_date: Optional[str] = "Just now"

class CreateGrievanceRequest(BaseModel):
    title: str
    category: str
    category_label: str
    institution_name: str
    aicte_permanent_id: str
    city: str
    state: str
    complainant_name: str
    complainant_role: str
    contact_mobile: str
    contact_email: str
    is_anonymous: bool
    details: str
    evidence_list: List[EvidenceUploadItem]
    link_to_related: Optional[bool] = False

class VerifyClosureOtpRequest(BaseModel):
    case_id: str
    otp: str
    citizen_feedback: Optional[str] = "Verified and accepted resolution."
    satisfaction_rating: Optional[int] = 5

class EscalateRequest(BaseModel):
    case_id: str
    dissatisfied_reason: str

class DocumentRequestIn(BaseModel):
    items: List[str]
    note: Optional[str] = None
    due_date: Optional[str] = None

class ChatMessageRequest(BaseModel):
    sender_role: Literal["complainant", "officer"]
    sender_name: str
    content: str
    kind: Literal["text", "clarification", "document_request"] = "text"
    document_request: Optional[DocumentRequestIn] = None
    attachments: List[EvidenceUploadItem] = []

class MarkReadRequest(BaseModel):
    reader_role: Literal["officer", "complainant"]

class FulfillDocumentRequest(BaseModel):
    sender_name: str
    attachments: List[EvidenceUploadItem]

# ==========================================================================
# Overlap Detection & Case Linker Schemas
# ==========================================================================

class MatchCriteriaBreakdown(BaseModel):
    permanent_id_match: bool
    institution_score: float
    category_match: bool
    category_score: float
    extracted_amount_match: Optional[bool] = None
    extracted_amount_str: Optional[str] = None
    temporal_proximity_days: int
    semantic_similarity_score: float
    shared_keyphrases: List[str] = []

class OverlapRecommendation(BaseModel):
    pair_id: str
    target_case_id: str
    candidate_case_id: str
    candidate_title: str
    candidate_category: str
    candidate_institution_name: str
    candidate_permanent_id: str
    candidate_complainant_masked: str
    candidate_date: str
    confidence_score: int
    recommendation_tier: Literal["PRIORITIZED", "MANUAL_REVIEW", "NO_MATCH"]
    match_reasons: List[str]
    breakdown: MatchCriteriaBreakdown
    is_linked: bool = False
    is_dismissed: bool = False

class LinkActionRequest(BaseModel):
    source_case_id: str
    target_case_id: str
    action: Literal["CONFIRM", "REJECT"]
    officer_name: str
    rejection_reason: Optional[str] = None


class AtrEvaluationRequest(BaseModel):
    complaint_id: str
    category: str
    atr_text: str
    voucher_name: Optional[str] = None
    voucher_sha256: Optional[str] = None
    institution_id: Optional[str] = None


class AtrQualityResult(BaseModel):
    proof_id: Optional[str] = None
    complaint_id: str
    quality_score: int
    verdict: Literal["PASSED_QUALITY_GATE", "SUSPICIOUS_LOW_QUALITY", "FLAGGED_EVASIVE_CLOSURE"]
    status_label: str
    can_dispatch_otp: bool
    extracted_utr: Optional[str] = None
    risk_flags: List[str] = []
    reasons: List[str] = []
    similarity_to_past_atr: float = 0.0


class AtrScrutinyDecisionRequest(BaseModel):
    proof_id: str
    complaint_id: str
    action: Literal["APPROVE_AND_DISPATCH_OTP", "REJECT_FAKE_CLOSURE", "DISPUTED_BY_CITIZEN"]
    officer_name: str
    remarks: str


# ==========================================================================
# Tamper-Evident Timeline Schemas
# ==========================================================================

class TimelineVerificationResponse(BaseModel):
    case_id: str
    is_valid: bool
    total_events_verified: int = 0
    genesis_root: Optional[str] = None
    head_hash: Optional[str] = None
    verification_status: Literal["CRYPTOGRAPHICALLY_VERIFIED", "TAMPER_DETECTED", "BROKEN_LINKAGE", "EMPTY_TIMELINE"]
    message: str
    broken_at_index: Optional[int] = None
    broken_event_id: Optional[str] = None
    broken_event_title: Optional[str] = None
    expected_hash: Optional[str] = None
    found_hash: Optional[str] = None


class SimulateTamperRequest(BaseModel):
    event_index: int = 2
    tampered_text: Optional[str] = "MALICIOUS AUDIT MODIFICATION: Disposed without physical inspection or refund clearance."


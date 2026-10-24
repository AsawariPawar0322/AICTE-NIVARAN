# ==========================================================================
# AICTE NIVARAN · Pydantic Schemas
# ==========================================================================

from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any

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

class ChatMessageRequest(BaseModel):
    case_id: str
    sender_role: str
    sender_name: str
    content: str
    attachment_name: Optional[str] = None

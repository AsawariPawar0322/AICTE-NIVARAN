# ==========================================================================
# AICTE NIVARAN · Closure-Quality Validator (ATR Scrutiny Engine)
# Detects Evasive Boilerplate, Missing Evidence, Transfer Runarounds & Duplicates
# ==========================================================================

import re
from typing import List, Dict, Any, Optional, Tuple
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Evasive bureaucratic phrases commonly used to artificially dispose complaints
EVASIVE_PHRASES = [
    (r"forwarded to (?:the )?(?:concerned|respective|relevant) (?:department|section|committee|branch|authority|officer)", "Forwarded without resolution"),
    (r"noted for (?:necessary )?compliance", "Generic compliance acknowledgement"),
    (r"matter (?:is )?(?:under|in) process", "Stalled: marked under process without remedy"),
    (r"action (?:has been |is being )?initiated", "Premature closure: action only initiated"),
    (r"suitable instructions (?:have been )?issued", "Vague instructions with no confirmation of resolution"),
    (r"does not pertain to this (?:ministry|bureau|department|institution|section)", "Transfer-only runaround: jurisdictional disclaimer"),
    (r"matter (?:is )?closed from our end", "Unilateral closure declaration"),
    (r"complainant (?:is )?advised to (?:approach|contact) (?:the )?(?:university|dte|court|police|bank)", "Referral runaround: shifting burden to complainant"),
    (r"as per (?:college|institute) rules", "Vague policy citation without speaking order"),
    (r"will be resolved in due course", "Deferred resolution closed prematurely")
]

# Transfer keywords indicating a runaround
TRANSFER_KEYWORDS = [
    "transferred to", "forwarded to university", "contact affiliating university",
    "pertains to state dte", "approach court", "outside our purview",
    "belongs to examination section"
]

# Regex to detect transaction references (UTR, IMPS, NEFT, Cheque numbers)
UTR_REGEX = re.compile(
    r"\b(?:utr|rrn|neft|rtgs|imps|txn|transaction id|reference|ref no\.?|cheque no\.?)(?:\s*(?:no\.?|id|num|reference|code))?\s*[:#-]?\s*([a-zA-Z0-9_-]{8,30})\b",
    re.IGNORECASE
)

# Regex to extract monetary figures
AMOUNT_REGEX = re.compile(r"(?:₹|rs\.?|inr)\s*([\d,]+)|\b(\d{4,6})\b", re.IGNORECASE)


def extract_utr(text: str) -> Optional[str]:
    """Extract bank transaction UTR / Reference number from resolution text."""
    match = UTR_REGEX.search(text)
    if match:
        return match.group(1).strip()
    return None


def detect_evasive_boilerplate(text: str) -> List[str]:
    """Identify evasive non-answers from the bureaucratic phrasebook."""
    flags = []
    text_lower = text.lower()
    for pattern, label in EVASIVE_PHRASES:
        if re.search(pattern, text_lower):
            flags.append(label)
    return flags


def detect_transfer_runaround(text: str) -> bool:
    """Check if the text represents an evasive transfer rather than a remedy."""
    text_lower = text.lower()
    return any(kw in text_lower for kw in TRANSFER_KEYWORDS)


def compute_duplicate_atr_similarity(new_atr: str, past_atrs: List[str]) -> Tuple[float, Optional[str]]:
    """Compute maximum cosine similarity between new ATR and past ATRs from same institution."""
    if not past_atrs or not new_atr.strip():
        return 0.0, None

    valid_past = [p.strip() for p in past_atrs if len(p.strip()) > 10]
    if not valid_past:
        return 0.0, None

    try:
        corpus = [new_atr] + valid_past
        vectorizer = TfidfVectorizer(ngram_range=(1, 2), stop_words="english")
        tfidf_matrix = vectorizer.fit_transform(corpus)
        sims = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:])[0]
        max_idx = int(sims.argmax())
        max_score = float(sims[max_idx])
        return round(max_score, 2), valid_past[max_idx]
    except Exception:
        return 0.0, None


def evaluate_atr_quality(
    category: str,
    atr_text: str,
    voucher_name: Optional[str] = None,
    voucher_sha256: Optional[str] = None,
    past_atrs_for_institution: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Evaluates Action Taken Report (ATR) across 5 automated quality dimensions:
    Base Score: 100
    - Evasive Boilerplate: up to -40 pts
    - Missing Evidence / UTR: up to -30 pts
    - Transfer-only Disposal: up to -35 pts
    - Duplicate Historical ATR: up to -25 pts
    - Extreme Brevity / Vagueness: -15 pts
    """
    score = 100
    risk_flags: List[str] = []
    reasons: List[str] = []

    text_clean = atr_text.strip()
    words = text_clean.split()
    cat_upper = (category or "").upper()

    # 1. Brevity Check
    if len(words) < 15:
        score -= 15
        risk_flags.append("EXTREME_BREVITIES")
        reasons.append("Resolution text is unusually brief (< 15 words) and lacks speaking justification.")

    # 2. Evasive Boilerplate Check
    boilerplate_matches = detect_evasive_boilerplate(text_clean)
    if boilerplate_matches:
        deduction = min(40, len(boilerplate_matches) * 20)
        score -= deduction
        risk_flags.append("EVASIVE_BOILERPLATE_DETECTED")
        reasons.append(f"Boilerplate language detected: {', '.join(boilerplate_matches[:2])}.")

    # 3. Transfer-Only Disposal Check
    is_transfer = detect_transfer_runaround(text_clean)
    if is_transfer:
        score -= 35
        risk_flags.append("TRANSFER_ONLY_DISPOSAL")
        reasons.append("Report closes grievance by transferring burden to another authority without evidence of resolution.")

    # 4. Evidentiary Voucher & UTR Check based on Category
    extracted_utr = extract_utr(text_clean)
    has_voucher = bool(voucher_name and voucher_sha256 and voucher_sha256 != "N/A")

    is_financial = any(term in cat_upper for term in ["FEE", "REFUND", "SCHOLARSHIP", "DEPOSIT"])
    is_credential = any(term in cat_upper for term in ["CERTIFICATE", "MARKSHEET", "DEGREE"])

    if is_financial:
        if not extracted_utr and not has_voucher:
            score -= 30
            risk_flags.append("MISSING_PAYMENT_UTR_AND_VOUCHER")
            reasons.append("Fee/refund resolution requires either a verifiable bank transaction UTR or attached voucher scroll.")
        elif not extracted_utr:
            score -= 10
            reasons.append("Attached voucher present, but no explicit transaction reference UTR found in text.")

    if is_credential:
        has_dispatch = bool(re.search(r"\b(?:dispatch|speed post|handover|received by student|consignment)\b", text_clean, re.IGNORECASE))
        if not has_dispatch and not has_voucher:
            score -= 30
            risk_flags.append("MISSING_HANDOVER_CONFIRMATION")
            reasons.append("Certificate grievance resolution requires document handover confirmation or dispatch tracking ID.")

    # 5. Duplicate Historical ATR Check
    max_sim, matched_past = compute_duplicate_atr_similarity(text_clean, past_atrs_for_institution or [])
    if max_sim >= 0.85:
        score -= 25
        risk_flags.append("DUPLICATE_HISTORICAL_ATR")
        reasons.append(f"ATR is {int(max_sim * 100)}% identical to a previous ATR submitted by this institution.")

    # Final Clamp
    final_score = max(5, min(100, score))

    # Verdict Determination
    if final_score >= 75 and "MISSING_PAYMENT_UTR_AND_VOUCHER" not in risk_flags and "TRANSFER_ONLY_DISPOSAL" not in risk_flags:
        verdict = "PASSED_QUALITY_GATE"
        can_dispatch_otp = True
        status_label = "Substantiated Resolution"
    elif final_score >= 45:
        verdict = "SUSPICIOUS_LOW_QUALITY"
        can_dispatch_otp = False
        status_label = "Low Quality / Inadequate Proof"
    else:
        verdict = "FLAGGED_EVASIVE_CLOSURE"
        can_dispatch_otp = False
        status_label = "Evasive Boilerplate Fake Closure"

    return {
        "quality_score": final_score,
        "verdict": verdict,
        "status_label": status_label,
        "can_dispatch_otp": can_dispatch_otp,
        "extracted_utr": extracted_utr,
        "risk_flags": risk_flags,
        "reasons": reasons,
        "similarity_to_past_atr": max_sim,
        "evaluation_timestamp": "now"
    }

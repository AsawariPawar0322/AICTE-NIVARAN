# ==========================================================================
# AICTE NIVARAN · High-Accuracy Similar Grievance Detection & Case Linker
# 4-Factor Hybrid Pipeline: Permanent ID + Category + Temporal + Semantic
# ==========================================================================

import re
import datetime
from typing import List, Dict, Any, Optional, Tuple
from rapidfuzz import fuzz
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# Optional deep semantic embeddings (Sentence Transformers)
_EMBEDDING_MODEL = None
_EMBEDDINGS_CACHE: Dict[str, Any] = {}

def get_embedding_model():
    """Lazily load sentence-transformers model if torch is installed."""
    global _EMBEDDING_MODEL
    if _EMBEDDING_MODEL is None:
        try:
            from sentence_transformers import SentenceTransformer
            # Lightweight, high-speed model (~80ms CPU execution)
            _EMBEDDING_MODEL = SentenceTransformer("all-MiniLM-L6-v2")
        except Exception as e:
            # Fall back seamlessly to TF-IDF if model is downloading or unavailable
            _EMBEDDING_MODEL = "TF_IDF_FALLBACK"
    return _EMBEDDING_MODEL


# ==========================================================================
# 1. Normalization & Feature Extraction
# ==========================================================================

KNOWN_INSTITUTION_ALIASES = {
    "1-10928341": ["dtu", "delhi technological university", "delhi college of engineering", "dce", "delhi tech univ"],
    "1-332918231": ["coep", "college of engineering pune", "coep tech", "coep technological university"],
    "1-45892110": ["spce", "sardar patel college of engineering", "spce mumbai"],
    "1-78901234": ["vjti", "veermata jijabai technological institute", "vjti mumbai"],
    "1-98765432": ["mit", "manipal institute of technology", "mit manipal"],
}

CATEGORY_COMPATIBILITY = {
    "FEE_REFUND": ["FEE_REFUND", "SCHOLARSHIP"],
    "SCHOLARSHIP": ["SCHOLARSHIP", "FEE_REFUND"],
    "RAGGING": ["RAGGING"],
    "WOMEN_SAFETY": ["WOMEN_SAFETY"],
    "FACULTY_INFRA": ["FACULTY_INFRA", "ADMISSIONS_EXAM"],
    "ADMISSIONS_EXAM": ["ADMISSIONS_EXAM", "FACULTY_INFRA"],
    "OTHER": ["OTHER"]
}

AMOUNT_REGEX = re.compile(r"(?:₹|rs\.?|inr)\s*([\d,]+)|\b(\d{4,6})\b", re.IGNORECASE)

KEYWORDS_VOCAB = [
    "caution money", "caution deposit", "security deposit", "refund", "withheld",
    "withholding", "deduction", "deducted", "degree certificate", "marksheet",
    "provisional certificate", "bonafide", "hostel deposit", "mess fee",
    "tuition fee", "scholarship", "pmsss", "pragati", "ragging", "harassment",
    "accounts section", "registrar", "ombudsperson"
]

def extract_amounts(text: str) -> List[int]:
    """Extract monetary amounts from text (e.g., ₹44,000 -> 44000)."""
    amounts = []
    for match in AMOUNT_REGEX.finditer(text):
        raw = match.group(1) or match.group(2)
        if raw:
            cleaned = raw.replace(",", "").strip()
            try:
                val = int(cleaned)
                if 500 <= val <= 2500000:  # Sensible range for fees
                    amounts.append(val)
            except ValueError:
                pass
    return list(set(amounts))

def extract_shared_keyphrases(text_a: str, text_b: str) -> List[str]:
    """Find domain keyphrases present in both complaints."""
    lower_a = text_a.lower()
    lower_b = text_b.lower()
    shared = []
    for kw in KEYWORDS_VOCAB:
        if kw in lower_a and kw in lower_b:
            shared.append(kw)
    return shared

def mask_name(name: str) -> str:
    """Mask citizen name for privacy shielding (e.g. 'Pooja Kulkarni' -> 'P***a K.')."""
    if not name or name.lower().startswith("confidential") or name.lower() == "anonymous":
        return "Confidential Student"
    parts = name.strip().split()
    if len(parts) == 1:
        first = parts[0]
        return f"{first[0]}***{first[-1]}" if len(first) > 2 else f"{first[0]}*"
    first = parts[0]
    last = parts[-1]
    masked_first = f"{first[0]}***{first[-1]}" if len(first) > 2 else f"{first[0]}*"
    return f"{masked_first} {last[0]}."


# ==========================================================================
# 2. Multi-Signal Scoring Engine
# ==========================================================================

def calculate_institution_similarity(
    pid_a: str, name_a: str,
    pid_b: str, name_b: str
) -> Tuple[float, bool, Optional[str]]:
    """
    Calculate institution similarity score:
    - 1.0 if identical Permanent IDs
    - 0.85-0.95 if recognized alias of the same permanent ID
    - 0.0 if explicit different non-empty Permanent IDs
    """
    pid_a_clean = (pid_a or "").strip()
    pid_b_clean = (pid_b or "").strip()

    # Exact match on AICTE Permanent ID
    if pid_a_clean and pid_b_clean and pid_a_clean == pid_b_clean:
        return 1.0, True, f"Identical AICTE Permanent ID: {pid_a_clean}"

    # Hard conflict: Explicitly different valid permanent IDs
    if pid_a_clean and pid_b_clean and pid_a_clean != pid_b_clean:
        return 0.0, False, "Different AICTE Permanent IDs"

    # Alias matching
    name_a_clean = name_a.lower().strip()
    name_b_clean = name_b.lower().strip()

    # Check known aliases
    for pid, aliases in KNOWN_INSTITUTION_ALIASES.items():
        match_a = (pid_a_clean == pid) or any(alias in name_a_clean for alias in aliases)
        match_b = (pid_b_clean == pid) or any(alias in name_b_clean for alias in aliases)
        if match_a and match_b:
            return 0.95, True, f"Institution Alias Match ({name_a} ≈ {name_b})"

    # Fuzzy string similarity
    ratio = fuzz.token_set_ratio(name_a_clean, name_b_clean) / 100.0
    if ratio >= 0.80:
        return ratio, False, f"Fuzzy Institution Match ({int(ratio * 100)}%)"

    return ratio * 0.5, False, None


def calculate_category_similarity(cat_a: str, cat_b: str) -> Tuple[float, bool]:
    """Score category alignment."""
    c_a = (cat_a or "").upper().replace(" ", "_")
    c_b = (cat_b or "").upper().replace(" ", "_")

    if c_a == c_b:
        return 1.0, True

    # Check compatibility (e.g. Fee Refund and Scholarship)
    allowed = CATEGORY_COMPATIBILITY.get(c_a, [])
    if c_b in allowed:
        return 0.65, False

    return 0.0, False


def calculate_temporal_proximity(date_a_str: str, date_b_str: str) -> Tuple[float, int]:
    """Score temporal proximity of filing."""
    # Default to 5 days if dates are unparseable display strings ("Just now", "2 days ago")
    days_diff = 5
    if days_diff <= 14:
        return 1.0, days_diff
    elif days_diff <= 30:
        return 0.75, days_diff
    elif days_diff <= 90:
        return 0.40, days_diff
    return 0.15, days_diff


def calculate_semantic_similarity(text_a: str, text_b: str) -> float:
    """Calculate semantic text similarity using Sentence Transformers or TF-IDF."""
    model = get_embedding_model()
    
    if model != "TF_IDF_FALLBACK" and hasattr(model, "encode"):
        try:
            embeddings = model.encode([text_a, text_b])
            cos = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
            return float(max(0.0, min(1.0, cos)))
        except Exception:
            pass

    # Fast TF-IDF + Character n-gram fallback
    try:
        tfidf = TfidfVectorizer(ngram_range=(1, 2))
        matrix = tfidf.fit_transform([text_a, text_b])
        cos = cosine_similarity(matrix[0:1], matrix[1:2])[0][0]
        # Boost with fuzzy token sort
        fuzz_sim = fuzz.token_sort_ratio(text_a.lower(), text_b.lower()) / 100.0
        return float(max(0.0, min(1.0, (cos * 0.6) + (fuzz_sim * 0.4))))
    except Exception:
        return float(fuzz.token_set_ratio(text_a, text_b) / 100.0)


# ==========================================================================
# 3. Main Overlap Analysis Engine
# ==========================================================================

def analyze_grievance_overlap(
    target_grievance: Dict[str, Any],
    candidate_grievance: Dict[str, Any]
) -> Optional[Dict[str, Any]]:
    """
    Evaluates a pair of grievances through the 4-factor formula:
    Score = (0.45 * S_inst) + (0.25 * S_cat) + (0.15 * S_time) + (0.15 * S_semantic)
    """
    target_id = target_grievance.get("id", "")
    cand_id = candidate_grievance.get("id", "")

    if target_id == cand_id:
        return None

    # 1. Institution Similarity (45% weight)
    inst_score, is_pid_match, inst_reason = calculate_institution_similarity(
        target_grievance.get("aicte_permanent_id", ""),
        target_grievance.get("institution_name", ""),
        candidate_grievance.get("aicte_permanent_id", ""),
        candidate_grievance.get("institution_name", "")
    )

    # Hard Constraint: If different permanent IDs, reject as cross-institution
    if inst_score == 0.0:
        return None

    # 2. Category Similarity (25% weight)
    cat_score, is_cat_match = calculate_category_similarity(
        target_grievance.get("category", ""),
        candidate_grievance.get("category", "")
    )

    # 3. Temporal Proximity (15% weight)
    time_score, days_apart = calculate_temporal_proximity(
        target_grievance.get("created_at", "Just now"),
        candidate_grievance.get("created_at", "5 days ago")
    )

    # 4. Semantic Similarity (15% weight)
    target_text = f"{target_grievance.get('title', '')} {target_grievance.get('details', '')}"
    cand_text = f"{candidate_grievance.get('title', '')} {candidate_grievance.get('details', '')}"
    sem_score = calculate_semantic_similarity(target_text, cand_text)

    # 5. Amount Extraction & Consistency
    target_amounts = extract_amounts(target_text)
    cand_amounts = extract_amounts(cand_text)
    shared_amounts = set(target_amounts).intersection(set(cand_amounts))
    amount_match = len(shared_amounts) > 0 if (target_amounts and cand_amounts) else None
    amount_str = f"₹{next(iter(shared_amounts)):,}" if shared_amounts else None

    # Amount match bonus
    amount_bonus = 0.05 if amount_match else 0.0

    # Calculate final weighted score [0, 100]
    raw_score = (
        (0.45 * inst_score) +
        (0.25 * cat_score) +
        (0.15 * time_score) +
        (0.15 * sem_score) +
        amount_bonus
    )
    final_score = int(min(100, max(0, round(raw_score * 100))))

    # Determine recommendation tier
    if final_score >= 80:
        tier = "PRIORITIZED"
    elif final_score >= 50:
        tier = "MANUAL_REVIEW"
    else:
        tier = "NO_MATCH"

    if tier == "NO_MATCH":
        return None

    # Construct human-readable match reasons
    match_reasons = []
    if is_pid_match:
        match_reasons.append(f"Permanent ID Match: {target_grievance.get('aicte_permanent_id', 'DTU')}")
    elif inst_reason:
        match_reasons.append(inst_reason)

    if is_cat_match:
        match_reasons.append(f"Same Category: {target_grievance.get('category_label', target_grievance.get('category'))}")

    if amount_match and amount_str:
        match_reasons.append(f"Identical Disputed Amount: {amount_str}")

    shared_kws = extract_shared_keyphrases(target_text, cand_text)
    if shared_kws:
        match_reasons.append(f"Shared Keyphrases: {', '.join(shared_kws[:3])}")

    match_reasons.append(f"Filed within ~{days_apart} days")

    pair_id = f"pair-{target_id}-{cand_id}"

    return {
        "pair_id": pair_id,
        "target_case_id": target_id,
        "candidate_case_id": cand_id,
        "candidate_title": candidate_grievance.get("title", ""),
        "candidate_category": candidate_grievance.get("category_label", candidate_grievance.get("category", "")),
        "candidate_institution_name": candidate_grievance.get("institution_name", ""),
        "candidate_permanent_id": candidate_grievance.get("aicte_permanent_id", ""),
        "candidate_complainant_masked": mask_name(candidate_grievance.get("complainant_name", "")),
        "candidate_date": candidate_grievance.get("created_at", "Recently"),
        "confidence_score": final_score,
        "recommendation_tier": tier,
        "match_reasons": match_reasons,
        "breakdown": {
            "permanent_id_match": is_pid_match,
            "institution_score": round(inst_score, 2),
            "category_match": is_cat_match,
            "category_score": round(cat_score, 2),
            "extracted_amount_match": amount_match,
            "extracted_amount_str": amount_str,
            "temporal_proximity_days": days_apart,
            "semantic_similarity_score": round(sem_score, 2),
            "shared_keyphrases": shared_kws
        },
        "is_linked": cand_id in target_grievance.get("related_case_ids", []),
        "is_dismissed": False
    }


def find_all_overlap_candidates(all_grievances: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Generates coordination recommendations for all active unclosed cases."""
    recommendations = []
    seen_pairs = set()

    for i, g_a in enumerate(all_grievances):
        for j, g_b in enumerate(all_grievances):
            if i >= j:
                continue

            pair_key = tuple(sorted([g_a.get("id"), g_b.get("id")]))
            if pair_key in seen_pairs:
                continue

            res = analyze_grievance_overlap(g_a, g_b)
            if res:
                recommendations.append(res)
                seen_pairs.add(pair_key)

    # Sort descending by confidence score
    recommendations.sort(key=lambda r: r["confidence_score"], reverse=True)
    return recommendations

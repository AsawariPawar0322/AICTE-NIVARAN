# ==========================================================================
# AICTE NIVARAN · Institution Grievance Scorecard & Inspection Prioritization
# Aggregates cases by Permanent ID & applies explainable audit rules
# ==========================================================================

from typing import List, Dict, Any, Optional
import statistics

# Inspection priority tier thresholds
PRIORITY_CRITICAL_THRESHOLD = 70
PRIORITY_HIGH_THRESHOLD = 50
PRIORITY_MEDIUM_THRESHOLD = 30


def calculate_median_resolution_days(resolved_events: List[int]) -> float:
    """Calculates median resolution time in days from a list of durations."""
    if not resolved_events:
        return 7.0  # Statutory default benchmark
    return round(statistics.median(resolved_events), 1)


def evaluate_institution_scorecard(
    permanent_id: str,
    institution_meta: Dict[str, Any],
    complaints: List[Dict[str, Any]],
    resolution_proofs: List[Dict[str, Any]]
) -> Dict[str, Any]:
    """
    Computes a transparent, explainable Inspection Priority Score (0 - 100)
    for a given AICTE Permanent ID based on multi-factor grievance intelligence.
    """
    total_cases = len(complaints)
    active_cases = [c for c in complaints if c.get("current_stage") not in ["RESOLVED", "REJECTED"]]
    resolved_cases = [c for c in complaints if c.get("current_stage") == "RESOLVED"]

    # 1. Upheld Complaints: Cases where financial refund or corrective order was ruled against college
    upheld_complaints = []
    for c in complaints:
        # Check resolution details or timeline for financial refund/corrective action
        res_details = c.get("resolution_proposed_details", {})
        atr_text = str(res_details.get("atr_summary", "")).lower()
        title_text = str(c.get("title", "")).lower()
        
        is_upheld = (
            "refund" in atr_text or 
            "neft" in atr_text or 
            "utr" in atr_text or 
            "admitted" in atr_text or 
            "returned" in atr_text or
            c.get("stage_number", 0) >= 5 or
            c.get("current_stage") == "RESOLVED"
        )
        if is_upheld:
            upheld_complaints.append(c["id"])

    upheld_count = len(upheld_complaints)

    # 2. Overdue Rate: Percentage of active cases exceeding statutory SLA
    overdue_cases = [
        c for c in active_cases 
        if c.get("sla_hours_remaining", 0) <= 0 or c.get("isOverdue", False)
    ]
    overdue_rate = round((len(overdue_cases) / len(active_cases) * 100) if active_cases else 0.0, 1)

    # 3. Reopened / Escalated Cases: Citizen dispute filed or Ombudsman escalation
    reopened_cases = []
    for c in complaints:
        is_escalated = (
            c.get("current_stage") == "ESCALATED" or 
            any(t.get("stage") == "ESCALATED" for t in c.get("timeline", []))
        )
        # Check if resolution proof was disputed
        proof = next((p for p in resolution_proofs if p.get("complaint_id") == c["id"]), None)
        if is_escalated or (proof and proof.get("complainant_dispute_filed")):
            reopened_cases.append(c["id"])

    reopened_count = len(reopened_cases)

    # 4. Overlap / Systemic Cluster Count
    overlap_count = 0
    for c in complaints:
        rel_count = c.get("related_case_count", 0) or len(c.get("related_case_ids", []))
        if rel_count > overlap_count:
            overlap_count = rel_count

    # 5. Flagged Evasive ATRs (Fake closures rejected by scrutinizer)
    flagged_atrs = [
        p for p in resolution_proofs 
        if p.get("permanent_id") == permanent_id and p.get("status") in ["PENDING_REVIEW", "REJECTED", "DISPUTED"]
    ]
    flagged_atr_count = len(flagged_atrs)

    # 6. Resolution durations (synthetic durations based on stages)
    durations = []
    for c in complaints:
        if c.get("current_stage") in ["RESOLVED", "PENDING_OTP"]:
            durations.append(14)
        else:
            durations.append(21)
    median_resolution_days = calculate_median_resolution_days(durations)

    # ======================================================================
    # Transparent Rule-Based Scoring Engine (0 - 100 Points)
    # ======================================================================
    score = 0.0
    explainable_reasons: List[str] = []
    score_breakdown: Dict[str, float] = {}

    # Weight 1: Overdue SLA Breach Rate (Max 25 pts)
    overdue_pts = 0.0
    if overdue_rate >= 50.0:
        overdue_pts = 25.0
        explainable_reasons.append(f"Critical Overdue Rate ({overdue_rate}% of active cases exceed statutory SLA)")
    elif overdue_rate >= 25.0:
        overdue_pts = 15.0
        explainable_reasons.append(f"Elevated Overdue Rate ({overdue_rate}% active cases breached SLA)")
    elif overdue_rate > 0.0:
        overdue_pts = 8.0
        explainable_reasons.append(f"Minor Overdue Cases present ({overdue_rate}%)")
    score_breakdown["overdue_points"] = overdue_pts
    score += overdue_pts

    # Weight 2: Reopened Cases & Citizen Ombudsman Escalation (Max 25 pts)
    reopen_pts = min(25.0, reopened_count * 12.5)
    score_breakdown["reopened_points"] = reopen_pts
    score += reopen_pts
    if reopened_count >= 2:
        explainable_reasons.append(f"{reopened_count} Citizens rejected resolution & escalated to Technical Ombudsman")
    elif reopened_count == 1:
        explainable_reasons.append("1 Citizen formally disputed institutional Action Taken Report")

    # Weight 3: Upheld Violations Ruled Against College (Max 20 pts)
    upheld_pts = min(20.0, upheld_count * 10.0)
    score_breakdown["upheld_points"] = upheld_pts
    score += upheld_pts
    if upheld_count >= 2:
        explainable_reasons.append(f"{upheld_count} Substantive violations upheld against institution requiring fee refund")
    elif upheld_count == 1:
        explainable_reasons.append("1 Substantive fee refund order upheld against college")

    # Weight 4: Systemic Overlap / Multi-complainant Cluster (Max 15 pts)
    overlap_pts = 0.0
    if overlap_count >= 3:
        overlap_pts = 15.0
        explainable_reasons.append(f"High-Density Cluster: {overlap_count} overlapping complaints alleging identical violation")
    elif overlap_count >= 2:
        overlap_pts = 10.0
        explainable_reasons.append(f"Systemic Repeat Issue: {overlap_count} overlapping complaints detected")
    elif overlap_count >= 1:
        overlap_pts = 5.0
    score_breakdown["overlap_points"] = overlap_pts
    score += overlap_pts

    # Weight 5: Evasive ATR & Fake Closure Detection (Max 15 pts)
    evasive_pts = 0.0
    if flagged_atr_count >= 2:
        evasive_pts = 15.0
        explainable_reasons.append(f"{flagged_atr_count} Action Taken Reports flagged for evasive boilerplate or missing UTR")
    elif flagged_atr_count == 1:
        evasive_pts = 10.0
        explainable_reasons.append("Action Taken Report flagged by Scrutiny Validator for evasive boilerplate")
    score_breakdown["evasive_atr_points"] = evasive_pts
    score += evasive_pts

    # Final Normalized Score
    final_score = int(round(min(100.0, score)))

    # Determine Inspection Priority Tier & Mandated Action
    if final_score >= PRIORITY_CRITICAL_THRESHOLD:
        priority_tier = "CRITICAL"
        recommended_action = "MANDATE_SURPRISE_PHYSICAL_INSPECTION"
        recommended_action_label = "Mandate Surprise Physical Inspection"
    elif final_score >= PRIORITY_HIGH_THRESHOLD:
        priority_tier = "HIGH"
        recommended_action = "ISSUE_STATUTORY_SHOW_CAUSE"
        recommended_action_label = "Issue Statutory Show-Cause Notice & Desk Audit"
    elif final_score >= PRIORITY_MEDIUM_THRESHOLD:
        priority_tier = "MEDIUM"
        recommended_action = "NODAL_OFFICER_HEARING"
        recommended_action_label = "Summon Nodal Officer for Online Hearing"
    else:
        priority_tier = "ROUTINE"
        recommended_action = "PERIODIC_COMPLIANCE_MONITORING"
        recommended_action_label = "Periodic Compliance Monitoring"

    if not explainable_reasons:
        explainable_reasons.append("Satisfactory compliance record with zero major statutory SLA violations.")

    return {
        "permanent_id": permanent_id,
        "institution_name": institution_meta.get("name", "Unknown Institution"),
        "city": institution_meta.get("city", ""),
        "state": institution_meta.get("state", ""),
        "region": institution_meta.get("region", "Northern"),
        "total_cases": total_cases,
        "active_cases": len(active_cases),
        "resolved_cases": len(resolved_cases),
        "upheld_complaints": upheld_count,
        "upheld_complaint_ids": upheld_complaints,
        "median_resolution_days": median_resolution_days,
        "overdue_rate": overdue_rate,
        "reopened_cases": reopened_count,
        "reopened_case_ids": reopened_cases,
        "overlap_count": overlap_count,
        "flagged_atr_count": flagged_atr_count,
        "inspection_priority_score": final_score,
        "priority_tier": priority_tier,
        "recommended_action": recommended_action,
        "recommended_action_label": recommended_action_label,
        "score_breakdown": score_breakdown,
        "explainable_reasons": explainable_reasons,
    }


def generate_all_scorecards(
    institutions: List[Dict[str, Any]],
    complaints: List[Dict[str, Any]],
    resolution_proofs: List[Dict[str, Any]]
) -> List[Dict[str, Any]]:
    """
    Aggregates all complaints across all institutions by Permanent ID and
    ranks institutions by Inspection Priority Score in descending order.
    """
    # Group complaints by permanent_id
    grouped_complaints: Dict[str, List[Dict[str, Any]]] = {}
    for c in complaints:
        pid = c.get("aicte_permanent_id") or c.get("institutionPermanentId") or "1-10928341"
        if pid not in grouped_complaints:
            grouped_complaints[pid] = []
        grouped_complaints[pid].append(c)

    scorecards = []
    for inst in institutions:
        pid = inst.get("permanent_id") or inst.get("permanentId")
        if not pid:
            continue
        inst_complaints = grouped_complaints.get(pid, [])
        scorecard = evaluate_institution_scorecard(pid, inst, inst_complaints, resolution_proofs)
        scorecards.append(scorecard)

    # Sort descending by inspection priority score
    scorecards.sort(key=lambda s: s["inspection_priority_score"], reverse=True)

    # Assign Rank
    for rank, sc in enumerate(scorecards, 1):
        sc["inspection_rank"] = rank

    return scorecards

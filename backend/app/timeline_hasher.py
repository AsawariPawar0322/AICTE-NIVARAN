# ==========================================================================
# AICTE NIVARAN · Tamper-Evident Cryptographic Case Timeline
# Sequential SHA-256 Hash Chaining (Merkle Linkage) for Audit Integrity
# ==========================================================================

import hashlib
import json
from typing import List, Dict, Any, Optional, Tuple

GENESIS_PREV_HASH = "0000000000000000000000000000000000000000000000000000000000000000"


def compute_event_hash(event: Dict[str, Any], previous_hash: str) -> str:
    """
    Computes a deterministic SHA-256 digest over the canonical event payload
    bound to the predecessor's hash.
    """
    canonical_payload = {
        "prev_hash": previous_hash,
        "event_id": str(event.get("id", "")),
        "timestamp": str(event.get("timestamp", "")),
        "stage": str(event.get("stageName") or event.get("stage") or event.get("title", "")),
        "actor_name": str(event.get("performedByName") or event.get("actor", "")),
        "actor_role": str(event.get("performedByRole") or event.get("role", "")),
        "action_taken": str(event.get("actionTaken") or event.get("description", "")),
    }
    # Deterministic JSON serialization with sorted keys
    canonical_bytes = json.dumps(canonical_payload, sort_keys=True).encode("utf-8")
    return hashlib.sha256(canonical_bytes).hexdigest()


def chain_events(events: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """
    Transforms a list of chronological timeline events into an immutable
    cryptographic hash chain from Genesis Root to Head.
    """
    chained = []
    current_prev = GENESIS_PREV_HASH

    for i, raw_event in enumerate(events):
        event = dict(raw_event)
        event["eventIndex"] = i + 1
        event["isGenesisRoot"] = (i == 0)
        event["previousHash"] = current_prev
        
        # Calculate current hash bound to previous hash
        event_hash = compute_event_hash(event, current_prev)
        event["currentHash"] = event_hash
        current_prev = event_hash
        
        chained.append(event)

    return chained


def append_chained_event(
    existing_events: List[Dict[str, Any]],
    new_event: Dict[str, Any]
) -> Dict[str, Any]:
    """Appends a single new event to an existing chained timeline."""
    if not existing_events:
        previous_hash = GENESIS_PREV_HASH
        event_index = 1
        is_genesis = True
    else:
        last_event = existing_events[-1]
        previous_hash = last_event.get("currentHash") or GENESIS_PREV_HASH
        event_index = len(existing_events) + 1
        is_genesis = False

    event = dict(new_event)
    event["eventIndex"] = event_index
    event["isGenesisRoot"] = is_genesis
    event["previousHash"] = previous_hash
    event["currentHash"] = compute_event_hash(event, previous_hash)

    return event


def verify_timeline_integrity(events: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Traverses the event chain from Genesis root to Head, re-computing each hash
    sequentially. Detects any backdating, deleted event, or altered text.
    """
    if not events:
        return {
            "is_valid": True,
            "total_events_verified": 0,
            "genesis_root": None,
            "head_hash": None,
            "verification_status": "EMPTY_TIMELINE",
            "message": "Timeline is empty."
        }

    expected_prev = GENESIS_PREV_HASH

    for i, event in enumerate(events):
        stored_prev = event.get("previousHash")
        stored_current = event.get("currentHash")

        # 1. Verify predecessor linkage
        if stored_prev != expected_prev:
            return {
                "is_valid": False,
                "total_events_verified": i,
                "genesis_root": events[0].get("currentHash") if events else None,
                "head_hash": None,
                "broken_at_index": i + 1,
                "broken_event_id": event.get("id"),
                "broken_event_title": event.get("stageName") or event.get("title"),
                "expected_hash": expected_prev,
                "found_hash": stored_prev,
                "verification_status": "BROKEN_LINKAGE",
                "message": f"Cryptographic Linkage Broken at Event #{i + 1}: Previous hash mismatch. Possible deleted or reordered event."
            }

        # 2. Verify payload integrity
        recomputed_current = compute_event_hash(event, expected_prev)
        if stored_current != recomputed_current:
            return {
                "is_valid": False,
                "total_events_verified": i,
                "genesis_root": events[0].get("currentHash") if events else None,
                "head_hash": None,
                "broken_at_index": i + 1,
                "broken_event_id": event.get("id"),
                "broken_event_title": event.get("stageName") or event.get("title"),
                "expected_hash": recomputed_current,
                "found_hash": stored_current,
                "verification_status": "TAMPER_DETECTED",
                "message": f"Tamper Detected at Event #{i + 1} ('{event.get('stageName') or event.get('title')}'): Stored hash does not match recomputed payload hash. Record text or timestamp was modified without authorization."
            }

        expected_prev = stored_current

    return {
        "is_valid": True,
        "total_events_verified": len(events),
        "genesis_root": events[0].get("currentHash"),
        "head_hash": expected_prev,
        "verification_status": "CRYPTOGRAPHICALLY_VERIFIED",
        "message": f"Cryptographic Integrity Verified: All {len(events)} events are sequentially linked from Genesis root. Zero unauthorized modifications detected."
    }

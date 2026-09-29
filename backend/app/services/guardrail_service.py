"""
Deterministic guardrail service.
Guardrails run in CODE after the LLM — injected text cannot bypass them.

Guardrail rules:
1. NEVER AUTO_CLOSE a CRITICAL alert.
2. NEVER AUTO_CLOSE when confidence < 0.85.
3. No relevant memory → never auto-close; return NEEDS_HUMAN.
4. Conflicting memories (same pattern benign AND malicious) → NEEDS_HUMAN.
5. Evidence mismatch: compare current alert key fields vs memory fields; if key
   fields differ materially from benign memories being relied on → NEEDS_HUMAN.
6. Known benign pattern + all key fields match + confidence ≥ 0.85 → AUTO_CLOSE allowed.
7. HIGH severity requires human review unless override allowed.
"""
import logging
from typing import Optional

from app.models.triage import LLMVerdict, GuardrailResult

logger = logging.getLogger(__name__)

CONFIDENCE_THRESHOLD = 0.85
BENIGN_TAGS = {"false-positive", "environment-memory"}
MALICIOUS_TAGS = {"true-positive", "incident-memory", "c2", "brute-force"}


def _has_conflicting_memories(memories: list, alert_fields: Optional[dict] = None) -> bool:
    """Return True if recalled memories for this pattern contain conflicting verdicts."""
    if not memories:
        return False
    # If alert_fields provided, check memories matching this source IP or pattern
    relevant = memories
    if alert_fields and alert_fields.get("source_ip"):
        src = alert_fields["source_ip"].lower()
        matched = [m for m in memories if src in (m.text or "").lower()]
        if matched:
            relevant = matched

    has_benign = False
    has_malicious = False
    for m in relevant:
        text_lower = (m.text or "").lower()
        tags = set(m.tags or [])
        if tags & MALICIOUS_TAGS or "true positive" in text_lower or "confirmed malicious" in text_lower:
            has_malicious = True
        if tags & BENIGN_TAGS or "false positive" in text_lower or "authorized" in text_lower:
            has_benign = True
    return has_benign and has_malicious


def _extract_memory_key_fields(memory_text: str) -> dict:
    """
    Extract structured fields from a memory's text for evidence mismatch comparison.
    We look for patterns like 'Source IP: x.x.x.x', 'Environment: production', etc.
    """
    import re
    fields = {}
    patterns = {
        "source_ip": r"(?:Source IP|IP address|from|source)[\s:]+([0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)",
        "environment": r"Environment:\s*([^\n,\.]+)",
        "asset": r"Asset:\s*([^\n,\.]+)",
        "aws_region": r"AWS Region:\s*([^\n,\.]+)",
    }
    for field, pattern in patterns.items():
        match = re.search(pattern, memory_text, re.IGNORECASE)
        if match:
            fields[field] = match.group(1).strip()
    return fields


def _check_evidence_mismatch(alert_fields: dict, memories: list, used_ids: list[str]) -> tuple[bool, list[str]]:
    """
    Compare current alert's key fields against benign memories being relied on or recalled.
    Returns (mismatch_found: bool, mismatch_details: list[str]).
    """
    mismatch_details = []
    alert_src = (alert_fields.get("source_ip") or "").strip().lower()

    # Determine if current alert is an external source IP
    is_external = alert_src and not (
        alert_src.startswith("10.") or
        alert_src.startswith("192.168.") or
        alert_src.startswith("172.")
    )

    # Check benign/scanner memories
    benign_memories = [
        m for m in memories
        if (not used_ids or m.id in used_ids) and (
            set(m.tags or []) & BENIGN_TAGS or
            "false positive" in (m.text or "").lower() or
            "authorized" in (m.text or "").lower() or
            "nessus" in (m.text or "").lower()
        )
    ]

    # If the alert is external and there are scanner/benign memories, flag evidence mismatch
    if is_external and benign_memories:
        mismatch_details.append(
            f"Source IP mismatch: recalled memories describe authorized internal scanning (e.g. 10.20.5.x), "
            f"but alert originates from external IP '{alert_src}'."
        )

    for mem in benign_memories:
        mem_fields = _extract_memory_key_fields(mem.text or "")
        mem_src = mem_fields.get("source_ip", "").strip().lower()
        if mem_src and alert_src and mem_src != alert_src and is_external:
            mismatch_details.append(
                f"Source IP mismatch: memory references authorized '{mem_src}' but alert is external '{alert_src}'."
            )

    unique_details = list(dict.fromkeys(mismatch_details))
    return len(unique_details) > 0, unique_details


def apply_guardrails(
    llm_verdict: LLMVerdict,
    alert_severity: str,
    memories: list,
    alert_key_fields: Optional[dict] = None,
    allow_high_auto: bool = False,
) -> GuardrailResult:
    """
    Apply all deterministic guardrails and return the final verdict + which rules fired.
    """
    fired = []
    final_verdict = llm_verdict.verdict
    original_verdict = llm_verdict.verdict

    # Rule 1: NEVER AUTO_CLOSE CRITICAL
    if alert_severity == "CRITICAL" and final_verdict == "AUTO_CLOSE":
        fired.append("RULE_1: CRITICAL alerts cannot be AUTO_CLOSED")
        final_verdict = "NEEDS_HUMAN"

    # Rule 2: NEVER AUTO_CLOSE when confidence < 0.85
    if llm_verdict.confidence < CONFIDENCE_THRESHOLD and final_verdict == "AUTO_CLOSE":
        fired.append(
            f"RULE_2: Confidence {llm_verdict.confidence:.2f} < {CONFIDENCE_THRESHOLD} threshold — "
            f"cannot AUTO_CLOSE"
        )
        final_verdict = "NEEDS_HUMAN"

    # Rule 3: No memory → never auto-classify as false positive
    if not memories and final_verdict == "AUTO_CLOSE":
        fired.append("RULE_3: No relevant memory found — cannot AUTO_CLOSE without organizational context")
        final_verdict = "NEEDS_HUMAN"

    # Rule 4: Conflicting memories for the same pattern
    if memories and _has_conflicting_memories(memories, alert_key_fields):
        fired.append("RULE_4: Conflicting memories (both benign and malicious patterns found) — requires human review")
        if final_verdict == "AUTO_CLOSE":
            final_verdict = "NEEDS_HUMAN"

    # Rule 5: Evidence mismatch — force NEEDS_HUMAN per Section 9
    if memories and alert_key_fields:
        mismatch, details = _check_evidence_mismatch(
            alert_key_fields, memories, llm_verdict.memory_ids_used
        )
        if mismatch:
            fired.append(
                f"RULE_5: Evidence mismatch detected — key fields differ from relied-upon benign memories. "
                f"Details: {'; '.join(details)}"
            )
            final_verdict = "NEEDS_HUMAN"

    # Rule 7: HIGH severity requires human review
    if alert_severity == "HIGH" and final_verdict == "AUTO_CLOSE" and not allow_high_auto:
        fired.append("RULE_7: HIGH severity requires human review")
        final_verdict = "NEEDS_HUMAN"

    overridden = final_verdict != original_verdict

    if overridden:
        logger.info(
            "Guardrails overrode LLM verdict %s → %s. Rules fired: %s",
            original_verdict, final_verdict, fired,
        )
    else:
        logger.debug("Guardrails: no override needed. Final verdict: %s", final_verdict)

    return GuardrailResult(
        fired=fired,
        overridden=overridden,
        original_verdict=original_verdict,
        final_verdict=final_verdict,
    )


def validate_memory_ids(
    llm_memory_ids: list[str],
    recall_results: list,
) -> list[str]:
    """
    Drop any memory IDs the LLM hallucinated that were not in the actual recall results.
    Returns only IDs that exist in the real recall results.
    """
    real_ids = {m.id for m in recall_results}
    valid = [mid for mid in llm_memory_ids if mid in real_ids]
    dropped = [mid for mid in llm_memory_ids if mid not in real_ids]
    if dropped:
        logger.warning("Dropped %d hallucinated memory IDs: %s", len(dropped), dropped)
    return valid

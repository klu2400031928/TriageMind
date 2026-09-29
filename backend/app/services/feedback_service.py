"""
Feedback service: retains analyst decisions into Hindsight and handles demo reset.
"""
import json
import logging
import time
from typing import Optional

from app.config import get_settings
from app.models.feedback import FeedbackRequest, FeedbackResponse
from app.services.hindsight_service import (
    retain_memory,
    delete_and_recreate_bank,
    recall_memories,
)
from app.services.triage_service import get_all_triage_results

logger = logging.getLogger(__name__)

# Track feedback per alert to handle duplicates
_feedback_store: dict[str, FeedbackRequest] = {}


def _get_alert_context(alert_id: str) -> str:
    """Get stored alert info for richer memory retention."""
    from app.services.triage_service import get_triage_result
    result = get_triage_result(alert_id)
    if not result:
        return f"Alert ID: {alert_id}."
    return (
        f"Alert ID: {alert_id}. "
        f"Severity: {result.severity}. "
        f"Event type in reasoning: {result.reasoning[:200]}."
    )


def submit_feedback(
    feedback: FeedbackRequest,
    alert_context: Optional[dict] = None,
) -> FeedbackResponse:
    """
    Process analyst feedback and retain it in Hindsight.
    Handles duplicates gracefully.
    """
    # Check for duplicate
    if feedback.alert_id in _feedback_store:
        logger.warning("Duplicate feedback for alert %s — ignoring.", feedback.alert_id)
        return FeedbackResponse(
            success=True,
            alert_id=feedback.alert_id,
            override=False,
            memory_retained=False,
            message="Feedback already recorded for this alert.",
        )

    override = feedback.ai_verdict != feedback.analyst_verdict
    outcome_label = "OVERRIDE" if override else "CONFIRMED"

    # Build rich natural-language memory
    alert_info = ""
    if alert_context:
        alert_info = (
            f"Alert: {alert_context.get('event_type', 'Unknown event')} "
            f"from {alert_context.get('source_ip', 'unknown source')} "
            f"to {alert_context.get('destination_ip', 'unknown destination')} "
            f"port {alert_context.get('destination_port', '?')}. "
            f"Asset: {alert_context.get('asset', 'unknown')}. "
            f"Environment: {alert_context.get('environment', 'unknown')}. "
            f"Hostname: {alert_context.get('hostname', 'unknown')}. "
            f"Username: {alert_context.get('username', 'unknown')}. "
            f"Severity: {alert_context.get('severity', 'unknown')}. "
            f"Source IP: {alert_context.get('source_ip', 'unknown')}. "
            f"Description: {str(alert_context.get('description', ''))[:200]}.\n"
        )

    memory_content = (
        f"{alert_info}"
        f"Alert ID: {feedback.alert_id}.\n"
        f"AI Recommendation: {feedback.ai_verdict}.\n"
        f"Analyst Decision ({outcome_label}): {feedback.analyst_verdict}.\n"
        f"Analyst: {feedback.analyst_name}.\n"
        f"Reason: {feedback.reason}.\n"
    )
    if feedback.notes:
        memory_content += f"Notes: {feedback.notes}.\n"
    if override:
        memory_content += (
            f"IMPORTANT: Analyst OVERRODE AI recommendation. "
            f"The AI said {feedback.ai_verdict} but the analyst determined {feedback.analyst_verdict}. "
            f"Reason for override: {feedback.reason}."
        )

    tags = ["analyst-feedback"]
    if override:
        tags.append("override-memory")
    tags.append(feedback.analyst_verdict.lower().replace("_", "-"))

    result = retain_memory(
        content=memory_content,
        tags=tags,
    )

    if result["success"]:
        _feedback_store[feedback.alert_id] = feedback
        logger.info(
            "Feedback retained for alert %s. Override=%s. Op=%s",
            feedback.alert_id, override, result["operation_id"],
        )
        return FeedbackResponse(
            success=True,
            alert_id=feedback.alert_id,
            override=override,
            memory_retained=True,
            operation_id=result["operation_id"],
            message="Analyst decision retained in memory.",
        )
    else:
        logger.error("Failed to retain feedback for alert %s: %s", feedback.alert_id, result.get("error"))
        return FeedbackResponse(
            success=False,
            alert_id=feedback.alert_id,
            override=override,
            memory_retained=False,
            message=f"Failed to retain memory: {result.get('error', 'unknown error')}",
        )


def poll_feedback_recalled(
    query: str,
    keyword: str,
    timeout: float = 30.0,
    poll_interval: float = 3.0,
) -> tuple[bool, int]:
    """
    Poll recall after feedback until the new memory appears.
    Returns (found: bool, memory_count: int).
    Used by frontend to confirm memory was processed.
    """
    deadline = time.time() + timeout
    kw_lower = keyword.lower()
    while time.time() < deadline:
        results = recall_memories(query=query)
        for r in results:
            if kw_lower in (r.text or "").lower():
                return True, len(results)
        time.sleep(poll_interval)
    results = recall_memories(query=query)
    return False, len(results)


def reset_demo(bank_id: Optional[str] = None) -> dict:
    """
    Reset the demo: delete and recreate the bank, reseed it.
    Returns status dict.
    """
    from app.services.hindsight_service import ensure_bank_exists
    from scripts.seed_memory import SEED_MEMORIES, retain_memory as seed_retain

    logger.info("Demo reset requested. Deleting bank and reseeding...")

    # Clear in-memory stores and persisted results
    _feedback_store.clear()
    from app.services.triage_service import clear_triage_results
    clear_triage_results()

    s = get_settings()
    target_bank = bank_id or s.hindsight_bank_id

    try:
        delete_and_recreate_bank(bank_id=target_bank)
    except Exception as e:
        logger.error("Failed to reset bank: %s", e)
        return {"success": False, "error": str(e)}

    # Reseed
    seeded = 0
    failed = 0
    for mem in SEED_MEMORIES:
        result = retain_memory(
            content=mem["content"],
            bank_id=target_bank,
            tags=mem.get("tags", []),
        )
        if result["success"]:
            seeded += 1
        else:
            failed += 1
        time.sleep(0.2)

    logger.info("Demo reset complete. Seeded %d/%d memories.", seeded, len(SEED_MEMORIES))
    return {
        "success": True,
        "bank_id": target_bank,
        "memories_seeded": seeded,
        "memories_failed": failed,
    }

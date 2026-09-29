"""
Core triage service: recall → LLM → guardrails → result.
"""
import json
import logging
import os
from typing import Optional

from app.models.alert import Alert
from app.models.triage import TriageResult, MemoryMatch
from app.services.hindsight_service import recall_memories
from app.services.llm_service import call_llm, format_alert_for_llm, format_memories_for_llm
from app.services.guardrail_service import apply_guardrails, validate_memory_ids

logger = logging.getLogger(__name__)

def _get_triage_store_path() -> str:
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "triage_store.json")),
        os.path.abspath(os.path.join(os.getcwd(), "data", "triage_store.json")),
        os.path.abspath(os.path.join(os.getcwd(), "..", "data", "triage_store.json")),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]

# In-memory and persisted store for triage results (keyed by alert_id)
_triage_store: dict[str, TriageResult] = {}

def _load_triage_store() -> None:
    global _triage_store
    path = _get_triage_store_path()
    if os.path.exists(path):
        try:
            with open(path, "r", encoding="utf-8") as f:
                data = json.load(f)
                _triage_store = {k: TriageResult(**v) for k, v in data.items()}
                logger.info("Loaded %d triage results from %s", len(_triage_store), path)
        except Exception as e:
            logger.warning("Could not load triage store from %s: %s", path, e)

def _save_triage_store() -> None:
    path = _get_triage_store_path()
    try:
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            data = {k: v.model_dump(mode="json") for k, v in _triage_store.items()}
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.warning("Could not save triage store to %s: %s", path, e)

_load_triage_store()


def build_recall_query(alert: Alert) -> str:
    """Build a meaningful Hindsight recall query from alert fields."""
    parts = []
    if alert.event_type:
        parts.append(alert.event_type.replace("_", " ").lower())
    if alert.source_ip:
        parts.append(f"source {alert.source_ip}")
    if alert.destination_port:
        parts.append(f"port {alert.destination_port}")
    if alert.hostname:
        parts.append(f"host {alert.hostname}")
    if alert.asset:
        parts.append(f"asset {alert.asset}")
    if alert.environment:
        parts.append(f"environment {alert.environment}")
    if alert.username:
        parts.append(f"user {alert.username}")
    if alert.aws_region:
        parts.append(f"AWS region {alert.aws_region}")
    if alert.cloudtrail_event:
        parts.append(f"CloudTrail {alert.cloudtrail_event}")
    if alert.tool:
        parts.append(f"tool {alert.tool}")
    # Add description keywords
    desc_words = (alert.description or "")[:100]
    parts.append(desc_words)
    return " ".join(parts)


def _recall_results_to_memory_matches(recall_results: list) -> list[MemoryMatch]:
    """Convert Hindsight RecallResult objects to MemoryMatch models."""
    matches = []
    for r in recall_results:
        scores = getattr(r, "scores", {}) or {}
        if isinstance(scores, dict):
            relevance = scores.get("final", 0.0)
        else:
            relevance = 0.0

        # Extract verdict and analyst from text heuristically
        text = r.text or ""
        verdict = None
        analyst = None
        date = None

        import re
        v_match = re.search(r"Verdict:\s*([^\n\.]+)", text, re.IGNORECASE)
        if v_match:
            verdict = v_match.group(1).strip()[:80]

        a_match = re.search(r"Analyst:\s*([^\n\.]+)", text, re.IGNORECASE)
        if a_match:
            analyst = a_match.group(1).strip()[:60]

        d_match = re.search(r"Timestamp:\s*([^\n\.]+)", text, re.IGNORECASE)
        if d_match:
            date = d_match.group(1).strip()[:30]

        matches.append(MemoryMatch(
            id=r.id,
            text=text[:400],
            relevance=relevance,
            verdict=verdict,
            analyst=analyst,
            date=date,
            tags=list(r.tags or []),
        ))
    return matches


def triage_alert(alert: Alert, use_memory: bool = True) -> TriageResult:
    """
    Full triage pipeline:
    1. Build recall query
    2. Recall memories from Hindsight (if use_memory=True)
    3. Format prompt
    4. Call LLM with retry/fallback
    5. Validate memory IDs
    6. Apply guardrails
    7. Return TriageResult
    """
    pipeline_steps = []

    # Step 1: Analyze alert
    pipeline_steps.append("Analyzing alert")
    alert_dict = alert.model_dump(mode="json")
    alert_text = format_alert_for_llm(alert_dict)

    # Step 2: Recall memories
    memories = []
    if use_memory:
        pipeline_steps.append("Searching organizational memory")
        query = build_recall_query(alert)
        logger.info("Recall query: %s", query[:100])
        all_memories = recall_memories(query=query, max_results_tokens=2048)
        # Sort by relevance score and cap to top 5 to avoid LLM context overflow
        def _score(m):
            scores = getattr(m, "scores", {}) or {}
            return scores.get("final", 0.0) if isinstance(scores, dict) else 0.0
        memories = sorted(all_memories, key=_score, reverse=True)[:5]
        pipeline_steps.append(f"{len(memories)} relevant memories found")
        pipeline_steps.append("Comparing historical decisions")
    else:
        pipeline_steps.append("Memory search skipped (use_memory=False)")

    # Step 3: Format memories for LLM
    memory_context = format_memories_for_llm(memories)

    # Step 4: Call LLM
    llm_verdict, raw_llm_output, model_used = call_llm(
        alert_text=alert_text,
        memory_context=memory_context,
    )
    logger.info(
        "LLM verdict: %s (confidence=%.2f, model=%s)",
        llm_verdict.verdict, llm_verdict.confidence, model_used,
    )

    # Step 5: Validate memory IDs — drop hallucinated ones
    valid_memory_ids = validate_memory_ids(llm_verdict.memory_ids_used, memories)
    llm_verdict.memory_ids_used = valid_memory_ids

    # Step 6: Apply guardrails
    pipeline_steps.append("Guardrail check")
    guardrail_result = apply_guardrails(
        llm_verdict=llm_verdict,
        alert_severity=alert.severity,
        memories=memories,
        alert_key_fields=alert.to_key_fields(),
    )
    pipeline_steps.append("Recommendation ready")

    # Build memory matches from real recall results
    memory_matches = _recall_results_to_memory_matches(memories)

    result = TriageResult(
        alert_id=alert.id,
        llm_verdict=llm_verdict.verdict,
        final_verdict=guardrail_result.final_verdict,
        confidence=llm_verdict.confidence,
        severity=llm_verdict.severity,
        reasoning=llm_verdict.reasoning,
        key_evidence=llm_verdict.key_evidence,
        recommended_actions=llm_verdict.recommended_actions,
        memory_matches=memory_matches,
        memory_ids_used=valid_memory_ids,
        memory_summary=llm_verdict.memory_summary,
        guardrails=guardrail_result,
        use_memory=use_memory,
        pipeline_steps=pipeline_steps,
    )

    # Store result
    _triage_store[alert.id] = result
    _save_triage_store()
    logger.info(
        "Triage complete for alert %s: LLM=%s → Final=%s (guardrails=%s)",
        alert.id, llm_verdict.verdict, guardrail_result.final_verdict,
        len(guardrail_result.fired),
    )
    return result


def get_triage_result(alert_id: str) -> Optional[TriageResult]:
    return _triage_store.get(alert_id)


def get_all_triage_results() -> dict[str, TriageResult]:
    return dict(_triage_store)


def clear_triage_results() -> None:
    """Clear all stored triage results in memory and on disk."""
    global _triage_store
    _triage_store.clear()
    path = _get_triage_store_path()
    if os.path.exists(path):
        try:
            os.remove(path)
            logger.info("Removed persisted triage store at %s", path)
        except Exception as e:
            logger.warning("Could not delete triage store file %s: %s", path, e)


def get_learning_stats() -> dict:
    """Compute real metrics from stored triage results."""
    results = list(_triage_store.values())
    total = len(results)
    if total == 0:
        return {
            "alerts_processed": 0,
            "memory_matches": 0,
            "auto_triaged": 0,
            "human_reviews": 0,
            "escalated": 0,
            "analyst_overrides": 0,
            "auto_triage_rate": 0.0,
            "human_review_rate": 0.0,
            "memory_match_rate": 0.0,
        }

    auto_triaged = sum(1 for r in results if r.final_verdict == "AUTO_CLOSE")
    human_reviews = sum(1 for r in results if r.final_verdict == "NEEDS_HUMAN")
    escalated = sum(1 for r in results if r.final_verdict == "ESCALATE")
    memory_matches = sum(1 for r in results if len(r.memory_matches) > 0)
    guardrail_overrides = sum(1 for r in results if r.guardrails.overridden)

    return {
        "alerts_processed": total,
        "memory_matches": memory_matches,
        "auto_triaged": auto_triaged,
        "human_reviews": human_reviews,
        "escalated": escalated,
        "analyst_overrides": guardrail_overrides,
        "auto_triage_rate": auto_triaged / total,
        "human_review_rate": human_reviews / total,
        "memory_match_rate": memory_matches / total,
    }

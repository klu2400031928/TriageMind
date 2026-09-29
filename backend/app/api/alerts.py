"""
Alerts API — serves the dataset from data/alerts.json.
"""
import json
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()


def _find_alerts_path() -> str:
    candidates = [
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "alerts.json")),
        os.path.abspath(os.path.join(os.getcwd(), "data", "alerts.json")),
        os.path.abspath(os.path.join(os.getcwd(), "..", "data", "alerts.json")),
        os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "data", "alerts.json")),
    ]
    for c in candidates:
        if os.path.exists(c):
            return c
    return candidates[0]


_alerts_cache: list[dict] | None = None


def _load_alerts() -> list[dict]:
    global _alerts_cache
    if _alerts_cache is not None:
        return _alerts_cache
    path = _find_alerts_path()
    if not os.path.exists(path):
        return []
    with open(path) as f:
        _alerts_cache = json.load(f)
    return _alerts_cache


@router.get("/alerts")
async def list_alerts():
    alerts = _load_alerts()
    # Include triage result summary if available
    from app.services.triage_service import get_all_triage_results
    results = get_all_triage_results()
    enriched = []
    for a in alerts:
        entry = dict(a)
        tr = results.get(a["id"])
        if tr:
            entry["triage"] = {
                "final_verdict": tr.final_verdict,
                "confidence": tr.confidence,
                "memory_count": len(tr.memory_matches),
                "reasoning": tr.reasoning,
            }
        enriched.append(entry)
    return {"alerts": enriched, "total": len(enriched)}


@router.get("/alerts/{alert_id}")
async def get_alert(alert_id: str):
    alerts = _load_alerts()
    for a in alerts:
        if a["id"] == alert_id:
            from app.services.triage_service import get_triage_result
            result = get_triage_result(alert_id)
            return {
                "alert": a,
                "triage": result.model_dump() if result else None,
            }
    raise HTTPException(status_code=404, detail=f"Alert '{alert_id}' not found")

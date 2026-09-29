"""
Learning API — stats, recent memories, and Hindsight Reflect.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.services.triage_service import get_learning_stats
from app.services.hindsight_service import recall_memories, reflect_on_bank

router = APIRouter()


@router.get("/learning/stats")
async def learning_stats():
    return get_learning_stats()


@router.get("/memory/recent")
async def recent_memories(query: str = "security alert analyst decision", limit: int = 20):
    """Return recently recalled memories for the memory page."""
    try:
        results = recall_memories(query=query, max_results_tokens=8192)
        memories = []
        for r in results[:limit]:
            scores = getattr(r, "scores", {}) or {}
            relevance = scores.get("final", 0.0) if isinstance(scores, dict) else 0.0
            import re
            text = r.text or ""
            verdict = None
            v_match = re.search(r"Verdict:\s*([^\n\.]+)", text, re.IGNORECASE)
            if v_match:
                verdict = v_match.group(1).strip()[:80]

            memories.append({
                "id": r.id,
                "text": text[:500],
                "relevance": relevance,
                "verdict": verdict,
                "tags": list(r.tags or []),
                "occurred": str(r.occurred_start) if r.occurred_start else None,
            })
        return {"memories": memories, "total": len(memories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


class ReflectRequest(BaseModel):
    query: str = "What patterns have I learned from analyst decisions?"


@router.post("/learning/reflect")
async def reflect(body: ReflectRequest):
    """Call Hindsight Reflect to synthesize learned patterns."""
    try:
        reflection = reflect_on_bank(query=body.query)
        return {"reflection": reflection, "query": body.query}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

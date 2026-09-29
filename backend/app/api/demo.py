"""
Demo API — seed and reset endpoints.
"""
import sys
import os
from fastapi import APIRouter, HTTPException

router = APIRouter()


@router.post("/seed")
async def seed_memories():
    """Seed the memory bank with baseline experiences (non-destructive)."""
    try:
        sys.path.insert(0, os.path.join(os.path.dirname(__file__), "..", "..", ".."))
        from scripts.seed_memory import SEED_MEMORIES
        from app.services.hindsight_service import ensure_bank_exists, retain_memory
        import time

        ensure_bank_exists()
        seeded = 0
        failed = 0
        for mem in SEED_MEMORIES:
            result = retain_memory(content=mem["content"], tags=mem.get("tags", []))
            if result["success"]:
                seeded += 1
            else:
                failed += 1
            time.sleep(0.1)

        return {
            "success": True,
            "memories_seeded": seeded,
            "memories_failed": failed,
            "total": len(SEED_MEMORIES),
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/demo/reset")
async def demo_reset():
    """
    Reset the demo: delete bank, recreate, reseed baseline memories.
    The 10.20.5.44 Nessus memory is excluded from seed so Stage 1 is a cold start.
    """
    try:
        from app.services.feedback_service import reset_demo
        result = reset_demo()
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

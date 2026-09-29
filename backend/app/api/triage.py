"""
Triage API — POST /api/triage (with optional use_memory toggle).
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.alert import Alert
from app.services.triage_service import triage_alert, get_triage_result

router = APIRouter()


class TriageRequest(BaseModel):
    alert: Alert
    use_memory: bool = True


@router.post("/triage")
async def run_triage(request: TriageRequest):
    try:
        result = triage_alert(alert=request.alert, use_memory=request.use_memory)
        return result.model_dump()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/triage/{alert_id}")
async def get_triage(alert_id: str):
    result = get_triage_result(alert_id)
    if not result:
        raise HTTPException(status_code=404, detail=f"No triage result for alert '{alert_id}'")
    return result.model_dump()

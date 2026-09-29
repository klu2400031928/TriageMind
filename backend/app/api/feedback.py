"""
Feedback API — POST /api/feedback.
"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional

from app.models.feedback import FeedbackRequest
from app.services.feedback_service import submit_feedback

router = APIRouter()


class FeedbackWithAlert(BaseModel):
    feedback: Optional[FeedbackRequest] = None
    alert_context: Optional[dict] = None
    # Also allow flat fields (FeedbackRequest fields directly)
    alert_id: Optional[str] = None
    ai_verdict: Optional[str] = None
    analyst_verdict: Optional[str] = None
    reason: Optional[str] = None
    analyst_name: Optional[str] = None
    notes: Optional[str] = None


@router.post("/feedback")
async def post_feedback(body: FeedbackWithAlert):
    try:
        # Support both nested {feedback: {...}} and flat {alert_id: ..., ...}
        if body.feedback:
            fb = body.feedback
            ctx = body.alert_context
        elif body.alert_id and body.analyst_verdict and body.reason and body.analyst_name:
            fb = FeedbackRequest(
                alert_id=body.alert_id,
                ai_verdict=body.ai_verdict or "NEEDS_HUMAN",
                analyst_verdict=body.analyst_verdict,
                reason=body.reason,
                analyst_name=body.analyst_name,
                notes=body.notes,
            )
            ctx = None
        else:
            raise HTTPException(status_code=422, detail="Must provide either 'feedback' object or flat feedback fields")

        result = submit_feedback(feedback=fb, alert_context=ctx)
        return result.model_dump()
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feedback/poll/{alert_id}")
async def poll_feedback(alert_id: str, keyword: str = "", timeout: float = 30.0):
    """
    Poll Hindsight recall until the feedback memory appears.
    Used by the frontend to show 'Memory updated' status.
    """
    from app.services.feedback_service import poll_feedback_recalled
    if not keyword:
        keyword = alert_id
    found, count = poll_feedback_recalled(
        query=f"analyst feedback {keyword}",
        keyword=keyword,
        timeout=timeout,
    )
    return {"found": found, "memory_count": count}

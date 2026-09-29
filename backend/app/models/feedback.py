"""Feedback Pydantic models."""
from typing import Optional, Literal
from pydantic import BaseModel, Field


class FeedbackRequest(BaseModel):
    alert_id: str = Field(..., max_length=64)
    ai_verdict: Literal["AUTO_CLOSE", "ESCALATE", "NEEDS_HUMAN"]
    analyst_verdict: Literal["AUTO_CLOSE", "ESCALATE", "NEEDS_HUMAN", "FALSE_POSITIVE", "TRUE_POSITIVE"]
    reason: str = Field(..., max_length=1024)
    analyst_name: str = Field(..., max_length=128)
    notes: Optional[str] = Field(None, max_length=1024)


class FeedbackResponse(BaseModel):
    success: bool
    alert_id: str
    override: bool
    memory_retained: bool
    operation_id: Optional[str] = None
    message: str = ""

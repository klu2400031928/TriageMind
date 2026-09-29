"""Triage result Pydantic models."""
from typing import Optional, Literal
from pydantic import BaseModel, Field


class MemoryMatch(BaseModel):
    """A single recalled memory from Hindsight."""
    id: str
    text: str
    relevance: float
    verdict: Optional[str] = None
    analyst: Optional[str] = None
    date: Optional[str] = None
    tags: list[str] = []


class LLMVerdict(BaseModel):
    """Raw LLM output, validated by Pydantic."""
    verdict: Literal["AUTO_CLOSE", "ESCALATE", "NEEDS_HUMAN"]
    confidence: float = Field(..., ge=0.0, le=1.0)
    severity: Literal["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    reasoning: str
    key_evidence: list[str] = []
    memory_ids_used: list[str] = []
    memory_summary: list[str] = []
    recommended_actions: list[str] = []


class GuardrailResult(BaseModel):
    """Which guardrails fired and what they did."""
    fired: list[str] = []
    overridden: bool = False
    original_verdict: Optional[str] = None
    final_verdict: str = ""


class TriageResult(BaseModel):
    """Full triage result returned to the client."""
    alert_id: str
    llm_verdict: str
    final_verdict: str
    confidence: float
    severity: str
    reasoning: str
    key_evidence: list[str] = []
    recommended_actions: list[str] = []
    memory_matches: list[MemoryMatch] = []
    memory_ids_used: list[str] = []     # validated against real recall
    memory_summary: list[str] = []
    guardrails: GuardrailResult
    use_memory: bool = True
    # Pipeline steps for UI storytelling
    pipeline_steps: list[str] = []

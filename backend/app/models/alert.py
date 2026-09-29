"""Alert Pydantic models with input sanitization."""
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field, field_validator
import re

MAX_STR_LEN = 512


def _sanitize(v: str | None, max_len: int = MAX_STR_LEN) -> str | None:
    """Strip control characters and enforce max length."""
    if v is None:
        return v
    # Remove control chars except newline/tab
    v = re.sub(r"[\x00-\x08\x0b\x0c\x0e-\x1f\x7f]", "", v)
    return v[:max_len]


class Alert(BaseModel):
    id: str = Field(..., max_length=64)
    timestamp: datetime
    source_ip: Optional[str] = Field(None, max_length=64)
    source_port: Optional[int] = None
    destination_ip: Optional[str] = Field(None, max_length=64)
    destination_port: Optional[int] = None
    hostname: Optional[str] = Field(None, max_length=128)
    username: Optional[str] = Field(None, max_length=128)
    asset: Optional[str] = Field(None, max_length=128)
    environment: Optional[str] = Field(None, max_length=64)
    severity: str = Field(..., pattern="^(LOW|MEDIUM|HIGH|CRITICAL)$")
    event_type: str = Field(..., max_length=128)
    process: Optional[str] = Field(None, max_length=128)
    tool: Optional[str] = Field(None, max_length=128)
    aws_region: Optional[str] = Field(None, max_length=64)
    cloudtrail_event: Optional[str] = Field(None, max_length=128)
    description: str = Field(..., max_length=MAX_STR_LEN)
    raw: Optional[dict] = None

    @field_validator("description", "hostname", "username", "asset",
                     "process", "tool", "event_type", mode="before")
    @classmethod
    def sanitize_strings(cls, v):
        return _sanitize(v) if isinstance(v, str) else v

    def to_key_fields(self) -> dict:
        """Return structured fields used by guardrail evidence mismatch check."""
        return {
            "source_ip": self.source_ip,
            "destination_ip": self.destination_ip,
            "destination_port": self.destination_port,
            "hostname": self.hostname,
            "asset": self.asset,
            "environment": self.environment,
            "aws_region": self.aws_region,
            "username": self.username,
        }

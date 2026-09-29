"""
TriageMind - Application configuration.
Loads from .env file; searches current dir, parent, and grandparent.
"""
import os
from pathlib import Path
from functools import lru_cache
from pydantic_settings import BaseSettings, SettingsConfigDict


def _find_env_file() -> str:
    """Walk up from cwd to find the first .env file."""
    cwd = Path.cwd()
    for candidate in [cwd, cwd.parent, cwd.parent.parent]:
        env = candidate / ".env"
        if env.exists():
            return str(env)
    return ".env"  # fallback; pydantic-settings won't error if missing


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=_find_env_file(),
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Hindsight
    hindsight_base_url: str = ""
    hindsight_api_key: str = ""
    hindsight_bank_id: str = "triagemind-demo"

    # Groq
    groq_api_key: str = ""
    groq_model: str = "openai/gpt-oss-120b"
    groq_fallback_model: str = "qwen/qwen3.8-27b"

    # App
    app_env: str = "development"
    demo_mode: bool = False


@lru_cache
def get_settings() -> Settings:
    return Settings()


def validate_required_settings() -> list[str]:
    """Return a list of configuration errors (empty = all good)."""
    s = get_settings()
    errors = []
    if not s.hindsight_base_url:
        errors.append("HINDSIGHT_BASE_URL is not set")
    if not s.hindsight_api_key:
        errors.append("HINDSIGHT_API_KEY is not set")
    if not s.groq_api_key:
        errors.append("GROQ_API_KEY is not set")
    return errors

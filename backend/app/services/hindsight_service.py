"""
Hindsight service — wraps the hindsight-client SDK.
Uses a fresh Hindsight client per call in a dedicated thread to avoid
aiohttp session conflicts with FastAPI's event loop.
"""
import asyncio
import concurrent.futures
import logging
import time
from typing import Optional
from hindsight_client_api.models.recall_result import RecallResult

from app.config import get_settings

logger = logging.getLogger(__name__)


def _get_settings_values() -> tuple[str, str, str]:
    s = get_settings()
    if not s.hindsight_base_url or not s.hindsight_api_key:
        raise RuntimeError(
            "HINDSIGHT_BASE_URL and HINDSIGHT_API_KEY must be set. "
            "Copy .env.example to .env and fill in your credentials."
        )
    return s.hindsight_base_url, s.hindsight_api_key, s.hindsight_bank_id


def _run_hindsight(coro_factory):
    """
    Run an async Hindsight operation in a fresh thread with a fresh event loop
    and a fresh Hindsight client. This avoids all aiohttp event loop conflicts.
    
    coro_factory: callable(client) -> coroutine
    """
    from hindsight_client import Hindsight
    base_url, api_key, _ = _get_settings_values()

    def _worker():
        loop = asyncio.new_event_loop()
        asyncio.set_event_loop(loop)
        client = Hindsight(base_url=base_url, api_key=api_key)
        try:
            return loop.run_until_complete(coro_factory(client))
        finally:
            try:
                loop.run_until_complete(client.aclose())
            except Exception:
                pass
            loop.close()

    try:
        asyncio.get_running_loop()
        # Inside async context (FastAPI) — use thread
        with concurrent.futures.ThreadPoolExecutor(max_workers=1) as pool:
            future = pool.submit(_worker)
            return future.result(timeout=60)
    except RuntimeError:
        # No running loop — direct
        return _worker()


def ensure_bank_exists(bank_id: Optional[str] = None) -> None:
    """Create bank if it doesn't exist (idempotent)."""
    s = get_settings()
    bank_id = bank_id or s.hindsight_bank_id
    bank_mission = (
        "You are an institutional memory for a Security Operations Center. "
        "You store analyst decisions, alert verdicts, and environment context. "
        "Your purpose is to help future analysts and AI systems make better "
        "triage decisions by recalling relevant past experiences."
    )
    bank_background = (
        "This memory bank contains verified analyst decisions and environmental "
        "context about the organization's infrastructure. Use it to distinguish "
        "known benign patterns from genuinely suspicious activity."
    )
    try:
        _run_hindsight(lambda c: c.acreate_bank(
            bank_id=bank_id,
            name="TriageMind SOC Memory",
            mission=bank_mission,
            background=bank_background,
        ))
        logger.info("Bank '%s' created.", bank_id)
    except Exception as e:
        err = str(e).lower()
        if "already exists" in err or "conflict" in err or "409" in err:
            logger.debug("Bank '%s' already exists — continuing.", bank_id)
        else:
            logger.warning("Bank create: %s", e)


def retain_memory(
    content: str,
    bank_id: Optional[str] = None,
    tags: Optional[list[str]] = None,
    metadata: Optional[dict[str, str]] = None,
) -> dict:
    """Retain a natural-language experience in Hindsight."""
    s = get_settings()
    bank_id = bank_id or s.hindsight_bank_id
    _tags = tags or []
    _metadata = metadata or {}
    try:
        resp = _run_hindsight(lambda c: c.aretain(
            bank_id=bank_id,
            content=content,
            tags=_tags,
            metadata=_metadata,
        ))
        op_id = (resp.operation_ids[0] if resp.operation_ids else
                 resp.operation_id if resp.operation_id else None)
        logger.info("Retained memory in bank '%s', op=%s", bank_id, op_id)
        return {"success": resp.success, "operation_id": op_id}
    except Exception as e:
        logger.error("retain failed: %s", e)
        return {"success": False, "operation_id": None, "error": str(e)}


def recall_memories(
    query: str,
    bank_id: Optional[str] = None,
    max_results_tokens: int = 4096,
    budget: str = "mid",
) -> list[RecallResult]:
    """Recall relevant memories from Hindsight."""
    s = get_settings()
    bank_id = bank_id or s.hindsight_bank_id
    try:
        resp = _run_hindsight(lambda c: c.arecall(
            bank_id=bank_id,
            query=query,
            max_tokens=max_results_tokens,
            budget=budget,
        ))
        results = resp.results or []
        logger.info(
            "Recalled %d memories from bank '%s' for query: %s...",
            len(results), bank_id, query[:60],
        )
        return results
    except Exception as e:
        logger.error("recall failed: %s", e)
        return []


def reflect_on_bank(
    query: str,
    bank_id: Optional[str] = None,
) -> str:
    """Call Hindsight Reflect to get a synthesized narrative answer."""
    s = get_settings()
    bank_id = bank_id or s.hindsight_bank_id
    try:
        resp = _run_hindsight(lambda c: c.areflect(
            bank_id=bank_id,
            query=query,
            budget="low",
            include_facts=True,
        ))
        return resp.text or ""
    except Exception as e:
        logger.error("reflect failed: %s", e)
        return f"[Reflect unavailable: {e}]"


def poll_until_recalled(
    query: str,
    expected_keyword: str,
    bank_id: Optional[str] = None,
    poll_interval: float = 3.0,
    timeout: float = 30.0,
) -> tuple[bool, list[RecallResult]]:
    """Poll recall until expected keyword appears or timeout."""
    deadline = time.time() + timeout
    keyword = expected_keyword.lower()
    while time.time() < deadline:
        results = recall_memories(query, bank_id=bank_id)
        for r in results:
            if keyword in (r.text or "").lower():
                return True, results
        time.sleep(poll_interval)
    return False, recall_memories(query, bank_id=bank_id)


def delete_and_recreate_bank(bank_id: Optional[str] = None) -> bool:
    """Delete a bank and recreate it fresh (for demo reset)."""
    s = get_settings()
    bank_id = bank_id or s.hindsight_bank_id
    try:
        _run_hindsight(lambda c: c.adelete_bank(bank_id=bank_id))
        logger.info("Deleted bank '%s'", bank_id)
    except Exception as e:
        logger.warning("delete_bank: %s (may not exist yet)", e)
    time.sleep(1)
    ensure_bank_exists(bank_id=bank_id)
    return True


def health_check() -> dict:
    """Quick health check against Hindsight."""
    try:
        resp = _run_hindsight(lambda c: c.aget_version())
        return {"status": "ok", "version": str(resp)}
    except Exception as e:
        return {"status": "error", "error": str(e)}

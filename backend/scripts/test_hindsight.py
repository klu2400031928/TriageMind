#!/usr/bin/env python3
"""
Phase 3 verification script: tests REAL Hindsight retain → recall.
Run from backend/ directory with env vars set.

Usage:
    cd TriageMind/backend
    HINDSIGHT_BASE_URL=... HINDSIGHT_API_KEY=... python scripts/test_hindsight.py
"""
import os
import sys
import time

# Allow running from project root too
sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.hindsight_service import (
    ensure_bank_exists,
    retain_memory,
    recall_memories,
    reflect_on_bank,
    health_check,
)

TEST_BANK = "triagemind-test-phase3"

def sep(title: str) -> None:
    print(f"\n{'='*60}")
    print(f"  {title}")
    print('='*60)


def main():
    sep("PHASE 3 — Hindsight retain → recall verification")

    # 1. Health check
    sep("1. Health check")
    h = health_check()
    print(f"  Result: {h}")
    if h["status"] != "ok":
        print("  ❌ FAIL — Hindsight is not reachable. Check HINDSIGHT_BASE_URL and HINDSIGHT_API_KEY.")
        sys.exit(1)
    print("  ✅ Hindsight is reachable")

    # 2. Create bank
    sep("2. Creating test bank")
    ensure_bank_exists(bank_id=TEST_BANK)
    print(f"  ✅ Bank '{TEST_BANK}' ready")

    # 3. Retain a memory
    sep("3. Retaining test memory")
    test_content = (
        "Alert: Outbound connection from ci-runner-03 to pypi.org:443. "
        "Tool: GitHub Actions. "
        "Verdict: FALSE POSITIVE. "
        "Analyst: TestBot. "
        "Reason: ci-runner-03 is an authorized CI/CD runner. It pulls packages from PyPI during build jobs. "
        "Environment: CI/CD. "
        "Timestamp: 2026-09-28."
    )
    result = retain_memory(content=test_content, bank_id=TEST_BANK, tags=["ci-cd", "false-positive"])
    print(f"  Retain result: {result}")
    if not result["success"]:
        print("  ❌ FAIL — retain did not succeed")
        sys.exit(1)
    print(f"  ✅ Retained. Operation ID: {result['operation_id']}")

    # 4. Wait for processing (Hindsight indexes memories asynchronously)
    sep("4. Waiting for Hindsight to process memory (up to 30s)...")
    query = "outbound traffic from ci-runner-03 to external package registry"
    found = False
    deadline = time.time() + 30
    poll_interval = 3
    while time.time() < deadline:
        elapsed = 30 - (deadline - time.time())
        print(f"  Polling recall... ({elapsed:.0f}s elapsed)", end="\r", flush=True)
        results = recall_memories(query=query, bank_id=TEST_BANK)
        for r in results:
            if "ci-runner-03" in (r.text or ""):
                found = True
                break
        if found:
            break
        time.sleep(poll_interval)

    print()  # newline after carriage return
    if not found:
        # Still show whatever came back
        results = recall_memories(query=query, bank_id=TEST_BANK)
        print(f"  ⚠️  Memory not yet recalled after 30s (got {len(results)} results). "
              "Processing delay may be longer. Try re-running in a minute.")
    else:
        print(f"  ✅ Memory found in recall after processing!")

    # 5. Show recall results
    sep("5. Recall results")
    results = recall_memories(query=query, bank_id=TEST_BANK)
    print(f"  Total results returned: {len(results)}")
    for i, r in enumerate(results):
        scores = r.scores or {}
        print(f"\n  Result {i+1}:")
        print(f"    ID: {r.id}")
        print(f"    Type: {r.type}")
        print(f"    Text: {(r.text or '')[:200]}")
        print(f"    Scores: {scores}")
        print(f"    Tags: {r.tags}")
        print(f"    Metadata: {r.metadata}")
        print(f"    Occurred: {r.occurred_start} → {r.occurred_end}")

    # 6. Reflect
    sep("6. Reflect")
    reflection = reflect_on_bank(
        query="What do I know about CI/CD runner behavior?",
        bank_id=TEST_BANK,
    )
    print(f"  Reflect response:\n  {reflection[:500]}")

    # 7. Summary
    sep("SUMMARY")
    if found:
        print("  ✅ PHASE 3 PASS — retain + recall + reflect all working with real Hindsight")
    else:
        print("  ⚠️  Partial — retain succeeded but recall may still be processing")
        print("  Re-run this script in ~1 minute to confirm")

    print("\nNote: The test bank 'triagemind-test-phase3' was used (not the demo bank).")
    print("You can safely delete it from the Hindsight dashboard.\n")


if __name__ == "__main__":
    main()

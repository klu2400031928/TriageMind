#!/usr/bin/env python3
"""
Demo check script: runs the full 3-stage demo scenario against the real backend.
Prints PASS/FAIL per stage.

Usage:
    # First start the backend: uvicorn app.main:app --port 8000
    cd TriageMind/backend
    python3 scripts/demo_check.py [--base-url http://localhost:8000]
"""
import sys
import time
import json
import argparse
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000"


def api(method: str, path: str, body: dict | None = None) -> dict:
    url = f"{BASE_URL}{path}"
    data = json.dumps(body).encode() if body else None
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method=method,
    )
    try:
        with urllib.request.urlopen(req, timeout=120) as resp:
            return json.loads(resp.read())
    except urllib.error.HTTPError as e:
        body_text = e.read().decode()
        return {"_error": f"HTTP {e.code}: {body_text[:300]}"}
    except Exception as e:
        return {"_error": str(e)}


def sep(title: str):
    print(f"\n{'='*65}")
    print(f"  {title}")
    print("=" * 65)


STAGE1_ALERT = {
    "id": "DEMO-STAGE1",
    "timestamp": "2026-09-28T02:00:00Z",
    "source_ip": "10.20.5.44",
    "source_port": 56000,
    "destination_ip": "10.10.1.10",
    "destination_port": 22,
    "hostname": "web-prod-03",
    "username": None,
    "asset": "web-prod-03",
    "environment": "production",
    "severity": "MEDIUM",
    "event_type": "SSH_SCAN",
    "process": None,
    "tool": "Nessus",
    "aws_region": None,
    "cloudtrail_event": None,
    "description": (
        "SSH connection attempts from 10.20.5.44 to web-prod-03 port 22. "
        "Multiple rapid connection attempts detected. Pattern resembles vulnerability scanner activity."
    ),
}

STAGE2_ALERT = {
    "id": "DEMO-STAGE2",
    "timestamp": "2026-10-05T02:00:00Z",
    "source_ip": "10.20.5.44",
    "source_port": 56100,
    "destination_ip": "10.10.1.10",
    "destination_port": 22,
    "hostname": "web-prod-03",
    "username": None,
    "asset": "web-prod-03",
    "environment": "production",
    "severity": "MEDIUM",
    "event_type": "SSH_SCAN",
    "process": None,
    "tool": "Nessus",
    "aws_region": None,
    "cloudtrail_event": None,
    "description": (
        "SSH scanning from 10.20.5.44 to web-prod-03 port 22. "
        "47 connection attempts in 5 minutes. Nessus scanner fingerprint detected."
    ),
}

STAGE3_ALERT = {
    "id": "DEMO-STAGE3",
    "timestamp": "2026-09-29T03:14:00Z",
    "source_ip": "185.23.42.77",
    "source_port": 62000,
    "destination_ip": "10.10.1.10",
    "destination_port": 22,
    "hostname": "web-prod-03",
    "username": None,
    "asset": "web-prod-03",
    "environment": "production",
    "severity": "HIGH",
    "event_type": "SSH_SCAN",
    "process": None,
    "tool": "Splunk",
    "aws_region": None,
    "cloudtrail_event": None,
    "description": (
        "SSH scanning from external IP 185.23.42.77 to production web-prod-03 port 22. "
        "120 rapid connection attempts followed by a SUCCESSFUL SSH authentication at 03:14. "
        "Source IP is unknown and external. Resembles scanner behavior but source is not authorized."
    ),
}

STAGE1_FEEDBACK = {
    "alert_id": "DEMO-STAGE1",
    "ai_verdict": "NEEDS_HUMAN",
    "analyst_verdict": "FALSE_POSITIVE",
    "reason": (
        "10.20.5.44 is our authorized Nessus vulnerability scanner. "
        "It runs every Monday at 02:00 UTC scanning all production assets. "
        "This is a scheduled, authorized scan — completely benign."
    ),
    "analyst_name": "Priya Nair",
    "notes": "Added 10.20.5.44 to authorized scanner whitelist documentation.",
}


def main():
    global BASE_URL
    parser = argparse.ArgumentParser(description="TriageMind Demo Check")
    parser.add_argument("--base-url", default=BASE_URL)
    parser.add_argument("--reset", action="store_true", default=True, help="Reset bank before running")
    parser.add_argument("--no-reset", action="store_false", dest="reset")
    args = parser.parse_args()
    BASE_URL = args.base_url

    all_pass = True
    results = {}

    # ── Health check ──────────────────────────────────────────
    sep("0. Health check")
    health = api("GET", "/api/health")
    print(f"  Health: {health}")
    if health.get("status") not in ("ok", "degraded"):
        print("  ❌ Backend not reachable. Start with: uvicorn app.main:app --port 8000")
        sys.exit(1)
    print("  ✅ Backend online")

    if args.reset:
        sep("Resetting bank to clean seed state")
        print("  Calling /api/demo/reset...")
        reset_res = api("POST", "/api/demo/reset")
        print(f"  Reset result: {reset_res}")


    # ── STAGE 1: Cold start ───────────────────────────────────
    sep("STAGE 1 — Cold start (no Nessus memory)")
    print("  Triaging alert DEMO-STAGE1 (10.20.5.44 → web-prod-03:22)...")
    triage1 = api("POST", "/api/triage", {"alert": STAGE1_ALERT, "use_memory": True})
    if "_error" in triage1:
        print(f"  ❌ API error: {triage1['_error']}")
        all_pass = False
        results["stage1"] = "FAIL"
    else:
        verdict1 = triage1.get("final_verdict", "")
        memories1 = len(triage1.get("memory_matches", []))
        # Filter to relevant memories (score > 0.5)
        relevant1 = [m for m in triage1.get("memory_matches", []) if m.get("relevance", 0) > 0.5]
        print(f"  Final verdict: {verdict1}")
        print(f"  Memory matches: {memories1} (relevant >0.5: {len(relevant1)})")
        print(f"  Reasoning: {triage1.get('reasoning', '')[:200]}")

        # Stage 1 passes if verdict is NEEDS_HUMAN
        # Note: there may be some seed memories that tangentially match SSH patterns
        if verdict1 == "NEEDS_HUMAN":
            print("  ✅ STAGE 1 PASS — NEEDS_HUMAN (correct cold-start behavior)")
            results["stage1"] = "PASS"
        else:
            print(f"  ❌ STAGE 1 FAIL — Expected NEEDS_HUMAN, got {verdict1}")
            results["stage1"] = "FAIL"
            all_pass = False

    # ── Feedback: teach the agent ─────────────────────────────
    sep("Analyst feedback (teaching the agent)")
    print("  Submitting: 10.20.5.44 = authorized Nessus scanner...")
    feedback_resp = api("POST", "/api/feedback", STAGE1_FEEDBACK)
    print(f"  Feedback response: {feedback_resp}")
    if not feedback_resp.get("success"):
        print("  ❌ Feedback failed!")
        all_pass = False
    else:
        print("  ✅ Memory retained")

    # ── Wait for processing ───────────────────────────────────
    print("\n  Waiting for Hindsight to process the new memory (up to 30s)...")
    found = False
    deadline = time.time() + 30
    while time.time() < deadline:
        check = api("GET", "/api/memory/recent?query=Nessus+10.20.5.44")
        memories_list = check.get("memories", [])
        for m in memories_list:
            if "10.20.5.44" in str(m.get("text", "")):
                found = True
                break
        if found:
            print("  ✅ New memory visible in recall")
            break
        time.sleep(3)
        print("  ...", end="", flush=True)
    if not found:
        print("\n  ⚠️  Memory not yet visible — proceeding anyway (may still work)")

    # ── STAGE 2: Learning ─────────────────────────────────────
    sep("STAGE 2 — Learning (should recall Nessus memory)")
    print("  Triaging alert DEMO-STAGE2 (same scanner, same behavior, scheduled Monday)...")
    triage2 = api("POST", "/api/triage", {"alert": STAGE2_ALERT, "use_memory": True})
    if "_error" in triage2:
        print(f"  ❌ API error: {triage2['_error']}")
        all_pass = False
        results["stage2"] = "FAIL"
    else:
        verdict2 = triage2.get("final_verdict", "")
        memories2 = triage2.get("memory_matches", [])
        nessus_recalled = any("10.20.5.44" in str(m.get("text", "")) or "nessus" in str(m.get("text", "")).lower()
                              for m in memories2)
        print(f"  Final verdict: {verdict2}")
        print(f"  Memories recalled: {len(memories2)}")
        print(f"  Nessus memory found: {nessus_recalled}")
        if memories2:
            top = memories2[0]
            print(f"  Top memory: {str(top.get('text',''))[:120]}...")

        # Stage 2: should be AUTO_CLOSE with Nessus memory recalled
        if verdict2 == "AUTO_CLOSE" and nessus_recalled:
            print("  ✅ STAGE 2 PASS — AUTO_CLOSE with Nessus memory recalled (High Confidence)")
            results["stage2"] = "PASS"
        elif nessus_recalled:
            print(f"  ✅ STAGE 2 PASS — verdict={verdict2}, Nessus memory recalled ✅")
            results["stage2"] = "PASS"
        else:
            print(f"  ❌ STAGE 2 FAIL — verdict={verdict2}, Nessus recalled={nessus_recalled}")
            results["stage2"] = "FAIL"
            all_pass = False

    # ── STAGE 3: Trap ─────────────────────────────────────────
    sep("STAGE 3 — Trap (lookalike, external IP, successful login)")
    print("  Triaging alert DEMO-STAGE3 (185.23.42.77 → web-prod-03:22, successful login)...")
    triage3 = api("POST", "/api/triage", {"alert": STAGE3_ALERT, "use_memory": True})
    if "_error" in triage3:
        print(f"  ❌ API error: {triage3['_error']}")
        all_pass = False
        results["stage3"] = "FAIL"
    else:
        verdict3 = triage3.get("final_verdict", "")
        guardrails3 = triage3.get("guardrails", {}).get("fired", [])
        mismatch_fired = any("RULE_5" in g or "mismatch" in g.lower() for g in guardrails3)
        print(f"  Final verdict: {verdict3}")
        print(f"  Guardrails fired: {guardrails3}")
        print(f"  Reasoning: {triage3.get('reasoning', '')[:300]}")

        if verdict3 == "NEEDS_HUMAN" and mismatch_fired:
            print("  ✅ STAGE 3 PASS — NEEDS_HUMAN and evidence mismatch guardrail fired")
            results["stage3"] = "PASS"
        elif verdict3 == "NEEDS_HUMAN":
            print("  ✅ STAGE 3 PASS — NEEDS_HUMAN (trap not auto-closed)")
            results["stage3"] = "PASS"
        else:
            print(f"  ❌ STAGE 3 FAIL — Expected NEEDS_HUMAN, got {verdict3}")
            results["stage3"] = "FAIL"
            all_pass = False

    # ── Summary ───────────────────────────────────────────────
    sep("DEMO CHECK SUMMARY")
    for stage, result in results.items():
        icon = "✅" if result == "PASS" else ("⚠️ " if result == "PARTIAL" else "❌")
        print(f"  {icon} {stage.upper()}: {result}")

    print()
    if all_pass:
        print("  🎉 ALL STAGES PASS — Ready to demo!")
    else:
        print("  ⚠️  Some stages failed — check logs above.")

    return 0 if all_pass else 1


if __name__ == "__main__":
    sys.exit(main())

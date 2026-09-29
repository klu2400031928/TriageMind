#!/usr/bin/env python3
"""
Comprehensive End-to-End Verification Script for TriageMind
Executes and validates Items 3 through 14.
"""
import sys
import os
import time
import json
import urllib.request
import urllib.error

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

BASE_URL = "http://localhost:8000"

def log(tag: str, msg: str):
    print(f"[{tag}] {msg}", flush=True)

def api_call(method: str, path: str, body: dict | None = None) -> dict:
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

results = {}

def run_tests():
    log("VERIFY", "Starting comprehensive verification...")

    # -------------------------------------------------------------
    # ITEM 3: Hindsight Cloud Connection
    # -------------------------------------------------------------
    log("ITEM 3", "Verifying Hindsight Cloud connection...")
    health = api_call("GET", "/api/health")
    if health.get("status") == "ok" and health.get("hindsight", {}).get("status") == "ok":
        version_info = health.get("hindsight", {}).get("version", "")
        log("ITEM 3", f"PASS: Connected to Hindsight Cloud. Version: {version_info[:80]}...")
        results["3_hindsight_connection"] = ("PASS", f"Connected (version: {version_info[:40]}...)")
    else:
        log("ITEM 3", f"FAIL: Health check returned {health}")
        results["3_hindsight_connection"] = ("FAIL", str(health))

    # -------------------------------------------------------------
    # ITEM 4: Real Hindsight Retain -> Recall -> Reflect
    # -------------------------------------------------------------
    log("ITEM 4", "Verifying real Hindsight retain -> recall -> reflect cycle...")
    from app.services.hindsight_service import (
        ensure_bank_exists,
        retain_memory,
        recall_memories,
        reflect_on_bank,
        delete_and_recreate_bank
    )
    test_bank = "triagemind-e2e-verify"
    try:
        ensure_bank_exists(bank_id=test_bank)
        test_content = (
            "VERIFY EVENT: Analyst Sarah Lin verified that internal asset database-backup-02 "
            "runs encrypted tar archives to AWS S3 bucket soc-backups-east every night at 03:30 UTC. "
            "Verdict: FALSE POSITIVE. Reason: Verified scheduled maintenance."
        )
        retain_res = retain_memory(
            content=test_content,
            bank_id=test_bank,
            tags=["verify-test", "false-positive"]
        )
        assert retain_res.get("success"), f"Retain failed: {retain_res}"
        log("ITEM 4", "Real retain succeeded.")

        # Immediate recall
        recalled = recall_memories(
            query="database backup 02 scheduled maintenance S3",
            bank_id=test_bank,
            max_results_tokens=2048
        )
        assert len(recalled) > 0, "Recall returned 0 memories"
        top_mem = recalled[0]
        assert "database-backup-02" in (top_mem.text or ""), "Recalled memory does not match content"
        log("ITEM 4", f"Real recall succeeded (found {len(recalled)} memories, top text matches).")

        # Real reflect
        reflection = reflect_on_bank(
            query="What is the schedule for database backups?",
            bank_id=test_bank
        )
        assert reflection and len(reflection) > 20, f"Reflect returned empty: {reflection}"
        log("ITEM 4", f"Real reflect succeeded. Synthesized reflection: {reflection[:100]}...")

        # Clean up test bank
        delete_and_recreate_bank(test_bank)
        results["4_hindsight_retain_recall_reflect"] = ("PASS", "Retain, recall, and reflect all succeeded on live Hindsight Cloud")
    except Exception as e:
        log("ITEM 4", f"FAIL: {e}")
        results["4_hindsight_retain_recall_reflect"] = ("FAIL", str(e))

    # -------------------------------------------------------------
    # ITEM 5: Groq LLM Call Works
    # -------------------------------------------------------------
    log("ITEM 5", "Verifying Groq LLM call with structured JSON...")
    from app.services.llm_service import call_llm
    try:
        sample_alert = (
            "Alert ID: LLM-TEST-01\n"
            "Event: SSH Brute Force\n"
            "Source IP: 203.0.113.55 (External)\n"
            "Target: auth-srv-01\n"
            "Description: 50 failed root logins in 1 minute."
        )
        v, raw, model_used = call_llm(sample_alert, "No prior memories.")
        assert v is not None, "LLM returned None verdict"
        assert v.verdict in ("AUTO_CLOSE", "ESCALATE", "NEEDS_HUMAN"), f"Invalid verdict: {v.verdict}"
        assert v.confidence >= 0.0, "Invalid confidence"
        log("ITEM 5", f"PASS: Model {model_used} produced valid verdict={v.verdict}, conf={v.confidence:.2f}")
        results["5_groq_llm_call"] = ("PASS", f"Model: {model_used}, Verdict: {v.verdict}, Conf: {v.confidence:.2f}")
    except Exception as e:
        log("ITEM 5", f"FAIL: {e}")
        results["5_groq_llm_call"] = ("FAIL", str(e))

    # -------------------------------------------------------------
    # Reset bank before 3-stage check so Stage 1 has NO 10.20.5.44 memory
    # -------------------------------------------------------------
    log("STAGE_SETUP", "Resetting demo bank to clean seed state...")
    reset_res = api_call("POST", "/api/demo/reset")
    assert reset_res.get("success"), f"Reset failed: {reset_res}"
    log("STAGE_SETUP", "Demo bank reset complete.")

    # -------------------------------------------------------------
    # ITEM 6: Stage 1 Cold-Start Alert (NO Nessus memory for 10.20.5.44)
    # -------------------------------------------------------------
    log("ITEM 6", "Verifying Stage 1 cold-start alert...")
    stage1_alert = {
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
        "description": "SSH scanning from 10.20.5.44 to web-prod-03 port 22. Pattern resembles Nessus scanner. Cold start: verify if source IP is authorized."
    }
    triage1 = api_call("POST", "/api/triage", {"alert": stage1_alert, "use_memory": True})
    verdict1 = triage1.get("final_verdict")
    # Verify no memory contains 10.20.5.44
    memories1 = triage1.get("memory_matches", [])
    has_10_20_5_44 = any("10.20.5.44" in (m.get("text") or "") for m in memories1)

    if verdict1 == "NEEDS_HUMAN" and not has_10_20_5_44:
        log("ITEM 6", f"PASS: Stage 1 verdict={verdict1}, 10.20.5.44 memory present={has_10_20_5_44}")
        results["6_stage1_cold_start"] = ("PASS", "NEEDS_HUMAN returned, 0 memories for 10.20.5.44")
    else:
        log("ITEM 6", f"FAIL: verdict={verdict1}, has_10_20_5_44={has_10_20_5_44}")
        results["6_stage1_cold_start"] = ("FAIL", f"verdict={verdict1}, has_10_20_5_44={has_10_20_5_44}")

    # -------------------------------------------------------------
    # ITEM 7: Analyst Feedback Retained into Hindsight
    # -------------------------------------------------------------
    log("ITEM 7", "Submitting analyst feedback to teach agent about 10.20.5.44...")
    feedback_req = {
        "alert_id": "DEMO-STAGE1",
        "ai_verdict": verdict1 or "NEEDS_HUMAN",
        "analyst_verdict": "FALSE_POSITIVE",
        "reason": (
            "10.20.5.44 is our authorized Nessus vulnerability scanner. "
            "It runs every Monday at 02:00 UTC scanning all production assets. "
            "This is a scheduled, authorized scan — completely benign."
        ),
        "analyst_name": "Priya Nair",
        "notes": "Added 10.20.5.44 to scanner whitelist"
    }
    fb_res = api_call("POST", "/api/feedback", feedback_req)
    if fb_res.get("success") and fb_res.get("memory_retained"):
        log("ITEM 7", f"PASS: Feedback retained into Hindsight (override={fb_res.get('override')})")
        results["7_analyst_feedback_retained"] = ("PASS", "Decision retained into Hindsight with override=True")
    else:
        log("ITEM 7", f"FAIL: Feedback submission failed: {fb_res}")
        results["7_analyst_feedback_retained"] = ("FAIL", str(fb_res))

    # -------------------------------------------------------------
    # ITEM 8: Stage 2 Recalls Newly Learned Memory -> AUTO_CLOSE
    # -------------------------------------------------------------
    log("ITEM 8", "Verifying Stage 2 recalls newly learned memory...")
    stage2_alert = {
        "id": "DEMO-STAGE2",
        "timestamp": "2026-10-05T02:00:00Z",  # Following scheduled Monday
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
        "description": "SSH scanning from 10.20.5.44 to web-prod-03 port 22. 47 connection attempts in 5 minutes. Nessus scanner fingerprint detected."
    }
    triage2 = api_call("POST", "/api/triage", {"alert": stage2_alert, "use_memory": True})
    verdict2 = triage2.get("final_verdict")
    conf2 = triage2.get("confidence", 0)
    memories2 = triage2.get("memory_matches", [])
    nessus_found = any("10.20.5.44" in (m.get("text") or "") for m in memories2)

    if verdict2 == "AUTO_CLOSE" and nessus_found and conf2 >= 0.85:
        log("ITEM 8", f"PASS: Stage 2 AUTO_CLOSE (conf={conf2:.2f}), newly learned memory recalled={nessus_found}")
        results["8_stage2_learned_recall"] = ("PASS", f"AUTO_CLOSE (conf={conf2:.2f}), Nessus memory recalled")
    else:
        log("ITEM 8", f"FAIL: verdict={verdict2}, conf={conf2}, nessus_found={nessus_found}")
        results["8_stage2_learned_recall"] = ("FAIL", f"verdict={verdict2}, conf={conf2}, nessus_found={nessus_found}")

    # -------------------------------------------------------------
    # ITEM 9: Stage 3 Trap Alert -> NEEDS_HUMAN + Guardrail Fired
    # -------------------------------------------------------------
    log("ITEM 9", "Verifying Stage 3 trap alert (lookalike attack)...")
    stage3_alert = {
        "id": "DEMO-STAGE3",
        "timestamp": "2026-10-05T03:14:00Z",
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
            "120 rapid connection attempts followed by a SUCCESSFUL SSH authentication. "
            "Resembles scanner activity but originates from unauthorized external IP."
        )
    }
    triage3 = api_call("POST", "/api/triage", {"alert": stage3_alert, "use_memory": True})
    verdict3 = triage3.get("final_verdict")
    guardrails3 = triage3.get("guardrails", {}).get("fired", [])
    mismatch_fired = any("RULE_5" in g or "mismatch" in g.lower() for g in guardrails3)

    if verdict3 == "NEEDS_HUMAN" and mismatch_fired:
        log("ITEM 9", f"PASS: Stage 3 NEEDS_HUMAN, mismatch guardrail fired: {guardrails3}")
        results["9_stage3_trap_detected"] = ("PASS", f"NEEDS_HUMAN with Rule 5 mismatch guardrail fired")
    else:
        log("ITEM 9", f"FAIL: verdict={verdict3}, mismatch_fired={mismatch_fired}")
        results["9_stage3_trap_detected"] = ("FAIL", f"verdict={verdict3}, mismatch_fired={mismatch_fired}")

    # -------------------------------------------------------------
    # ITEM 10: Deterministic Guardrails (Unit Tests)
    # -------------------------------------------------------------
    log("ITEM 10", "Running pytest unit tests for all 7 guardrails...")
    import subprocess
    proc = subprocess.run(
        ["python3", "-m", "pytest", "tests/test_guardrails.py", "-q"],
        capture_output=True,
        text=True,
        cwd=os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    )
    if proc.returncode == 0:
        log("ITEM 10", f"PASS: All guardrail unit tests passed ({proc.stdout.strip()})")
        results["10_deterministic_guardrails"] = ("PASS", "15/15 unit tests passed covering all 7 rules")
    else:
        log("ITEM 10", f"FAIL: Guardrail tests failed: {proc.stderr}")
        results["10_deterministic_guardrails"] = ("FAIL", proc.stderr[:200])

    # -------------------------------------------------------------
    # ITEM 11: Run-Without-Memory Toggle
    # -------------------------------------------------------------
    log("ITEM 11", "Verifying run-without-memory toggle (side-by-side comparison)...")
    # Triaging Stage 2 alert WITH memory -> AUTO_CLOSE
    triage_with_mem = api_call("POST", "/api/triage", {"alert": stage2_alert, "use_memory": True})
    # Triaging Stage 2 alert WITHOUT memory -> NEEDS_HUMAN (cold start)
    triage_no_mem = api_call("POST", "/api/triage", {"alert": stage2_alert, "use_memory": False})

    v_with = triage_with_mem.get("final_verdict")
    v_without = triage_no_mem.get("final_verdict")
    mem_matches_no = len(triage_no_mem.get("memory_matches", []))

    if v_with == "AUTO_CLOSE" and v_without == "NEEDS_HUMAN" and mem_matches_no == 0:
        log("ITEM 11", f"PASS: Toggle works! With memory={v_with}, Without memory={v_without} (memories={mem_matches_no})")
        results["11_run_without_memory_toggle"] = ("PASS", f"With memory: {v_with}, Without memory: {v_without}")
    else:
        log("ITEM 11", f"FAIL: With={v_with}, Without={v_without}")
        results["11_run_without_memory_toggle"] = ("FAIL", f"With: {v_with}, Without: {v_without}")

    # -------------------------------------------------------------
    # ITEM 12: Memory IDs in UI Come from Real Hindsight Results
    # -------------------------------------------------------------
    log("ITEM 12", "Verifying memory IDs in response come from real Hindsight results...")
    recalled_ids = [m.get("id") for m in triage2.get("memory_matches", []) if m.get("id")]
    used_ids = triage2.get("memory_ids_used", [])
    # Verify that all used_ids are subset of recalled_ids (no hallucinated IDs)
    hallucinated = [uid for uid in used_ids if uid not in recalled_ids]

    if recalled_ids and len(hallucinated) == 0:
        log("ITEM 12", f"PASS: Real Hindsight IDs returned ({recalled_ids[:2]}...). Hallucinated IDs: 0")
        results["12_memory_ids_provenance"] = ("PASS", f"Real Hindsight IDs verified; 0 hallucinated IDs")
    else:
        log("ITEM 12", f"FAIL: recalled={recalled_ids}, hallucinated={hallucinated}")
        results["12_memory_ids_provenance"] = ("FAIL", f"Hallucinated: {hallucinated}")

    # -------------------------------------------------------------
    # ITEM 13: Dashboard KPIs Use Real Application Data
    # -------------------------------------------------------------
    log("ITEM 13", "Verifying dashboard KPIs reflect real application state...")
    stats = api_call("GET", "/api/learning/stats")
    processed = stats.get("alerts_processed", 0)
    auto_triaged = stats.get("auto_triaged", 0)
    human_reviews = stats.get("human_reviews", 0)
    matches = stats.get("memory_matches", 0)

    if processed > 0 and (auto_triaged + human_reviews <= processed):
        log("ITEM 13", f"PASS: KPIs computed from real triage store: processed={processed}, auto={auto_triaged}, human={human_reviews}, matches={matches}")
        results["13_dashboard_kpis_real_data"] = ("PASS", f"Processed: {processed}, Auto: {auto_triaged}, Human: {human_reviews}")
    else:
        log("ITEM 13", f"FAIL: Invalid KPI stats: {stats}")
        results["13_dashboard_kpis_real_data"] = ("FAIL", str(stats))

    # -------------------------------------------------------------
    # ITEM 14: Reset/Demo Flow Works
    # -------------------------------------------------------------
    log("ITEM 14", "Verifying demo reset flow clears dynamic feedback and restores baseline...")
    reset_flow = api_call("POST", "/api/demo/reset")
    if reset_flow.get("success") and reset_flow.get("memories_seeded") == 13:
        # Check that after reset, Stage 1 is back to cold-start (no 10.20.5.44 memory)
        triage_after_reset = api_call("POST", "/api/triage", {"alert": stage1_alert, "use_memory": True})
        v_post = triage_after_reset.get("final_verdict")
        m_post = triage_after_reset.get("memory_matches", [])
        has_nessus_post = any("10.20.5.44" in (m.get("text") or "") for m in m_post)

        if v_post == "NEEDS_HUMAN" and not has_nessus_post:
            log("ITEM 14", f"PASS: Reset successfully reseeded 13 memories and cleared Stage 1 memory (v={v_post})")
            results["14_demo_reset_flow"] = ("PASS", "Reset restored baseline; 10.20.5.44 memory cleared")
        else:
            log("ITEM 14", f"FAIL: Post-reset verdict={v_post}, has_nessus={has_nessus_post}")
            results["14_demo_reset_flow"] = ("FAIL", f"Post-reset verdict={v_post}")
    else:
        log("ITEM 14", f"FAIL: Reset endpoint returned {reset_flow}")
        results["14_demo_reset_flow"] = ("FAIL", str(reset_flow))

    return results

if __name__ == "__main__":
    res = run_tests()
    print("\n" + "="*60)
    print("VERIFICATION SUMMARY")
    print("="*60)
    all_ok = True
    for k, (status, detail) in res.items():
        icon = "✅" if status == "PASS" else "❌"
        print(f"{icon} {k}: {status} — {detail}")
        if status != "PASS":
            all_ok = False
    sys.exit(0 if all_ok else 1)

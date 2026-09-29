# TriageMind REST API Reference

Base URL: `http://localhost:8000/api`

All requests and responses use `application/json` encoding unless otherwise specified.

---

## Table of Contents
1. [System Health](#1-system-health)
   - `GET /api/health`
2. [Alerts & Dataset](#2-alerts--dataset)
   - `GET /api/alerts`
   - `GET /api/alerts/{alert_id}`
3. [Triage Engine](#3-triage-engine)
   - `POST /api/triage`
   - `GET /api/triage/{alert_id}`
4. [Analyst Feedback & Memory](#4-analyst-feedback--memory)
   - `POST /api/feedback`
   - `GET /api/feedback/poll/{alert_id}`
5. [Dashboard Metrics & Reflection](#5-dashboard-metrics--reflection)
   - `GET /api/learning/stats`
   - `GET /api/memory/recent`
   - `POST /api/learning/reflect`
6. [Demo & Reset Operations](#6-demo--reset-operations)
   - `POST /api/demo/reset`
   - `POST /api/seed`

---

## 1. System Health

### `GET /api/health`
Verifies backend connectivity, configuration validity, and Hindsight Cloud API connectivity.

**Request:**
```http
GET /api/health HTTP/1.1
Host: localhost:8000
```

**Response (200 OK):**
```json
{
  "status": "ok",
  "hindsight": {
    "status": "ok",
    "version": "api_version='0.10.1' features=FeaturesInfo(observations=True, mcp=True, worker=False, bank_config_api=True, bank_llm_health=False, file_upload_api=True, document_export_api=True, document_import_api=True, audit_log=True, llm_trace=True, store_document_text=True)"
  },
  "config_errors": [],
  "app_env": "development"
}
```

---

## 2. Alerts & Dataset

### `GET /api/alerts`
Retrieves all alerts from `data/alerts.json` enriched with their active stored triage verdicts, confidence scores, and memory counts.

**Response (200 OK):**
```json
{
  "alerts": [
    {
      "id": "ALT-001",
      "timestamp": "2026-09-29T02:00:00Z",
      "source_ip": "10.20.5.88",
      "source_port": 54231,
      "destination_ip": "10.10.1.10",
      "destination_port": 22,
      "hostname": "web-prod-01",
      "username": null,
      "asset": "web-prod-01",
      "environment": "production",
      "severity": "MEDIUM",
      "event_type": "SSH_SCAN",
      "process": null,
      "tool": "Nessus",
      "aws_region": null,
      "cloudtrail_event": null,
      "description": "SSH connection attempts from 10.20.5.88 to web-prod-01 port 22...",
      "triage": {
        "final_verdict": "NEEDS_HUMAN",
        "confidence": 0.85,
        "memory_count": 5,
        "reasoning": "The alert matches a known Nessus scan pattern..."
      }
    }
  ],
  "total": 40
}
```

### `GET /api/alerts/{alert_id}`
Returns details for a single alert and its associated stored triage record.

**Response (200 OK):**
```json
{
  "alert": {
    "id": "ALT-001",
    "severity": "MEDIUM",
    "event_type": "SSH_SCAN",
    "source_ip": "10.20.5.88"
  },
  "triage": {
    "alert_id": "ALT-001",
    "llm_verdict": "NEEDS_HUMAN",
    "final_verdict": "NEEDS_HUMAN",
    "confidence": 0.85
  }
}
```

**Errors:**
- `404 Not Found`: If `alert_id` does not exist in `data/alerts.json`.

---

## 3. Triage Engine

### `POST /api/triage`
Runs the triage pipeline (observable extraction → memory recall → LLM reasoning → deterministic guardrail enforcement).

**Request Body:**
```json
{
  "alert": {
    "id": "DEMO-STAGE2",
    "timestamp": "2026-10-05T02:00:00Z",
    "source_ip": "10.20.5.44",
    "source_port": 56100,
    "destination_ip": "10.10.1.10",
    "destination_port": 22,
    "hostname": "web-prod-03",
    "username": null,
    "asset": "web-prod-03",
    "environment": "production",
    "severity": "MEDIUM",
    "event_type": "SSH_SCAN",
    "process": null,
    "tool": "Nessus",
    "aws_region": null,
    "cloudtrail_event": null,
    "description": "SSH scanning from 10.20.5.44 to web-prod-03 port 22."
  },
  "use_memory": true
}
```

**Response (200 OK):**
```json
{
  "alert_id": "DEMO-STAGE2",
  "llm_verdict": "AUTO_CLOSE",
  "final_verdict": "AUTO_CLOSE",
  "confidence": 0.95,
  "severity": "MEDIUM",
  "reasoning": "Recalled memory confirms IP 10.20.5.44 is an authorized Nessus scanner scheduled on Mondays...",
  "key_evidence": [
    "Source IP 10.20.5.44 matches authorized Nessus scanner memory",
    "Scan occurs at 02:00 UTC on scheduled Monday"
  ],
  "recommended_actions": [
    "Auto-close alert as authorized scheduled scanner activity"
  ],
  "memory_matches": [
    {
      "id": "mem_01jk98...",
      "text": "Alert: DEMO-STAGE1. Analyst Priya Nair confirmed 10.20.5.44 is authorized...",
      "relevance": 0.94,
      "verdict": "FALSE POSITIVE",
      "analyst": "Priya Nair",
      "date": "2026-09-28",
      "tags": ["nessus", "authorized-scanner", "false-positive"]
    }
  ],
  "memory_ids_used": ["mem_01jk98..."],
  "memory_summary": ["Priya Nair verified 10.20.5.44 is authorized Nessus scanner"],
  "guardrails": {
    "fired": [],
    "overridden": false,
    "original_verdict": "AUTO_CLOSE",
    "final_verdict": "AUTO_CLOSE"
  },
  "use_memory": true,
  "pipeline_steps": [
    "Analyzing alert",
    "Searching organizational memory",
    "5 relevant memories found",
    "Comparing historical decisions",
    "Guardrail check",
    "Recommendation ready"
  ]
}
```

### `GET /api/triage/{alert_id}`
Retrieves an existing triage result from the stored results cache.

**Response (200 OK):** Returns `TriageResult` schema.  
**Errors:** `404 Not Found` if the alert has not been triaged yet.

---

## 4. Analyst Feedback & Memory

### `POST /api/feedback`
Captures an analyst's decision and retains it in Hindsight Cloud.

**Request Body:**
```json
{
  "alert_id": "DEMO-STAGE1",
  "ai_verdict": "NEEDS_HUMAN",
  "analyst_verdict": "FALSE_POSITIVE",
  "reason": "10.20.5.44 is our authorized Nessus scanner. It runs scheduled scans every Monday at 02:00 UTC.",
  "analyst_name": "Priya Nair",
  "notes": "Added to authorized scanner whitelist documentation."
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "alert_id": "DEMO-STAGE1",
  "override": true,
  "memory_retained": true,
  "operation_id": null,
  "message": "Analyst decision retained in memory."
}
```

### `GET /api/feedback/poll/{alert_id}`
Polls Hindsight until the newly retained memory is indexed and searchable.

**Query Parameters:**
- `keyword` (string, optional): String to search for in recalled memories (defaults to `alert_id`).
- `timeout` (float, default: `30.0`): Maximum time in seconds to poll.

**Response (200 OK):**
```json
{
  "found": true,
  "memory_count": 5
}
```

---

## 5. Dashboard Metrics & Reflection

### `GET /api/learning/stats`
Computes real-time SOC metrics derived directly from stored triage records.

**Response (200 OK):**
```json
{
  "alerts_processed": 4,
  "memory_matches": 4,
  "auto_triaged": 1,
  "human_reviews": 3,
  "escalated": 0,
  "analyst_overrides": 1,
  "auto_triage_rate": 0.25,
  "human_review_rate": 0.75,
  "memory_match_rate": 1.0
}
```

### `GET /api/memory/recent`
Fetches recently recalled organizational memories from Hindsight Cloud for inspection.

**Query Parameters:**
- `query` (string, default: `"security alert analyst decision"`)
- `limit` (int, default: `20`)

**Response (200 OK):**
```json
{
  "memories": [
    {
      "id": "mem_01jk98...",
      "text": "Alert: SSH login by jsmith to app-staging-01 at 23:47...",
      "relevance": 0.76,
      "verdict": "FALSE POSITIVE",
      "tags": ["ssh", "false-positive", "night-shift"],
      "occurred": null
    }
  ],
  "total": 14
}
```

### `POST /api/learning/reflect`
Invokes Hindsight Reflect to synthesize learned organizational patterns into natural language.

**Request Body:**
```json
{
  "query": "What patterns have I learned from analyst decisions?"
}
```

**Response (200 OK):**
```json
{
  "reflection": "The SOC has authorized internal Nessus scanners on the 10.20.5.x subnet (specifically 10.20.5.88 and 10.20.5.44) operating on scheduled Monday/Wednesday windows...",
  "query": "What patterns have I learned from analyst decisions?"
}
```

---

## 6. Demo & Reset Operations

### `POST /api/demo/reset`
Performs clean demo reset:
1. Deletes the active Hindsight Cloud memory bank (`triagemind-demo`).
2. Recreates the bank with fresh configuration.
3. Reseeds the 13 baseline memories (excluding `10.20.5.44` so Stage 1 remains a true Cold Start).
4. Clears all stored triage results in memory and on disk (`data/triage_store.json`).
5. Clears analyst feedback cache.
6. Does NOT touch or corrupt `data/alerts.json`.

**Response (200 OK):**
```json
{
  "success": true,
  "bank_id": "triagemind-demo",
  "memories_seeded": 13,
  "memories_failed": 0
}
```

### `POST /api/seed`
Non-destructively retains the 13 baseline memories into the bank without deleting existing records.

**Response (200 OK):**
```json
{
  "success": true,
  "memories_seeded": 13,
  "memories_failed": 0,
  "total": 13
}
```

# TriageMind Architecture & System Design

## Overview

TriageMind is an autonomous AI Security Operations Center (SOC) alert triage agent engineered around **persistent organizational memory** and **deterministic safety guardrails**.

Unlike traditional stateless triage bots or naive RAG implementations that blindly trust cosine similarity, TriageMind maintains a strict separation between **model recommendation generation** and **final guarded verdict enforcement**.

---

## Architectural Diagram

```mermaid
flowchart TD
    subgraph ClientLayer ["Client Layer"]
        UI["Next.js 15 Command Center"]
        AlertQueue["Alert Queue (40 Alerts)"]
        DetailModal["Triage & Memory Modal"]
        MetricsBar["Dashboard KPIs"]
    end

    subgraph APILayer ["FastAPI Ingestion & Routing (:8000)"]
        AlertsAPI["/api/alerts"]
        TriageAPI["/api/triage"]
        FeedbackAPI["/api/feedback"]
        StatsAPI["/api/learning/stats"]
        ReflectAPI["/api/learning/reflect"]
        ResetAPI["/api/demo/reset"]
    end

    subgraph TriageEngine ["Triage Engine"]
        QueryBuilder["Observable & Query Builder"]
        LLMCaller["Groq LLM Service (openai/gpt-oss-120b)"]
        MemValidator["Memory ID Validator"]
        Guardrails["Deterministic Guardrail Safety Layer"]
    end

    subgraph Persistence ["State & Memory Layer"]
        AlertsJSON[("data/alerts.json (Source Dataset)")]
        TriageStore[("data/triage_store.json (Results Store)")]
        Hindsight[("Hindsight Cloud Memory Bank (triagemind-demo)")]
    end

    %% UI to API
    UI --> AlertQueue
    UI --> DetailModal
    UI --> MetricsBar
    AlertQueue -->|GET /api/alerts| AlertsAPI
    DetailModal -->|POST /api/triage| TriageAPI
    DetailModal -->|POST /api/feedback| FeedbackAPI
    MetricsBar -->|GET /api/learning/stats| StatsAPI

    %% API to Storage / Engine
    AlertsAPI -->|Read Dataset| AlertsJSON
    AlertsAPI -->|Enrich with Results| TriageStore
    StatsAPI -->|Aggregate Metrics| TriageStore
    TriageAPI --> TriageEngine

    %% Inside Triage Engine
    TriageAPI --> QueryBuilder
    QueryBuilder -->|arecall (Semantic Query)| Hindsight
    Hindsight -->|Recalled Memories| LLMCaller
    QueryBuilder -->|Alert Context| LLMCaller
    LLMCaller -->|Raw Recommendation| MemValidator
    MemValidator -->|Validated Memory IDs| Guardrails
    Guardrails -->|Final Guarded Verdict| TriageAPI

    %% Result Persistence & Feedback
    TriageAPI -->|Persist Result| TriageStore
    FeedbackAPI -->|aretain (Analyst Knowledge)| Hindsight
    FeedbackAPI -->|Clear on Reset| TriageStore
```

---

## Core Operational Lifecycles

### 1. Alert Ingestion
Alerts originate from external detection sensors (e.g. Suricata IDS, AWS CloudTrail, Splunk, Zeek).
- In this implementation, the primary source dataset resides in `data/alerts.json` (40 synthetic security alerts covering SSH scans, AWS IAM anomalies, reverse shell callbacks, and authorized scanners).
- The `GET /api/alerts` route loads the complete dataset without modifying source records, validating alert schemas against Pydantic models.

### 2. Alert Storage
- **Static Dataset**: `data/alerts.json` serves as the read-only catalog of ingested alerts. It is preserved across reboots and demo resets.
- **Triage Result Store**: When an alert is analyzed, its full output (`TriageResult`) is persisted to `data/triage_store.json`.
- Alerts returned by `/api/alerts` are dynamically enriched with their stored triage verdicts, memory counts, and reasoning.

### 3. Triage Execution Pipeline
When `POST /api/triage` is invoked:
1. **Extraction**: The alert observables (IP addresses, ports, hostname, environment, severity, event type, tool, and timestamp) are extracted into structured key fields.
2. **Context Routing**: If `use_memory=True`, the engine queries Hindsight Cloud. If `use_memory=False` (Cold Start), memory retrieval is bypassed.
3. **Prompt Composition**: The alert payload and memory context are rendered into a strict JSON-enforced instruction template.
4. **Model Call**: Groq API executes `openai/gpt-oss-120b` with `temperature=0` to guarantee deterministic reasoning.
5. **Guardrail Enforcement**: The raw output passes to the Python guardrail engine.
6. **Persistence**: The final result is indexed in `_triage_store` and synced to disk.

### 4. Memory Retrieval (Hindsight Cloud)
- Query formulation combines event signatures, source IPs, targets, and description tokens.
- Hindsight executes semantic memory search across the `triagemind-demo` bank using `arecall()`.
- Results include relevance scores (`scores.final`), analyst notes, verdicts, and semantic tags.
- High-relevance memories (>0.50) provide the contextual baseline for the LLM.

### 5. Recommendation Generation vs. Final Guarded Verdict
TriageMind establishes an absolute boundary between what the model *recommends* and what the system *executes*:

| Attribute | Model Recommendation (`LLMVerdict`) | Final Guarded Verdict (`TriageResult.final_verdict`) |
|---|---|---|
| **Origin** | Groq Cloud LLM (`openai/gpt-oss-120b`) | Python Code Guardrail Engine (`guardrail_service.py`) |
| **Bypassable?** | Yes (via prompt manipulation or hallucination) | **Never** (Deterministic code invariants) |
| **Output Values** | `AUTO_CLOSE`, `NEEDS_HUMAN`, `ESCALATE` | `AUTO_CLOSE`, `NEEDS_HUMAN`, `ESCALATE` |
| **Inputs Evaluated** | Alert description, raw prompt text, memory text | Exact observable fields, severity, confidence, tags |

### 6. Guardrail Enforcement Layer
The 7 immutable guardrail rules execute sequentially in code:
1. **Rule 1 (Critical Severity)**: If `alert_severity == "CRITICAL"`, verdict is forced to `NEEDS_HUMAN`. Critical alerts cannot be auto-closed.
2. **Rule 2 (Confidence Threshold)**: If `confidence < 0.85`, auto-closure is prohibited; forces `NEEDS_HUMAN`.
3. **Rule 3 (Cold Start / No Memory)**: If no memories are provided or found, the agent cannot auto-close; forces `NEEDS_HUMAN`.
4. **Rule 4 (Conflicting Memories)**: If both benign and malicious precedents match the pattern, forces `NEEDS_HUMAN`.
5. **Rule 5 (Evidence Mismatch)**: If an alert resembles a benign memory but key observables differ (e.g., source IP is external `185.23.x.x` instead of internal `10.20.5.x`, or successful authentication occurred), forces `NEEDS_HUMAN`.
6. **Rule 6 (Memory ID Validation)**: Drops any hallucinated memory ID that was not present in the actual recall response.
7. **Rule 7 (High Severity)**: High severity alerts require human review unless an explicit verified policy allows closure.

### 7. Result Persistence
- Results are saved in `data/triage_store.json` keyed by `alert.id`.
- Re-triaging an alert updates its record in-place rather than creating duplicate entries.
- Results survive backend restarts, preventing metric drift on page reloads.

### 8. Dashboard Aggregation
Dashboard statistics (`GET /api/learning/stats`) compute aggregations over all stored triage results in `_triage_store`:
- **Alerts Analyzed**: `len(_triage_store)`
- **Memory Matches**: Number of results with `len(memory_matches) > 0`
- **Auto-Triaged**: Number of results with `final_verdict == "AUTO_CLOSE"`
- **Human Reviews**: Number of results with `final_verdict == "NEEDS_HUMAN"`
- **Rates**: Exact percentages calculated from real counts (no hardcoded counters).

### 9. Analyst Feedback
When an analyst reviews an alert or overrides an AI verdict:
- Submits structured feedback via `POST /api/feedback`.
- Includes analyst name, verdict (`FALSE_POSITIVE` | `TRUE_POSITIVE` | `NEEDS_HUMAN`), rationale, and documentation notes.
- Deduplication prevents redundant memory writes for the same alert.

### 10. Memory Retention
- Formats a natural-language institutional memory entry including alert observables, analyst decisions, and operational context.
- Calls Hindsight `aretain()` to asynchronously index the memory in the organizational bank.
- Memory tags (`false-positive`, `nessus`, `authorized-scanner`, etc.) enable high-precision retrieval on subsequent runs.

### 11. Reflection & Knowledge Synthesis
- Exposes `POST /api/learning/reflect` backed by Hindsight `areflect()`.
- Synthesizes all stored analyst corrections into high-level organizational insights (e.g., recurring scanner schedules, vulnerable subnets, and active threat campaigns).

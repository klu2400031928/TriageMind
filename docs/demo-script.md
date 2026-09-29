# TriageMind — 90-Second Demo & Pitch Script

> **Timing**: 90 seconds spoken naturally.  
> **Target Audience**: Hackathon Judges, Security Leads, SOC Directors.

---

### [00:00 – 00:15] The Problem: SOC Alert Fatigue & Lost Context
*(Action: Open TriageMind Command Center at `http://localhost:3000` showing the Live SOC Activity and Security Operations Queue.)*

> **Speaker**:  
> "Every day, SOC analysts waste 80% of their shift reviewing the exact same recurring benign alerts—like scheduled vulnerability scans and CI pipelines. Worse, whenever an analyst verifies that an internal IP is harmless, that knowledge vanishes into shift notes. When the next shift starts, the investigation starts all over from scratch.  
> We built **TriageMind** to give security teams persistent institutional memory."

---

### [00:15 – 00:35] Stage 1: Cold Start (Safety by Default)
*(Action: Click **STAGE 1: COLD START** in the top Demo Bar.)*

> **Speaker**:  
> "Here, our SIEM detects rapid SSH connections from IP `10.20.5.44` against a production web server. It looks like a vulnerability scanner, but this is a **Cold Start**.  
> Notice the AI verdict: **NEEDS HUMAN**.  
> Because the agent has no verified organizational memory proving `10.20.5.44` is an approved scanner, it refuses to guess. Deterministic guardrails prevent unsafe auto-closure."

---

### [00:35 – 00:55] Analyst Feedback: Teaching the Agent
*(Action: Switch to the **Analyst Override / Feedback** section of the modal.)*

> **Speaker**:  
> "Our Tier-2 analyst verifies the scanner with IT and submits one piece of feedback:  
> *'10.20.5.44 is our authorized Nessus scanner. It runs scheduled scans on production assets every Monday at 02:00 UTC.'*  
> When the analyst hits Submit, this decision is immediately encoded into **Hindsight Cloud** as persistent institutional memory. It's now part of the company's permanent security knowledge base."

---

### [00:55 – 01:10] Stage 2: Adaptive Learning in Action
*(Action: Click **STAGE 2: LEARNING (AUTO-CLOSE)** in the top Demo Bar.)*

> **Speaker**:  
> "The following Monday, the exact same scan occurs from `10.20.5.44`.  
> Look at the screen:  
> TriageMind recalls the newly retained analyst precedent with over 90% relevance. Because the IP, tool fingerprint, and scheduled window match perfectly, the verdict is now **AUTO-CLOSE with 95% confidence**.  
> The analyst never has to triage this false positive again. That's real, continuous learning."

---

### [00:10 – 01:25] Stage 3: The Trap Alert (Lookalike Attack Defense)
*(Action: Click **STAGE 3: TRAP ALERT** in the top Demo Bar.)*

> **Speaker**:  
> "Now here is the critical test: an attacker launches a lookalike attack. They mimic scanner volume against the same production host. A naive AI model would see 'SSH scan on web-prod' and auto-close it.  
> But look at TriageMind:  
> The banner flashes red. **Guardrail 5 (Evidence Mismatch)** fires!  
> The agent detected that the source IP is external—`185.23.42.77`—and observed a **successful authentication**. The guardrail immediately overrides the model and forces **NEEDS HUMAN**.  
> TriageMind refuses to blindly trust similarity."

---

### [01:25 – 01:30] Closing Statement
*(Action: Point to the Live Dashboard Metrics showing real updated counts and coverage.)*

> **Speaker**:  
> "TriageMind doesn't just automate decisions. It learns organizational context while preserving human control when the evidence doesn't match."

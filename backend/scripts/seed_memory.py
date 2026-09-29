#!/usr/bin/env python3
"""
Seed TriageMind's Hindsight memory bank with 13 real experiences.
IMPORTANT: Does NOT include the 10.20.5.44 Nessus scanner memory
so that Stage 1 of the demo is a true cold start.

Usage:
    cd TriageMind/backend
    python3 scripts/seed_memory.py
"""
import os
import sys
import time

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

from app.services.hindsight_service import (
    ensure_bank_exists,
    retain_memory,
    get_settings,
)

# 13 seed memories — no 10.20.5.44 Nessus memory (reserved for demo Stage 1)
SEED_MEMORIES = [
    {
        "content": (
            "Alert: Outbound HTTPS connection from ci-runner-03 to pypi.org:443.\n"
            "Tool: GitHub Actions.\n"
            "Verdict: FALSE POSITIVE.\n"
            "Analyst: Priya Nair.\n"
            "Reason: ci-runner-03 is an authorized CI/CD runner. It downloads Python packages "
            "from PyPI during build jobs. This is expected behavior. The GitHub Actions service "
            "account has been granted outbound HTTPS access for build purposes.\n"
            "Environment: CI/CD.\n"
            "Source IP: 10.30.1.5.\n"
            "Outcome: Alert safely closed. Added ci-runner-03 to known-safe host list.\n"
            "Timestamp: 2026-09-22."
        ),
        "tags": ["ci-cd", "false-positive", "outbound-traffic", "environment-memory"],
    },
    {
        "content": (
            "Alert: Outbound HTTPS connection from ci-runner-04 to github.com CDN (185.199.108.133:443).\n"
            "Tool: GitHub Actions.\n"
            "Verdict: FALSE POSITIVE.\n"
            "Analyst: Priya Nair.\n"
            "Reason: ci-runner-04 is an authorized CI/CD runner. GitHub Actions runners routinely "
            "connect to GitHub's CDN infrastructure to pull actions, containers and npm packages. "
            "The 185.199.108.0/24 range belongs to GitHub.\n"
            "Environment: CI/CD.\n"
            "Source IP: 10.30.1.5.\n"
            "Outcome: Closed. GitHub CDN range added to network allowlist.\n"
            "Timestamp: 2026-09-22."
        ),
        "tags": ["ci-cd", "false-positive", "outbound-traffic", "environment-memory"],
    },
    {
        "content": (
            "Alert: AWS API call s3:PutObject by ci-runner-04 in us-east-1.\n"
            "Tool: AWS CloudTrail.\n"
            "Verdict: FALSE POSITIVE.\n"
            "Analyst: Marcus Chen.\n"
            "Reason: CI runners are authorized to write build artifacts to the designated S3 bucket "
            "as part of the deployment pipeline. The ECS deployment pipeline requires artifact upload "
            "before proceeding. This is expected behavior from us-east-1.\n"
            "Environment: CI/CD.\n"
            "Asset: ci-runner-04. AWS Region: us-east-1.\n"
            "Outcome: Closed. CI runner AWS permissions documented.\n"
            "Timestamp: 2026-09-22."
        ),
        "tags": ["ci-cd", "false-positive", "aws", "environment-memory"],
    },
    {
        "content": (
            "Alert: SSH login by jsmith to app-staging-01 at 23:47.\n"
            "Tool: Splunk.\n"
            "Verdict: FALSE POSITIVE.\n"
            "Analyst: Marcus Chen.\n"
            "Reason: jsmith is a known night-shift system administrator. He regularly performs "
            "maintenance tasks on staging servers between 22:00 and 06:00 UTC. Access from "
            "10.10.5.12 is his authorized admin workstation. Staging access is within his "
            "authorized scope.\n"
            "Environment: Staging.\n"
            "Source IP: 10.10.5.12. Asset: app-staging-01.\n"
            "Outcome: Closed. Night-shift admin schedule documented.\n"
            "Timestamp: 2026-09-21."
        ),
        "tags": ["ssh", "false-positive", "night-shift", "admin", "environment-memory"],
    },
    {
        "content": (
            "Alert: SSH login by jsmith to app-staging-02 at 01:15.\n"
            "Tool: Splunk.\n"
            "Verdict: FALSE POSITIVE.\n"
            "Analyst: Priya Nair.\n"
            "Reason: jsmith's night-shift maintenance. This is a recurring pattern. jsmith "
            "accesses staging servers (10.10.2.x subnet) between 22:00 and 06:00 from workstation "
            "10.10.5.12. No production access has been observed. Pattern is consistent with "
            "authorized night-shift operations.\n"
            "Override: AI recommended ESCALATE due to unusual hours. Analyst correctly identified "
            "as false positive based on documented night-shift schedule.\n"
            "AI Recommendation: ESCALATE. Analyst Decision: FALSE POSITIVE.\n"
            "Environment: Staging.\n"
            "Source IP: 10.10.5.12. Asset: app-staging-02.\n"
            "Outcome: Closed. AI updated with analyst correction.\n"
            "Timestamp: 2026-09-22."
        ),
        "tags": ["ssh", "false-positive", "night-shift", "admin", "override-memory"],
    },
    {
        "content": (
            "Alert: IAM access key creation for svc-deploy from ap-southeast-1 at 03:41 UTC.\n"
            "Tool: AWS CloudTrail. Event: iam:CreateAccessKey.\n"
            "Verdict: TRUE POSITIVE — Confirmed Malicious.\n"
            "Analyst: Priya Nair.\n"
            "Reason: svc-deploy normally operates exclusively from us-east-1. API calls from "
            "ap-southeast-1 are never expected for this account. IAM key creation at 03:41 UTC "
            "outside business hours from an unexpected region is a strong indicator of credential "
            "compromise. Threat intel confirmed the source IP (203.0.113.45) has been associated "
            "with credential stuffing campaigns.\n"
            "Environment: Production. AWS Region: ap-southeast-1 (UNEXPECTED — normal is us-east-1).\n"
            "Outcome: Incident declared. All existing keys for svc-deploy revoked. New keys issued "
            "with MFA requirement. Account activity reviewed. Confirmed unauthorized access.\n"
            "Timestamp: 2026-09-23."
        ),
        "tags": ["aws", "true-positive", "iam", "credential-compromise", "incident-memory"],
    },
    {
        "content": (
            "Alert: AWS API enumeration — ec2:DescribeInstances by svc-deploy from eu-west-3.\n"
            "Tool: AWS CloudTrail.\n"
            "Verdict: TRUE POSITIVE — Confirmed Malicious.\n"
            "Analyst: Marcus Chen.\n"
            "Reason: Follow-on to the IAM key compromise (ALT-009). Attacker used the stolen "
            "svc-deploy credentials to enumerate infrastructure from eu-west-3. ec2:DescribeInstances "
            "called 47 times in 10 minutes — reconnaissance pattern. This was the attacker "
            "mapping the environment after credential theft.\n"
            "Environment: Production. AWS Region: eu-west-3.\n"
            "Outcome: Keys already revoked. Attacker lost access. Monitored for follow-on activity "
            "for 72 hours. No further incidents.\n"
            "Timestamp: 2026-09-23."
        ),
        "tags": ["aws", "true-positive", "enumeration", "credential-compromise", "incident-memory"],
    },
    {
        "content": (
            "Alert: Outbound TCP from web-prod-05 (www-data/php-fpm) to 185.23.44.12:4444.\n"
            "Tool: Suricata IDS.\n"
            "Verdict: TRUE POSITIVE — Confirmed Malicious.\n"
            "Analyst: Priya Nair.\n"
            "Reason: Port 4444 is a well-known Metasploit/C2 callback port. php-fpm should never "
            "initiate outbound TCP connections. This is a textbook webshell reverse shell pattern. "
            "The www-data process spawning network connections is a definitive indicator of "
            "compromise. Destination IP confirmed in threat intel as C2 infrastructure.\n"
            "Environment: Production. Asset: web-prod-05.\n"
            "Outcome: CRITICAL INCIDENT. web-prod-05 immediately isolated. Forensic snapshot taken. "
            "Webshell found in /var/www/html/upload/. All web servers inspected. Credentials rotated. "
            "Logs preserved.\n"
            "Timestamp: 2026-09-24."
        ),
        "tags": ["port-4444", "true-positive", "c2", "webshell", "production", "incident-memory"],
    },
    {
        "content": (
            "Alert: Outbound TCP from web-prod-06 (apache) to 45.142.200.5:4444.\n"
            "Tool: Suricata IDS.\n"
            "Verdict: TRUE POSITIVE — Confirmed Malicious.\n"
            "Analyst: Marcus Chen.\n"
            "Reason: Second production server compromised. Same pattern as web-prod-05: web server "
            "process making outbound connection to port 4444. Different destination IP — suggests "
            "coordinated C2 with multiple callback infrastructure. Production web server processes "
            "should NEVER initiate outbound connections. This pattern is unambiguous compromise.\n"
            "Override: AI recommended ESCALATE. Analyst escalated to CRITICAL and coordinated "
            "simultaneous isolation with web-prod-05.\n"
            "AI Recommendation: ESCALATE. Analyst Decision: ESCALATE (with CRITICAL incident declaration).\n"
            "Environment: Production. Asset: web-prod-06.\n"
            "Outcome: Isolated simultaneously with web-prod-05. Full incident response activated.\n"
            "Timestamp: 2026-09-24."
        ),
        "tags": ["port-4444", "true-positive", "c2", "webshell", "production", "incident-memory", "override-memory"],
    },
    {
        "content": (
            "Alert: SSH scanning from external IP 185.23.77.199 to web-prod-03 port 22.\n"
            "Tool: Splunk.\n"
            "Verdict: TRUE POSITIVE — Suspicious, required investigation.\n"
            "Analyst: Priya Nair.\n"
            "Reason: Unknown external source IP (185.23.77.199) NOT in approved scanner list. "
            "89 rapid SSH attempts followed by a SUCCESSFUL authentication at 02:01 UTC. "
            "The critical difference from authorized vulnerability scans: "
            "(1) Source IP is external and unknown, not 10.20.5.88 (Nessus). "
            "(2) A successful login occurred after rapid failed attempts — brute force succeeded. "
            "(3) Production server targeted at unusual hour.\n"
            "Override: AI initially flagged NEEDS_HUMAN based on unknown source. Analyst confirmed "
            "as TRUE POSITIVE and escalated to CRITICAL incident.\n"
            "AI Recommendation: NEEDS_HUMAN. Analyst Decision: ESCALATE.\n"
            "Environment: Production. Asset: web-prod-03. Source IP: 185.23.77.199 (EXTERNAL, UNKNOWN).\n"
            "Outcome: web-prod-03 isolated. SSH brute force from external IP confirmed. Credentials "
            "rotated. Firewall rules updated to restrict SSH access.\n"
            "Timestamp: 2026-09-26."
        ),
        "tags": ["ssh", "true-positive", "brute-force", "external-ip", "production", "incident-memory", "override-memory"],
    },
    {
        "content": (
            "Alert: IAM policy attachment (iam:AttachUserPolicy) by admin-rchen from cn-north-1 at 04:00 UTC.\n"
            "Tool: AWS CloudTrail.\n"
            "Verdict: TRUE POSITIVE — Confirmed Unauthorized Access.\n"
            "Analyst: Marcus Chen.\n"
            "Reason: admin-rchen has never previously made API calls from the China (cn-north-1) region. "
            "IAM policy attachment — an identity privilege escalation action — at 04:00 UTC from an "
            "unexpected geographic region is a critical indicator. admin-rchen confirmed they were "
            "not working at that time. Account was compromised.\n"
            "Environment: Production. AWS Region: cn-north-1 (NEVER SEEN before for this account).\n"
            "Outcome: All admin-rchen sessions invalidated. Account locked. MFA re-enrollment required. "
            "IAM policy attachment reviewed and reverted. Forensic investigation of the attacker's "
            "access path initiated.\n"
            "Timestamp: 2026-09-27."
        ),
        "tags": ["aws", "true-positive", "iam", "credential-compromise", "unusual-region", "incident-memory"],
    },
    {
        "content": (
            "Alert: ci-runner-05 making outbound TCP connection to 10.10.1.20:4444 via Python process.\n"
            "Tool: Suricata IDS.\n"
            "Verdict: ESCALATE — Suspicious, requires investigation.\n"
            "Analyst: Priya Nair.\n"
            "Reason: Although ci-runner-05 is an authorized CI runner, Python processes on runners "
            "should only connect to package registries (PyPI, npm), not arbitrary internal IPs on "
            "port 4444. Port 4444 is associated with C2 callbacks. The destination (10.10.1.20) is "
            "not a known build infrastructure IP. This resembles a supply chain compromise where a "
            "malicious package opens a reverse shell to an internal pivot point.\n"
            "Override: AI recommended NEEDS_HUMAN. Analyst escalated directly.\n"
            "AI Recommendation: NEEDS_HUMAN. Analyst Decision: ESCALATE.\n"
            "Environment: CI/CD — but anomalous behavior. Asset: ci-runner-05. Port: 4444.\n"
            "Outcome: Build pipeline suspended. Malicious package identified in requirements.txt. "
            "Package removed. All runner images rebuilt. Dependencies audited.\n"
            "Timestamp: 2026-09-27."
        ),
        "tags": ["ci-cd", "true-positive", "port-4444", "supply-chain", "incident-memory", "override-memory"],
    },
    {
        "content": (
            "PATTERN LEARNING: Known differences between authorized Nessus scans and attack traffic.\n"
            "Authorized Nessus scanner characteristics: "
            "Source IP is always from the 10.20.5.x subnet (specifically 10.20.5.88 is the primary scanner). "
            "Scans occur on a Monday/Wednesday schedule, typically between 02:00 and 06:00 UTC. "
            "Target is a defined set of production and staging assets. "
            "NO successful authentication occurs — the scanner only tests connectivity. "
            "Nessus TCP fingerprint present.\n"
            "Attack/suspicious SSH characteristics: "
            "Source IP is external (non-RFC1918) or from unexpected internal subnets. "
            "Successful SSH authentication after rapid failed attempts is a CRITICAL indicator. "
            "Unusual timing or unexpected target hosts.\n"
            "RULE: Resemblance to the Nessus scan pattern is NOT sufficient to auto-close. "
            "The source IP, authentication outcome, and timing MUST all match. "
            "Any successful login after scan-like behavior requires immediate human review.\n"
            "Derived from: incidents ALT-016 and ALT-031 (trap alerts that resembled scanner but were attacks).\n"
            "Timestamp: 2026-09-28."
        ),
        "tags": ["pattern-learning", "ssh", "nessus", "scanner-vs-attack", "environment-memory"],
    },
]


def main():
    s = get_settings()
    bank_id = s.hindsight_bank_id
    print(f"Seeding bank: {bank_id}")
    print(f"Total memories to seed: {len(SEED_MEMORIES)}")
    print("(NOTE: 10.20.5.44 Nessus memory is intentionally excluded for demo Stage 1)\n")

    ensure_bank_exists(bank_id=bank_id)

    success_count = 0
    for i, mem in enumerate(SEED_MEMORIES, 1):
        print(f"[{i:2d}/{len(SEED_MEMORIES)}] Retaining: {mem['content'][:80].strip()}...")
        result = retain_memory(
            content=mem["content"],
            bank_id=bank_id,
            tags=mem.get("tags", []),
        )
        if result["success"]:
            success_count += 1
            print(f"         ✅ OK (op={result['operation_id']})")
        else:
            print(f"         ❌ FAILED: {result.get('error', 'unknown error')}")
        time.sleep(0.3)  # small delay to avoid rate limiting

    print(f"\nSeeding complete: {success_count}/{len(SEED_MEMORIES)} succeeded.")
    if success_count == len(SEED_MEMORIES):
        print("✅ All seed memories retained successfully.")
    else:
        print("⚠️  Some memories failed — check logs above.")


if __name__ == "__main__":
    main()

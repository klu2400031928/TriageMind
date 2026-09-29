"use client";

import React, { useState, useEffect } from "react";
import { Alert, TriageResult, AnalystVerdict, FeedbackRequest } from "@/types";
import { triageAlert, submitFeedback } from "@/lib/api";
import {
  X,
  Brain,
  Shield,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Send,
  Zap,
  Sparkles,
  ArrowRight,
  Clock,
  Layers,
  History,
  AlertOctagon,
  Lock,
  GitBranch,
  Terminal,
  Activity,
  Check,
  Eye,
  Info
} from "lucide-react";

interface AlertDetailModalProps {
  alert: Alert | null;
  onClose: () => void;
  onAlertUpdated: (updated: Alert) => void;
}

export function AlertDetailModal({ alert, onClose, onAlertUpdated }: AlertDetailModalProps) {
  const [triage, setTriage] = useState<TriageResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [useMemory, setUseMemory] = useState(true);

  // Split Comparison state: track both with-memory and without-memory results
  const [triageWithMem, setTriageWithMem] = useState<TriageResult | null>(null);
  const [triageWithoutMem, setTriageWithoutMem] = useState<TriageResult | null>(null);
  const [viewSplitMode, setViewSplitMode] = useState(false);

  // Feedback form state
  const [analystVerdict, setAnalystVerdict] = useState<AnalystVerdict>("FALSE_POSITIVE");
  const [analystName, setAnalystName] = useState("Analyst Lead");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [retainedSuccess, setRetainedSuccess] = useState(false);

  useEffect(() => {
    if (alert) {
      setUseMemory(true);
      runTriage(true);
      setRetainedSuccess(false);
      setReason("");
      setViewSplitMode(false);
    }
  }, [alert]);

  if (!alert) return null;

  async function runTriage(memEnabled: boolean) {
    if (!alert) return;
    setLoading(true);
    try {
      const result = await triageAlert(alert, memEnabled);
      setTriage(result);
      if (memEnabled) {
        setTriageWithMem(result);
      } else {
        setTriageWithoutMem(result);
      }

      if (result.final_verdict === "AUTO_CLOSE") {
        setAnalystVerdict("FALSE_POSITIVE");
      } else if (result.final_verdict === "ESCALATE") {
        setAnalystVerdict("TRUE_POSITIVE");
      } else {
        setAnalystVerdict("NEEDS_HUMAN");
      }

      onAlertUpdated({
        ...alert,
        triage: {
          final_verdict: result.final_verdict,
          confidence: result.confidence,
          memory_count: result.memory_matches.length,
          reasoning: result.reasoning,
        },
      });
    } catch (e) {
      console.error("Triage error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleMemory(enabled: boolean) {
    setUseMemory(enabled);
    if (enabled && triageWithMem) {
      setTriage(triageWithMem);
      return;
    }
    if (!enabled && triageWithoutMem) {
      setTriage(triageWithoutMem);
      return;
    }
    runTriage(enabled);
  }

  async function handleCompareSideBySide() {
    setViewSplitMode(true);
    if (!triageWithMem) {
      const resWith = await triageAlert(alert!, true);
      setTriageWithMem(resWith);
    }
    if (!triageWithoutMem) {
      const resWithout = await triageAlert(alert!, false);
      setTriageWithoutMem(resWithout);
    }
  }

  async function handleSubmitFeedback(e: React.FormEvent) {
    e.preventDefault();
    if (!alert || !reason.trim()) return;

    setSubmitting(true);
    try {
      const req: FeedbackRequest = {
        alert_id: alert.id,
        ai_verdict: triage?.final_verdict || "NEEDS_HUMAN",
        analyst_verdict: analystVerdict,
        reason: reason.trim(),
        analyst_name: analystName,
        notes: notes.trim(),
      };

      const resp = await submitFeedback(req, alert as any);
      if (resp.success) {
        setRetainedSuccess(true);
        // Refresh triage with new memory
        setTimeout(() => {
          runTriage(true);
        }, 1500);
      }
    } catch (err) {
      console.error("Failed to submit feedback:", err);
    } finally {
      setSubmitting(false);
    }
  }

  const isOverride =
    triage &&
    analystVerdict !== triage.final_verdict &&
    !(
      (triage.final_verdict === "AUTO_CLOSE" && analystVerdict === "FALSE_POSITIVE") ||
      (triage.final_verdict === "ESCALATE" && analystVerdict === "TRUE_POSITIVE")
    );

  // Check if this alert triggers the Lookalike Trap (Rule 5)
  const isTrapAlert =
    (triage &&
      triage.guardrails.fired.some((r) =>
        r.toLowerCase().includes("rule 5") ||
        r.toLowerCase().includes("mismatch") ||
        r.toLowerCase().includes("scanner ip mismatch")
      )) ||
    (alert.description.toLowerCase().includes("lookalike") ||
      (alert.description.toLowerCase().includes("185.23.42.77") &&
        alert.description.toLowerCase().includes("successful ssh")));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#090d16] border border-[#1c2638] rounded-2xl w-full max-w-6xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* TOP INVESTIGATION CONSOLE HEADER */}
        <div className="px-6 py-4 border-b border-[#1c2638] bg-[#0c101a] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 flex items-center justify-center shadow-cyan-glow">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono font-bold text-white text-base tracking-wide">
                  {alert.id}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${
                    alert.severity === "CRITICAL"
                      ? "text-red-400 bg-red-950/80 border-red-800"
                      : alert.severity === "HIGH"
                      ? "text-amber-400 bg-amber-950/80 border-amber-800"
                      : alert.severity === "MEDIUM"
                      ? "text-yellow-400 bg-yellow-950/80 border-yellow-800"
                      : "text-blue-400 bg-blue-950/80 border-blue-800"
                  }`}
                >
                  {alert.severity} THREAT
                </span>
                <span className="text-xs text-gray-400 font-mono hidden sm:inline">
                  {alert.timestamp.replace("T", " ").replace("Z", " UTC")}
                </span>
              </div>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                {alert.event_type.replace(/_/g, " ")} • {alert.tool || "SIEM Ingest"}
              </p>
            </div>
          </div>

          {/* Top Threat Telemetry Chips */}
          <div className="hidden lg:flex items-center space-x-4 bg-[#06080e] px-4 py-1.5 rounded-xl border border-[#1c2638] text-xs font-mono">
            <div>
              <span className="text-gray-500 text-[10px] block">SOURCE IP</span>
              <span className="text-cyan-300 font-semibold">{alert.source_ip || "Internal"}</span>
            </div>
            <div className="text-gray-600">→</div>
            <div>
              <span className="text-gray-500 text-[10px] block">TARGET ASSET</span>
              <span className="text-white font-semibold">
                {alert.asset || alert.hostname || "cloud"}
                {alert.destination_port ? `:${alert.destination_port}` : ""}
              </span>
            </div>
          </div>

          {/* Mode Switchers & Close Button */}
          <div className="flex items-center space-x-2.5">
            {/* Memory ON / OFF Switcher */}
            <div className="flex items-center bg-[#06080e] p-1 rounded-lg border border-[#1c2638]">
              <button
                type="button"
                onClick={() => {
                  setViewSplitMode(false);
                  handleToggleMemory(false);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono transition ${
                  !useMemory && !viewSplitMode
                    ? "bg-[#1c2638] text-cyan-300 font-bold shadow-sm"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                <Zap className="w-3 h-3 text-gray-400" />
                <span>Cold Start (No Memory)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setViewSplitMode(false);
                  handleToggleMemory(true);
                }}
                className={`flex items-center space-x-1.5 px-3 py-1 rounded text-xs font-mono transition ${
                  useMemory && !viewSplitMode
                    ? "bg-purple-600 text-white font-bold shadow-purple-glow"
                    : "text-gray-400 hover:text-purple-300"
                }`}
              >
                <Brain className="w-3 h-3 text-purple-200" />
                <span>With Hindsight Memory</span>
              </button>
            </div>

            {/* Split Comparison Button */}
            <button
              onClick={handleCompareSideBySide}
              title="Compare side-by-side: With Hindsight Memory vs Cold Start"
              className={`p-1.5 rounded-lg border text-xs font-mono transition ${
                viewSplitMode
                  ? "bg-cyan-950/80 border-cyan-500 text-cyan-300"
                  : "bg-[#0c101a] border-[#1c2638] text-gray-400 hover:text-white"
              }`}
            >
              <GitBranch className="w-4 h-4" />
            </button>

            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-[#1c2638] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* 11. TRAP ALERT BANNER (If Guardrail 5 or lookalike attack) */}
          {isTrapAlert && (
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-red-950/80 via-amber-950/60 to-[#0c101a] border-2 border-red-500/80 p-5 shadow-red-glow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <div className="w-10 h-10 rounded-lg bg-red-600/30 border border-red-500 flex items-center justify-center shrink-0 mt-0.5">
                    <AlertOctagon className="w-6 h-6 text-red-400 animate-pulse" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-extrabold uppercase px-2 py-0.5 rounded bg-red-600 text-white">
                        CRITICAL LOOKALIKE ATTACK DETECTED
                      </span>
                      <span className="text-xs font-mono text-red-300">
                        GUARDRAIL 5: EVIDENCE MISMATCH OVERRIDE
                      </span>
                    </div>

                    <p className="text-sm font-bold text-white mt-1">
                      Attacker mimicked authorized scanner signature, but external IP{" "}
                      <code className="text-red-300 bg-red-950/60 px-1 py-0.5 rounded font-mono">
                        {alert.source_ip}
                      </code>{" "}
                      does NOT match authorized internal scanner{" "}
                      <code className="text-emerald-300 bg-emerald-950/60 px-1 py-0.5 rounded font-mono">
                        10.20.5.44
                      </code>
                      .
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2 text-xs font-mono">
                      <span className="px-2 py-1 rounded bg-black/60 border border-red-800/60 text-red-200">
                        ⚠ 120 rapid connection attempts + SUCCESSFUL authentication
                      </span>
                      <span className="px-2 py-1 rounded bg-black/60 border border-purple-800/60 text-purple-300">
                        🧠 Memory recalled scanner pattern BUT guardrail forced review
                      </span>
                      <span className="px-2 py-1 rounded bg-amber-950/80 border border-amber-500/60 text-amber-200 font-bold">
                        AI OVERRIDDEN → ESCALATE / NEEDS HUMAN
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VISUAL EXECUTION PIPELINE NODES */}
          <div className="bg-[#0c101a] border border-[#1c2638] rounded-xl p-4">
            <div className="text-[11px] uppercase font-mono text-gray-400 mb-3 flex items-center justify-between">
              <span className="flex items-center space-x-1.5">
                <Activity className="w-3.5 h-3.5 text-cyan-400" />
                <span>Autonomous Triage Execution Pipeline</span>
              </span>
              <span className="text-gray-500 text-[10px]">
                {loading ? "PROCESSING..." : "STEP 6/6 COMPLETE"}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs font-mono">
              {[
                { label: "1. INGEST", desc: "Parse Alert", icon: Shield, status: "complete" },
                { label: "2. ANALYZE", desc: "LLM Heuristics", icon: Terminal, status: "complete" },
                {
                  label: "3. MEMORY",
                  desc: useMemory ? "Recall Hindsight" : "Bypass Memory",
                  icon: Brain,
                  status: loading ? "active" : "complete",
                },
                {
                  label: "4. EVIDENCE",
                  desc: "Compare History",
                  icon: Layers,
                  status: loading ? "pending" : "complete",
                },
                {
                  label: "5. GUARDRAILS",
                  desc: "Deterministic Rules",
                  icon: Lock,
                  status: loading ? "pending" : "complete",
                },
                {
                  label: "6. VERDICT",
                  desc: triage ? triage.final_verdict : "Pending",
                  icon: CheckCircle2,
                  status: triage ? "complete" : "pending",
                },
              ].map((step, idx) => {
                const Icon = step.icon;
                return (
                  <div
                    key={idx}
                    className={`p-2.5 rounded-lg border transition-all ${
                      loading && idx >= 2
                        ? "bg-[#06080e] border-[#1c2638] text-gray-500"
                        : "bg-[#111827] border-cyan-500/30 text-gray-200 shadow-sm"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold text-cyan-400">{step.label}</span>
                      <Icon className="w-3 h-3 text-gray-400" />
                    </div>
                    <div className="text-[11px] text-gray-300 mt-1 truncate">{step.desc}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ALERT PAYLOAD METADATA */}
          <div className="bg-[#0c101a] border border-[#1c2638] rounded-xl p-4">
            <div className="text-[11px] uppercase font-mono text-gray-400 mb-2 flex items-center space-x-1.5">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Event Details & Evidence Payload</span>
            </div>
            <p className="text-xs text-gray-200 leading-relaxed font-sans bg-[#06080e] p-3 rounded-lg border border-[#1c2638]">
              {alert.description}
            </p>
          </div>

          {/* LOADING SKELETON STATE */}
          {loading ? (
            <div className="cyber-card rounded-xl p-8 border border-purple-500/30 text-center space-y-4">
              <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto" />
              <div className="space-y-1">
                <p className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                  ANALYZING ALERT & EXECUTING REASONING PIPELINE
                </p>
                <div className="text-xs font-mono text-gray-400 space-y-1">
                  <p>● Querying Hindsight semantic memory bank (bank: triagemind-demo)...</p>
                  <p>● Comparing against historical analyst decisions & false positive precedent...</p>
                  <p className="text-cyan-300">○ Evaluating deterministic security guardrails (Rules 1-6)...</p>
                </div>
              </div>
            </div>
          ) : viewSplitMode ? (
            /* 9. MEMORY ON/OFF SPLIT COMPARISON */
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-gradient-to-r from-purple-950/60 via-blue-950/60 to-[#0c101a] border border-purple-500/40 text-xs font-mono text-purple-200 flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <GitBranch className="w-4 h-4 text-purple-400" />
                  <strong className="text-white">SIDE-BY-SIDE MEMORY IMPACT SHOWCASE:</strong>
                  <span>Witness how institutional memory changes automated triage decisions.</span>
                </span>
                <span className="text-[11px] text-gray-400">Live Backend Dual-Triage</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left: WITH MEMORY */}
                <div className="cyber-card rounded-xl p-5 border border-purple-500/50 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1c2638] pb-2">
                    <span className="text-xs font-bold font-mono text-purple-300 flex items-center space-x-1.5">
                      <Brain className="w-4 h-4 text-purple-400" />
                      <span>WITH HINDSIGHT MEMORY</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-200 border border-purple-800">
                      MEMORY AUGMENTED
                    </span>
                  </div>

                  {triageWithMem && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">AI Verdict:</span>
                        <span
                          className={`font-mono font-bold text-sm px-2.5 py-0.5 rounded ${
                            triageWithMem.final_verdict === "AUTO_CLOSE"
                              ? "text-emerald-400 bg-emerald-950/80 border border-emerald-500/40"
                              : "text-amber-400 bg-amber-950/80 border border-amber-500/40"
                          }`}
                        >
                          {triageWithMem.final_verdict}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        Confidence:{" "}
                        <strong className="text-white">
                          {(triageWithMem.confidence * 100).toFixed(0)}%
                        </strong>{" "}
                        • Recalled:{" "}
                        <strong className="text-purple-300">
                          {triageWithMem.memory_matches.length} memories
                        </strong>
                      </div>
                      <p className="text-xs text-gray-300 italic bg-black/40 p-2.5 rounded border border-gray-800 font-sans">
                        "{triageWithMem.reasoning}"
                      </p>
                    </div>
                  )}
                </div>

                {/* Right: WITHOUT MEMORY */}
                <div className="cyber-card rounded-xl p-5 border border-gray-700 space-y-3">
                  <div className="flex items-center justify-between border-b border-[#1c2638] pb-2">
                    <span className="text-xs font-bold font-mono text-gray-300 flex items-center space-x-1.5">
                      <Zap className="w-4 h-4 text-gray-400" />
                      <span>WITHOUT MEMORY (COLD START)</span>
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
                      BLIND AI
                    </span>
                  </div>

                  {triageWithoutMem && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 font-mono">AI Verdict:</span>
                        <span className="font-mono font-bold text-sm px-2.5 py-0.5 rounded text-amber-400 bg-amber-950/80 border border-amber-500/40">
                          {triageWithoutMem.final_verdict}
                        </span>
                      </div>
                      <div className="text-xs text-gray-400 font-mono">
                        Confidence:{" "}
                        <strong className="text-white">
                          {(triageWithoutMem.confidence * 100).toFixed(0)}%
                        </strong>{" "}
                        • Recalled: <strong className="text-gray-400">0 memories</strong>
                      </div>
                      <p className="text-xs text-gray-300 italic bg-black/40 p-2.5 rounded border border-gray-800 font-sans">
                        "{triageWithoutMem.reasoning}"
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="text-center">
                <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-500/40">
                  Decision difference demonstrates why institutional memory prevents alert fatigue.
                </span>
              </div>
            </div>
          ) : triage ? (
            /* STANDARD DETAILED VIEW (Sections 7, 8, & Form) */
            <div className="space-y-6">
              {/* 7. AI VERDICT CARD */}
              <div
                className={`cyber-card rounded-2xl p-6 border ${
                  triage.final_verdict === "AUTO_CLOSE"
                    ? "border-emerald-500/60 bg-gradient-to-r from-emerald-950/40 via-[#0c101a] to-[#06080e] shadow-emerald-glow"
                    : triage.final_verdict === "ESCALATE"
                    ? "border-red-500/60 bg-gradient-to-r from-red-950/40 via-[#0c101a] to-[#06080e] shadow-red-glow"
                    : "border-amber-500/60 bg-gradient-to-r from-amber-950/40 via-[#0c101a] to-[#06080e] shadow-amber-glow"
                }`}
              >
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
                  <div>
                    <span className="text-xs font-mono uppercase tracking-widest text-gray-400">
                      Triage Recommendation
                    </span>
                    <div className="flex items-center space-x-3 mt-1">
                      <h2
                        className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${
                          triage.final_verdict === "AUTO_CLOSE"
                            ? "text-emerald-400"
                            : triage.final_verdict === "ESCALATE"
                            ? "text-red-400"
                            : "text-amber-400"
                        }`}
                      >
                        {triage.final_verdict === "AUTO_CLOSE" && "✓ AUTO CLOSE"}
                        {triage.final_verdict === "NEEDS_HUMAN" && "⚠ NEEDS HUMAN"}
                        {triage.final_verdict === "ESCALATE" && "🚨 ESCALATE"}
                      </h2>
                      <span className="text-xs font-mono px-2.5 py-1 rounded bg-black/60 text-white border border-gray-700">
                        {(triage.confidence * 100).toFixed(0)}% CONFIDENCE
                      </span>
                    </div>
                  </div>

                  {/* Guardrail or Memory Status Pill */}
                  <div className="flex flex-wrap gap-2 text-xs font-mono">
                    {triage.guardrails.overridden ? (
                      <span className="px-3 py-1 rounded-full bg-red-950/90 text-red-300 border border-red-500/60 flex items-center space-x-1.5 font-bold">
                        <Lock className="w-3.5 h-3.5 text-red-400" />
                        <span>GUARDRAIL OVERRIDE ENFORCED</span>
                      </span>
                    ) : triage.memory_matches.length > 0 ? (
                      <span className="px-3 py-1 rounded-full bg-purple-950/90 text-purple-300 border border-purple-500/60 flex items-center space-x-1.5 font-bold">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>INSTITUTIONAL MEMORY APPLIED</span>
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-blue-950/80 text-blue-300 border border-blue-600/40">
                        COLD START TRIAGE
                      </span>
                    )}
                  </div>
                </div>

                {/* Reasoning Narrative */}
                <div className="mt-4">
                  <span className="text-xs font-bold font-mono uppercase text-gray-300">
                    Analyst Synthesis & Reasoning:
                  </span>
                  <p className="mt-1 text-xs text-gray-200 leading-relaxed font-sans bg-[#06080e]/80 p-4 rounded-xl border border-gray-800/80">
                    {triage.reasoning}
                  </p>
                </div>

                {/* Evidence & Recommended Actions */}
                <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                  <div className="bg-[#06080e]/60 p-3.5 rounded-lg border border-gray-800">
                    <span className="font-mono text-[11px] text-cyan-400 uppercase font-semibold">
                      Key Corroborating Evidence:
                    </span>
                    <ul className="mt-2 space-y-1 text-gray-300">
                      {triage.key_evidence.map((ev, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{ev}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-[#06080e]/60 p-3.5 rounded-lg border border-gray-800">
                    <span className="font-mono text-[11px] text-emerald-400 uppercase font-semibold">
                      Recommended SOP Actions:
                    </span>
                    <ul className="mt-2 space-y-1 text-gray-300">
                      {triage.recommended_actions.map((act, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{act}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* 8. INSTITUTIONAL MEMORY VISUALIZER (Graph Nodes) */}
              <div className="cyber-card rounded-2xl p-6 border border-[#1c2638] space-y-4">
                <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-purple-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Institutional Memory Visualizer (Hindsight)
                      </h4>
                      <p className="text-[11px] text-gray-400">
                        Traces how historical analyst decisions shaped this verdict.
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-purple-300 bg-purple-950/60 px-2.5 py-1 rounded border border-purple-800/60">
                    Bank: triagemind-demo
                  </span>
                </div>

                {triage.memory_matches.length === 0 ? (
                  <div className="text-center py-8 text-gray-400 text-xs font-mono bg-[#06080e] rounded-xl border border-dashed border-[#1c2638] p-6 space-y-2">
                    <div className="w-8 h-8 rounded-full bg-blue-900/30 border border-blue-500/40 flex items-center justify-center mx-auto text-blue-400">
                      <Zap className="w-4 h-4" />
                    </div>
                    <div className="text-white font-bold">COLD START — NO MEMORY MATCH FOUND</div>
                    <p className="text-gray-400 max-w-md mx-auto">
                      The agent has never encountered this specific IP or scanning pattern before.
                      Provide your decision below to encode this event into Hindsight for all future shifts.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Visual Connected Graph */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                      {/* Node 1: Current Alert */}
                      <div className="p-3.5 rounded-xl bg-[#06080e] border border-cyan-500/40 space-y-1">
                        <span className="text-[10px] text-cyan-400 font-bold block uppercase">
                          NODE 1: CURRENT EVENT
                        </span>
                        <div className="font-bold text-white">{alert.id}</div>
                        <div className="text-gray-400 text-[11px] truncate">
                          {alert.source_ip} → {alert.event_type}
                        </div>
                      </div>

                      {/* Node 2: Recalled Precedent */}
                      <div className="p-3.5 rounded-xl bg-purple-950/40 border border-purple-500/50 space-y-1 shadow-purple-glow">
                        <span className="text-[10px] text-purple-300 font-bold block uppercase">
                          NODE 2: RECALLED MEMORY
                        </span>
                        <div className="font-bold text-purple-200">
                          {triage.memory_matches[0]?.id
                            ? `MEM-${triage.memory_matches[0].id.slice(0, 8)}`
                            : "MATCH PRECEDENT"}
                        </div>
                        <div className="text-emerald-400 font-bold text-[11px]">
                          {(triage.memory_matches[0]?.relevance * 100).toFixed(0)}% RELEVANCE MATCH
                        </div>
                      </div>

                      {/* Node 3: Historical Decision */}
                      <div className="p-3.5 rounded-xl bg-[#06080e] border border-emerald-500/40 space-y-1">
                        <span className="text-[10px] text-emerald-400 font-bold block uppercase">
                          NODE 3: HISTORICAL DECISION
                        </span>
                        <div className="font-bold text-emerald-300">
                          {triage.memory_matches[0]?.verdict || "FALSE_POSITIVE"}
                        </div>
                        <div className="text-gray-400 text-[11px] truncate">
                          By: {triage.memory_matches[0]?.analyst || "Senior Analyst"}
                        </div>
                      </div>
                    </div>

                    {/* Detailed Memory Match Cards */}
                    <div className="space-y-3">
                      {triage.memory_matches.map((m, idx) => {
                        const relPercent = Math.round(m.relevance * 100);
                        return (
                          <div
                            key={m.id || idx}
                            className="bg-[#06080e] border border-[#1c2638] hover:border-purple-500/50 rounded-xl p-4 transition-all space-y-2.5"
                          >
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-purple-300 font-bold">
                                  MEMORY #{idx + 1}: {m.id ? m.id.slice(0, 12) : "REC-01"}
                                </span>
                                {m.verdict && (
                                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-purple-950 text-purple-200 border border-purple-800">
                                    VERDICT: {m.verdict}
                                  </span>
                                )}
                              </div>
                              <span className="font-mono text-emerald-400 font-bold">
                                {relPercent}% RELEVANCE
                              </span>
                            </div>

                            {/* Relevance Visual Meter */}
                            <div className="w-full bg-gray-900 h-1.5 rounded-full overflow-hidden border border-gray-800">
                              <div
                                className="bg-gradient-to-r from-purple-500 to-emerald-400 h-full rounded-full"
                                style={{ width: `${relPercent}%` }}
                              />
                            </div>

                            <p className="text-xs text-gray-200 leading-relaxed font-sans">
                              {m.text}
                            </p>

                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-500">
                              <div className="flex flex-wrap gap-1">
                                {m.tags.map((t, ti) => (
                                  <span
                                    key={ti}
                                    className="px-1.5 py-0.5 rounded bg-black/60 text-gray-400 text-[10px]"
                                  >
                                    #{t}
                                  </span>
                                ))}
                              </div>
                              {m.analyst && (
                                <span className="text-gray-400">Analyst: {m.analyst}</span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* ANALYST DECISION & INSTITUTIONAL RETENTION FORM */}
              <div className="cyber-card rounded-2xl p-6 border border-blue-900/40 shadow-xl space-y-4">
                <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
                  <div className="flex items-center space-x-2">
                    <UserCheck className="w-5 h-5 text-cyan-400" />
                    <div>
                      <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                        Analyst Decision & Institutional Memory Feedback
                      </h4>
                      <p className="text-[11px] text-gray-400 font-sans">
                        Any decision, reason, or override entered here is encoded directly into Hindsight semantic memory.
                      </p>
                    </div>
                  </div>
                  {retainedSuccess && (
                    <span className="text-xs font-mono font-bold text-emerald-400 flex items-center space-x-1.5 bg-emerald-950/80 px-3 py-1 rounded-full border border-emerald-500/60 animate-pulse">
                      <Check className="w-3.5 h-3.5" />
                      <span>Retained into Institutional Memory!</span>
                    </span>
                  )}
                </div>

                <form onSubmit={handleSubmitFeedback} className="space-y-4">
                  {/* Override Warning Callout */}
                  {isOverride && (
                    <div className="bg-purple-950/80 border border-purple-600 rounded-xl p-3.5 flex items-start space-x-3 shadow-purple-glow">
                      <Brain className="w-4 h-4 text-purple-300 shrink-0 mt-0.5" />
                      <div className="text-xs">
                        <span className="font-mono font-bold text-purple-200">
                          🧠 Learned from Override:
                        </span>
                        <p className="text-purple-300/90 mt-0.5 font-sans">
                          You are overriding the AI's recommendation ({triage.final_verdict}). This correction will be permanently retained in Hindsight to adapt the agent's behavior for similar future alerts!
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
                        Analyst Final Verdict:
                      </label>
                      <select
                        value={analystVerdict}
                        onChange={(e) => setAnalystVerdict(e.target.value as AnalystVerdict)}
                        className="w-full bg-[#06080e] border border-[#1c2638] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      >
                        <option value="FALSE_POSITIVE">
                          FALSE POSITIVE (Authorized / Benign Activity)
                        </option>
                        <option value="TRUE_POSITIVE">
                          TRUE POSITIVE (Confirmed Malicious Threat)
                        </option>
                        <option value="NEEDS_HUMAN">
                          NEEDS HUMAN (Requires Further Investigation)
                        </option>
                        <option value="AUTO_CLOSE">
                          AUTO CLOSE (Approved for Automated Resolution)
                        </option>
                        <option value="ESCALATE">
                          ESCALATE (Escalate to Tier 2 / Incident Response)
                        </option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
                        Analyst Name / Callout:
                      </label>
                      <input
                        type="text"
                        value={analystName}
                        onChange={(e) => setAnalystName(e.target.value)}
                        placeholder="e.g. Priya Nair (Lead Analyst)"
                        required
                        className="w-full bg-[#06080e] border border-[#1c2638] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-cyan-500"
                      >
                      </input>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
                      Reason for Decision (Encoded directly into Hindsight semantic memory):
                    </label>
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="e.g. 10.20.5.44 is our authorized Nessus scanner. It runs scheduled scans on production assets every Monday at 02:00 UTC."
                      required
                      className="w-full bg-[#06080e] border border-[#1c2638] rounded-lg px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono font-semibold text-gray-300 mb-1">
                      Additional SOC Audit Notes (Optional):
                    </label>
                    <input
                      type="text"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="e.g. Ticket #SEC-9842 logged; confirmed with Network Engineering."
                      className="w-full bg-[#06080e] border border-[#1c2638] rounded-lg px-3 py-2 text-xs text-white font-mono placeholder-gray-500 focus:outline-none focus:border-cyan-500"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 rounded-lg text-xs font-mono text-gray-400 hover:text-white bg-[#06080e] border border-[#1c2638] hover:bg-[#111827] transition"
                    >
                      Dismiss
                    </button>

                    <button
                      type="submit"
                      disabled={submitting || !reason.trim()}
                      className="px-5 py-2.5 rounded-lg text-xs font-mono font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 shadow-cyan-glow disabled:opacity-50 transition flex items-center space-x-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submitting ? "Retaining in Memory..." : "Submit & Retain Memory"}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

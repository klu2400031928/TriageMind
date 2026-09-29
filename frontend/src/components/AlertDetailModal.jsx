"use client";

import React, { useState, useEffect } from "react";
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

export function AlertDetailModal({ alert, onClose, onAlertUpdated }) {
  const [triage, setTriage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [useMemory, setUseMemory] = useState(true);

  // Split Comparison state: track both with-memory and without-memory results
  const [triageWithMem, setTriageWithMem] = useState(null);
  const [triageWithoutMem, setTriageWithoutMem] = useState(null);
  const [viewSplitMode, setViewSplitMode] = useState(false);

  // Feedback form state
  const [analystVerdict, setAnalystVerdict] = useState("FALSE_POSITIVE");
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

  async function runTriage(memEnabled) {
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
          memory_count: result.memory_matches ? result.memory_matches.length : 0,
          reasoning: result.reasoning,
        },
      });
    } catch (e) {
      console.error("Triage error:", e);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleSplit() {
    const nextMode = !viewSplitMode;
    setViewSplitMode(nextMode);
    if (nextMode && !triageWithoutMem) {
      setLoading(true);
      try {
        const withoutResult = await triageAlert(alert, false);
        setTriageWithoutMem(withoutResult);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleSubmitFeedback(e) {
    e.preventDefault();
    if (!reason.trim()) {
      alert("Please provide the rationale/reason for teaching institutional memory.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await submitFeedback(
        {
          alert_id: alert.id,
          analyst: analystName,
          analyst_verdict: analystVerdict,
          reason: reason,
          notes: notes,
        },
        alert
      );
      setRetainedSuccess(true);
      // Re-run triage to show instant adaptation
      setTimeout(() => {
        runTriage(true);
      }, 1500);
    } catch (err) {
      console.error("Feedback error:", err);
      alert("Failed to submit feedback to Hindsight.");
    } finally {
      setSubmitting(false);
    }
  }

  const isGuarded = triage?.guardrails_fired && triage.guardrails_fired.length > 0;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl rounded-2xl bg-[#080c14] border border-[#1c2638] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="p-4 sm:p-5 border-b border-[#1c2638] bg-[#0c101a] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-base font-extrabold text-white font-mono uppercase tracking-wide">
                  {alert.id}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                  {alert.event_type}
                </span>
                <span className="text-xs text-gray-500 font-mono">
                  {new Date(alert.timestamp).toUTCString()}
                </span>
              </div>
              <p className="text-xs text-gray-400 font-sans mt-0.5 max-w-xl truncate">
                {alert.description}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Split Comparison Mode Button */}
            <button
              onClick={handleToggleSplit}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition flex items-center space-x-1.5 border ${
                viewSplitMode
                  ? "bg-purple-950/80 text-purple-300 border-purple-500/60 shadow-purple-glow"
                  : "bg-[#111827] text-gray-400 border-[#1c2638] hover:text-white"
              }`}
              title="Compare With Memory vs Without Memory side-by-side"
            >
              <GitBranch className="w-3.5 h-3.5" />
              <span>{viewSplitMode ? "Split Mode: ON" : "Compare Cold Start"}</span>
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#162033] transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* MODAL BODY */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          {/* 1. ALERT OBSERVABLES CARD */}
          <div className="cyber-card rounded-xl p-4 border border-[#1c2638]">
            <div className="text-xs font-mono text-gray-400 uppercase tracking-wider mb-3 flex items-center space-x-2">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Telemetry Observables & Security Context</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                <span className="text-gray-500 text-[10px] block">SOURCE IP / PORT</span>
                <span className="text-white font-bold">{alert.source_ip || "N/A"}</span>
                {alert.source_port && <span className="text-gray-400">:{alert.source_port}</span>}
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                <span className="text-gray-500 text-[10px] block">TARGET ASSET</span>
                <span className="text-cyan-300 font-bold">{alert.asset || alert.hostname || "AWS Cloud"}</span>
                {alert.destination_port && (
                  <span className="text-gray-400 text-[10px] block">Port: {alert.destination_port}</span>
                )}
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                <span className="text-gray-500 text-[10px] block">ENVIRONMENT</span>
                <span className="text-amber-400 font-bold uppercase">{alert.environment || "production"}</span>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                <span className="text-gray-500 text-[10px] block">REPORTING TOOL</span>
                <span className="text-purple-300 font-bold">{alert.tool || "SIEM/Agent"}</span>
              </div>
            </div>
          </div>

          {/* 2. SPLIT COMPARISON OR SINGLE TRIAGE RESULT */}
          {viewSplitMode ? (
            /* SIDE-BY-SIDE SPLIT VIEW */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Left Column: WITH HINDSIGHT MEMORY */}
              <div className="p-4 rounded-xl bg-[#0c101a] border border-cyan-500/40 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2638] pb-2">
                  <div className="flex items-center space-x-2">
                    <Brain className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs font-mono font-bold text-cyan-300 uppercase">
                      With Hindsight Memory
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800">
                    MEMORY ENABLED
                  </span>
                </div>

                {triageWithMem ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">Verdict:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                          triageWithMem.final_verdict === "AUTO_CLOSE"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                            : triageWithMem.final_verdict === "ESCALATE"
                            ? "bg-red-950 text-red-300 border-red-500"
                            : "bg-amber-950 text-amber-300 border-amber-500"
                        }`}
                      >
                        {triageWithMem.final_verdict}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-gray-400">
                      Confidence: <strong className="text-white">{Math.round(triageWithMem.confidence * 100)}%</strong>
                    </div>

                    <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#06080e] p-3 rounded-lg border border-[#1c2638]">
                      {triageWithMem.reasoning}
                    </p>

                    <div className="text-xs font-mono text-purple-300">
                      {triageWithMem.memory_matches ? triageWithMem.memory_matches.length : 0} institutional memories recalled
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-gray-500">Evaluating...</div>
                )}
              </div>

              {/* Right Column: COLD START (NO MEMORY) */}
              <div className="p-4 rounded-xl bg-[#0c101a] border border-amber-500/30 space-y-3">
                <div className="flex items-center justify-between border-b border-[#1c2638] pb-2">
                  <div className="flex items-center space-x-2">
                    <History className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-mono font-bold text-amber-300 uppercase">
                      Cold Start (No Memory)
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-950 text-amber-400 border border-amber-800">
                    MEMORY DISABLED
                  </span>
                </div>

                {triageWithoutMem ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400">Verdict:</span>
                      <span
                        className={`text-xs font-mono font-bold px-2.5 py-0.5 rounded border ${
                          triageWithoutMem.final_verdict === "AUTO_CLOSE"
                            ? "bg-emerald-950 text-emerald-300 border-emerald-500"
                            : triageWithoutMem.final_verdict === "ESCALATE"
                            ? "bg-red-950 text-red-300 border-red-500"
                            : "bg-amber-950 text-amber-300 border-amber-500"
                        }`}
                      >
                        {triageWithoutMem.final_verdict}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-gray-400">
                      Confidence: <strong className="text-white">{Math.round(triageWithoutMem.confidence * 100)}%</strong>
                    </div>

                    <p className="text-xs text-gray-300 font-sans leading-relaxed bg-[#06080e] p-3 rounded-lg border border-[#1c2638]">
                      {triageWithoutMem.reasoning}
                    </p>

                    <div className="text-[11px] font-mono text-gray-500">
                      Zero historical precedents recalled. Agent falls back to defensive human review.
                    </div>
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-gray-500">Loading cold-start comparison...</div>
                )}
              </div>
            </div>
          ) : (
            /* STANDARD SINGLE TRIAGE VIEW */
            <div className="cyber-card rounded-xl p-5 border border-[#1c2638] space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-[#1c2638] pb-3">
                <div className="flex items-center space-x-2">
                  <Brain className="w-5 h-5 text-purple-400" />
                  <span className="text-sm font-extrabold text-white font-mono uppercase tracking-wide">
                    Autonomous AI Triage Assessment
                  </span>
                </div>

                {/* Memory On/Off Toggle */}
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-gray-400">Hindsight Memory:</span>
                  <button
                    onClick={() => {
                      const next = !useMemory;
                      setUseMemory(next);
                      runTriage(next);
                    }}
                    className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition border ${
                      useMemory
                        ? "bg-purple-950 text-purple-300 border-purple-500 shadow-purple-glow"
                        : "bg-gray-800 text-gray-400 border-gray-700"
                    }`}
                  >
                    {useMemory ? "ON (Adaptive)" : "OFF (Cold Start)"}
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="py-12 flex flex-col items-center justify-center space-y-3">
                  <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs font-mono text-cyan-300">
                    Recalling Hindsight memories & evaluating deterministic guardrails...
                  </span>
                </div>
              ) : triage ? (
                <div className="space-y-4">
                  {/* Verdict Header Banner */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                      <span className="text-gray-500 text-[10px] font-mono block">FINAL VERDICT</span>
                      <div className="mt-1">
                        {triage.final_verdict === "AUTO_CLOSE" && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-500 shadow-emerald-glow">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                            <span>AUTO_CLOSE (Benign Approved)</span>
                          </span>
                        )}
                        {triage.final_verdict === "ESCALATE" && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-red-950 text-red-300 border border-red-500 shadow-red-glow">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            <span>ESCALATE (Active Threat)</span>
                          </span>
                        )}
                        {triage.final_verdict === "NEEDS_HUMAN" && (
                          <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-500 shadow-amber-glow">
                            <UserCheck className="w-3.5 h-3.5 text-amber-400" />
                            <span>NEEDS_HUMAN (Analyst Review)</span>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                      <span className="text-gray-500 text-[10px] font-mono block">CONFIDENCE SCORE</span>
                      <div className="mt-1 flex items-baseline space-x-2">
                        <span className="text-xl font-black font-mono text-white">
                          {Math.round(triage.confidence * 100)}%
                        </span>
                        <span className="text-xs font-mono text-cyan-400">
                          {triage.confidence >= 0.85 ? "✓ Meets 0.85 Guardrail" : "⚠ Below Guardrail"}
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#0c101a] border border-[#1c2638]">
                      <span className="text-gray-500 text-[10px] font-mono block">GUARDRAIL STATUS</span>
                      <div className="mt-1">
                        {isGuarded ? (
                          <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-amber-400">
                            <AlertOctagon className="w-3.5 h-3.5" />
                            <span>{triage.guardrails_fired.length} Rule(s) Enforced</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 text-xs font-mono font-bold text-emerald-400">
                            <Check className="w-3.5 h-3.5" />
                            <span>All Safety Invariants Clear</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Guardrails Fired Box (If any) */}
                  {isGuarded && (
                    <div className="p-3 rounded-lg bg-amber-950/40 border border-amber-500/50 space-y-1.5">
                      <div className="flex items-center space-x-2 text-xs font-mono font-bold text-amber-300">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>DETERMINISTIC SAFETY OVERRIDES TRIGGERED:</span>
                      </div>
                      <ul className="text-xs font-mono text-amber-200 list-disc list-inside space-y-1">
                        {triage.guardrails_fired.map((g, idx) => (
                          <li key={idx}>{g}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* LLM Reasoning */}
                  <div className="space-y-1.5">
                    <span className="text-xs font-mono text-gray-400 uppercase tracking-wider block">
                      Agent Rationale & Investigation Analysis
                    </span>
                    <div className="p-3.5 rounded-lg bg-[#0c101a] border border-[#1c2638] text-xs text-gray-200 font-sans leading-relaxed">
                      {triage.reasoning}
                    </div>
                  </div>

                  {/* Recalled Hindsight Memories */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono text-gray-400 uppercase tracking-wider flex items-center space-x-1.5">
                        <Brain className="w-3.5 h-3.5 text-purple-400" />
                        <span>Recalled Institutional Precedents ({triage.memory_matches ? triage.memory_matches.length : 0})</span>
                      </span>
                    </div>

                    {!triage.memory_matches || triage.memory_matches.length === 0 ? (
                      <div className="p-3 rounded-lg bg-[#0c101a] border border-[#1c2638] text-xs font-mono text-gray-500">
                        No prior memories matched this alert signature. (Cold start scenario)
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {triage.memory_matches.map((mem, idx) => (
                          <div
                            key={idx}
                            className="p-3 rounded-lg bg-[#0c101a] border border-purple-500/30 hover:border-purple-500/60 transition space-y-1"
                          >
                            <div className="flex items-center justify-between text-xs font-mono">
                              <span className="text-purple-300 font-bold">Memory Reference #{idx + 1}</span>
                              <span className="text-[11px] text-purple-400 font-semibold">
                                Relevance: {Math.round((mem.relevance || 0.9) * 100)}%
                              </span>
                            </div>
                            <p className="text-xs text-gray-300 font-sans leading-relaxed">
                              {mem.content || mem.text}
                            </p>
                            {mem.id && (
                              <div className="text-[10px] font-mono text-gray-500 pt-0.5">
                                Hindsight Bank ID: {mem.id}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* 3. ANALYST FEEDBACK & TEACHING LOOP */}
          <div className="cyber-card rounded-xl p-5 border border-[#1c2638] space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-extrabold text-white font-mono uppercase tracking-wide">
                  Teach Institutional Memory (Analyst Feedback Loop)
                </span>
              </div>
              <span className="text-[11px] font-mono text-purple-300">
                Updates Hindsight Bank in Real Time
              </span>
            </div>

            {retainedSuccess && (
              <div className="p-3 rounded-lg bg-emerald-950/60 border border-emerald-500 text-emerald-300 text-xs font-mono flex items-center space-x-2 animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>
                  ✓ Decision retained into Hindsight memory! All future shifts & triage requests will remember this context.
                </span>
              </div>
            )}

            <form onSubmit={handleSubmitFeedback} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">
                    Analyst Verdict Override
                  </label>
                  <select
                    value={analystVerdict}
                    onChange={(e) => setAnalystVerdict(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c101a] border border-[#1c2638] text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  >
                    <option value="FALSE_POSITIVE">FALSE POSITIVE (Authorized Benign Activity)</option>
                    <option value="TRUE_POSITIVE">TRUE POSITIVE (Active Incident / Attack)</option>
                    <option value="NEEDS_HUMAN">NEEDS HUMAN REVIEW (Ambiguous Context)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-gray-400 block mb-1">
                    Analyst Name / Clearance ID
                  </label>
                  <input
                    type="text"
                    value={analystName}
                    onChange={(e) => setAnalystName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[#0c101a] border border-[#1c2638] text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-400 block mb-1">
                  Institutional Context & Reason to Retain <span className="text-cyan-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. 10.20.5.44 is our approved Nessus vulnerability scanner running weekly scans every Monday at 02:00 UTC."
                  className="w-full px-3 py-2 rounded-lg bg-[#0c101a] border border-[#1c2638] text-xs font-mono text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-lg text-xs font-mono text-gray-400 hover:text-white hover:bg-[#162033] transition"
                >
                  Close
                </button>

                <button
                  type="submit"
                  disabled={submitting || !reason.trim()}
                  className="px-5 py-2 rounded-lg text-xs font-mono font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-glow transition disabled:opacity-50 flex items-center space-x-2"
                >
                  <Send className={`w-3.5 h-3.5 ${submitting ? "animate-spin" : ""}`} />
                  <span>{submitting ? "Retaining Memory..." : "Retain & Teach Agent"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

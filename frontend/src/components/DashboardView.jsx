"use client";

import React from "react";
import {
  Shield,
  Brain,
  CheckCircle2,
  UserCheck,
  AlertTriangle,
  Radio,
  ArrowUpRight,
  Play,
  Zap,
  Lock,
  Layers,
  Activity,
  Terminal,
  Clock,
  Sparkles,
  ChevronRight
} from "lucide-react";

export function DashboardView({
  alerts = [],
  stats,
  onSelectAlert,
  onNavigateTab,
  onRunDemo,
}) {
  const processed = stats?.alerts_processed || alerts.filter(a => a.triage).length;
  const memoryMatches = stats?.memory_matches || 0;
  const autoTriaged = stats?.auto_triaged || 0;
  const humanReviews = stats?.human_reviews || 0;

  const autoRate = stats?.auto_triage_rate ? Math.round(stats.auto_triage_rate * 100) : 0;
  const matchRate = stats?.memory_match_rate ? Math.round(stats.memory_match_rate * 100) : 0;

  const severityBadge = (sev) => {
    switch (sev) {
      case "CRITICAL":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-red-950/80 text-red-400 border border-red-800/80">CRITICAL</span>;
      case "HIGH":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-950/80 text-amber-400 border border-amber-800/80">HIGH</span>;
      case "MEDIUM":
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-yellow-950/80 text-yellow-400 border border-yellow-800/80">MEDIUM</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950/80 text-blue-400 border border-blue-800/80">LOW</span>;
    }
  };

  const verdictBadge = (verdict) => {
    if (!verdict) return <span className="text-[11px] text-gray-500 font-mono">PENDING TRIAGE</span>;
    switch (verdict) {
      case "AUTO_CLOSE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 shadow-emerald-glow">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>AUTO CLOSE</span>
          </span>
        );
      case "ESCALATE":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-red-950/80 text-red-300 border border-red-500/40 shadow-red-glow">
            <AlertTriangle className="w-3 h-3 text-red-400" />
            <span>ESCALATE</span>
          </span>
        );
      case "NEEDS_HUMAN":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40 shadow-amber-glow">
            <UserCheck className="w-3 h-3 text-amber-400" />
            <span>NEEDS HUMAN</span>
          </span>
        );
      default:
        return <span className="text-xs text-gray-400 font-mono">{verdict}</span>;
    }
  };

  // Extract recent triage events for the Live SOC Activity timeline
  const triagedAlerts = alerts.filter(a => a.triage);
  const pendingAlerts = alerts.filter(a => !a.triage);
  // Always display real alerts from dataset, prioritizing any triaged events
  const activityList = [...triagedAlerts, ...pendingAlerts].slice(0, 6);

  return (
    <div className="space-y-6">
      {/* 2. HERO / COMMAND CENTER */}
      <div className="relative overflow-hidden rounded-2xl cyber-card p-6 sm:p-8 border border-[#1c2638] shadow-2xl">
        {/* Background glow and subtle mesh lines */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-12 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>CONTINUOUS INSTITUTIONAL MEMORY ENGINE</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white font-mono tracking-tight leading-tight uppercase">
              Autonomous AI SOC Alert Triage
            </h1>

            <p className="text-sm text-gray-300 max-w-2xl leading-relaxed font-sans">
              TriageMind retains every human analyst correction into <strong>Hindsight</strong> persistent semantic memory. It auto-closes repetitive authorized scanner traffic with high confidence and deterministic code guardrails to block lookalike attacks.
            </p>

            {/* Quick Feature Badges */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0c101a] border border-[#1c2638] text-[11px] font-mono text-gray-300">
                <Brain className="w-3.5 h-3.5 text-purple-400" />
                <span>Hindsight Vector Bank</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0c101a] border border-[#1c2638] text-[11px] font-mono text-gray-300">
                <Lock className="w-3.5 h-3.5 text-cyan-400" />
                <span>7 Deterministic Guardrails</span>
              </div>
              <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-md bg-[#0c101a] border border-[#1c2638] text-[11px] font-mono text-gray-300">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                <span>Zero-Shot Adaptation</span>
              </div>
            </div>
          </div>

          {/* Quick CTA Box */}
          <div className="lg:col-span-4 bg-[#0c101a]/90 border border-[#1c2638] rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-mono font-bold text-white uppercase">Agent Readiness</span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
                READY
              </span>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between text-gray-400">
                <span>Autonomous Auto-Close Rate:</span>
                <span className="text-cyan-400 font-bold">{autoRate}%</span>
              </div>
              <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-cyan-500 to-blue-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(autoRate, 8)}%` }}
                />
              </div>

              <div className="flex justify-between text-gray-400 pt-1">
                <span>Memory Precedent Recall:</span>
                <span className="text-purple-400 font-bold">{matchRate}%</span>
              </div>
              <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-purple-500 to-fuchsia-500 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${Math.max(matchRate, 12)}%` }}
                />
              </div>
            </div>

            {onRunDemo && (
              <button
                onClick={onRunDemo}
                className="w-full mt-2 py-2.5 px-4 rounded-lg bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono text-xs font-bold flex items-center justify-center space-x-2 shadow-cyan-glow transition-all duration-200"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>START GUIDED DEMO</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 3. KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Alerts */}
        <div
          onClick={() => onNavigateTab("alerts")}
          className="cyber-card p-5 rounded-xl border border-[#1c2638] hover:border-cyan-500/40 cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Alerts Analyzed</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {processed}
            </span>
            <span className="text-xs text-blue-400 flex items-center space-x-1 font-mono">
              <span>{alerts.length} Total</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">
            Ingested from security feed
          </div>
        </div>

        {/* Card 2: Memory Matches */}
        <div
          onClick={() => onNavigateTab("memory")}
          className="cyber-card p-5 rounded-xl border border-[#1c2638] hover:border-purple-500/40 cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Memory Matches</span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {memoryMatches}
            </span>
            <span className="text-xs text-purple-400 flex items-center space-x-1 font-mono">
              <span>{matchRate}% Rate</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">
            Matched prior analyst decisions
          </div>
        </div>

        {/* Card 3: Autonomous Auto-Triaged */}
        <div
          onClick={() => onNavigateTab("alerts")}
          className="cyber-card p-5 rounded-xl border border-[#1c2638] hover:border-emerald-500/40 cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Auto-Triaged</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {autoTriaged}
            </span>
            <span className="text-xs text-emerald-400 flex items-center space-x-1 font-mono">
              <span>{autoRate}% Closed</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">
            Authorized scanner exemptions
          </div>
        </div>

        {/* Card 4: Human Escalations */}
        <div
          onClick={() => onNavigateTab("alerts")}
          className="cyber-card p-5 rounded-xl border border-[#1c2638] hover:border-amber-500/40 cursor-pointer transition-all duration-200 group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">Human Reviews</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl sm:text-3xl font-black font-mono text-white tracking-tight">
              {humanReviews}
            </span>
            <span className="text-xs text-amber-400 flex items-center space-x-1 font-mono">
              <span>Escalated</span>
              <ArrowUpRight className="w-3 h-3" />
            </span>
          </div>
          <div className="mt-2 text-[11px] text-gray-400">
            Novel or ambiguous events
          </div>
        </div>
      </div>

      {/* 4. DUAL COLUMN: LIVE SOC ACTIVITY & GUARDRAIL ARCHITECTURE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Live SOC Activity Feed (7 cols) */}
        <div className="lg:col-span-7 cyber-card rounded-2xl border border-[#1c2638] p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-extrabold font-mono text-white tracking-wider uppercase">
                Live SOC Activity Timeline
              </h2>
            </div>
            <button
              onClick={() => onNavigateTab("alerts")}
              className="text-xs font-mono text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 transition"
            >
              <span>View All ({alerts.length})</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {activityList.length === 0 ? (
              <div className="p-8 text-center text-gray-500 font-mono text-xs">
                No alert activity recorded yet. Ingest alerts or run the demo journey above.
              </div>
            ) : (
              activityList.map((alert) => (
                <div
                  key={alert.id}
                  onClick={() => onSelectAlert(alert)}
                  className="p-3.5 rounded-xl bg-[#0c101a] border border-[#1c2638] hover:border-cyan-500/40 hover:bg-[#111827] cursor-pointer transition-all duration-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition">
                        {alert.id}
                      </span>
                      {severityBadge(alert.severity)}
                      <span className="text-[11px] font-mono text-gray-400">
                        {alert.event_type}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 truncate max-w-md font-sans">
                      {alert.description}
                    </p>
                    <div className="flex items-center space-x-2 text-[10px] font-mono text-gray-400">
                      <span>SRC: {alert.source_ip || "Internal"}</span>
                      <span>•</span>
                      <span>TARGET: {alert.asset || alert.hostname || "AWS"}</span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-1 flex-shrink-0">
                    {verdictBadge(alert.triage?.final_verdict)}
                    {alert.triage && (
                      <span className="text-[10px] font-mono text-gray-400">
                        {Math.round(alert.triage.confidence * 100)}% Conf • {alert.triage.memory_count || 0} Mem
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Deterministic Safety & Memory Architecture (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Institutional Memory Highlight */}
          <div className="cyber-card rounded-2xl border border-[#1c2638] p-5 sm:p-6 space-y-4">
            <div className="flex items-center space-x-2 border-b border-[#1c2638] pb-3">
              <Brain className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-extrabold font-mono text-white tracking-wider uppercase">
                Institutional Memory Core
              </h2>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Unlike static rules or stateless LLMs, TriageMind forms organizational memory over time:
            </p>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638] flex items-start space-x-2.5">
                <span className="text-cyan-400 font-bold mt-0.5">01</span>
                <div>
                  <strong className="text-white">Cold Start Safety</strong>
                  <p className="text-[11px] text-gray-400">Refuses to auto-close unseen scanner IPs without precedent.</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638] flex items-start space-x-2.5">
                <span className="text-emerald-400 font-bold mt-0.5">02</span>
                <div>
                  <strong className="text-white">Continuous Retention</strong>
                  <p className="text-[11px] text-gray-400">Retains analyst decisions & schedules directly to Hindsight.</p>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-[#0c101a] border border-[#1c2638] flex items-start space-x-2.5">
                <span className="text-amber-400 font-bold mt-0.5">03</span>
                <div>
                  <strong className="text-white">Lookalike Trap Defense</strong>
                  <p className="text-[11px] text-gray-400">Code guardrails diff IP & evidence to block mimicry attacks.</p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigateTab("memory")}
              className="w-full py-2 rounded-lg text-xs font-mono bg-[#0c101a] hover:bg-[#162033] text-purple-300 border border-purple-500/30 hover:border-purple-400 transition flex items-center justify-center space-x-2"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>INSPECT MEMORY BANK</span>
            </button>
          </div>

          {/* Deterministic Guardrail Safety Layer */}
          <div className="cyber-card rounded-2xl border border-[#1c2638] p-5 sm:p-6 space-y-3">
            <div className="flex items-center space-x-2 border-b border-[#1c2638] pb-2">
              <Lock className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-extrabold font-mono text-white tracking-wider uppercase">
                7 Deterministic Guardrails
              </h2>
            </div>

            <div className="text-[11px] font-mono text-gray-400 space-y-1.5">
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Rule 1: Never auto-close CRITICAL severity</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Rule 2: Minimum confidence threshold (0.85)</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Rule 4: Conflicting precedent escalation</span>
              </div>
              <div className="flex items-center space-x-2 text-gray-300">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                <span>Rule 5: Observable evidence mismatch diffing</span>
              </div>
            </div>

            <div className="pt-1 text-[10px] font-mono text-cyan-400/80 bg-cyan-950/30 p-2 rounded border border-cyan-900/50">
              ⚡ Executed in deterministic Python code post-LLM to eliminate hallucination & prompt-injection risks.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

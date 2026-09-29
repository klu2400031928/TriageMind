"use client";

import React from "react";
import { Alert, LearningStats } from "@/types";
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

interface DashboardViewProps {
  alerts: Alert[];
  stats: LearningStats | null;
  onSelectAlert: (alert: Alert) => void;
  onNavigateTab: (tab: "alerts" | "memory" | "learning") => void;
  onRunDemo?: () => void;
}

export function DashboardView({
  alerts,
  stats,
  onSelectAlert,
  onNavigateTab,
  onRunDemo,
}: DashboardViewProps) {
  const processed = stats?.alerts_processed || alerts.filter(a => a.triage).length;
  const memoryMatches = stats?.memory_matches || 0;
  const autoTriaged = stats?.auto_triaged || 0;
  const humanReviews = stats?.human_reviews || 0;

  const autoRate = stats?.auto_triage_rate ? Math.round(stats.auto_triage_rate * 100) : 0;
  const matchRate = stats?.memory_match_rate ? Math.round(stats.memory_match_rate * 100) : 0;

  const severityBadge = (sev: string) => {
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

  const verdictBadge = (verdict?: string) => {
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
        <div className="absolute bottom-0 left-1/3 -mb-12 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-xs font-mono">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span className="tracking-wider uppercase">AUTONOMOUS SOC INTELLIGENCE</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Security decisions that <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">remember</span>.
            </h1>

            <p className="text-sm text-gray-300 leading-relaxed font-sans max-w-2xl">
              An AI triage agent powered by Hindsight persistent memory. It learns from analyst overrides, remembers institutional context across shifts, and detains lookalike attacks when evidence contradicts historical precedent.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={() => onRunDemo ? onRunDemo() : onNavigateTab("alerts")}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-semibold text-xs transition-all duration-200 shadow-cyan-glow flex items-center space-x-2"
              >
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>RUN LIVE DEMO</span>
              </button>

              <button
                onClick={() => onNavigateTab("memory")}
                className="px-5 py-2.5 rounded-xl bg-[#0c101a] hover:bg-[#162033] text-gray-200 border border-[#1c2638] hover:border-purple-500/50 text-xs font-medium transition-all duration-200 flex items-center space-x-2 group"
              >
                <Brain className="w-3.5 h-3.5 text-purple-400 group-hover:scale-110 transition-transform" />
                <span>EXPLORE MEMORY BANK</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-purple-300" />
              </button>
            </div>
          </div>

          {/* Right Live Status Panel */}
          <div className="w-full lg:w-72 bg-[#06080e]/80 border border-[#1c2638] rounded-xl p-4 space-y-3 backdrop-blur-md">
            <div className="text-[11px] font-mono text-gray-400 uppercase tracking-wider flex items-center justify-between border-b border-[#1c2638] pb-2">
              <span className="flex items-center space-x-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                <span>SOC Telemetry</span>
              </span>
              <span className="text-emerald-400 text-[10px]">LIVE</span>
            </div>

            <div className="space-y-2.5 text-xs font-mono">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">AGENT STATUS</span>
                <span className="flex items-center space-x-1.5 text-emerald-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  <span>ONLINE</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">MEMORY CORE</span>
                <span className="flex items-center space-x-1.5 text-purple-400 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                  <span>ACTIVE</span>
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-gray-400">GUARDRAILS</span>
                <span className="flex items-center space-x-1.5 text-cyan-400 font-semibold">
                  <Lock className="w-3 h-3 text-cyan-400" />
                  <span>ENFORCED</span>
                </span>
              </div>

              <div className="flex items-center justify-between pt-1 border-t border-gray-800 text-[11px]">
                <span className="text-gray-500">MEMORY BANK</span>
                <span className="text-gray-300">triagemind-demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. SECURITY METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Alerts Analyzed */}
        <div className="cyber-card-interactive rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-gray-400">
              Alerts Analyzed
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Shield className="w-4 h-4 text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-white font-mono">{processed}</span>
            <span className="text-xs text-blue-400 font-mono font-medium">
              {processed > 0 ? `${processed}/${alerts.length} Triaged` : "Awaiting Triage"}
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>{alerts.length} alerts in queue</span>
            <span className="font-mono text-[10px] text-gray-500 tracking-widest">▅▆▇▇▆▅▆▇</span>
          </div>
        </div>

        {/* Memory Matches */}
        <div className="cyber-card-interactive rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-purple-300">
              Memory Matches
            </span>
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-purple-300 font-mono">{memoryMatches}</span>
            <span className="text-xs text-purple-400 font-mono font-medium">
              {matchRate}% match
            </span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>Augmented via Hindsight</span>
            <span className="font-mono text-[10px] text-purple-400 tracking-widest">▃▅▆▇██▇▆</span>
          </div>
        </div>

        {/* Auto-Triaged */}
        <div className="cyber-card-interactive rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-emerald-300">
              Auto-Triaged
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-emerald-400 font-mono">{autoTriaged}</span>
            <span className="text-xs text-emerald-300 font-mono font-medium">{autoRate}% safe close</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>High confidence benign close</span>
            <span className="font-mono text-[10px] text-emerald-400 tracking-widest">▂▃▅▆▇▇██</span>
          </div>
        </div>

        {/* Human Reviews Required */}
        <div className="cyber-card-interactive rounded-xl p-5 relative overflow-hidden group">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-[11px] font-mono uppercase tracking-wider text-amber-300">
              Human Reviews
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <UserCheck className="w-4 h-4 text-amber-400" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline space-x-2">
            <span className="text-3xl font-extrabold text-amber-400 font-mono">{humanReviews}</span>
            <span className="text-xs text-amber-300 font-mono font-medium">Safe guardrails</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>Escalated or cold start review</span>
            <span className="font-mono text-[10px] text-amber-400 tracking-widest">▅▅▃▂▅▆▅▃</span>
          </div>
        </div>
      </div>

      {/* Grid: 4. LIVE SOC ACTIVITY (Left) + INSTITUTIONAL ARCHITECTURE (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live SOC Activity Timeline */}
        <div className="lg:col-span-2 cyber-card rounded-xl p-6 border border-[#1c2638] space-y-4">
          <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
            <div className="flex items-center space-x-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Live SOC Activity Timeline
              </h3>
            </div>
            <span className="text-[11px] font-mono text-gray-500">Real Incident Stream</span>
          </div>

          <div className="space-y-3">
            {activityList.map((a, idx) => {
              const verdict = a.triage?.final_verdict;
              return (
                <div
                  key={a.id || idx}
                  onClick={() => onSelectAlert(a)}
                  className="flex items-start justify-between p-3.5 rounded-lg bg-[#06080e]/60 border border-[#1c2638] hover:border-cyan-500/40 hover:bg-[#111827] transition-all cursor-pointer group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-1">
                      {verdict === "AUTO_CLOSE" ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 block shadow-emerald-glow" />
                      ) : verdict === "ESCALATE" ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-red-400 block shadow-red-glow" />
                      ) : verdict === "NEEDS_HUMAN" ? (
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 block shadow-amber-glow" />
                      ) : (
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-400 block" />
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-xs font-bold text-white group-hover:text-cyan-300 transition-colors">
                          {a.id}
                        </span>
                        <span className="text-xs text-gray-300 font-medium">
                          {a.event_type.replace(/_/g, " ")}
                        </span>
                        {severityBadge(a.severity)}
                      </div>

                      <div className="text-[11px] font-mono text-gray-400 flex items-center space-x-2">
                        <span>SRC: {a.source_ip || "Internal"}</span>
                        <span>→</span>
                        <span>TARGET: {a.asset || a.hostname || "cloud"}</span>
                        {a.destination_port && <span>:{a.destination_port}</span>}
                      </div>

                      {a.triage?.reasoning && (
                        <p className="text-xs text-gray-400 line-clamp-1 italic font-sans">
                          "{a.triage.reasoning}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right space-y-1 shrink-0 ml-3">
                    <div>{verdictBadge(verdict)}</div>
                    <div className="text-[10px] font-mono text-gray-500 flex items-center justify-end space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{a.timestamp.slice(11, 19)} UTC</span>
                    </div>
                    {a.triage && (
                      <span className="text-[10px] font-mono text-cyan-400 font-semibold block">
                        {(a.triage.confidence * 100).toFixed(0)}% CONF
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Institutional Memory Architecture Diagram */}
        <div className="cyber-card rounded-xl p-6 border border-[#1c2638] flex flex-col justify-between space-y-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Brain className="w-4 h-4 text-purple-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                Institutional Memory Core
              </h3>
            </div>
            <p className="text-xs text-gray-300 leading-relaxed font-sans">
              Normal AI runs blind: <code className="text-gray-400">Alert → Decision</code>.
              <br />
              <strong className="text-cyan-300 font-mono">TriageMind</strong> enriches every alert with organizational memory:
            </p>
          </div>

          {/* Connected Flow Node Diagram */}
          <div className="space-y-2 font-mono text-xs">
            <div className="p-2.5 rounded-lg bg-[#06080e] border border-[#1c2638] flex items-center justify-between">
              <span className="text-gray-400">1. INGEST ALERT</span>
              <Shield className="w-3.5 h-3.5 text-blue-400" />
            </div>
            <div className="text-center text-gray-600">↓</div>

            <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-800/40 flex items-center justify-between shadow-purple-glow">
              <span className="text-purple-300 font-semibold">2. HINDSIGHT RECALL</span>
              <Brain className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-center text-gray-600">↓</div>

            <div className="p-2.5 rounded-lg bg-[#06080e] border border-[#1c2638] flex items-center justify-between">
              <span className="text-gray-400">3. HISTORICAL EVIDENCE</span>
              <span className="text-emerald-400 font-mono text-[10px]">96% match</span>
            </div>
            <div className="text-center text-gray-600">↓</div>

            <div className="p-2.5 rounded-lg bg-amber-950/30 border border-amber-800/40 flex items-center justify-between">
              <span className="text-amber-300 font-semibold">4. GUARDRAIL VERIFY</span>
              <Lock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-center text-gray-600">↓</div>

            <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between shadow-emerald-glow">
              <span className="text-emerald-300 font-bold">5. SAFE ACTION</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          <button
            onClick={() => onNavigateTab("memory")}
            className="w-full py-2.5 rounded-lg bg-purple-900/30 hover:bg-purple-900/50 border border-purple-700/50 text-purple-200 text-xs font-mono font-medium transition flex items-center justify-center space-x-1.5"
          >
            <span>Query Memory Engine</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Recent Alerts Table */}
      <div className="cyber-card rounded-xl overflow-hidden border border-[#1c2638]">
        <div className="px-6 py-4 border-b border-[#1c2638] flex items-center justify-between bg-[#06080e]/60">
          <div>
            <h3 className="text-sm font-bold text-white font-mono tracking-wide">
              SECURITY OPERATIONS QUEUE
            </h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Click any alert to launch the AI SOC Investigation drawer with institutional memory visualization.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab("alerts")}
            className="text-xs text-cyan-400 hover:text-cyan-300 font-mono font-semibold flex items-center space-x-1"
          >
            <span>VIEW ALL QUEUED ({alerts.length})</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0c101a] text-gray-400 uppercase font-mono border-b border-[#1c2638]">
              <tr>
                <th className="px-6 py-3">Alert ID</th>
                <th className="px-6 py-3">Timestamp</th>
                <th className="px-6 py-3">Severity</th>
                <th className="px-6 py-3">Event Type</th>
                <th className="px-6 py-3">Source & Asset</th>
                <th className="px-6 py-3">AI Verdict</th>
                <th className="px-6 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2638] text-gray-300">
              {alerts.slice(0, 6).map((a) => (
                <tr
                  key={a.id}
                  onClick={() => onSelectAlert(a)}
                  className="hover:bg-[#162033]/60 transition cursor-pointer group"
                >
                  <td className="px-6 py-3 font-mono font-bold text-white group-hover:text-cyan-400 transition">
                    {a.id}
                  </td>
                  <td className="px-6 py-3 text-gray-400 font-mono">
                    {a.timestamp.replace("T", " ").replace("Z", "")}
                  </td>
                  <td className="px-6 py-3">{severityBadge(a.severity)}</td>
                  <td className="px-6 py-3 font-medium text-gray-200">
                    {a.event_type.replace(/_/g, " ")}
                  </td>
                  <td className="px-6 py-3">
                    <div className="font-mono text-gray-300">{a.source_ip || "Internal"}</div>
                    <div className="text-[11px] text-gray-500 font-sans">{a.asset || a.hostname || "cloud-infra"}</div>
                  </td>
                  <td className="px-6 py-3">{verdictBadge(a.triage?.final_verdict)}</td>
                  <td className="px-6 py-3 text-right">
                    <span className="text-xs text-cyan-400 font-mono font-semibold group-hover:underline">
                      INVESTIGATE →
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

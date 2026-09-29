"use client";

import React, { useState } from "react";
import { Alert, Severity } from "@/types";
import {
  Search,
  Filter,
  Brain,
  Shield,
  ArrowUpDown,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  RotateCcw,
  Zap,
  Terminal,
  ShieldAlert
} from "lucide-react";

interface AlertQueueViewProps {
  alerts: Alert[];
  onSelectAlert: (alert: Alert) => void;
}

export function AlertQueueView({ alerts, onSelectAlert }: AlertQueueViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState<string>("ALL");
  const [verdictFilter, setVerdictFilter] = useState<string>("ALL");

  const filtered = alerts.filter((a) => {
    const matchesSearch =
      a.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.source_ip && a.source_ip.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (a.asset && a.asset.toLowerCase().includes(searchTerm.toLowerCase())) ||
      a.event_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesSeverity = severityFilter === "ALL" || a.severity === severityFilter;
    const matchesVerdict =
      verdictFilter === "ALL" ||
      (a.triage && a.triage.final_verdict === verdictFilter) ||
      (verdictFilter === "PENDING" && !a.triage);

    return matchesSearch && matchesSeverity && matchesVerdict;
  });

  const severityBadge = (sev: Severity) => {
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
    if (!verdict) return <span className="text-[11px] text-gray-500 font-mono">UNPROCESSED</span>;
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

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-extrabold text-white font-mono tracking-tight uppercase">
              Security Operations Triage Queue
            </h2>
          </div>
          <p className="text-xs text-gray-400 font-sans mt-0.5">
            Real-time feed of ingested alerts. Select any alert to launch AI reasoning and inspect Hindsight memory match.
          </p>
        </div>

        <div className="text-xs font-mono text-gray-400 flex items-center space-x-2 bg-[#0c101a] px-3 py-1.5 rounded-lg border border-[#1c2638]">
          <span>TOTAL QUEUED: <strong className="text-white">{alerts.length}</strong></span>
          <span>•</span>
          <span>DISPLAYED: <strong className="text-cyan-400">{filtered.length}</strong></span>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="cyber-card rounded-xl p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between border border-[#1c2638]">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IP, asset hostname, event type, or alert ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#06080e] border border-[#1c2638] rounded-lg pl-10 pr-4 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition font-mono"
          />
        </div>

        {/* Severity Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center space-x-1 bg-[#06080e] p-1 rounded-lg border border-[#1c2638]">
            <span className="text-[10px] font-mono text-gray-500 px-2 uppercase">Sev:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition ${
                  severityFilter === sev
                    ? "bg-[#1c2638] text-white shadow-sm font-bold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          {/* Verdict Filter Pills */}
          <div className="flex items-center space-x-1 bg-[#06080e] p-1 rounded-lg border border-[#1c2638]">
            <span className="text-[10px] font-mono text-gray-500 px-2 uppercase">Verdict:</span>
            {[
              { id: "ALL", label: "ALL" },
              { id: "AUTO_CLOSE", label: "AUTO" },
              { id: "NEEDS_HUMAN", label: "HUMAN" },
              { id: "ESCALATE", label: "ESCALATE" },
              { id: "PENDING", label: "PENDING" },
            ].map((v) => (
              <button
                key={v.id}
                onClick={() => setVerdictFilter(v.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-mono font-medium transition ${
                  verdictFilter === v.id
                    ? "bg-[#1c2638] text-cyan-300 shadow-sm font-bold"
                    : "text-gray-400 hover:text-gray-200"
                }`}
              >
                {v.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Alerts Table / Empty State */}
      {filtered.length === 0 ? (
        <div className="cyber-card rounded-2xl p-16 text-center border border-dashed border-[#1c2638] space-y-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-950/40 border border-cyan-800/40 flex items-center justify-center mx-auto text-cyan-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              SYSTEM CLEAR
            </h3>
            <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
              No security alerts match the current search query or filter parameters.
            </p>
          </div>
          <button
            onClick={() => {
              setSearchTerm("");
              setSeverityFilter("ALL");
              setVerdictFilter("ALL");
            }}
            className="px-4 py-2 rounded-lg bg-[#111827] hover:bg-[#1a253a] text-cyan-400 border border-cyan-500/30 text-xs font-mono font-medium transition inline-flex items-center space-x-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Filters</span>
          </button>
        </div>
      ) : (
        <div className="cyber-card rounded-xl overflow-hidden border border-[#1c2638]">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0c101a] text-gray-400 uppercase font-mono border-b border-[#1c2638]">
                <tr>
                  <th className="px-5 py-3.5">Severity</th>
                  <th className="px-5 py-3.5">Alert ID</th>
                  <th className="px-5 py-3.5">Event Signature</th>
                  <th className="px-5 py-3.5">Source IP</th>
                  <th className="px-5 py-3.5">Destination / Asset</th>
                  <th className="px-5 py-3.5">Time (UTC)</th>
                  <th className="px-5 py-3.5">Memory 🧠</th>
                  <th className="px-5 py-3.5">AI Verdict</th>
                  <th className="px-5 py-3.5 text-right">Triage Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1c2638] text-gray-300">
                {filtered.map((a) => (
                  <tr
                    key={a.id}
                    onClick={() => onSelectAlert(a)}
                    className="hover:bg-[#162033]/70 transition-all cursor-pointer group"
                  >
                    <td className="px-5 py-3.5">{severityBadge(a.severity)}</td>
                    <td className="px-5 py-3.5 font-mono font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {a.id}
                    </td>
                    <td className="px-5 py-3.5 font-medium text-gray-200">
                      <div>{a.event_type.replace(/_/g, " ")}</div>
                      <div className="text-[10px] text-gray-500 font-mono">{a.tool || "SIEM Detection"}</div>
                    </td>
                    <td className="px-5 py-3.5 font-mono text-cyan-300">
                      {a.source_ip || "Internal"}
                    </td>
                    <td className="px-5 py-3.5 font-mono text-gray-300">
                      <span>{a.asset || a.hostname || "cloud"}</span>
                      {a.destination_port && (
                        <span className="text-gray-500">:{a.destination_port}</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-gray-400 font-mono">
                      {a.timestamp.slice(11, 19)}
                    </td>
                    <td className="px-5 py-3.5">
                      {a.triage ? (
                        a.triage.memory_count > 0 ? (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60 font-mono text-[11px] shadow-purple-glow">
                            <Brain className="w-3 h-3 text-purple-400" />
                            <span>{a.triage.memory_count} MATCH</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-blue-950/50 text-blue-300 border border-blue-800/40 font-mono text-[10px]">
                            <span>COLD START</span>
                          </span>
                        )
                      ) : (
                        <span className="text-gray-600 font-mono">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5">{verdictBadge(a.triage?.final_verdict)}</td>
                    <td className="px-5 py-3.5 text-right">
                      <button className="px-3 py-1.5 rounded-lg bg-[#111827] group-hover:bg-cyan-950/70 border border-[#1c2638] group-hover:border-cyan-500/50 text-xs font-mono font-bold text-cyan-400 transition-all inline-flex items-center space-x-1">
                        <span>INVESTIGATE</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

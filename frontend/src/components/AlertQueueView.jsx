"use client";

import React, { useState } from "react";
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

export function AlertQueueView({ alerts = [], onSelectAlert }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [verdictFilter, setVerdictFilter] = useState("ALL");

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
          <p className="text-xs text-gray-400 mt-0.5 font-mono">
            {filtered.length} of {alerts.length} total alerts matching operational filters
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center bg-[#0c101a] border border-[#1c2638] rounded-lg p-1">
            <span className="text-gray-400 px-2 py-1 text-[11px]">SEVERITY:</span>
            {["ALL", "CRITICAL", "HIGH", "MEDIUM", "LOW"].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  severityFilter === sev
                    ? "bg-cyan-950 text-cyan-300 border border-cyan-500/50"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {sev}
              </button>
            ))}
          </div>

          <div className="flex items-center bg-[#0c101a] border border-[#1c2638] rounded-lg p-1">
            <span className="text-gray-400 px-2 py-1 text-[11px]">VERDICT:</span>
            {["ALL", "AUTO_CLOSE", "NEEDS_HUMAN", "ESCALATE", "PENDING"].map((v) => (
              <button
                key={v}
                onClick={() => setVerdictFilter(v)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition ${
                  verdictFilter === v
                    ? "bg-purple-950 text-purple-300 border border-purple-500/50"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by Alert ID, IP address, hostname, tool, or description observable..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#0c101a] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 text-xs font-mono"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Alert Table */}
      <div className="cyber-card rounded-xl border border-[#1c2638] overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#090d16] border-b border-[#1c2638] text-gray-400 uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">Alert ID</th>
                <th className="py-3 px-4">Severity</th>
                <th className="py-3 px-4">Event / Tool</th>
                <th className="py-3 px-4">Source → Target</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-right">Triage Verdict</th>
                <th className="py-3 px-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#162033]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-gray-500">
                    No security alerts found matching the active filters.
                  </td>
                </tr>
              ) : (
                filtered.map((alert) => (
                  <tr
                    key={alert.id}
                    onClick={() => onSelectAlert(alert)}
                    className="hover:bg-[#111827] cursor-pointer transition-colors group"
                  >
                    <td className="py-3.5 px-4 font-bold text-white group-hover:text-cyan-300 whitespace-nowrap">
                      {alert.id}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {severityBadge(alert.severity)}
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 whitespace-nowrap">
                      <div className="font-semibold text-white">{alert.event_type}</div>
                      {alert.tool && (
                        <div className="text-[10px] text-gray-500">Tool: {alert.tool}</div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="text-gray-200">
                        {alert.source_ip || "Internal"}
                        {alert.source_port ? `:${alert.source_port}` : ""}
                      </div>
                      <div className="text-[10px] text-cyan-400/80">
                        → {alert.asset || alert.hostname || "Target"}
                        {alert.destination_port ? `:${alert.destination_port}` : ""}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-gray-300 max-w-xs truncate font-sans">
                      {alert.description}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      {verdictBadge(alert.triage?.final_verdict)}
                    </td>
                    <td className="py-3.5 px-3 text-right">
                      <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all inline" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

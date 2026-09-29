"use client";

import React, { useState, useEffect } from "react";
import { getRecentMemories } from "@/lib/api";
import {
  Brain,
  Search,
  Tag,
  RefreshCw,
  Sparkles,
  Clock,
  User,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  Database,
  Layers,
  CheckCircle2,
  Lock,
  ArrowUpRight
} from "lucide-react";

export function MemoryBankView() {
  const [memories, setMemories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadMemories(debouncedQuery);
  }, [debouncedQuery]);

  async function loadMemories(q?: string) {
    setLoading(true);
    try {
      const data = await getRecentMemories(q || undefined);
      setMemories(data.memories || []);
    } catch (err) {
      console.error("Failed to load memories:", err);
    } finally {
      setLoading(false);
    }
  }

  function toggleExpand(id: string) {
    setExpandedId(prev => (prev === id ? null : id));
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-[#1c2638] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shadow-purple-glow">
                <Brain className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h2 className="text-xl font-extrabold text-white font-mono tracking-tight uppercase">
                  Hindsight Institutional Memory Bank
                </h2>
                <div className="flex items-center space-x-2 text-xs font-mono text-gray-400 mt-0.5">
                  <span>ACTIVE BANK: <strong className="text-purple-300">triagemind-demo</strong></span>
                  <span>•</span>
                  <span>TOTAL EXPERIENCES: <strong className="text-cyan-300">{memories.length}</strong></span>
                </div>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl font-sans leading-relaxed">
              Every resolved incident, analyst override, scanner exemption, and threat pattern is preserved in persistent semantic storage. The agent recalls these historical experiences to triage repetitive noise and identify subtle variations.
            </p>
          </div>

          <button
            onClick={() => loadMemories(debouncedQuery)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-mono font-medium bg-[#06080e] hover:bg-[#162033] text-gray-200 border border-[#1c2638] hover:border-purple-500/40 transition shadow-sm"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-purple-400" : "text-gray-400"}`} />
            <span>SYNC MEMORIES</span>
          </button>
        </div>

        {/* Semantic Memory Search Bar */}
        <div className="mt-6 relative">
          <Search className="w-4 h-4 text-purple-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search organizational memory semantically (e.g. 'Nessus authorized scanner', 'reverse shell port 4444', 'scheduled backup')..."
            className="w-full bg-[#06080e] border border-[#1c2638] focus:border-purple-500 rounded-xl pl-11 pr-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none transition font-mono shadow-inner"
          />
        </div>
      </div>

      {/* Memories Grid */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto shadow-purple-glow" />
          <p className="text-xs text-purple-300 font-mono tracking-wider uppercase">
            Querying Hindsight Memory Bank Vector Index...
          </p>
        </div>
      ) : memories.length === 0 ? (
        <div className="cyber-card rounded-2xl p-16 text-center border border-dashed border-[#1c2638] space-y-3">
          <div className="w-12 h-12 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center mx-auto text-purple-400">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold font-mono text-white uppercase">
            No memories match your query
          </h3>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Try a different search phrase or click "Sync Memories" to refresh from the live Hindsight Cloud bank.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {memories.map((m, idx) => {
            const memId = m.id || `mem-${idx}`;
            const isExpanded = expandedId === memId;
            const relevanceScore = m.relevance !== undefined ? Math.round(m.relevance * 100) : 95;

            return (
              <div
                key={memId}
                className="cyber-card-interactive rounded-2xl p-5 border border-[#1c2638] hover:border-purple-500/50 space-y-3 transition-all group"
              >
                {/* Header */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-purple-300 font-bold tracking-tight">
                      {m.id ? `MEM-${m.id.slice(0, 10)}` : `MEMORY #${idx + 1}`}
                    </span>
                    {m.verdict && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-purple-950/80 text-purple-200 border border-purple-800">
                        {m.verdict}
                      </span>
                    )}
                  </div>

                  <span className="font-mono text-emerald-400 font-bold text-xs">
                    {relevanceScore}% MATCH
                  </span>
                </div>

                {/* Relevance Visual Meter */}
                <div className="space-y-1">
                  <div className="w-full bg-[#06080e] h-2 rounded-full overflow-hidden border border-gray-800">
                    <div
                      className="bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${relevanceScore}%` }}
                    />
                  </div>
                </div>

                {/* Memory Text */}
                <p className={`text-xs text-gray-200 leading-relaxed font-sans ${isExpanded ? "" : "line-clamp-3"}`}>
                  {m.text}
                </p>

                {/* Expand / Collapse Button */}
                <div className="flex items-center justify-between pt-2 border-t border-gray-800/80 text-[11px] font-mono text-gray-400">
                  <div className="flex flex-wrap gap-1">
                    {m.tags &&
                      m.tags.slice(0, isExpanded ? m.tags.length : 3).map((t: string, i: number) => (
                        <span
                          key={i}
                          className="px-1.5 py-0.5 rounded bg-[#06080e] text-cyan-300 text-[10px] border border-gray-800"
                        >
                          #{t}
                        </span>
                      ))}
                    {m.tags && m.tags.length > 3 && !isExpanded && (
                      <span className="text-[10px] text-gray-500">+{m.tags.length - 3}</span>
                    )}
                  </div>

                  <button
                    onClick={() => toggleExpand(memId)}
                    className="text-cyan-400 hover:text-cyan-300 flex items-center space-x-1 font-semibold"
                  >
                    <span>{isExpanded ? "Collapse" : "Expand"}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="pt-2 border-t border-gray-800 text-[11px] font-mono text-gray-400 space-y-1.5 bg-[#06080e]/60 p-3 rounded-lg">
                    {m.analyst && (
                      <div>
                        ANALYST AUTHOR: <strong className="text-gray-200">{m.analyst}</strong>
                      </div>
                    )}
                    {m.occurred && (
                      <div>
                        RECORDED DATE: <span className="text-gray-300">{m.occurred}</span>
                      </div>
                    )}
                    <div>
                      STORAGE ENGINE: <span className="text-purple-300">Hindsight Persistent Vector Bank</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

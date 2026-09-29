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
  const [memories, setMemories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  useEffect(() => {
    loadMemories(debouncedQuery);
  }, [debouncedQuery]);

  async function loadMemories(q) {
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

  function toggleExpand(id) {
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
            placeholder="Search recalled memories by IP, subnet, asset name, tool, analyst decision..."
            className="w-full pl-11 pr-4 py-3 rounded-xl bg-[#080c14] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white text-xs font-mono"
            >
              CLEAR
            </button>
          )}
        </div>
      </div>

      {/* Memory Cards Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
            RECALLED ORGANIZATIONAL MEMORIES ({memories.length})
          </span>
          <span className="text-[11px] font-mono text-purple-400">
            Semantic Similarity & Time-Decay Ranked
          </span>
        </div>

        {loading ? (
          <div className="p-12 cyber-card rounded-2xl border border-[#1c2638] flex flex-col items-center justify-center space-y-3">
            <div className="w-8 h-8 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-xs font-mono text-purple-300">
              Querying Hindsight semantic memory bank...
            </span>
          </div>
        ) : memories.length === 0 ? (
          <div className="p-12 cyber-card rounded-2xl border border-[#1c2638] text-center space-y-2">
            <Brain className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-sm font-mono text-gray-400">No memories match your query.</p>
            <p className="text-xs text-gray-500">
              Clear the search query or submit analyst feedback from the Alert Queue to seed new memory.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {memories.map((mem, idx) => {
              const text = mem.content || mem.text || "";
              const isExpanded = expandedId === (mem.id || idx.toString());
              const isNessus = text.toLowerCase().includes("nessus") || text.includes("10.20.5");
              const isDevOps = text.toLowerCase().includes("ci/cd") || text.toLowerCase().includes("gitlab");
              const isThreat = text.toLowerCase().includes("malicious") || text.toLowerCase().includes("brute-force") || text.includes("4444");

              return (
                <div
                  key={mem.id || idx}
                  className={`cyber-card rounded-xl p-5 border transition-all duration-200 space-y-3 relative overflow-hidden ${
                    isExpanded
                      ? "border-purple-500/60 shadow-purple-glow"
                      : "border-[#1c2638] hover:border-purple-500/30"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-purple-950/80 text-purple-300 border border-purple-800/60">
                        MEM #{idx + 1}
                      </span>
                      {isNessus && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
                          SCANNER EXEMPTION
                        </span>
                      )}
                      {isDevOps && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                          CI/CD RUNNER
                        </span>
                      )}
                      {isThreat && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-950 text-red-300 border border-red-800">
                          KNOWN THREAT
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono text-gray-500">
                      ID: {mem.id ? mem.id.substring(0, 12) : `mem-${idx}`}
                    </span>
                  </div>

                  <p className="text-xs text-gray-200 font-sans leading-relaxed">
                    {isExpanded ? text : text.slice(0, 220) + (text.length > 220 ? "..." : "")}
                  </p>

                  {text.length > 220 && (
                    <button
                      onClick={() => toggleExpand(mem.id || idx.toString())}
                      className="text-[11px] font-mono text-purple-400 hover:text-purple-300 flex items-center space-x-1"
                    >
                      <span>{isExpanded ? "Show Less" : "Read Full Context"}</span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5" />
                      )}
                    </button>
                  )}

                  <div className="pt-2 border-t border-[#1c2638] flex items-center justify-between text-[10px] font-mono text-gray-400">
                    <span className="flex items-center space-x-1">
                      <Database className="w-3 h-3 text-purple-400" />
                      <span>Persistent Memory Bank</span>
                    </span>
                    <span className="text-emerald-400">STATUS: RETAINED</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

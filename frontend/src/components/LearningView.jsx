"use client";

import React, { useState, useEffect } from "react";
import { runReflection, getLearningStats } from "@/lib/api";
import {
  Sparkles,
  Brain,
  TrendingUp,
  BookOpen,
  Send,
  CheckCircle2,
  ShieldCheck,
  UserCheck,
  Activity,
  ArrowRight,
  GitBranch,
  Layers,
  Terminal,
  Zap,
  Clock,
  ShieldAlert
} from "lucide-react";

export function LearningView() {
  const [stats, setStats] = useState(null);
  const [query, setQuery] = useState(
    "What patterns have I learned from analyst decisions across our infrastructure?"
  );
  const [reflection, setReflection] = useState("");
  const [reflecting, setReflecting] = useState(false);

  useEffect(() => {
    loadStats();
    handleReflect(query);
  }, []);

  async function loadStats() {
    try {
      const data = await getLearningStats();
      setStats(data);
    } catch (err) {
      console.error("Failed to load learning stats:", err);
    }
  }

  async function handleReflect(q) {
    setReflecting(true);
    try {
      const resp = await runReflection(q);
      setReflection(resp.reflection);
    } catch (err) {
      setReflection("Unable to generate reflection at this time.");
    } finally {
      setReflecting(false);
    }
  }

  const sampleQueries = [
    "What patterns have I learned from analyst decisions across our infrastructure?",
    "What is the authorized schedule and source IP for Nessus scanning?",
    "What are known malicious indicators (like port 4444) observed in past incidents?",
    "How do authorized scans differ from unauthorized attack attempts?",
  ];

  const intelligenceCards = [
    {
      title: "Learned Patterns",
      metric: "Scheduled Scans",
      desc: "Nessus scanner IP 10.20.5.44 authorized on Mondays 02:00 UTC",
      icon: CheckCircle2,
      border: "border-emerald-500/40",
      color: "text-emerald-400",
    },
    {
      title: "False Positive Signatures",
      metric: "DevOps CI/CD",
      desc: "GitLab runner SSH deployments auto-suppressed with correct key tags",
      icon: ShieldCheck,
      border: "border-cyan-500/40",
      color: "text-cyan-400",
    },
    {
      title: "Threat Patterns",
      metric: "Port 4444 Callbacks",
      desc: "Meterpreter reverse shell indicators immediately trigger ESCALATE",
      icon: ShieldAlert,
      border: "border-red-500/40",
      color: "text-red-400",
    },
    {
      title: "Analyst Overrides",
      metric: `${stats?.analyst_overrides || 3} Feedback Events`,
      desc: "Continuous human-in-the-loop updates teaching novel edge cases",
      icon: UserCheck,
      border: "border-purple-500/40",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-[#1c2638] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-2">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shadow-emerald-glow">
              <Sparkles className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-white font-mono tracking-tight uppercase">
                Reflect & Learn Engine (Hindsight Synthesis)
              </h2>
              <p className="text-xs font-mono text-emerald-400 mt-0.5">
                Autonomous Higher-Order Reasoning Over Institutional History
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-300 max-w-2xl font-sans leading-relaxed">
            The <code>reflect</code> capability examines all accumulated experiences, analyst corrections, and triage outcomes in the memory bank to synthesize global operational rules without requiring model fine-tuning.
          </p>
        </div>
      </div>

      {/* Intelligence Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {intelligenceCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`cyber-card p-5 rounded-xl border ${card.border} space-y-2`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-gray-400 uppercase tracking-wider">
                  {card.title}
                </span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className="text-base font-bold font-mono text-white">
                {card.metric}
              </div>
              <p className="text-xs text-gray-400 font-sans leading-relaxed">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reflection Interactive Prompt & Output */}
      <div className="cyber-card rounded-2xl p-6 border border-[#1c2638] space-y-5">
        <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
          <div className="flex items-center space-x-2">
            <Brain className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-extrabold font-mono text-white uppercase tracking-wider">
              Query Synthesized Organizational Knowledge
            </h3>
          </div>
          <span className="text-[11px] font-mono text-cyan-400">
            Powered by <code>areflect()</code>
          </span>
        </div>

        {/* Input bar */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReflect(query)}
            placeholder="Ask anything about what the agent has learned..."
            className="flex-1 px-4 py-2.5 rounded-xl bg-[#080c14] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-500 font-mono focus:outline-none focus:border-cyan-500/50"
          />
          <button
            onClick={() => handleReflect(query)}
            disabled={reflecting || !query.trim()}
            className="px-5 py-2.5 rounded-xl text-xs font-mono font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-glow transition disabled:opacity-50 flex items-center justify-center space-x-2"
          >
            <Send className={`w-3.5 h-3.5 ${reflecting ? "animate-spin" : ""}`} />
            <span>{reflecting ? "Synthesizing..." : "Run Reflection"}</span>
          </button>
        </div>

        {/* Query Suggestions */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-mono text-gray-400">SAMPLE REASONING QUERIES:</span>
          <div className="flex flex-wrap gap-2">
            {sampleQueries.map((sq, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setQuery(sq);
                  handleReflect(sq);
                }}
                className="px-3 py-1.5 rounded-lg text-xs font-mono bg-[#0c101a] border border-[#1c2638] text-gray-300 hover:text-cyan-300 hover:border-cyan-500/40 text-left transition"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Reflection Output Box */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span>SYNTHESIS RESULT:</span>
            {reflecting && <span className="text-cyan-400 animate-pulse">Computing semantic graph...</span>}
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-[#080c14] border border-[#1c2638] text-xs sm:text-sm text-gray-200 font-sans leading-relaxed space-y-3 whitespace-pre-wrap">
            {reflecting ? (
              <div className="py-8 text-center text-gray-500 font-mono text-xs">
                Analyzing memory bank connections...
              </div>
            ) : reflection ? (
              reflection
            ) : (
              <span className="text-gray-500 font-mono">
                Click "Run Reflection" to synthesize memory patterns.
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

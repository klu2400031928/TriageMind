"use client";

import React, { useState, useEffect } from "react";
import { runReflection, getLearningStats } from "@/lib/api";
import { LearningStats } from "@/types";
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
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [query, setQuery] = useState(
    "What patterns have I learned from analyst decisions across our infrastructure?"
  );
  const [reflection, setReflection] = useState<string>("");
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

  async function handleReflect(q: string) {
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
      {/* 12. INSTITUTIONAL INTELLIGENCE HEADER */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-[#1c2638] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2.5">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shadow-amber-glow">
                <Sparkles className="w-5 h-5 text-amber-400" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-white font-mono tracking-tight uppercase">
                  Institutional Intelligence
                </h1>
                <p className="text-xs font-mono text-amber-300 mt-0.5">
                  "What has our SOC learned over time?"
                </p>
              </div>
            </div>
            <p className="text-xs text-gray-300 max-w-2xl font-sans leading-relaxed">
              Powered by Hindsight's <code className="text-amber-300 font-mono">reflect()</code> synthesis engine. TriageMind analyzes accumulated institutional memories to summarize organizational behaviors, identify repeated false positives, and discover security gaps.
            </p>
          </div>
        </div>
      </div>

      {/* METRIC & LEARNING PROGRESS TIMELINE */}
      <div className="cyber-card rounded-2xl p-6 border border-[#1c2638] space-y-4">
        <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
          <span className="text-xs font-bold font-mono text-white uppercase tracking-wider flex items-center space-x-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span>Autonomous Learning Evolution Flow</span>
          </span>
          <span className="text-[11px] font-mono text-emerald-400">Adaptive Memory Loop</span>
        </div>

        {/* 5-Step Learning Pipeline Timeline */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 font-mono text-xs">
          <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638] text-center space-y-1">
            <span className="text-[10px] text-gray-500 block">STEP 1</span>
            <div className="font-bold text-gray-300">ANALYST DECISION</div>
            <p className="text-[10px] text-gray-500 font-sans">Human marks benign or threat</p>
          </div>

          <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-800/40 text-center space-y-1 shadow-purple-glow">
            <span className="text-[10px] text-purple-400 block font-bold">STEP 2</span>
            <div className="font-bold text-purple-200">HINDSIGHT RETAIN</div>
            <p className="text-[10px] text-purple-300 font-sans">Encoded into semantic bank</p>
          </div>

          <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638] text-center space-y-1">
            <span className="text-[10px] text-gray-500 block">STEP 3</span>
            <div className="font-bold text-gray-300">REPEATED ALERT</div>
            <p className="text-[10px] text-gray-500 font-sans">Similar signature ingested</p>
          </div>

          <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40 text-center space-y-1 shadow-cyan-glow">
            <span className="text-[10px] text-cyan-400 block font-bold">STEP 4</span>
            <div className="font-bold text-cyan-200">LEARNED PATTERN</div>
            <p className="text-[10px] text-cyan-300 font-sans">Relevance match &gt; 90%</p>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 text-center space-y-1 shadow-emerald-glow">
            <span className="text-[10px] text-emerald-400 block font-bold">STEP 5</span>
            <div className="font-bold text-emerald-300">AUTOMATION</div>
            <p className="text-[10px] text-emerald-200 font-sans">Safe auto-close with 0 fatigue</p>
          </div>
        </div>
      </div>

      {/* 4 INSTITUTIONAL KNOWLEDGE CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {intelligenceCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`cyber-card-interactive rounded-xl p-5 border ${card.border} space-y-2`}
            >
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-gray-400 uppercase tracking-wider text-[11px]">{card.title}</span>
                <Icon className={`w-4 h-4 ${card.color}`} />
              </div>
              <div className={`font-bold font-mono text-sm ${card.color}`}>
                {card.metric}
              </div>
              <p className="text-xs text-gray-300 font-sans leading-relaxed">
                {card.desc}
              </p>
            </div>
          );
        })}
      </div>

      {/* ASK INSTITUTIONAL MEMORY (REFLECT ENGINE) */}
      <div className="cyber-card rounded-2xl p-6 sm:p-8 border border-amber-900/40 space-y-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
          <div className="flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h3 className="text-sm font-bold font-mono text-white uppercase tracking-wider">
              Ask Institutional Memory (Hindsight Reflect)
            </h3>
          </div>
          <span className="text-xs font-mono text-amber-400 bg-amber-950/60 px-2.5 py-1 rounded border border-amber-800/60">
            Engine: hindsight.reflect()
          </span>
        </div>

        {/* Input box */}
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask anything about what the SOC has experienced, authorized, or learned..."
            className="flex-1 bg-[#06080e] border border-[#1c2638] focus:border-amber-500 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-500 focus:outline-none transition font-mono shadow-inner"
          />
          <button
            onClick={() => handleReflect(query)}
            disabled={reflecting || !query.trim()}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white font-mono font-bold text-xs shadow-amber-glow transition disabled:opacity-50 flex items-center justify-center space-x-2 shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{reflecting ? "Synthesizing..." : "Synthesize Knowledge"}</span>
          </button>
        </div>

        {/* Preset Query Chips */}
        <div className="flex flex-wrap gap-2 pt-1">
          {sampleQueries.map((sq, i) => (
            <button
              key={i}
              onClick={() => {
                setQuery(sq);
                handleReflect(sq);
              }}
              className="text-[11px] font-mono px-3 py-1.5 rounded-lg bg-[#06080e] hover:bg-[#162033] text-gray-300 hover:text-amber-300 border border-[#1c2638] hover:border-amber-500/40 transition text-left"
            >
              {sq}
            </button>
          ))}
        </div>

        {/* Reflection Output */}
        <div className="pt-4 border-t border-[#1c2638] space-y-2">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400">
            <span className="uppercase tracking-wider">Synthesized Institutional Knowledge:</span>
            {reflecting && <span className="text-amber-400 animate-pulse">Running Groq LLM over Hindsight Bank...</span>}
          </div>

          {reflecting ? (
            <div className="py-16 text-center space-y-3">
              <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto shadow-amber-glow" />
              <p className="text-xs text-amber-300 font-mono tracking-wider">
                Scanning historical memory documents and synthesizing narrative...
              </p>
            </div>
          ) : reflection ? (
            <div className="bg-[#06080e] border border-amber-900/50 rounded-xl p-6 text-xs text-gray-200 leading-relaxed font-sans whitespace-pre-line shadow-inner border-l-4 border-l-amber-500">
              {reflection}
            </div>
          ) : (
            <p className="text-xs text-gray-500 font-mono py-4">
              Submit a prompt above or select a preset chip to query institutional memory.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

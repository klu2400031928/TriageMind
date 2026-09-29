"use client";

import React from "react";
import { Play, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, BookOpen, Layers } from "lucide-react";

export function DemoBar({ onRunStage, activeStage }) {
  const stages = [
    {
      id: 1,
      num: "01",
      title: "COLD START",
      subtitle: "Agent encounters unknown scan pattern",
      icon: Play,
      color: "border-cyan-500/40 text-cyan-300 bg-cyan-950/40",
      activeBg: "bg-cyan-600 text-white border-cyan-400 shadow-cyan-glow",
    },
    {
      id: 2,
      num: "02",
      title: "LEARN",
      subtitle: "Analyst teaches authorized scanner IP",
      icon: BookOpen,
      color: "border-blue-500/40 text-blue-300 bg-blue-950/40",
      activeBg: "bg-blue-600 text-white border-blue-400 shadow-blue-glow",
    },
    {
      id: 3,
      num: "03",
      title: "ADAPT",
      subtitle: "Memory auto-closes repeated scan",
      icon: ShieldCheck,
      color: "border-emerald-500/40 text-emerald-300 bg-emerald-950/40",
      activeBg: "bg-emerald-600 text-white border-emerald-400 shadow-emerald-glow",
    },
    {
      id: 4,
      num: "04",
      title: "TRAP ALERT",
      subtitle: "Lookalike attack triggers guardrails",
      icon: AlertTriangle,
      color: "border-amber-500/40 text-amber-300 bg-amber-950/40",
      activeBg: "bg-amber-600 text-white border-amber-400 shadow-amber-glow",
    },
  ];

  return (
    <div className="bg-[#090d16]/95 border-b border-[#1c2638] px-4 py-2.5 backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left Title */}
        <div className="flex items-center space-x-2.5">
          <div className="w-6 h-6 rounded-md bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-white font-mono tracking-wider uppercase">
                Interactive Demo Journey
              </span>
              <span className="text-[10px] text-purple-400 font-mono px-1.5 py-0.2 rounded bg-purple-950/80 border border-purple-800/40">
                LIVE SOC WALKTHROUGH
              </span>
            </div>
            <p className="text-[11px] text-gray-400 hidden lg:block">
              Experience cold-start triage, analyst memory retention, adaptive auto-close, and deterministic trap overrides.
            </p>
          </div>
        </div>

        {/* 4-Step Journey Pills */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
          {stages.map((stage, idx) => {
            const Icon = stage.icon;
            const isActive = activeStage === stage.id;
            return (
              <React.Fragment key={stage.id}>
                <button
                  onClick={() => onRunStage(stage.id)}
                  className={`group relative flex items-center space-x-2 px-3 py-1.5 rounded-lg text-xs font-mono transition-all duration-200 border ${
                    isActive
                      ? stage.activeBg
                      : "bg-[#0c101a] border-[#1c2638] text-gray-300 hover:border-gray-600 hover:bg-[#111827]"
                  }`}
                >
                  <span
                    className={`font-bold text-[10px] px-1 py-0.5 rounded ${
                      isActive ? "bg-white/20 text-white" : "bg-gray-800 text-gray-400"
                    }`}
                  >
                    {stage.num}
                  </span>
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-white" : "text-gray-400 group-hover:text-gray-200"
                    }`}
                  />
                  <div className="text-left">
                    <div className="font-bold uppercase leading-none">{stage.title}</div>
                    <div className="text-[9px] text-gray-400 hidden xl:block leading-none mt-0.5">
                      {stage.subtitle}
                    </div>
                  </div>
                </button>

                {idx < stages.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-gray-600 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

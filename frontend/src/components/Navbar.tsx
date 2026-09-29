"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Brain,
  Activity,
  RefreshCw,
  Sparkles,
  Server,
  Terminal,
  Radio,
  ChevronDown,
  User,
  Settings,
  Key,
  LogOut,
} from "lucide-react";

interface NavbarProps {
  activeTab: "dashboard" | "alerts" | "memory" | "learning";
  setActiveTab: (tab: "dashboard" | "alerts" | "memory" | "learning") => void;
  online: boolean;
  onReset: () => void;
  resetting: boolean;
}

export function Navbar({ activeTab, setActiveTab, online, onReset, resetting }: NavbarProps) {
  return (
    <header className="border-b border-[#1c2638] bg-[#06080e]/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand & System Status */}
        <div className="flex items-center space-x-4">
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/30 border border-cyan-500/40 flex items-center justify-center shadow-cyan-glow group-hover:border-cyan-400 transition-all duration-300">
              <Brain className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base tracking-wider text-white font-mono uppercase bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
                  TriageMind
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-500/30 flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></span>
                  <span>v2.4-SOC</span>
                </span>
              </div>
              <p className="text-[11px] text-gray-400 font-medium tracking-tight">
                AI-Powered SOC Intelligence
              </p>
            </div>
          </div>

          {/* Animated Operational Badge */}
          <div className="hidden lg:flex items-center space-x-2 px-2.5 py-1 rounded-full bg-[#0c101a] border border-[#1c2638] text-[11px] font-mono text-gray-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-semibold tracking-wide">SYSTEM OPERATIONAL</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center space-x-1 p-1 bg-[#0c101a] rounded-xl border border-[#1c2638]">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "dashboard"
                ? "bg-gradient-to-r from-cyan-950/80 to-blue-950/80 text-cyan-300 border border-cyan-500/40 shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#111827]"
            }`}
          >
            <Activity className={`w-3.5 h-3.5 ${activeTab === "dashboard" ? "text-cyan-400" : ""}`} />
            <span>Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab("alerts")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "alerts"
                ? "bg-gradient-to-r from-blue-950/80 to-indigo-950/80 text-blue-300 border border-blue-500/40 shadow-sm"
                : "text-gray-400 hover:text-gray-200 hover:bg-[#111827]"
            }`}
          >
            <Shield className={`w-3.5 h-3.5 ${activeTab === "alerts" ? "text-blue-400" : ""}`} />
            <span>Alert Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("memory")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "memory"
                ? "bg-gradient-to-r from-purple-950/80 to-fuchsia-950/80 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-gray-400 hover:text-purple-300 hover:bg-[#111827]"
            }`}
          >
            <Brain className={`w-3.5 h-3.5 ${activeTab === "memory" ? "text-purple-400" : ""}`} />
            <span>Memory Bank</span>
          </button>

          <button
            onClick={() => setActiveTab("learning")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 flex items-center space-x-2 ${
              activeTab === "learning"
                ? "bg-gradient-to-r from-amber-950/80 to-orange-950/80 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-gray-400 hover:text-amber-300 hover:bg-[#111827]"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "learning" ? "text-amber-400" : ""}`} />
            <span>Reflect & Learn</span>
          </button>
        </nav>

        {/* Right Status Badges & Reset Demo */}
        <div className="flex items-center space-x-3">
          {/* Agent Status */}
          <div className="hidden sm:flex items-center space-x-2 px-3 py-1 rounded-lg border border-[#1c2638] bg-[#0c101a]">
            <span
              className={`w-2 h-2 rounded-full ${
                online ? "bg-emerald-400 shadow-[0_0_8px_#10b981]" : "bg-red-400"
              }`}
            />
            <span className="text-xs font-mono text-gray-300">
              {online ? "Agent Online" : "Connecting..."}
            </span>
          </div>

          {/* Hindsight Status */}
          <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-lg border border-purple-900/40 bg-purple-950/30 text-purple-300 text-xs font-mono">
            <Radio className="w-3 h-3 text-purple-400 animate-pulse" />
            <span>Hindsight Active</span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onReset}
            disabled={resetting}
            title="Reset bank to baseline seed memories"
            className="flex items-center space-x-1.5 text-xs text-gray-300 hover:text-white px-3 py-1.5 rounded-lg bg-[#111827] hover:bg-[#1a253a] border border-[#1c2638] hover:border-gray-600 transition shadow-sm disabled:opacity-50 font-medium"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin text-purple-400" : "text-gray-400"}`} />
            <span className="hidden sm:inline">{resetting ? "Resetting..." : "Reset Demo"}</span>
          </button>

          {/* User Profile Pill & Dropdown */}
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}

function UserProfileMenu() {
  const { user, signOutUser } = useAuth();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) {
    return (
      <button
        onClick={() => router.push("/login")}
        className="px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black text-xs font-mono font-bold transition flex items-center space-x-1"
      >
        <User className="w-3.5 h-3.5" />
        <span>Sign In</span>
      </button>
    );
  }

  // Calculate initials (e.g. "Sri Vardhan" -> "SV" or "sri@..." -> "S")
  const getInitials = (name?: string | null, email?: string | null) => {
    if (name && name.trim()) {
      const parts = name.trim().split(/\s+/);
      if (parts.length >= 2) {
        return (parts[0][0] + parts[1][0]).toUpperCase();
      }
      return name.slice(0, 2).toUpperCase();
    }
    if (email) {
      return email.slice(0, 2).toUpperCase();
    }
    return "AN";
  };

  const initials = getInitials(user.displayName, user.email);
  const displayName = user.displayName || user.email?.split("@")[0] || "Analyst";

  const handleSignOut = async () => {
    await signOutUser();
    setIsOpen(false);
    router.push("/login");
  };

  return (
    <div className="relative" ref={menuRef}>
      {/* Pill Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 p-1 pl-1.5 pr-2.5 rounded-xl bg-[#0c101a] hover:bg-[#141b29] border border-[#1c2638] hover:border-cyan-500/40 transition group"
      >
        {user.photoURL ? (
          <img
            src={user.photoURL}
            alt={displayName}
            className="w-7 h-7 rounded-lg object-cover border border-cyan-500/40"
          />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-[11px] font-mono font-bold text-white shadow-cyan-glow">
            {initials}
          </div>
        )}
        <div className="text-left hidden sm:block max-w-[120px]">
          <span className="text-xs font-mono font-semibold text-white truncate block leading-tight">
            {displayName}
          </span>
          <span className="text-[10px] font-mono text-cyan-400 block leading-tight uppercase">
            {user.providerId === "google.com" ? "Google" : user.providerId === "phone" ? "Phone" : "Analyst"}
          </span>
        </div>
        <ChevronDown className="w-3.5 h-3.5 text-gray-400 group-hover:text-white transition-transform" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#080c14] border border-[#1c2638] shadow-2xl py-2 z-50 divide-y divide-[#1c2638] font-mono text-xs">
          {/* User Header */}
          <div className="px-4 py-3 space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white truncate text-sm">
                {displayName}
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] bg-cyan-950 text-cyan-300 border border-cyan-800">
                ACTIVE
              </span>
            </div>
            <p className="text-[11px] text-gray-400 truncate">
              {user.email || user.phoneNumber || "Verified Session"}
            </p>
            <div className="text-[10px] text-gray-500 pt-1">
              UID: <span className="text-gray-400">{user.uid.slice(0, 12)}...</span>
            </div>
          </div>

          {/* Menu Items */}
          <div className="py-1">
            <button
              onClick={() => {
                setIsOpen(false);
                setShowProfileModal(true);
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-[#111827] flex items-center space-x-2 transition"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>My Profile</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                alert("Account Settings: All telemetry streams and notification channels are active.");
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-[#111827] flex items-center space-x-2 transition"
            >
              <Settings className="w-3.5 h-3.5 text-gray-400" />
              <span>Account Settings</span>
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                alert("Security Status: Deterministic Guardrails (7 Rules) enforced. Mutual auth active.");
              }}
              className="w-full px-4 py-2 text-left text-gray-300 hover:text-white hover:bg-[#111827] flex items-center space-x-2 transition"
            >
              <Key className="w-3.5 h-3.5 text-purple-400" />
              <span>Security & Policies</span>
            </button>
          </div>

          {/* Sign Out */}
          <div className="py-1">
            <button
              onClick={handleSignOut}
              className="w-full px-4 py-2 text-left text-red-400 hover:text-red-300 hover:bg-red-950/30 flex items-center space-x-2 transition font-semibold"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Details Modal */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="cyber-card rounded-2xl max-w-md w-full border border-[#1c2638] p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4 text-cyan-400" />
                <h3 className="font-mono text-sm font-bold text-white uppercase">
                  SOC Analyst Credential Record
                </h3>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="text-gray-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-[#06080e] border border-[#1c2638]">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="" className="w-12 h-12 rounded-xl object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-lg font-bold text-white">
                    {initials}
                  </div>
                )}
                <div>
                  <div className="font-bold text-white text-sm">{displayName}</div>
                  <div className="text-gray-400 text-[11px]">{user.email || user.phoneNumber}</div>
                  <div className="text-[10px] text-cyan-400 mt-0.5">Role: SOC Investigation Lead</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638] space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">FIREBASE UID:</span>
                  <span className="text-gray-300 font-mono select-all">{user.uid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">AUTH PROVIDER:</span>
                  <span className="text-purple-300 font-bold uppercase">{user.providerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SESSION STATUS:</span>
                  <span className="text-emerald-400 font-bold">AUTHENTICATED</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">MEMORY CLEARANCE:</span>
                  <span className="text-cyan-300">Level 4 (Hindsight Read/Write)</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 rounded-xl bg-[#1c2638] hover:bg-[#25334d] text-white text-xs font-mono font-bold transition"
              >
                Close Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

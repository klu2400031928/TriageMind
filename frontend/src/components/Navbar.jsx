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

export function Navbar({ activeTab, setActiveTab, online, onReset, resetting }) {
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
                ? "bg-gradient-to-r from-emerald-950/80 to-teal-950/80 text-emerald-300 border border-emerald-500/40 shadow-sm"
                : "text-gray-400 hover:text-emerald-300 hover:bg-[#111827]"
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${activeTab === "learning" ? "text-emerald-400" : ""}`} />
            <span>Reflect & Learn</span>
          </button>
        </nav>

        {/* Right Actions: Health + Reset Demo + User Menu */}
        <div className="flex items-center space-x-3">
          {/* Backend Status Dot */}
          <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[#0c101a] border border-[#1c2638] text-xs">
            <span
              className={`w-2 h-2 rounded-full ${
                online ? "bg-emerald-400 animate-pulse" : "bg-red-500"
              }`}
            />
            <span className="text-gray-400 font-mono text-[11px] hidden sm:inline">
              {online ? "HINDSIGHT CONNECTED" : "BACKEND OFFLINE"}
            </span>
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onReset}
            disabled={resetting}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold bg-[#111827] hover:bg-[#1a2333] text-gray-300 hover:text-white border border-[#1c2638] hover:border-gray-600 transition disabled:opacity-50"
            title="Wipe and re-seed demo memory bank to initial state"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${resetting ? "animate-spin text-cyan-400" : ""}`} />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* User Profile Menu with Dropdown */}
          <UserProfileMenu />
        </div>
      </div>
    </header>
  );
}

function UserProfileMenu() {
  const router = useRouter();
  const { user, signOutUser, isFirebaseConfigured } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOutUser();
    router.push("/login");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "SOC Analyst";
  const initials = displayName
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SA";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        className="flex items-center space-x-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#0c101a] hover:bg-[#131b2c] border border-[#1c2638] hover:border-cyan-500/40 transition group"
      >
        <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-500/40 flex items-center justify-center text-[11px] font-mono font-bold text-cyan-300">
          {initials}
        </div>
        <div className="text-left hidden md:block">
          <div className="text-xs font-semibold text-gray-200 leading-tight flex items-center space-x-1">
            <span className="max-w-[100px] truncate">{displayName}</span>
          </div>
          <div className="text-[10px] font-mono text-cyan-400/80 leading-none">
            {user?.providerId === "demo-mode" ? "Demo Lead" : "Lead Analyst"}
          </div>
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${menuOpen ? "rotate-180" : ""}`} />
      </button>

      {/* Dropdown Menu */}
      {menuOpen && (
        <div className="absolute right-0 mt-2 w-64 rounded-xl bg-[#0c101a] border border-[#1c2638] shadow-2xl z-50 py-2 divide-y divide-[#162033] animate-in fade-in slide-in-from-top-2 duration-150">
          {/* User summary header */}
          <div className="px-4 py-3">
            <div className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500/30 to-purple-600/30 border border-cyan-500/40 flex items-center justify-center text-xs font-mono font-bold text-cyan-300">
                {initials}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">{displayName}</p>
                <p className="text-[11px] text-gray-400 font-mono truncate">{user?.email || "No email"}</p>
                {user?.phoneNumber && (
                  <p className="text-[10px] text-cyan-400 font-mono truncate">{user.phoneNumber}</p>
                )}
              </div>
            </div>
            <div className="mt-2.5 flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                {user?.providerId === "demo-mode"
                  ? "DEMO SESSION"
                  : user?.providerId === "google.com"
                  ? "GOOGLE AUTH"
                  : user?.providerId === "phone"
                  ? "PHONE OTP"
                  : "EMAIL/PASSWORD"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950/80 text-emerald-300 border border-emerald-800/60 flex items-center space-x-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span>ACTIVE</span>
              </span>
            </div>
          </div>

          {/* Action links */}
          <div className="py-1">
            <button
              onClick={() => {
                setMenuOpen(false);
                setProfileModalOpen(true);
              }}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#111827] transition text-left"
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span>My Profile & Clearance</span>
            </button>
            <button
              onClick={() => {
                setMenuOpen(false);
                alert("Station security configurations are managed centrally via backend policy.");
              }}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-gray-300 hover:text-white hover:bg-[#111827] transition text-left"
            >
              <Settings className="w-3.5 h-3.5 text-gray-400" />
              <span>SOC Preferences</span>
            </button>
          </div>

          {/* Logout */}
          <div className="pt-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-red-400 hover:text-red-300 hover:bg-red-950/30 transition text-left"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Station</span>
            </button>
          </div>
        </div>
      )}

      {/* Profile Details Dialog */}
      {profileModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0c101a] border border-[#1c2638] rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#1c2638] pb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center font-mono font-bold text-cyan-300">
                  {initials}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white font-mono uppercase">
                    Security Clearance Profile
                  </h3>
                  <p className="text-xs text-gray-400 font-mono">TriageMind SOC Command Station</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="text-gray-400 hover:text-white text-xs font-mono px-2 py-1 rounded bg-[#111827] border border-[#1c2638]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638] space-y-1.5">
                <span className="text-gray-500 text-[10px] uppercase">Authenticated Identity</span>
                <p className="text-white font-semibold text-sm">{displayName}</p>
                <p className="text-gray-400">{user?.email || "No email associated"}</p>
                {user?.phoneNumber && <p className="text-cyan-400">{user.phoneNumber}</p>}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638]">
                  <span className="text-gray-500 text-[10px] uppercase block">SOC Role</span>
                  <span className="text-cyan-300 font-semibold">Tier-3 Lead Analyst</span>
                </div>
                <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638]">
                  <span className="text-gray-500 text-[10px] uppercase block">Memory Clearance</span>
                  <span className="text-purple-300 font-semibold">Read / Write / Retain</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638] space-y-1">
                <span className="text-gray-500 text-[10px] uppercase block">Assigned Memory Bank</span>
                <div className="flex items-center justify-between">
                  <span className="text-white">triagemind-demo</span>
                  <span className="text-emerald-400 text-[10px]">ACTIVE & SYNCED</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#06080e] border border-[#1c2638] space-y-1">
                <span className="text-gray-500 text-[10px] uppercase block">UID & Provider</span>
                <p className="text-gray-400 break-all text-[11px]">{user?.uid}</p>
                <p className="text-cyan-400 text-[10px]">Provider: {user?.providerId}</p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setProfileModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-mono bg-cyan-600 hover:bg-cyan-500 text-white font-semibold shadow-cyan-glow transition"
              >
                Close Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

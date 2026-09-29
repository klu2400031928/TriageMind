"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DemoBar } from "@/components/DemoBar";
import { DashboardView } from "@/components/DashboardView";
import { AlertQueueView } from "@/components/AlertQueueView";
import { MemoryBankView } from "@/components/MemoryBankView";
import { LearningView } from "@/components/LearningView";
import { AlertDetailModal } from "@/components/AlertDetailModal";
import { getAlerts, getHealth, getLearningStats, resetDemo } from "@/lib/api";

export function CommandCenter({ initialTab = "dashboard" }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [alerts, setAlerts] = useState([]);
  const [stats, setStats] = useState(null);
  const [online, setOnline] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [resetting, setResetting] = useState(false);
  const [activeDemoStage, setActiveDemoStage] = useState(undefined);

  useEffect(() => {
    setActiveTab(initialTab);
  }, [initialTab]);

  useEffect(() => {
    fetchInitialData();
    const interval = setInterval(fetchInitialData, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchInitialData() {
    try {
      const [h, a, s] = await Promise.all([
        getHealth(),
        getAlerts().catch(() => ({ alerts: [], total: 0 })),
        getLearningStats().catch(() => null),
      ]);
      setOnline(h.status === "ok");
      if (a.alerts) setAlerts(a.alerts);
      if (s) setStats(s);
    } catch (err) {
      setOnline(false);
    }
  }

  async function handleResetDemo() {
    if (!confirm("Reset memory bank to baseline seed state? (Takes ~15-20s)")) return;
    setResetting(true);
    try {
      await resetDemo();
      await fetchInitialData();
      alert("✅ Demo bank reset to clean baseline!");
    } catch (err) {
      alert("Failed to reset demo bank.");
    } finally {
      setResetting(false);
    }
  }

  // Demo Stage quick runners
  async function handleRunStage(stage) {
    setActiveDemoStage(stage);
    if (stage === 1) {
      // Stage 1: Cold start (Unknown Nessus scanner IP 10.20.5.44)
      const stage1Alert = {
        id: "DEMO-STAGE1",
        timestamp: "2026-09-28T02:00:00Z",
        source_ip: "10.20.5.44",
        source_port: 56000,
        destination_ip: "10.10.1.10",
        destination_port: 22,
        hostname: "web-prod-03",
        username: null,
        asset: "web-prod-03",
        environment: "production",
        severity: "MEDIUM",
        event_type: "SSH_SCAN",
        process: null,
        tool: "Nessus",
        aws_region: null,
        cloudtrail_event: null,
        description: "SSH scanning from 10.20.5.44 to web-prod-03 port 22. Pattern resembles Nessus scanner. Cold start: verify if source IP is authorized.",
      };
      setSelectedAlert(stage1Alert);
    } else if (stage === 2) {
      // Stage 2: Analyst Teaches the system
      const stage2Alert = {
        id: "DEMO-STAGE1",
        timestamp: "2026-09-28T02:00:00Z",
        source_ip: "10.20.5.44",
        source_port: 56000,
        destination_ip: "10.10.1.10",
        destination_port: 22,
        hostname: "web-prod-03",
        username: null,
        asset: "web-prod-03",
        environment: "production",
        severity: "MEDIUM",
        event_type: "SSH_SCAN",
        process: null,
        tool: "Nessus",
        aws_region: null,
        cloudtrail_event: null,
        description: "SSH scanning from 10.20.5.44 to web-prod-03 port 22. Scheduled Monday Nessus scan.",
      };
      setSelectedAlert(stage2Alert);
    } else if (stage === 3) {
      // Stage 3: Auto-close after learning
      const stage3Alert = {
        id: "DEMO-STAGE2",
        timestamp: "2026-09-28T02:00:00Z",
        source_ip: "10.20.5.44",
        source_port: 56000,
        destination_ip: "10.10.1.10",
        destination_port: 22,
        hostname: "web-prod-03",
        username: null,
        asset: "web-prod-03",
        environment: "production",
        severity: "MEDIUM",
        event_type: "SSH_SCAN",
        process: null,
        tool: "Nessus",
        aws_region: null,
        cloudtrail_event: null,
        description: "Scheduled Monday Nessus scan from 10.20.5.44 to web-prod-03 port 22.",
      };
      setSelectedAlert(stage3Alert);
    } else if (stage === 4) {
      // Stage 4: Trap Alert (lookalike external IP + successful login)
      const stage4Alert = {
        id: "DEMO-STAGE3",
        timestamp: "2026-09-28T03:14:00Z",
        source_ip: "185.23.42.77",
        source_port: 48220,
        destination_ip: "10.10.1.10",
        destination_port: 22,
        hostname: "web-prod-03",
        username: "deploy",
        asset: "web-prod-03",
        environment: "production",
        severity: "MEDIUM",
        event_type: "SSH_SCAN",
        process: null,
        tool: "Nessus",
        aws_region: null,
        cloudtrail_event: null,
        description: "120 rapid connection attempts to port 22 from external IP 185.23.42.77, followed by a successful authentication event at 03:14 UTC.",
      };
      setSelectedAlert(stage4Alert);
    }
  }

  function handleAlertUpdated(updated) {
    setAlerts((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
    if (selectedAlert && selectedAlert.id === updated.id) {
      setSelectedAlert(updated);
    }
    // Refresh stats
    getLearningStats().then(setStats).catch(() => {});
  }

  return (
    <div className="min-h-screen bg-[#06080e] text-gray-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        online={online}
        onReset={handleResetDemo}
        resetting={resetting}
      />

      {/* Guided 4-Step Interactive Demo Bar */}
      <DemoBar
        onRunStage={handleRunStage}
        activeStage={activeDemoStage}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === "dashboard" && (
          <DashboardView
            alerts={alerts}
            stats={stats}
            onSelectAlert={setSelectedAlert}
            onNavigateTab={setActiveTab}
            onRunDemo={() => handleRunStage(1)}
          />
        )}

        {activeTab === "alerts" && (
          <AlertQueueView
            alerts={alerts}
            onSelectAlert={setSelectedAlert}
          />
        )}

        {activeTab === "memory" && (
          <MemoryBankView />
        )}

        {activeTab === "learning" && (
          <LearningView />
        )}
      </main>

      {/* Slide-over / Modal for Alert Inspection & Analyst Triage */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAlertUpdated={handleAlertUpdated}
        />
      )}
    </div>
  );
}

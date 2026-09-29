"use client";

import React, { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { DemoBar } from "@/components/DemoBar";
import { DashboardView } from "@/components/DashboardView";
import { AlertQueueView } from "@/components/AlertQueueView";
import { MemoryBankView } from "@/components/MemoryBankView";
import { LearningView } from "@/components/LearningView";
import { AlertDetailModal } from "@/components/AlertDetailModal";
import { Alert, LearningStats } from "@/types";
import { getAlerts, getHealth, getLearningStats, resetDemo } from "@/lib/api";

interface CommandCenterProps {
  initialTab?: "dashboard" | "alerts" | "memory" | "learning";
}

export function CommandCenter({ initialTab = "dashboard" }: CommandCenterProps) {
  const [activeTab, setActiveTab] = useState<"dashboard" | "alerts" | "memory" | "learning">(initialTab);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [stats, setStats] = useState<LearningStats | null>(null);
  const [online, setOnline] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [resetting, setResetting] = useState(false);
  const [activeDemoStage, setActiveDemoStage] = useState<number | undefined>();

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
  async function handleRunStage(stage: 1 | 2 | 3 | 4) {
    setActiveDemoStage(stage);
    if (stage === 1) {
      // Stage 1: Cold start (Unknown Nessus scanner IP 10.20.5.44)
      const stage1Alert: Alert = {
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
      const stage2Alert: Alert = {
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
        description: "SSH scanning from 10.20.5.44 to web-prod-03 port 22. Cold start alert ready for analyst override: '10.20.5.44 is authorized Nessus scanner every Monday 02:00 UTC.'",
      };
      setSelectedAlert(stage2Alert);
    } else if (stage === 3) {
      // Stage 3: Adaptive triage (Recalls newly learned memory -> AUTO_CLOSE)
      const stage3Alert: Alert = {
        id: "DEMO-STAGE2",
        timestamp: "2026-10-05T02:00:00Z",
        source_ip: "10.20.5.44",
        source_port: 56100,
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
        description: "SSH scanning from 10.20.5.44 to web-prod-03 port 22. 47 connection attempts in 5 minutes. Nessus scanner fingerprint detected.",
      };
      setSelectedAlert(stage3Alert);
    } else if (stage === 4) {
      // Stage 4: Trap Alert (External lookalike attack with successful login)
      const stage4Alert: Alert = {
        id: "DEMO-STAGE3",
        timestamp: "2026-10-05T03:14:00Z",
        source_ip: "185.23.42.77",
        source_port: 62000,
        destination_ip: "10.10.1.10",
        destination_port: 22,
        hostname: "web-prod-03",
        username: null,
        asset: "web-prod-03",
        environment: "production",
        severity: "HIGH",
        event_type: "SSH_SCAN",
        process: null,
        tool: "Splunk",
        aws_region: null,
        cloudtrail_event: null,
        description: "SSH scanning from external IP 185.23.42.77 to production web-prod-03 port 22. 120 rapid connection attempts followed by a SUCCESSFUL SSH authentication. Resembles scanner activity but originates from unauthorized external IP.",
      };
      setSelectedAlert(stage4Alert);
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#06080e] text-white">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        online={online}
        onReset={handleResetDemo}
        resetting={resetting}
      />

      <DemoBar
        onRunStage={handleRunStage}
        activeStage={activeDemoStage}
      />

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

        {activeTab === "memory" && <MemoryBankView />}

        {activeTab === "learning" && <LearningView />}
      </main>

      {/* Alert Detail Modal */}
      {selectedAlert && (
        <AlertDetailModal
          alert={selectedAlert}
          onClose={() => setSelectedAlert(null)}
          onAlertUpdated={(updated) => {
            setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
            getLearningStats().then((s) => {
              if (s) setStats(s);
            }).catch(() => {});
          }}
        />
      )}
    </div>
  );
}

"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandCenter } from "@/components/CommandCenter";

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <CommandCenter initialTab="dashboard" />
    </ProtectedRoute>
  );
}

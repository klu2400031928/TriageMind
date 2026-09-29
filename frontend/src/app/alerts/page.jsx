"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandCenter } from "@/components/CommandCenter";

export default function AlertsPage() {
  return (
    <ProtectedRoute>
      <CommandCenter initialTab="alerts" />
    </ProtectedRoute>
  );
}

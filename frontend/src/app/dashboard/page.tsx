"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandCenter } from "@/components/CommandCenter";

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <CommandCenter initialTab="dashboard" />
    </ProtectedRoute>
  );
}

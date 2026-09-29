"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandCenter } from "@/components/CommandCenter";

export default function MemoryPage() {
  return (
    <ProtectedRoute>
      <CommandCenter initialTab="memory" />
    </ProtectedRoute>
  );
}

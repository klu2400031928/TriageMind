"use client";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandCenter } from "@/components/CommandCenter";

export default function ReflectPage() {
  return (
    <ProtectedRoute>
      <CommandCenter initialTab="learning" />
    </ProtectedRoute>
  );
}

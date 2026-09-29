"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CommandCenter } from "@/components/CommandCenter";

export default function Home() {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) {
        router.push("/login");
      } else {
        router.push("/dashboard");
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <ProtectedRoute>
      <CommandCenter initialTab="dashboard" />
    </ProtectedRoute>
  );
}

"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export function ProtectedRoute({ children }) {
  const { loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080e] flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">
            VERIFYING SOC AUTHORIZATION...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Return null while redirect is firing — strictly prevents flashing protected UI
    return null;
  }

  return <>{children}</>;
}

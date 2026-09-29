"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import {
  Shield,
  Brain,
  Lock,
  ArrowRight,
  Phone,
  Mail,
  KeyRound,
  User,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Terminal,
} from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const {
    loading,
    isAuthenticated,
    isFirebaseConfigured,
    signUpWithEmail,
    signInWithGoogle,
    loginAsDemoAnalyst,
  } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  // Password validation rules
  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasLowercase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasLowercase && hasNumber;

  const strengthScore = [hasMinLength, hasUppercase, hasLowercase, hasNumber].filter(Boolean).length;
  const strengthColor =
    strengthScore <= 1
      ? "bg-red-500"
      : strengthScore <= 3
      ? "bg-yellow-500"
      : "bg-emerald-500";
  const strengthLabel =
    strengthScore <= 1 ? "WEAK" : strengthScore <= 3 ? "FAIR" : "STRONG";

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setErrorMsg("Password does not meet all required security criteria.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await signUpWithEmail(fullName, email, password);
      setSuccessMsg("✓ Account created successfully! Provisioning SOC command station...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      console.error("Sign-up error:", err);
      let msg = "Failed to create account. Please check inputs and try again.";
      if (err.code === "auth/email-already-in-use") {
        msg = "An account already exists with this email. Try signing in instead.";
      } else if (err.code === "auth/invalid-email") {
        msg = "Invalid email format.";
      } else if (err.code === "auth/weak-password") {
        msg = "Password is too weak for Firebase security policies.";
      } else if (!isFirebaseConfigured) {
        msg = "Firebase Authentication is not configured in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await signInWithGoogle();
      setSuccessMsg("✓ Google account connected. Initializing workspace...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      console.error("Google auth error:", err);
      setErrorMsg("Google sign-in failed. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080e] flex items-center justify-center text-white">
        <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#06080e] text-white selection:bg-cyan-500/30">
      {/* LEFT PANEL: BRAND & ARCHITECTURE STORY */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#080d1a] via-[#090f1f] to-[#04060a] border-r border-[#1c2638] overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-cyan-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight font-mono text-white flex items-center space-x-2">
              <span>TRIAGEMIND</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                PROVISION
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono tracking-wider uppercase">
              AUTONOMOUS SOC INTELLIGENCE
            </p>
          </div>
        </div>

        <div className="relative z-10 my-auto py-10 space-y-6 max-w-lg">
          <div>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase block mb-2">
              SECURITY OPERATIONS WORKFORCE
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Build a smarter SOC with <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-purple-400">institutional memory</span>.
            </h1>
            <p className="text-sm text-gray-400 mt-3 leading-relaxed">
              Join security operations teams who use TriageMind to transform repetitive alert triage into permanent, queryable organizational knowledge.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-4">
            <div className="p-4 rounded-xl bg-[#0c121e]/80 border border-[#1c2638] space-y-1">
              <div className="text-xl font-extrabold text-cyan-400 font-mono">0.85+</div>
              <div className="text-xs font-bold text-white">Confidence Gate</div>
              <p className="text-[10px] text-gray-400">Auto-close is only permitted when high confidence is established.</p>
            </div>
            <div className="p-4 rounded-xl bg-[#0c121e]/80 border border-[#1c2638] space-y-1">
              <div className="text-xl font-extrabold text-purple-400 font-mono">100%</div>
              <div className="text-xs font-bold text-white">Auditable Memory</div>
              <p className="text-[10px] text-gray-400">Every decision traces back to explicit Hindsight memory IDs.</p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 font-mono pt-4 border-t border-[#1c2638]">
          <span>SOC TEAM ONBOARDING</span>
          <span>ROLE-BASED GOVERNANCE</span>
        </div>
      </div>

      {/* RIGHT PANEL: SIGNUP CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative overflow-y-auto">
        <div className="absolute inset-0 bg-[radial-gradient(#1c2638_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6 my-auto">
          {!isFirebaseConfigured && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-500/40 p-4 space-y-2">
              <div className="flex items-start space-x-2 text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="text-xs">
                  <span className="font-bold block">Firebase Console Config Needed</span>
                  To enable production user registration, configure Firebase keys in <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">frontend/.env.local</code>.
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  loginAsDemoAnalyst();
                  router.push("/dashboard");
                }}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>⚡ Quick Access: Enter as Demo Analyst Lead</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          <div className="cyber-card rounded-2xl p-7 border border-[#1c2638] shadow-2xl backdrop-blur-md space-y-5">
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono mb-2">
                <Terminal className="w-3 h-3" />
                <span>NEW ANALYST PROVISIONING</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                CREATE YOUR TRIAGEMIND ACCOUNT
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Build a smarter security operation with institutional memory.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-lg bg-red-950/70 border border-red-500/50 flex items-start space-x-2.5 text-red-200 text-xs">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{errorMsg}</span>
              </div>
            )}
            {successMsg && (
              <div className="p-3 rounded-lg bg-emerald-950/70 border border-emerald-500/50 flex items-start space-x-2.5 text-emerald-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span className="leading-snug">{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-mono text-gray-300 block mb-1 uppercase tracking-wider">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="Sri Vardhan"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-300 block mb-1 uppercase tracking-wider">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="sri.vardhan@enterprise.sec"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-300 block mb-1 uppercase tracking-wider">
                  Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>

                {/* Password Strength Indicator */}
                {password.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    <div className="flex items-center justify-between text-[10px] font-mono">
                      <span className="text-gray-400">STRENGTH:</span>
                      <span className={strengthScore === 4 ? "text-emerald-400 font-bold" : "text-yellow-400"}>
                        {strengthLabel}
                      </span>
                    </div>
                    <div className="h-1 w-full bg-[#1c2638] rounded-full overflow-hidden">
                      <div
                        className={`h-full ${strengthColor} transition-all duration-300`}
                        style={{ width: `${(strengthScore / 4) * 100}%` }}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-1 text-[10px] font-mono pt-1 text-gray-400">
                      <span className={hasMinLength ? "text-emerald-400" : "text-gray-500"}>
                        {hasMinLength ? "✓" : "○"} 8+ Characters
                      </span>
                      <span className={hasUppercase ? "text-emerald-400" : "text-gray-500"}>
                        {hasUppercase ? "✓" : "○"} Uppercase (A-Z)
                      </span>
                      <span className={hasLowercase ? "text-emerald-400" : "text-gray-500"}>
                        {hasLowercase ? "✓" : "○"} Lowercase (a-z)
                      </span>
                      <span className={hasNumber ? "text-emerald-400" : "text-gray-500"}>
                        {hasNumber ? "✓" : "○"} Number (0-9)
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[11px] font-mono text-gray-300 block mb-1 uppercase tracking-wider">
                  Confirm Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs tracking-wider uppercase transition shadow-cyan-glow flex items-center justify-center space-x-2 disabled:opacity-60"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    <span>CREATING ACCOUNT...</span>
                  </>
                ) : (
                  <>
                    <span>CREATE ACCOUNT</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-[#1c2638] w-full" />
              <span className="bg-[#0b0f17] px-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest absolute">
                OR
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={submitting}
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#06080e] hover:bg-[#111827] border border-[#1c2638] text-xs font-mono font-medium text-gray-200 transition"
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.14z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.06-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.06 3.15c.94-2.83 3.58-4.98 6.68-4.98z"/>
                </svg>
                <span>Google</span>
              </button>

              <Link
                href="/login"
                className="flex items-center justify-center space-x-2 py-2 px-3 rounded-xl bg-[#06080e] hover:bg-[#111827] border border-[#1c2638] text-xs font-mono font-medium text-gray-200 transition"
              >
                <Phone className="w-3.5 h-3.5 text-purple-400" />
                <span>Phone OTP</span>
              </Link>
            </div>

            <div className="pt-2 text-center text-xs text-gray-400 font-sans border-t border-[#1c2638]">
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-cyan-400 hover:text-cyan-300 font-mono font-semibold transition"
              >
                Sign in →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

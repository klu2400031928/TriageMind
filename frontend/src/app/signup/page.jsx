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
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

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

  const handleSignUp = async (e) => {
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
    } catch (err) {
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
    setSuccessMsg(null);
    try {
      await signInWithGoogle();
      setSuccessMsg("✓ Google identity provisioned! Redirecting to SOC Command Center...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      console.error("Google sign-up error:", err);
      let msg = "Google signup was canceled or failed.";
      if (!isFirebaseConfigured) {
        msg = "Firebase Authentication is not configured in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoBypass = () => {
    loginAsDemoAnalyst();
    setSuccessMsg("✓ Entering SOC Command Center as Lead Analyst (Demo Mode)...");
    setTimeout(() => router.push("/dashboard"), 400);
  };

  return (
    <div className="min-h-screen bg-[#06080e] flex flex-col justify-center selection:bg-cyan-500/30 selection:text-cyan-200">
      <div className="max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8 space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
            <span>SOC ANALYST ONBOARDING</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white font-mono uppercase tracking-tight">
            Provision TriageMind Clearance
          </h1>
          <p className="text-xs text-gray-400 font-mono max-w-md mx-auto">
            Create an authenticated SOC operator profile with institutional memory access.
          </p>
        </div>

        <div className="cyber-card rounded-2xl border border-[#1c2638] p-6 sm:p-8 shadow-2xl relative max-w-xl mx-auto">
          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-950/70 border border-red-500/60 text-red-300 text-xs font-mono flex items-start space-x-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{errorMsg}</div>
            </div>
          )}

          {successMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/60 text-emerald-300 text-xs font-mono flex items-start space-x-2.5 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 leading-relaxed">{successMsg}</div>
            </div>
          )}

          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">
                Full Name / Clearance Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Priya Nair"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-mono text-gray-300 block mb-1">
                SOC Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="analyst@triagemind.sec"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/50"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-gray-300 block mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/50"
                  />
                </div>
              </div>
            </div>

            {/* Password Security Meter */}
            {password.length > 0 && (
              <div className="p-3 rounded-xl bg-[#090d16] border border-[#1c2638] space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-gray-400">PASSWORD POLICY:</span>
                  <span className="font-bold text-gray-300">{strengthLabel}</span>
                </div>
                <div className="w-full bg-[#111827] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${strengthColor} h-1.5 rounded-full transition-all duration-300`}
                    style={{ width: `${(strengthScore / 4) * 100}%` }}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1 text-[10px] text-gray-400">
                  <span className={hasMinLength ? "text-emerald-400" : ""}>
                    {hasMinLength ? "✓" : "○"} 8+ Characters
                  </span>
                  <span className={hasUppercase ? "text-emerald-400" : ""}>
                    {hasUppercase ? "✓" : "○"} Uppercase (A-Z)
                  </span>
                  <span className={hasLowercase ? "text-emerald-400" : ""}>
                    {hasLowercase ? "✓" : "○"} Lowercase (a-z)
                  </span>
                  <span className={hasNumber ? "text-emerald-400" : ""}>
                    {hasNumber ? "✓" : "○"} Number (0-9)
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-glow transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              <span>REGISTER CLEARANCE PROFILE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Social Auth */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#1c2638]"></div>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-[#080c14] px-3 text-gray-500 font-mono">
                Or provision with federated identity
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogleSignUp}
            disabled={submitting}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-mono font-medium bg-[#0c101a] hover:bg-[#131b2b] text-gray-200 border border-[#1c2638] hover:border-gray-600 transition flex items-center justify-center space-x-3"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.34 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>Sign Up with Google Workspace</span>
          </button>

          {!isFirebaseConfigured && (
            <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
              <div className="flex items-center space-x-2 text-xs font-mono text-amber-300 font-bold">
                <Terminal className="w-3.5 h-3.5 text-amber-400" />
                <span>Demo Bypass Available</span>
              </div>
              <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                If Firebase credentials are not yet configured, bypass registration to explore all SOC Command Center features:
              </p>
              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black transition shadow-sm"
              >
                Enter SOC Command Center (Demo Lead)
              </button>
            </div>
          )}

          <div className="mt-6 text-center text-xs font-mono text-gray-400 border-t border-[#1c2638] pt-4">
            <span>Already have an authenticated profile? </span>
            <Link
              href="/login"
              className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 inline-flex items-center space-x-0.5"
            >
              <span>Sign In</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

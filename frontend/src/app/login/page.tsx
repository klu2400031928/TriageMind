"use client";

import React, { useState, useEffect, useRef } from "react";
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
  CheckCircle2,
  AlertCircle,
  Sparkles,
  RefreshCw,
  Terminal,
  Activity,
  Layers,
  ChevronRight,
  UserCheck,
} from "lucide-react";
import { ConfirmationResult } from "firebase/auth";

export default function LoginPage() {
  const router = useRouter();
  const {
    user,
    loading,
    isAuthenticated,
    isFirebaseConfigured,
    signInWithEmail,
    signInWithGoogle,
    setupRecaptcha,
    sendPhoneOtp,
    confirmPhoneOtp,
    resetPassword,
    loginAsDemoAnalyst,
  } = useAuth();

  // Mode: "email" | "phone" | "forgot"
  const [authMode, setAuthMode] = useState<"email" | "phone" | "forgot">("email");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone states
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState<1 | 2>(1);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Recaptcha container
  const recaptchaVerifierRef = useRef<any>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [loading, isAuthenticated, router]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await signInWithEmail(email, password);
      setSuccessMsg("✓ Authentication successful. Welcome back to TriageMind.");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      console.error("Sign-in error:", err);
      let msg = "Authentication failed. Please check your credentials and try again.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password. Please verify and try again.";
      } else if (err.code === "auth/user-not-found") {
        msg = "No TriageMind account found with this email.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Access temporarily blocked due to multiple failed login attempts. Try again later.";
      } else if (!isFirebaseConfigured) {
        msg = "Firebase Authentication is not configured in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await signInWithGoogle();
      setSuccessMsg("✓ Google authentication successful. Redirecting to SOC Command Center...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      let msg = "Google authentication failed. Please try again.";
      if (err.code === "auth/popup-blocked") {
        msg = "Popup blocked by browser. Please allow popups for this site.";
      } else if (err.code === "auth/popup-closed-by-user") {
        msg = "Google sign-in window was closed before completing.";
      } else if (err.code === "auth/account-exists-with-different-credential") {
        msg = "An account already exists with the same email address using a different sign-in method.";
      } else if (!isFirebaseConfigured) {
        msg = "Firebase configuration is not set up in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = phoneNumber.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 7) {
      setErrorMsg("Please enter a valid phone number.");
      return;
    }

    const fullPhone = `${countryCode}${cleanPhone}`;
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      if (!recaptchaVerifierRef.current) {
        recaptchaVerifierRef.current = setupRecaptcha("recaptcha-container");
      }
      const confirmation = await sendPhoneOtp(fullPhone, recaptchaVerifierRef.current);
      setConfirmationResult(confirmation);
      setPhoneStep(2);
      setResendCooldown(60);
      setSuccessMsg(`✓ Verification code sent to ${fullPhone}. Check your phone.`);
    } catch (err: any) {
      console.error("Phone OTP send error:", err);
      let msg = "Failed to send SMS code. Please verify the phone number format.";
      if (err.code === "auth/invalid-phone-number") {
        msg = "The format of the phone number provided is incorrect.";
      } else if (err.code === "auth/quota-exceeded") {
        msg = "SMS quota exceeded for this project. Please contact administrator.";
      } else if (!isFirebaseConfigured) {
        msg = "Firebase configuration is not set up in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
      // Reset recaptcha if failed
      if (recaptchaVerifierRef.current) {
        try {
          recaptchaVerifierRef.current.clear();
        } catch (e) {}
        recaptchaVerifierRef.current = null;
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyPhoneOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode || otpCode.length < 6) {
      setErrorMsg("Please enter the complete 6-digit verification code.");
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await confirmPhoneOtp(confirmationResult, otpCode);
      setSuccessMsg("✓ Phone verification successful! Redirecting to SOC Command Center...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err: any) {
      console.error("OTP verification error:", err);
      let msg = "Invalid verification code. Please check the 6-digit code and try again.";
      if (err.code === "auth/code-expired") {
        msg = "The SMS code has expired. Please request a new code.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      await resetPassword(email);
      setSuccessMsg("✓ Password reset email sent. Check your inbox to reset credentials.");
    } catch (err: any) {
      setErrorMsg("Failed to send reset email. Verify the email address.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoBypass = () => {
    loginAsDemoAnalyst();
    setSuccessMsg("✓ Signed in as Priya Nair (Demo SOC Lead).");
    setTimeout(() => router.push("/dashboard"), 400);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#06080e] flex items-center justify-center text-white">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs font-mono text-cyan-300 tracking-wider uppercase">
            INITIALIZING SECURITY CONTEXT...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#06080e] text-white selection:bg-cyan-500/30">
      {/* Hidden container for Firebase invisible reCAPTCHA */}
      <div id="recaptcha-container"></div>

      {/* LEFT PANEL: BRAND & ARCHITECTURE STORY (DESKTOP) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-between p-12 bg-gradient-to-br from-[#080d1a] via-[#090f1f] to-[#04060a] border-r border-[#1c2638] overflow-hidden">
        {/* Glow lights */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header */}
        <div className="relative z-10 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center shadow-cyan-glow">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight font-mono text-white flex items-center space-x-2">
              <span>TRIAGEMIND</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
                v2.4
              </span>
            </div>
            <p className="text-[11px] text-gray-400 font-mono tracking-wider uppercase">
              AUTONOMOUS SOC INTELLIGENCE
            </p>
          </div>
        </div>

        {/* Center Visual: The Cognitive SOC Pipeline */}
        <div className="relative z-10 my-auto py-10 space-y-8">
          <div>
            <span className="text-xs font-mono text-cyan-400 tracking-widest uppercase block mb-2">
              INSTITUTIONAL CYBERSECURITY CORE
            </span>
            <h1 className="text-3xl xl:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Security decisions that <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-300 to-purple-400">remember</span>.
            </h1>
            <p className="text-sm text-gray-400 mt-3 max-w-lg leading-relaxed">
              Every analyst override, scheduled scan whitelist, and forensic verification is permanently retained in Hindsight Cloud. Eliminating alert fatigue while keeping human safety guardrails inviolable.
            </p>
          </div>

          {/* Visual Architecture Flow */}
          <div className="space-y-2.5 max-w-md">
            {[
              { label: "SECURITY ALERT", desc: "Telemetry ingested from Suricata, Splunk & CloudTrail", color: "text-blue-400", border: "border-blue-500/30" },
              { label: "AI AGENT REASONING", desc: "Observable extraction & hypothesis formulation", color: "text-cyan-400", border: "border-cyan-500/30" },
              { label: "HINDSIGHT PERSISTENT MEMORY", desc: "Recalls verified analyst precedents & whitelists", color: "text-purple-400", border: "border-purple-500/40" },
              { label: "DETERMINISTIC GUARDRAILS", desc: "Immutable code safety layer blocks lookalike attacks", color: "text-amber-400", border: "border-amber-500/30" },
              { label: "GUARDED VERDICT", desc: "AUTO_CLOSE or NEEDS_HUMAN with validated reasoning", color: "text-emerald-400", border: "border-emerald-500/40" },
            ].map((step, idx) => (
              <div key={idx} className="relative">
                <div className={`p-3 rounded-lg bg-[#0c121e]/80 border ${step.border} flex items-center justify-between`}>
                  <div>
                    <div className={`text-[11px] font-mono font-bold ${step.color}`}>{step.label}</div>
                    <div className="text-[10px] text-gray-400">{step.desc}</div>
                  </div>
                  <span className="text-xs font-mono text-gray-600">0{idx + 1}</span>
                </div>
                {idx < 4 && (
                  <div className="w-0.5 h-2 bg-gradient-to-b from-gray-700 to-transparent mx-auto"></div>
                )}
              </div>
            ))}
          </div>

          {/* Live Telemetry Chips */}
          <div className="flex flex-wrap gap-2 pt-2">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>AGENT ONLINE</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-950/60 border border-purple-500/40 text-purple-300 text-xs font-mono">
              <Brain className="w-3 h-3 text-purple-400" />
              <span>HINDSIGHT ACTIVE</span>
            </span>
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
              <Lock className="w-3 h-3 text-cyan-400" />
              <span>GUARDRAILS ENFORCED</span>
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10 flex items-center justify-between text-xs text-gray-500 font-mono pt-4 border-t border-[#1c2638]">
          <span>PROTECTED ENTERPRISE SOC SYSTEM</span>
          <span>MUTUAL AUTHENTICATION</span>
        </div>
      </div>

      {/* RIGHT PANEL: AUTHENTICATION CARD */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative">
        {/* Subtle grid background */}
        <div className="absolute inset-0 bg-[radial-gradient(#1c2638_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />

        <div className="w-full max-w-md relative z-10 space-y-6">
          {/* Mobile Brand Header */}
          <div className="lg:hidden flex items-center space-x-3 mb-6">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-700 flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-extrabold font-mono text-white">TRIAGEMIND</div>
              <p className="text-[10px] text-gray-400 font-mono">AI-POWERED SOC INTELLIGENCE</p>
            </div>
          </div>

          {/* Unconfigured Firebase Notification Banner */}
          {!isFirebaseConfigured && (
            <div className="rounded-xl bg-amber-950/50 border border-amber-500/40 p-4 space-y-2">
              <div className="flex items-start space-x-2 text-amber-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                <div className="text-xs">
                  <span className="font-bold block">Firebase Console Config Needed</span>
                  To enable live production Google OAuth and Phone OTP, add your Firebase keys to <code className="bg-amber-900/60 px-1 py-0.5 rounded text-amber-200">frontend/.env.local</code>.
                </div>
              </div>
              <button
                type="button"
                onClick={handleDemoBypass}
                className="w-full py-1.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-black font-mono text-xs font-bold transition flex items-center justify-center space-x-1.5"
              >
                <span>⚡ Quick Access: Continue as Demo Analyst Lead</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Authentication Container */}
          <div className="cyber-card rounded-2xl p-7 border border-[#1c2638] shadow-2xl backdrop-blur-md space-y-6">
            {/* Header Titles */}
            <div>
              <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono mb-2">
                <Terminal className="w-3 h-3" />
                <span>COMMAND CENTER ACCESS</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                {authMode === "forgot" ? "Reset Credentials" : authMode === "phone" ? "Phone Verification" : "Welcome back"}
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                {authMode === "forgot"
                  ? "Enter your email to receive a secure recovery link."
                  : authMode === "phone"
                  ? "Authenticate via secure one-time SMS verification."
                  : "Sign in to continue to your security command center."}
              </p>
            </div>

            {/* Error & Success Feedback Banners */}
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

            {/* MODE 1: EMAIL SIGN IN */}
            {authMode === "email" && (
              <form onSubmit={handleEmailSignIn} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-gray-300 block mb-1.5 uppercase tracking-wider">
                    Analyst Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@enterprise.sec"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-[11px] font-mono text-gray-300 uppercase tracking-wider">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => setAuthMode("forgot")}
                      className="text-[11px] text-cyan-400 hover:text-cyan-300 font-mono transition"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs tracking-wider uppercase transition shadow-cyan-glow flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  {submitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      <span>AUTHENTICATING...</span>
                    </>
                  ) : (
                    <>
                      <span>SIGN IN</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* MODE 2: PHONE OTP AUTHENTICATION */}
            {authMode === "phone" && (
              <div className="space-y-4">
                {phoneStep === 1 ? (
                  <form onSubmit={handleSendPhoneOtp} className="space-y-4">
                    <div>
                      <label className="text-[11px] font-mono text-gray-300 block mb-1.5 uppercase tracking-wider">
                        Country Code & Phone Number
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={countryCode}
                          onChange={(e) => setCountryCode(e.target.value)}
                          className="w-20 bg-[#06080e] border border-[#1c2638] rounded-xl px-3 py-2.5 text-xs text-white font-mono text-center focus:outline-none focus:border-cyan-500"
                        />
                        <div className="relative flex-1">
                          <Phone className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                          <input
                            type="tel"
                            required
                            placeholder="9876543210"
                            value={phoneNumber}
                            onChange={(e) => setPhoneNumber(e.target.value)}
                            className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                          />
                        </div>
                      </div>
                      <p className="text-[10px] text-gray-500 mt-1 font-mono">
                        A 6-digit verification code will be sent via SMS.
                      </p>
                    </div>

                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-mono font-bold text-xs tracking-wider uppercase transition shadow-purple-glow flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>REQUESTING CODE...</span>
                        </>
                      ) : (
                        <>
                          <span>SEND OTP</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyPhoneOtp} className="space-y-4">
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <label className="text-[11px] font-mono text-gray-300 uppercase tracking-wider">
                          Enter 6-digit verification code
                        </label>
                        <button
                          type="button"
                          onClick={() => setPhoneStep(1)}
                          className="text-[10px] text-gray-400 hover:text-cyan-300 font-mono underline"
                        >
                          Change Number
                        </button>
                      </div>
                      <input
                        type="text"
                        maxLength={6}
                        required
                        placeholder="••••••"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                        className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl px-4 py-3 text-lg tracking-[0.5em] text-cyan-300 text-center font-mono placeholder-gray-600 focus:outline-none focus:border-cyan-500 transition"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={submitting || otpCode.length < 6}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-black font-mono font-bold text-xs tracking-wider uppercase transition shadow-emerald-glow flex items-center justify-center space-x-2 disabled:opacity-60"
                    >
                      {submitting ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          <span>VERIFYING OTP...</span>
                        </>
                      ) : (
                        <>
                          <span>VERIFY & CONTINUE</span>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>

                    <div className="text-center">
                      <button
                        type="button"
                        disabled={resendCooldown > 0 || submitting}
                        onClick={handleSendPhoneOtp}
                        className="text-[11px] font-mono text-gray-400 hover:text-cyan-300 disabled:opacity-40 transition"
                      >
                        {resendCooldown > 0 ? `Resend OTP in ${resendCooldown}s` : "Resend Code"}
                      </button>
                    </div>
                  </form>
                )}

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("email");
                      setPhoneStep(1);
                    }}
                    className="text-xs text-gray-400 hover:text-white font-mono transition"
                  >
                    ← Back to Email Sign In
                  </button>
                </div>
              </div>
            )}

            {/* MODE 3: FORGOT PASSWORD */}
            {authMode === "forgot" && (
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div>
                  <label className="text-[11px] font-mono text-gray-300 block mb-1.5 uppercase tracking-wider">
                    Registered Email
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      placeholder="analyst@enterprise.sec"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-[#06080e] border border-[#1c2638] rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500 font-mono transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-2.5 rounded-xl bg-[#1c2638] hover:bg-[#25334d] text-cyan-300 font-mono font-bold text-xs tracking-wider uppercase transition flex items-center justify-center space-x-2"
                >
                  {submitting ? "SENDING LINK..." : "SEND PASSWORD RESET LINK"}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("email")}
                    className="text-xs text-gray-400 hover:text-white font-mono transition"
                  >
                    ← Back to Sign In
                  </button>
                </div>
              </form>
            )}

            {/* SOCIAL / ALTERNATIVE PROVIDERS */}
            {authMode === "email" && (
              <>
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-[#1c2638] w-full" />
                  <span className="bg-[#0b0f17] px-3 text-[10px] font-mono text-gray-500 uppercase tracking-widest absolute">
                    OR
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={submitting}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#06080e] hover:bg-[#111827] border border-[#1c2638] hover:border-gray-600 text-xs font-mono font-medium text-gray-200 transition disabled:opacity-60"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.9c2.28-2.1 3.64-5.2 3.64-9.14z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.9-3.05c-1.08.72-2.45 1.16-4.03 1.16-3.1 0-5.74-2.1-6.68-4.93H1.26v3.15C3.25 21.36 7.34 24 12 24z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.32 14.27c-.24-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.06-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.34 0 3.25 2.64 1.26 6.58l4.06 3.15c.94-2.83 3.58-4.98 6.68-4.98z"
                      />
                    </svg>
                    <span>Google</span>
                  </button>

                  {/* Continue with Phone Button */}
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("phone");
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-[#06080e] hover:bg-[#111827] border border-[#1c2638] hover:border-gray-600 text-xs font-mono font-medium text-gray-200 transition"
                  >
                    <Phone className="w-4 h-4 text-purple-400" />
                    <span>Phone OTP</span>
                  </button>
                </div>
              </>
            )}

            {/* Bottom Create Account Link */}
            <div className="pt-2 text-center text-xs text-gray-400 font-sans border-t border-[#1c2638]">
              Don&apos;t have an account?{" "}
              <Link
                href="/signup"
                className="text-cyan-400 hover:text-cyan-300 font-mono font-semibold transition inline-flex items-center space-x-1"
              >
                <span>Create account</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

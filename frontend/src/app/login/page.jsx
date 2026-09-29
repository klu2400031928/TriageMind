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
  const [authMode, setAuthMode] = useState("email");

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // Phone states
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [phoneStep, setPhoneStep] = useState(1);
  const [otpCode, setOtpCode] = useState("");
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Status & Feedback
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Recaptcha container
  const recaptchaVerifierRef = useRef(null);

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

  const handleEmailSignIn = async (e) => {
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
    } catch (err) {
      console.error("Sign-in error:", err);
      let msg = "Authentication failed. Please check your credentials and try again.";
      if (err.code === "auth/invalid-credential" || err.code === "auth/wrong-password") {
        msg = "Invalid email or password. Please verify and try again.";
      } else if (err.code === "auth/user-not-found") {
        msg = "No user found with this email. Please sign up first.";
      } else if (err.code === "auth/too-many-requests") {
        msg = "Access temporarily disabled due to many failed attempts. Try again later.";
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
      setSuccessMsg("✓ Google authentication verified. Connecting to SOC Command Center...");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      console.error("Google auth error:", err);
      let msg = "Google sign-in failed.";
      if (err.code === "auth/popup-closed-by-user") {
        msg = "Sign-in popup was closed before completing authentication.";
      } else if (!isFirebaseConfigured) {
        msg = "Firebase Google Auth is not configured in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!phoneNumber) {
      setErrorMsg("Please enter your phone number.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const fullPhone = `${countryCode}${phoneNumber.replace(/\D/g, "")}`;
      // Initialize recaptcha verifier
      const verifier = setupRecaptcha("recaptcha-container");
      recaptchaVerifierRef.current = verifier;

      const result = await sendPhoneOtp(fullPhone, verifier);
      setConfirmationResult(result);
      setPhoneStep(2);
      setResendCooldown(60);
      setSuccessMsg(`✓ SMS verification code sent to ${fullPhone}`);
    } catch (err) {
      console.error("Phone OTP error:", err);
      let msg = "Failed to send SMS code. Ensure phone number format is valid.";
      if (err.code === "auth/invalid-phone-number") {
        msg = "The provided phone number is invalid. Use international format (e.g., +1 650-555-1234).";
      } else if (err.code === "auth/quota-exceeded") {
        msg = "SMS quota exceeded for this Firebase project. Try again later or use test phone numbers.";
      } else if (!isFirebaseConfigured) {
        msg = "Firebase Phone Auth is not configured in .env.local yet. See instructions below.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!confirmationResult || !otpCode) {
      setErrorMsg("Please enter the 6-digit verification code received.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await confirmPhoneOtp(confirmationResult, otpCode);
      setSuccessMsg("✓ Phone number verified! Access granted to TriageMind.");
      setTimeout(() => router.push("/dashboard"), 500);
    } catch (err) {
      console.error("OTP verification error:", err);
      let msg = "Invalid verification code. Please check SMS and retry.";
      if (err.code === "auth/invalid-verification-code") {
        msg = "Incorrect SMS code entered.";
      } else if (err.code === "auth/code-expired") {
        msg = "SMS code has expired. Please request a new code.";
      }
      setErrorMsg(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) {
      setErrorMsg("Please enter your registered email address.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      await resetPassword(email);
      setSuccessMsg("✓ Password reset email sent. Please check your inbox/spam folders.");
    } catch (err) {
      console.error("Password reset error:", err);
      setErrorMsg("Failed to send reset link. Please verify your email address.");
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
      <div id="recaptcha-container"></div>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* LEFT COLUMN: BRANDING & SOC HIGHLIGHTS */}
          <div className="lg:col-span-6 space-y-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-blue-600/30 to-purple-600/30 border border-cyan-500/40 flex items-center justify-center shadow-cyan-glow">
                <Brain className="w-6 h-6 text-cyan-400" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-wider text-white font-mono uppercase bg-gradient-to-r from-white via-gray-200 to-cyan-300 bg-clip-text text-transparent">
                    TriageMind
                  </span>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    SOC v2.4
                  </span>
                </div>
                <p className="text-xs text-gray-400 font-medium">
                  Autonomous AI SOC Alert-Triage Intelligence
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <h1 className="text-3xl sm:text-4xl font-black text-white font-mono uppercase tracking-tight leading-tight">
                Institutional Memory for Modern Cyber Operations
              </h1>
              <p className="text-sm text-gray-300 font-sans leading-relaxed">
                Log in to access your persistent <strong>Hindsight</strong> memory bank, real-time alert triage pipelines, and deterministic guardrail defense system.
              </p>
            </div>

            {/* Feature List */}
            <div className="space-y-3 pt-2 text-xs font-mono">
              <div className="p-3 rounded-xl bg-[#0c101a] border border-[#1c2638] flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 flex-shrink-0">
                  <Brain className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-bold block">Persistent Precedent Storage</span>
                  <span className="text-gray-400">Analyst overrides teach future shifts automatically</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c101a] border border-[#1c2638] flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 flex-shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-bold block">Deterministic Safety Invariants</span>
                  <span className="text-gray-400">7 hard guardrails block lookalike mimicry attacks</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#0c101a] border border-[#1c2638] flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 flex-shrink-0">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-white font-bold block">High Confidence Auto-Close</span>
                  <span className="text-gray-400">Eliminates up to 80% of repetitive benign scanner alerts</span>
                </div>
              </div>
            </div>

            {/* Live Telemetry Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] font-mono text-gray-400">
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0c101a] border border-[#1c2638]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Hindsight Bank: Connected</span>
              </div>
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#0c101a] border border-[#1c2638]">
                <Activity className="w-3 h-3 text-cyan-400" />
                <span>Zero Latency Vector Search</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: AUTHENTICATION CARD */}
          <div className="lg:col-span-6">
            <div className="cyber-card rounded-2xl border border-[#1c2638] p-6 sm:p-8 shadow-2xl relative">
              {/* Card top banner / mode tabs */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between border-b border-[#1c2638] pb-3">
                  <div>
                    <h2 className="text-lg font-extrabold text-white font-mono uppercase tracking-wide">
                      {authMode === "forgot" ? "Account Recovery" : "Analyst Sign-In"}
                    </h2>
                    <p className="text-xs text-gray-400 font-mono">
                      {authMode === "forgot"
                        ? "Dispatch password reset token to verified email"
                        : "Authenticate with verified credentials or OAuth provider"}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                    <KeyRound className="w-4 h-4 text-cyan-400" />
                  </div>
                </div>

                {/* Auth Mode Selectors */}
                {authMode !== "forgot" && (
                  <div className="grid grid-cols-2 gap-1 p-1 bg-[#090d16] rounded-xl border border-[#1c2638] text-xs font-mono font-medium">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("email");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`py-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                        authMode === "email"
                          ? "bg-gradient-to-r from-cyan-950 to-blue-950 text-cyan-300 border border-cyan-500/40 shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <Mail className="w-3.5 h-3.5" />
                      <span>Email & Password</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("phone");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className={`py-2 rounded-lg flex items-center justify-center space-x-2 transition ${
                        authMode === "phone"
                          ? "bg-gradient-to-r from-purple-950 to-indigo-950 text-purple-300 border border-purple-500/40 shadow-sm"
                          : "text-gray-400 hover:text-gray-200"
                      }`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Phone OTP</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Feedback messages */}
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

              {/* MODE 1: EMAIL & PASSWORD SIGN IN */}
              {authMode === "email" && (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-mono text-gray-300">
                        Password
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthMode("forgot");
                          setErrorMsg(null);
                          setSuccessMsg(null);
                        }}
                        className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 transition"
                      >
                        Forgot password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white shadow-cyan-glow transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>VERIFYING CLEARANCE...</span>
                      </>
                    ) : (
                      <>
                        <span>AUTHENTICATE & ENTER SOC</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* MODE 2: PHONE OTP SIGN IN */}
              {authMode === "phone" && (
                <div className="space-y-4">
                  {phoneStep === 1 ? (
                    <form onSubmit={handleSendOtp} className="space-y-4">
                      <div>
                        <label className="text-xs font-mono text-gray-300 block mb-1">
                          Phone Number (with country code)
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="w-20 px-3 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-center text-gray-100 font-mono focus:outline-none focus:border-purple-500/50"
                            placeholder="+1"
                          />
                          <div className="relative flex-1">
                            <Phone className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="tel"
                              required
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              placeholder="6505551234"
                              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090d16] border border-[#1c2638] text-sm text-gray-100 placeholder-gray-600 font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition"
                            />
                          </div>
                        </div>
                        <p className="text-[10px] text-gray-500 font-mono mt-1">
                          Includes invisible reCAPTCHA bot verification
                        </p>
                      </div>

                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-glow transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>SENDING OTP CODE...</span>
                          </>
                        ) : (
                          <>
                            <span>DISPATCH SMS OTP CODE</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  ) : (
                    <form onSubmit={handleVerifyOtp} className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <label className="text-xs font-mono text-gray-300">
                            6-Digit Verification Code
                          </label>
                          <button
                            type="button"
                            onClick={() => {
                              setPhoneStep(1);
                              setOtpCode("");
                            }}
                            className="text-[11px] font-mono text-purple-400 hover:underline"
                          >
                            Change number
                          </button>
                        </div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className="w-full px-4 py-3 rounded-xl bg-[#090d16] border border-[#1c2638] text-center text-xl tracking-widest text-white font-mono focus:outline-none focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/30 transition"
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs font-mono">
                        <span className="text-gray-500">Didn't receive SMS?</span>
                        {resendCooldown > 0 ? (
                          <span className="text-gray-500">Resend in {resendCooldown}s</span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={submitting}
                            className="text-purple-400 hover:text-purple-300 underline"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={submitting || otpCode.length < 6}
                        className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-glow transition-all duration-200 disabled:opacity-50 flex items-center justify-center space-x-2"
                      >
                        {submitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin" />
                            <span>VERIFYING OTP...</span>
                          </>
                        ) : (
                          <>
                            <span>VERIFY & ACCESS SOC</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              )}

              {/* MODE 3: FORGOT PASSWORD */}
              {authMode === "forgot" && (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="text-xs font-mono text-gray-300 block mb-1">
                      Account Email Address
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

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 rounded-xl text-xs font-mono font-bold bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-cyan-glow transition disabled:opacity-50 flex items-center justify-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>DISPATCHING RESET LINK...</span>
                      </>
                    ) : (
                      <>
                        <span>SEND PASSWORD RESET LINK</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode("email");
                        setErrorMsg(null);
                        setSuccessMsg(null);
                      }}
                      className="text-xs font-mono text-gray-400 hover:text-white"
                    >
                      ← Back to Sign In
                    </button>
                  </div>
                </form>
              )}

              {/* SOCIAL / FEDERATED AUTH DIVIDER */}
              {authMode !== "forgot" && (
                <>
                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-[#1c2638]"></div>
                    </div>
                    <div className="relative flex justify-center text-[10px] uppercase">
                      <span className="bg-[#080c14] px-3 text-gray-500 font-mono">
                        Or authenticate via OAuth
                      </span>
                    </div>
                  </div>

                  {/* Google OAuth Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
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
                    <span>Continue with Google Workspace</span>
                  </button>

                  {/* Fallback Bypass for Testing / Demo Lead */}
                  {!isFirebaseConfigured && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-950/40 border border-amber-500/40 space-y-2">
                      <div className="flex items-center space-x-2 text-xs font-mono text-amber-300 font-bold">
                        <Terminal className="w-3.5 h-3.5 text-amber-400" />
                        <span>Firebase Configuration Notice</span>
                      </div>
                      <p className="text-[11px] text-gray-300 font-sans leading-relaxed">
                        Firebase credentials are not yet set in <code>frontend/.env.local</code>. You can immediately evaluate the full SOC Command Center using the built-in demo analyst account:
                      </p>
                      <button
                        type="button"
                        onClick={handleDemoBypass}
                        className="w-full py-2 px-3 rounded-lg text-xs font-mono font-bold bg-amber-500 hover:bg-amber-400 text-black transition flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Enter SOC Command Center (Demo Lead)</span>
                      </button>
                    </div>
                  )}

                  {/* Bottom Navigation */}
                  <div className="mt-6 text-center text-xs font-mono text-gray-400 border-t border-[#1c2638] pt-4">
                    <span>Don't have a SOC clearance account? </span>
                    <Link
                      href="/signup"
                      className="text-cyan-400 hover:text-cyan-300 font-bold ml-1 inline-flex items-center space-x-0.5"
                    >
                      <span>Create Account</span>
                      <ChevronRight className="w-3 h-3" />
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

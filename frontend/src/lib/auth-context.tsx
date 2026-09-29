"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  signInWithPhoneNumber,
  ConfirmationResult,
  RecaptchaVerifier,
} from "firebase/auth";
import {
  getFirebaseAuth,
  getGoogleProvider,
  isFirebaseConfigured,
} from "./firebase";

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  phoneNumber: string | null;
  photoURL: string | null;
  providerId: string;
}

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  isAuthenticated: boolean;
  isFirebaseConfigured: boolean;
  signInWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (name: string, email: string, pass: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  setupRecaptcha: (containerId: string) => RecaptchaVerifier;
  sendPhoneOtp: (
    phone: string,
    verifier: RecaptchaVerifier
  ) => Promise<ConfirmationResult>;
  confirmPhoneOtp: (
    confirmationResult: ConfirmationResult,
    otp: string
  ) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  signOutUser: () => Promise<void>;
  loginAsDemoAnalyst: () => void;
  getIdToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = "triagemind_auth_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check local storage for quick initial hydration
    try {
      const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (cached) {
        setUser(JSON.parse(cached));
      }
    } catch (e) {
      // ignore
    }

    if (!isFirebaseConfigured) {
      // If Firebase is not configured, we keep cached demo user or leave null
      setLoading(false);
      return;
    }

    const auth = getFirebaseAuth();
    if (!auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (fbUser: FirebaseUser | null) => {
      if (fbUser) {
        const mappedUser: AuthUser = {
          uid: fbUser.uid,
          email: fbUser.email,
          displayName: fbUser.displayName || fbUser.email?.split("@")[0] || "SOC Analyst",
          phoneNumber: fbUser.phoneNumber,
          photoURL: fbUser.photoURL,
          providerId: fbUser.providerData?.[0]?.providerId || "firebase",
        };
        setUser(mappedUser);
        try {
          localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mappedUser));
        } catch (e) {}
      } else {
        // Only clear if not in an explicit demo override session
        const cached = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (cached) {
          try {
            const parsed = JSON.parse(cached);
            if (parsed.providerId === "demo-mode") {
              setUser(parsed);
              setLoading(false);
              return;
            }
          } catch (e) {}
        }
        setUser(null);
        try {
          localStorage.removeItem(LOCAL_STORAGE_KEY);
        } catch (e) {}
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, pass: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Authentication is not configured.");
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const mapped: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email?.split("@")[0] || "SOC Analyst",
      phoneNumber: cred.user.phoneNumber,
      photoURL: cred.user.photoURL,
      providerId: "password",
    };
    setUser(mapped);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
  };

  const signUpWithEmail = async (name: string, email: string, pass: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Authentication is not configured.");
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (name.trim()) {
      await updateProfile(cred.user, { displayName: name.trim() });
    }
    const mapped: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: name.trim() || cred.user.email?.split("@")[0] || "SOC Analyst",
      phoneNumber: cred.user.phoneNumber,
      photoURL: cred.user.photoURL,
      providerId: "password",
    };
    setUser(mapped);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
  };

  const signInWithGoogle = async () => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Authentication is not configured.");
    const provider = getGoogleProvider();
    const cred = await signInWithPopup(auth, provider);
    const mapped: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || "Google Analyst",
      phoneNumber: cred.user.phoneNumber,
      photoURL: cred.user.photoURL,
      providerId: "google.com",
    };
    setUser(mapped);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
  };

  const setupRecaptcha = (containerId: string): RecaptchaVerifier => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Authentication is not configured.");
    if (typeof window === "undefined") {
      throw new Error("reCAPTCHA requires browser window context.");
    }
    // Clear any previous recaptcha container content
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = "";
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: () => {
        // reCAPTCHA verified
      },
      "expired-callback": () => {
        console.warn("reCAPTCHA expired, please retry.");
      },
    });
    return verifier;
  };

  const sendPhoneOtp = async (
    phone: string,
    verifier: RecaptchaVerifier
  ): Promise<ConfirmationResult> => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Authentication is not configured.");
    return await signInWithPhoneNumber(auth, phone, verifier);
  };

  const confirmPhoneOtp = async (
    confirmationResult: ConfirmationResult,
    otp: string
  ) => {
    const cred = await confirmationResult.confirm(otp);
    const mapped: AuthUser = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.phoneNumber || "Verified Phone Analyst",
      phoneNumber: cred.user.phoneNumber,
      photoURL: cred.user.photoURL,
      providerId: "phone",
    };
    setUser(mapped);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(mapped));
  };

  const resetPassword = async (email: string) => {
    const auth = getFirebaseAuth();
    if (!auth) throw new Error("Firebase Authentication is not configured.");
    await sendPasswordResetEmail(auth, email);
  };

  const signOutUser = async () => {
    const auth = getFirebaseAuth();
    if (auth) {
      try {
        await firebaseSignOut(auth);
      } catch (e) {
        // ignore
      }
    }
    setUser(null);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
  };

  const loginAsDemoAnalyst = () => {
    const demoUser: AuthUser = {
      uid: "demo-analyst-lead",
      email: "priya.nair@triagemind.sec",
      displayName: "Priya Nair",
      phoneNumber: "+1 (555) 019-2834",
      photoURL: null,
      providerId: "demo-mode",
    };
    setUser(demoUser);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(demoUser));
  };

  const getIdToken = async (): Promise<string | null> => {
    const auth = getFirebaseAuth();
    if (auth && auth.currentUser) {
      return await auth.currentUser.getIdToken();
    }
    return null;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        isFirebaseConfigured,
        signInWithEmail,
        signUpWithEmail,
        signInWithGoogle,
        setupRecaptcha,
        sendPhoneOtp,
        confirmPhoneOtp,
        resetPassword,
        signOutUser,
        loginAsDemoAnalyst,
        getIdToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

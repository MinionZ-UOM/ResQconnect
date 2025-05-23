// hooks/AuthProvider.tsx
"use client";

import {
  onIdTokenChanged,
  signInWithEmailAndPassword,
  signOut,
  User as FBUser,
} from "firebase/auth";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebaseClient";

type Ctx = {
  user: FBUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<Ctx | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<FBUser | null>(null);
  const [loading, setLoading] = useState(true);

  /* ───────────────────── listen for token refresh / sign-in / sign-out ── */
  useEffect(() => {
    const refreshUser = (u: FBUser | null) => {
      setUser(u);
      setLoading(false);
    };

    const unsub = onIdTokenChanged(auth, refreshUser);

    return () => unsub(); // cleanup on hot-reload / unmount
  }, []);

  /* ───────────────────────────── actions ──────────────────────────────── */
  const login = (email: string, password: string) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      setUser(null);          
    } finally {
      setLoading(false);
    }
  };

  /* ───────────────────────── provider shell ───────────────────────────── */
  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};

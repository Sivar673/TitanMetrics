import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '@/api/client';
import { fetchMe, login, signup } from '@/api/titan';
import { clearToken, loadToken, saveToken } from '@/lib/tokenStorage';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  // True only while restoring a persisted session on launch. Route
  // guards wait on this; per-screen buttons use isLoading instead —
  // gating layouts on in-flight sign-in/up unmounts the very screen
  // showing the error.
  isRestoring: boolean;
  // True while a sign-in/sign-up call is in flight (button spinners)
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function toUser(res: Awaited<ReturnType<typeof fetchMe>>): User {
  return {
    id: res.id,
    email: res.email,
    role: res.role,
    displayName: res.display_name,
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRestoring, setIsRestoring] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  // Restore a persisted session: load the stored token, then let the
  // backend validate it via /auth/me. Expired or revoked tokens get
  // cleared instead of leaving the app half-authenticated.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const token = await loadToken();
        if (!token) return;
        setAuthToken(token);
        const me = await fetchMe();
        if (!cancelled) setUser(toUser(me));
      } catch {
        setAuthToken(null);
        await clearToken();
      } finally {
        if (!cancelled) setIsRestoring(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isRestoring,
      isLoading,
      signIn: async (email, password) => {
        setIsLoading(true);
        try {
          const res = await login(email.trim().toLowerCase(), password);
          setAuthToken(res.token);
          await saveToken(res.token);
          setUser(toUser(res.user));
        } finally {
          setIsLoading(false);
        }
      },
      // Signup responds with the same token+user shape as login, so a
      // new account is signed in with no second round trip
      signUp: async (email, password, displayName) => {
        setIsLoading(true);
        try {
          const res = await signup(email.trim().toLowerCase(), password, displayName.trim());
          setAuthToken(res.token);
          await saveToken(res.token);
          setUser(toUser(res.user));
        } finally {
          setIsLoading(false);
        }
      },
      signOut: () => {
        setAuthToken(null);
        setUser(null);
        void clearToken();
      },
    }),
    [user, isRestoring, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

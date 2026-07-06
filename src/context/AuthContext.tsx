import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { setAuthToken } from '@/api/client';
import { fetchMe, login } from '@/api/titan';
import { clearToken, loadToken, saveToken } from '@/lib/tokenStorage';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  // True while restoring a persisted session on launch and during sign-in
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
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
  const [isLoading, setIsLoading] = useState(true);

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
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const value = useMemo<AuthState>(
    () => ({
      user,
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
      signOut: () => {
        setAuthToken(null);
        setUser(null);
        void clearToken();
      },
    }),
    [user, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

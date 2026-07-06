import React, { createContext, useContext, useMemo, useState } from 'react';
import { setAuthToken } from '@/api/client';
import { login } from '@/api/titan';
import type { User } from '@/types/models';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const value = useMemo<AuthState>(
    () => ({
      user,
      isLoading,
      // Token lives in memory only; add secure storage for session
      // persistence across app restarts.
      signIn: async (email, password) => {
        setIsLoading(true);
        try {
          const res = await login(email.trim().toLowerCase(), password);
          setAuthToken(res.token);
          setUser({
            id: res.user.id,
            email: res.user.email,
            role: res.user.role,
            displayName: res.user.display_name,
          });
        } finally {
          setIsLoading(false);
        }
      },
      signOut: () => {
        setAuthToken(null);
        setUser(null);
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

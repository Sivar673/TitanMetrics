import React, { createContext, useContext, useMemo, useState } from 'react';
import { setAuthToken } from '@/api/client';
import type { User, UserRole } from '@/types/models';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, role: UserRole) => Promise<void>;
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
      // Role picker stub — swap for POST /auth/login returning a real JWT.
      // The token flows into the Axios request interceptor either way.
      signIn: async (email, role) => {
        setIsLoading(true);
        setAuthToken(`dev-token-${role}`);
        // Clients log workouts/check-ins against their own id; in mock
        // mode reuse a roster id so report/progression fixtures line up.
        const id = role === 'client' ? 'c_1' : 'coach_1';
        setUser({ id, email, role, displayName: email.split('@')[0] });
        setIsLoading(false);
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

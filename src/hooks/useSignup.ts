import { useMutation } from '@tanstack/react-query';
import { useAuth } from '@/context/AuthContext';

interface SignupInput {
  email: string;
  password: string;
  displayName: string;
}

// Mutation wrapper around AuthContext.signUp: token persistence and user
// state stay in the context (single owner of auth state), while callers
// get React Query's isPending/error lifecycle.
export function useSignup() {
  const { signUp } = useAuth();

  return useMutation({
    mutationFn: ({ email, password, displayName }: SignupInput) =>
      signUp(email, password, displayName),
  });
}

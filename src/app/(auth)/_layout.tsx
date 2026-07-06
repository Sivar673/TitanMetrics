import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/QueryStates';

export default function AuthLayout() {
  const { user, isRestoring } = useAuth();

  // Wait for session restore before deciding — otherwise a persisted
  // user flashes the login screen on every launch. (Restore only: this
  // must NOT react to in-flight sign-in/up, or the stack unmounts and
  // failed submissions lose their screen state.)
  if (isRestoring) return <LoadingState />;
  if (user) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

import { Redirect, Stack } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/QueryStates';

export default function AuthLayout() {
  const { user, isLoading } = useAuth();

  // Wait for session restore before deciding — otherwise a persisted
  // user flashes the login screen on every launch
  if (isLoading) return <LoadingState />;
  if (user) return <Redirect href="/" />;

  return <Stack screenOptions={{ headerShown: false }} />;
}

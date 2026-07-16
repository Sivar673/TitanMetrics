import { Redirect, Stack } from 'expo-router';
import { Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { LoadingState } from '@/components/ui/QueryStates';

export default function CoachStackLayout() {
  const { user, isRestoring, signOut } = useAuth();

  if (isRestoring) return <LoadingState />;
  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'coach') return <Redirect href="/(client)/dashboard" />;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#fafafa',
        contentStyle: { backgroundColor: '#09090b' },
        headerRight: () => (
          <Pressable onPress={signOut} hitSlop={12}>
            <Ionicons name="log-out-outline" color="#71717a" size={22} />
          </Pressable>
        ),
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Client Roster' }} />
      <Stack.Screen name="client/[id]" options={{ title: 'Client Profile' }} />
      <Stack.Screen name="client/[id]/report" options={{ title: 'Weekly Report' }} />
      <Stack.Screen name="client/[id]/history" options={{ title: 'Metric History' }} />
    </Stack>
  );
}

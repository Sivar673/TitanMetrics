import { Stack } from 'expo-router';

export default function CoachStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#09090b' },
        headerTintColor: '#fafafa',
        contentStyle: { backgroundColor: '#09090b' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Client Roster' }} />
      <Stack.Screen name="client/[id]" options={{ title: 'Client Profile' }} />
      <Stack.Screen name="client/[id]/report" options={{ title: 'Weekly Report' }} />
      <Stack.Screen name="client/[id]/history" options={{ title: 'Metric History' }} />
    </Stack>
  );
}

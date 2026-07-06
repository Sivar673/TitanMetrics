import { Redirect, Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';

const TAB_BAR_BG = '#09090b'; // zinc-950
const ACTIVE = '#f59e0b'; // amber-500
const INACTIVE = '#71717a'; // zinc-500

export default function ClientTabLayout() {
  const { user } = useAuth();

  if (!user) return <Redirect href="/(auth)/login" />;
  if (user.role !== 'client') return <Redirect href="/(coach)" />;

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: TAB_BAR_BG },
        headerTintColor: '#fafafa',
        tabBarStyle: { backgroundColor: TAB_BAR_BG, borderTopColor: '#27272a' },
        tabBarActiveTintColor: ACTIVE,
        tabBarInactiveTintColor: INACTIVE,
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="stats-chart" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="log-workout"
        options={{
          title: 'Log Workout',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="barbell" color={color} size={size} />
          ),
        }}
      />
      <Tabs.Screen
        name="check-in"
        options={{
          title: 'Check-In',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="clipboard" color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}

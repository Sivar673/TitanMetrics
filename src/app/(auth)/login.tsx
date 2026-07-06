import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import type { UserRole } from '@/types/models';

export default function LoginScreen() {
  const { signIn } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');

  const handleSignIn = async (role: UserRole) => {
    if (!email.trim()) return;
    await signIn(email.trim(), role);
    router.replace('/');
  };

  return (
    <View className="flex-1 justify-center gap-6 bg-zinc-950 px-6">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-zinc-50">Titan Metrics</Text>
        <Text className="text-base text-zinc-400">
          Men's Physique coaching, quantified.
        </Text>
      </View>

      <TextInput
        className="rounded-xl bg-zinc-800 px-4 py-3.5 text-lg text-zinc-50"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
        placeholderTextColor="#52525b"
        autoCapitalize="none"
        autoComplete="email"
        keyboardType="email-address"
      />

      {/* Stub role picker — replaced by real auth in Stage 3 */}
      <View className="gap-3">
        <Pressable
          onPress={() => handleSignIn('client')}
          className="items-center rounded-2xl bg-amber-500 py-4 active:bg-amber-600"
        >
          <Text className="text-lg font-bold text-zinc-950">Continue as Client</Text>
        </Pressable>
        <Pressable
          onPress={() => handleSignIn('coach')}
          className="items-center rounded-2xl bg-zinc-800 py-4 active:bg-zinc-700"
        >
          <Text className="text-lg font-bold text-zinc-50">Continue as Coach</Text>
        </Pressable>
      </View>
    </View>
  );
}

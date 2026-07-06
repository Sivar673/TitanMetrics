import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSignIn = async () => {
    if (!email.trim() || !password) {
      setError('Enter your email and password.');
      return;
    }
    setError(null);
    try {
      await signIn(email, password);
      router.replace('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign-in failed. Try again.');
    }
  };

  return (
    <View className="flex-1 justify-center gap-6 bg-zinc-950 px-6">
      <View className="gap-1">
        <Text className="text-3xl font-bold text-zinc-50">Titan Metrics</Text>
        <Text className="text-base text-zinc-400">
          Men's Physique coaching, quantified.
        </Text>
      </View>

      <View className="gap-3">
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
        <TextInput
          className="rounded-xl bg-zinc-800 px-4 py-3.5 text-lg text-zinc-50"
          value={password}
          onChangeText={setPassword}
          placeholder="Password"
          placeholderTextColor="#52525b"
          secureTextEntry
          autoComplete="password"
          onSubmitEditing={handleSignIn}
        />
      </View>

      {/* Inline error: Alert.alert is a no-op on web */}
      {error && <Text className="text-sm text-rose-400">{error}</Text>}

      <Pressable
        onPress={handleSignIn}
        disabled={isLoading}
        className={`items-center rounded-2xl py-4 ${
          isLoading ? 'bg-amber-500/50' : 'bg-amber-500 active:bg-amber-600'
        }`}
      >
        {isLoading ? (
          <ActivityIndicator color="#09090b" />
        ) : (
          <Text className="text-lg font-bold text-zinc-950">Sign In</Text>
        )}
      </Pressable>
    </View>
  );
}

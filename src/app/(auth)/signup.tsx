import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Link, useRouter } from 'expo-router';
import { useSignup } from '@/hooks/useSignup';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function SignupScreen() {
  const router = useRouter();
  const { mutate: signUp, isPending, error: submitError } = useSignup();

  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSignup = () => {
    if (!displayName.trim()) {
      setValidationError('Enter the name your coach will see.');
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setValidationError('Enter a valid email address.');
      return;
    }
    if (password.length < 8) {
      setValidationError('Password needs at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setValidationError("Passwords don't match.");
      return;
    }
    setValidationError(null);
    signUp(
      { email, password, displayName },
      // Signup logs the account in; "/" routes by role to the dashboard
      { onSuccess: () => router.replace('/') },
    );
  };

  const errorMessage =
    validationError ??
    (submitError instanceof Error ? submitError.message : submitError ? 'Signup failed.' : null);

  return (
    <ScrollView
      className="flex-1 bg-zinc-950"
      contentContainerClassName="flex-grow justify-center gap-6 px-6 py-10"
      keyboardShouldPersistTaps="handled"
    >
      <View className="gap-1">
        <Text className="text-3xl font-bold text-zinc-50">Start your prep</Text>
        <Text className="text-base text-zinc-400">
          Track workouts, weekly check-ins, and AI physique feedback in one place.
        </Text>
      </View>

      <View className="gap-3">
        <TextInput
          className="rounded-xl bg-zinc-800 px-4 py-3.5 text-lg text-zinc-50"
          value={displayName}
          onChangeText={setDisplayName}
          placeholder="Display name"
          placeholderTextColor="#52525b"
          autoComplete="name"
        />
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
          placeholder="Password (8+ characters)"
          placeholderTextColor="#52525b"
          secureTextEntry
          autoComplete="new-password"
        />
        <TextInput
          className="rounded-xl bg-zinc-800 px-4 py-3.5 text-lg text-zinc-50"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm password"
          placeholderTextColor="#52525b"
          secureTextEntry
          autoComplete="new-password"
          onSubmitEditing={handleSignup}
        />
      </View>

      {/* Inline error: Alert.alert is a no-op on web */}
      {errorMessage && <Text className="text-sm text-rose-400">{errorMessage}</Text>}

      <Pressable
        onPress={handleSignup}
        disabled={isPending}
        className={`items-center rounded-2xl py-4 ${
          isPending ? 'bg-amber-500/50' : 'bg-amber-500 active:bg-amber-600'
        }`}
      >
        {isPending ? (
          <ActivityIndicator color="#09090b" />
        ) : (
          <Text className="text-lg font-bold text-zinc-950">Create Account</Text>
        )}
      </Pressable>

      <View className="flex-row justify-center gap-1.5">
        <Text className="text-sm text-zinc-500">Already training with us?</Text>
        <Link href="/(auth)/login" className="text-sm font-semibold text-amber-400">
          Sign in
        </Link>
      </View>
    </ScrollView>
  );
}

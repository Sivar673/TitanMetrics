import React from 'react';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

export function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-zinc-950">
      <ActivityIndicator color="#f59e0b" />
    </View>
  );
}

interface ErrorStateProps {
  error: Error;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <View className="flex-1 items-center justify-center gap-3 bg-zinc-950 px-8">
      <Text className="text-center text-base text-zinc-300">
        Couldn't load data
      </Text>
      <Text className="text-center text-sm text-zinc-500">{error.message}</Text>
      <Pressable
        onPress={onRetry}
        className="rounded-xl bg-zinc-800 px-5 py-2.5 active:bg-zinc-700"
      >
        <Text className="font-semibold text-zinc-50">Retry</Text>
      </Pressable>
    </View>
  );
}

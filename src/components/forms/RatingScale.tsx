import React from 'react';
import { Pressable, Text, View } from 'react-native';

interface RatingScaleProps {
  label: string;
  lowHint: string;
  highHint: string;
  value: number | null;
  onChange: (value: number) => void;
}

export function RatingScale({ label, lowHint, highHint, value, onChange }: RatingScaleProps) {
  return (
    <View className="gap-2">
      <Text className="text-base font-medium text-zinc-200">{label}</Text>
      <View className="flex-row gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            onPress={() => onChange(n)}
            className={`flex-1 items-center rounded-xl py-3 ${
              value === n ? 'bg-amber-500' : 'bg-zinc-800'
            }`}
          >
            <Text
              className={`text-base font-semibold ${
                value === n ? 'text-zinc-950' : 'text-zinc-300'
              }`}
            >
              {n}
            </Text>
          </Pressable>
        ))}
      </View>
      <View className="flex-row justify-between">
        <Text className="text-xs text-zinc-500">{lowHint}</Text>
        <Text className="text-xs text-zinc-500">{highHint}</Text>
      </View>
    </View>
  );
}

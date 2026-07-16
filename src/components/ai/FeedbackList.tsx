import React from 'react';
import { Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FeedbackListProps {
  title: string;
  items: string[];
  icon: keyof typeof Ionicons.glyphMap;
  iconColor: string;
}

export function FeedbackList({ title, items, icon, iconColor }: FeedbackListProps) {
  if (items.length === 0) return null;
  return (
    <View className="gap-2">
      <Text className="text-lg font-semibold text-zinc-50">{title}</Text>
      <View className="gap-2 rounded-2xl bg-zinc-900 p-4">
        {items.map((item) => (
          <View key={item} className="flex-row items-start gap-2.5">
            <Ionicons name={icon} size={16} color={iconColor} style={{ marginTop: 2 }} />
            <Text className="flex-1 text-sm leading-5 text-zinc-300">{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

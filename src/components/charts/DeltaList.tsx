import React from 'react';
import { Text, View } from 'react-native';
import type { WeeklyDelta } from '@/types/api';

function formatValue(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

export function DeltaList({ deltas }: { deltas: WeeklyDelta[] }) {
  return (
    <View className="overflow-hidden rounded-2xl bg-zinc-900">
      {deltas.map((row, i) => (
        <View
          key={row.metric}
          className={`flex-row items-center justify-between p-4 ${
            i > 0 ? 'border-t border-zinc-800' : ''
          }`}
        >
          <View className="flex-1 gap-0.5">
            <Text className="text-base text-zinc-200">{row.metric}</Text>
            <Text className="text-xs text-zinc-500">
              {row.previous !== null
                ? `prev ${formatValue(row.previous)} ${row.unit}`
                : 'first tracked week'}
            </Text>
          </View>
          <View className="items-end gap-0.5">
            <Text className="text-lg font-semibold text-zinc-50">
              {formatValue(row.current)}
              <Text className="text-sm font-normal text-zinc-400"> {row.unit}</Text>
            </Text>
            {row.delta !== null && (
              <Text
                className={`text-sm font-medium ${
                  row.delta > 0
                    ? 'text-emerald-400'
                    : row.delta < 0
                      ? 'text-rose-400'
                      : 'text-zinc-500'
                }`}
              >
                {row.delta > 0 ? '+' : ''}
                {formatValue(row.delta)}
              </Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

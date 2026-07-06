import React from 'react';
import { Text, View } from 'react-native';

export interface TrendPoint {
  label: string; // short x-axis label, e.g. "5/11"
  value: number;
}

interface TrendBarChartProps {
  title: string;
  unit: string;
  data: TrendPoint[];
  height?: number;
  barColorClass?: string; // NativeWind bg-* class
}

// Dependency-free bar chart. Bars are normalized to the data's own
// min/max so week-over-week movement stays visible even when the
// absolute change is small relative to the value (e.g. bodyweight).
export function TrendBarChart({
  title,
  unit,
  data,
  height = 120,
  barColorClass = 'bg-amber-500',
}: TrendBarChartProps) {
  if (data.length === 0) return null;

  const values = data.map((d) => d.value);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  const MIN_BAR = 8;

  const first = data[0].value;
  const last = data[data.length - 1].value;
  const totalDelta = last - first;

  return (
    <View className="gap-2 rounded-2xl bg-zinc-900 p-4">
      <View className="flex-row items-baseline justify-between">
        <Text className="text-base font-semibold text-zinc-50">{title}</Text>
        <Text
          className={`text-sm font-medium ${
            totalDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'
          }`}
        >
          {totalDelta >= 0 ? '+' : ''}
          {totalDelta.toFixed(1)} {unit}
        </Text>
      </View>

      <View className="flex-row items-end gap-1" style={{ height }}>
        {data.map((point, i) => {
          const normalized = range === 0 ? 1 : (point.value - min) / range;
          const barHeight = MIN_BAR + normalized * (height - MIN_BAR);
          const isLast = i === data.length - 1;
          return (
            <View key={`${point.label}-${i}`} className="flex-1 items-center justify-end">
              <View
                className={`w-full rounded-t ${isLast ? barColorClass : 'bg-zinc-700'}`}
                style={{ height: barHeight }}
              />
            </View>
          );
        })}
      </View>

      <View className="flex-row justify-between">
        <Text className="text-xs text-zinc-500">
          {data[0].label} · {first.toFixed(1)}
        </Text>
        <Text className="text-xs text-zinc-400">
          {data[data.length - 1].label} · {last.toFixed(1)} {unit}
        </Text>
      </View>
    </View>
  );
}

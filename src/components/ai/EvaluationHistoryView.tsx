import React, { useState } from 'react';
import { FlatList, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useEvaluationHistory } from '@/hooks/useEvaluationHistory';
import { ScoreLineChart } from '@/components/charts/ScoreLineChart';
import { FeedbackList } from '@/components/ai/FeedbackList';
import { ErrorState, LoadingState } from '@/components/ui/QueryStates';
import { shortWeekLabel } from '@/lib/format';
import type { EvaluationHistoryItem } from '@/types/api';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function HistoryRow({
  item,
  expanded,
  onToggle,
}: {
  item: EvaluationHistoryItem;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <View className="overflow-hidden rounded-2xl bg-zinc-900">
      <Pressable
        onPress={onToggle}
        className="flex-row items-center justify-between p-4 active:bg-zinc-800"
      >
        <View className="gap-0.5">
          <Text className="text-base font-semibold text-zinc-50">
            {formatDate(item.created_at)}
          </Text>
          <Text className="text-xs text-zinc-500">
            {item.is_valid_submission
              ? `${item.strengths.length} strengths · ${item.weaknesses.length} weaknesses`
              : 'Invalid submission'}
          </Text>
        </View>
        <View className="flex-row items-center gap-3">
          <Text className="text-2xl font-bold text-amber-400">
            {item.overall_score}
            <Text className="text-sm font-normal text-zinc-500">/10</Text>
          </Text>
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={18}
            color="#71717a"
          />
        </View>
      </Pressable>

      {expanded && (
        <View className="gap-4 border-t border-zinc-800 p-4">
          {item.validity_notes && (
            <Text className="text-sm text-rose-300">{item.validity_notes}</Text>
          )}
          <FeedbackList
            title="Strengths"
            items={item.strengths}
            icon="checkmark-circle"
            iconColor="#34d399"
          />
          <FeedbackList
            title="Weaknesses"
            items={item.weaknesses}
            icon="alert-circle"
            iconColor="#fb7185"
          />
          <FeedbackList
            title="Training Adjustments"
            items={item.training_adjustments}
            icon="barbell"
            iconColor="#f59e0b"
          />
        </View>
      )}
    </View>
  );
}

export function EvaluationHistoryView() {
  const { data, isPending, isError, error, refetch, isRefetching } = useEvaluationHistory();
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const toggle = (id: number) =>
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  // API returns newest first; the chart reads left-to-right in time
  const chartPoints = [...data]
    .reverse()
    .filter((item) => item.is_valid_submission)
    .map((item) => ({
      label: shortWeekLabel(item.created_at.slice(0, 10)),
      value: item.overall_score,
    }));

  return (
    <FlatList
      className="flex-1 bg-zinc-950"
      contentContainerClassName="gap-3 p-4 pb-12"
      data={data}
      keyExtractor={(item) => String(item.id)}
      refreshing={isRefetching}
      onRefresh={refetch}
      ListHeaderComponent={
        <View className="mb-1 gap-3">
          <ScoreLineChart title="Package Score Over Time" data={chartPoints} />
          {data.length > 0 && (
            <Text className="text-sm text-zinc-500">
              Tap an evaluation for the full judging breakdown.
            </Text>
          )}
        </View>
      }
      ListEmptyComponent={
        <View className="items-center gap-2 rounded-2xl bg-zinc-900 p-8">
          <Ionicons name="sparkles-outline" size={24} color="#71717a" />
          <Text className="text-center text-sm text-zinc-400">
            No evaluations yet. Run your first AI evaluation and it will show
            up here with a score trend over time.
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <HistoryRow
          item={item}
          expanded={expandedIds.has(item.id)}
          onToggle={() => toggle(item.id)}
        />
      )}
    />
  );
}

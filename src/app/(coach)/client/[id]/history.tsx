import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text } from 'react-native';
import { useProgression } from '@/hooks/useProgression';
import { TrendBarChart, type TrendPoint } from '@/components/charts/TrendBarChart';
import { ErrorState, LoadingState } from '@/components/ui/QueryStates';
import { shortWeekLabel } from '@/lib/format';

export default function MetricHistory() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data, isPending, isError, error, refetch } = useProgression(id);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  const weightPoints: TrendPoint[] = data.weight_trend.map((p) => ({
    label: shortWeekLabel(p.week_start),
    value: p.avg_weight_lbs,
  }));

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="gap-4 p-4 pb-12">
      <Text className="text-lg font-semibold text-zinc-50">Weight Trajectory</Text>
      <TrendBarChart title="Avg Morning Weight" unit="lbs" data={weightPoints} />

      <Text className="mt-2 text-lg font-semibold text-zinc-50">Strength (est. 1RM)</Text>
      {data.strength_trends.map((trend) => (
        <TrendBarChart
          key={trend.exercise}
          title={trend.exercise}
          unit="lbs"
          barColorClass="bg-emerald-500"
          data={trend.points.map((p) => ({
            label: shortWeekLabel(p.week_start),
            value: p.est_one_rm_lbs,
          }))}
        />
      ))}
    </ScrollView>
  );
}

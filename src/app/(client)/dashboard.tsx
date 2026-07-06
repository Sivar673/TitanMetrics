import { ScrollView, Text, View } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { useClientReport } from '@/hooks/useClientReport';
import { useProgression } from '@/hooks/useProgression';
import { DeltaList } from '@/components/charts/DeltaList';
import { TrendBarChart } from '@/components/charts/TrendBarChart';
import { ErrorState, LoadingState } from '@/components/ui/QueryStates';
import { PHASE_LABEL } from '@/lib/constants';
import { shortWeekLabel, weeksOutLabel } from '@/lib/format';

export default function ClientDashboard() {
  const { user } = useAuth();
  const report = useClientReport(user?.id);
  const progression = useProgression(user?.id);

  if (report.isPending || progression.isPending) return <LoadingState />;
  if (report.isError) return <ErrorState error={report.error} onRetry={report.refetch} />;
  if (progression.isError) {
    return <ErrorState error={progression.error} onRetry={progression.refetch} />;
  }

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="gap-4 p-4 pb-12">
      <View className="gap-1 rounded-2xl bg-zinc-900 p-4">
        <Text className="text-sm uppercase tracking-wide text-zinc-500">Current Phase</Text>
        <Text className="text-2xl font-bold text-amber-400">
          {PHASE_LABEL[report.data.phase]}
          {report.data.weeks_out != null ? ` · ${weeksOutLabel(report.data.weeks_out)}` : ''}
        </Text>
      </View>

      <TrendBarChart
        title="Avg Morning Weight"
        unit="lbs"
        data={progression.data.weight_trend.map((p) => ({
          label: shortWeekLabel(p.week_start),
          value: p.avg_weight_lbs,
        }))}
      />

      <Text className="text-lg font-semibold text-zinc-50">This Week</Text>
      <DeltaList deltas={report.data.deltas} />
    </ScrollView>
  );
}

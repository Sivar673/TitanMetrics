import { useLocalSearchParams } from 'expo-router';
import { ScrollView, Text, View } from 'react-native';
import { useClientReport } from '@/hooks/useClientReport';
import { DeltaList } from '@/components/charts/DeltaList';
import { ErrorState, LoadingState } from '@/components/ui/QueryStates';
import { PHASE_LABEL } from '@/lib/constants';
import { weeksOutLabel } from '@/lib/format';

export default function WeeklyReport() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: report, isPending, isError, error, refetch } = useClientReport(id);

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <ScrollView className="flex-1 bg-zinc-950" contentContainerClassName="gap-4 p-4 pb-12">
      <View className="gap-1">
        <Text className="text-2xl font-bold text-zinc-50">{report.display_name}</Text>
        <Text className="text-sm text-zinc-400">
          {PHASE_LABEL[report.phase]}
          {report.weeks_out != null ? ` · ${weeksOutLabel(report.weeks_out)}` : ''} · week of{' '}
          {report.week_start}
        </Text>
      </View>

      {report.coach_flags.length > 0 && (
        <View className="gap-2 rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
          {report.coach_flags.map((flag) => (
            <Text key={flag} className="text-sm text-amber-300">
              ⚠ {flag}
            </Text>
          ))}
        </View>
      )}

      <Text className="text-lg font-semibold text-zinc-50">Week-over-Week</Text>
      <DeltaList deltas={report.deltas} />
    </ScrollView>
  );
}

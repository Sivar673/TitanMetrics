import { FlatList, Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { useClients } from '@/hooks/useClients';
import { ErrorState, LoadingState } from '@/components/ui/QueryStates';
import { PHASE_LABEL } from '@/lib/constants';

export default function CoachRoster() {
  const router = useRouter();
  const { data: clients, isPending, isError, error, refetch, isRefetching } = useClients();

  if (isPending) return <LoadingState />;
  if (isError) return <ErrorState error={error} onRetry={refetch} />;

  return (
    <FlatList
      className="flex-1 bg-zinc-950"
      contentContainerClassName="gap-3 p-4"
      data={clients}
      keyExtractor={(item) => item.id}
      refreshing={isRefetching}
      onRefresh={refetch}
      renderItem={({ item }) => (
        <Pressable
          className="rounded-2xl bg-zinc-900 p-4 active:bg-zinc-800"
          onPress={() =>
            router.push({ pathname: '/(coach)/client/[id]', params: { id: item.id } })
          }
        >
          <View className="flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-zinc-50">{item.displayName}</Text>
            <Text
              className={
                item.phase === 'prep' || item.phase === 'peak_week'
                  ? 'font-medium text-amber-400'
                  : 'font-medium text-emerald-400'
              }
            >
              {PHASE_LABEL[item.phase]}
              {item.weeksOut != null ? ` · ${item.weeksOut}w out` : ''}
            </Text>
          </View>
          <View className="mt-2 flex-row gap-4">
            <Text className="text-sm text-zinc-400">
              Δ {item.weeklyWeightDeltaLbs?.toFixed(1) ?? '—'} lbs/wk
            </Text>
            <Text className="text-sm text-zinc-400">
              {(item.complianceRate * 100).toFixed(0)}% adherence
            </Text>
          </View>
        </Pressable>
      )}
    />
  );
}

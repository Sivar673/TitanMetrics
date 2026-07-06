import { Link, useLocalSearchParams } from 'expo-router';
import { Text, View } from 'react-native';

export default function ClientProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <View className="flex-1 gap-3 bg-zinc-950 p-4">
      <Text className="text-2xl font-bold text-zinc-50">Client {id}</Text>
      <Link
        href={{ pathname: '/(coach)/client/[id]/report', params: { id } }}
        className="text-base text-amber-400"
      >
        View Weekly Report →
      </Link>
      <Link
        href={{ pathname: '/(coach)/client/[id]/history', params: { id } }}
        className="text-base text-amber-400"
      >
        View Metric History →
      </Link>
    </View>
  );
}

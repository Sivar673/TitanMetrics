import { useQuery } from '@tanstack/react-query';
import { fetchProgression } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';

export function useProgression(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.progression(clientId ?? ''),
    queryFn: () => fetchProgression(clientId!),
    enabled: !!clientId,
  });
}

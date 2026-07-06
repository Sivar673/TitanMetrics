import { useQuery } from '@tanstack/react-query';
import { fetchClientReport } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';

export function useClientReport(clientId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.report(clientId ?? ''),
    queryFn: () => fetchClientReport(clientId!),
    enabled: !!clientId,
  });
}

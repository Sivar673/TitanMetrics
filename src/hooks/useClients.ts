import { useQuery } from '@tanstack/react-query';
import { fetchClients } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';

export function useClients() {
  return useQuery({
    queryKey: queryKeys.clients,
    queryFn: fetchClients,
  });
}

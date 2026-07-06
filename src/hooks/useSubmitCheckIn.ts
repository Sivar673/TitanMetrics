import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitCheckIn } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';
import type { CheckInPayload } from '@/types/api';

export function useSubmitCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CheckInPayload) => submitCheckIn(payload),
    onSuccess: (_data, payload) => {
      // A new check-in changes this client's report and the coach roster
      queryClient.invalidateQueries({ queryKey: queryKeys.report(payload.client_id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.clients });
    },
  });
}

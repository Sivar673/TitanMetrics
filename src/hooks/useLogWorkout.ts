import { useMutation, useQueryClient } from '@tanstack/react-query';
import { logWorkout } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';
import type { WorkoutSessionPayload } from '@/types/api';

export function useLogWorkout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: WorkoutSessionPayload) => logWorkout(payload),
    onSuccess: (_data, payload) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.progression(payload.client_id) });
    },
  });
}

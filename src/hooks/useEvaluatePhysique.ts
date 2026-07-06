import { useMutation, useQueryClient } from '@tanstack/react-query';
import { evaluatePhysique } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';
import type { PoseImage, PoseName } from '@/types/api';

export function useEvaluatePhysique() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (images: Record<PoseName, PoseImage>) => evaluatePhysique(images),
    onSuccess: () => {
      // The new evaluation is now part of the persisted history
      queryClient.invalidateQueries({ queryKey: queryKeys.evaluationHistory });
    },
  });
}

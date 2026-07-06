import { useMutation } from '@tanstack/react-query';
import { evaluatePhysique } from '@/api/titan';
import type { PoseImage, PoseName } from '@/types/api';

export function useEvaluatePhysique() {
  return useMutation({
    mutationFn: (images: Record<PoseName, PoseImage>) => evaluatePhysique(images),
    // Stateless feature: nothing cached to invalidate. If evaluations get
    // persisted server-side later, invalidate that history query here.
  });
}

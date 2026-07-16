import { useQuery } from '@tanstack/react-query';
import { fetchEvaluationHistory } from '@/api/titan';
import { queryKeys } from '@/api/queryKeys';

export function useEvaluationHistory() {
  return useQuery({
    queryKey: queryKeys.evaluationHistory,
    queryFn: fetchEvaluationHistory,
  });
}

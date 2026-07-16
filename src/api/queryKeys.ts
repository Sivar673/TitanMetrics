export const queryKeys = {
  clients: ['clients'] as const,
  report: (clientId: string) => ['clients', clientId, 'report'] as const,
  progression: (clientId: string) => ['clients', clientId, 'progression'] as const,
  evaluationHistory: ['ai', 'evaluations'] as const,
};

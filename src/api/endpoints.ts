export const ENDPOINTS = {
  login: '/auth/login',
  me: '/auth/me',
  checkIns: '/check-ins',
  workouts: '/workouts',
  coachClients: '/coach/clients',
  clientReport: (clientId: string) => `/clients/${clientId}/report`,
  clientProgression: (clientId: string) => `/clients/${clientId}/progression`,
  physiqueEvaluation: '/ai/physique-evaluation',
  evaluationHistory: '/ai/evaluations',
} as const;

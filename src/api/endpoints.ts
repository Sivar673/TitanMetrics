export const ENDPOINTS = {
  login: '/auth/login',
  checkIns: '/check-ins',
  workouts: '/workouts',
  coachClients: '/coach/clients',
  clientReport: (clientId: string) => `/clients/${clientId}/report`,
  clientProgression: (clientId: string) => `/clients/${clientId}/progression`,
} as const;

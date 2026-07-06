export type UserRole = 'coach' | 'client';

export type TrainingPhase = 'prep' | 'off_season' | 'peak_week' | 'recovery';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  displayName: string;
}

export interface ClientSummary {
  id: string;
  displayName: string;
  phase: TrainingPhase;
  weeksOut: number | null; // null when off-season
  lastCheckInAt: string | null; // ISO 8601 from FastAPI
  weeklyWeightDeltaLbs: number | null;
  complianceRate: number; // 0-1, macro adherence
}

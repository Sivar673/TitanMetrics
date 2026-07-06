// Payload types mirror the FastAPI Pydantic schemas one-to-one
// (snake_case included) so backend schema drift breaks the build,
// not production.

// ---- Weekly Check-In ----

export interface FatigueMarkersPayload {
  sleep_quality: number; // 1-5
  muscle_soreness: number; // 1-5 (5 = very sore)
  training_motivation: number; // 1-5
  hunger: number; // 1-5 (relevant in prep)
  stress: number; // 1-5
}

export interface CheckInPayload {
  client_id: string;
  week_start: string; // ISO date "2026-06-29"
  morning_weights_lbs: (number | null)[]; // length 7, Mon-Sun, null = missed
  macro_adherent_days: number; // 0-7
  fatigue: FatigueMarkersPayload;
  notes: string | null;
}

// ---- Workout Session ----

export type SplitDay =
  | 'chest_back'
  | 'shoulders_arms'
  | 'legs'
  | 'chest_back_2'
  | 'shoulders_arms_2'
  | 'legs_2';

export interface SetPayload {
  set_number: number;
  weight_lbs: number;
  reps: number;
  rpe: number | null; // 6-10 scale, optional
  is_working_set: boolean; // false = warm-up
}

export interface ExercisePayload {
  name: string;
  order: number;
  sets: SetPayload[];
}

export interface WorkoutSessionPayload {
  client_id: string;
  performed_at: string; // ISO 8601 datetime
  split_day: SplitDay;
  exercises: ExercisePayload[];
  session_notes: string | null;
}

// ---- Responses (wire format, snake_case as FastAPI returns it) ----

export interface ClientSummaryResponse {
  id: string;
  display_name: string;
  phase: 'prep' | 'off_season' | 'peak_week' | 'recovery';
  weeks_out: number | null;
  last_check_in_at: string | null;
  weekly_weight_delta_lbs: number | null;
  compliance_rate: number; // 0-1
}

export interface WeeklyDelta {
  metric: string; // e.g. "Avg Morning Weight"
  unit: string; // e.g. "lbs"
  current: number;
  previous: number | null; // null on the first tracked week
  delta: number | null;
}

export interface ClientReportResponse {
  client_id: string;
  display_name: string;
  week_start: string; // ISO date
  phase: ClientSummaryResponse['phase'];
  weeks_out: number | null;
  deltas: WeeklyDelta[];
  coach_flags: string[]; // automated callouts, e.g. "Fatigue trending up 2 weeks"
}

export interface WeightPoint {
  week_start: string;
  avg_weight_lbs: number;
}

export interface StrengthPoint {
  week_start: string;
  top_set_weight_lbs: number;
  est_one_rm_lbs: number;
}

export interface StrengthTrend {
  exercise: string;
  points: StrengthPoint[];
}

export interface ProgressionResponse {
  client_id: string;
  weight_trend: WeightPoint[];
  strength_trends: StrengthTrend[];
}

export interface CreatedResponse {
  id: number; // SQLite autoincrement primary key
}

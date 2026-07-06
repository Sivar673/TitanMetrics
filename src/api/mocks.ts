// Deterministic fixtures served when EXPO_PUBLIC_API_URL is unset.
// Shapes match the FastAPI wire format exactly, so swapping to the real
// backend is a config change, not a code change.

import type {
  ClientReportResponse,
  ClientSummaryResponse,
  CreatedResponse,
  ProgressionResponse,
  StrengthPoint,
  WeightPoint,
} from '@/types/api';

const NETWORK_DELAY_MS = 350;

export function delay(ms: number = NETWORK_DELAY_MS): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function weeksAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7) - n * 7); // Monday n weeks back
  return d.toISOString().slice(0, 10);
}

export const MOCK_CLIENTS: ClientSummaryResponse[] = [
  { id: 'c_1', display_name: 'Marcus T.', phase: 'prep', weeks_out: 8, last_check_in_at: weeksAgo(0), weekly_weight_delta_lbs: -1.3, compliance_rate: 0.94 },
  { id: 'c_2', display_name: 'Devon R.', phase: 'off_season', weeks_out: null, last_check_in_at: weeksAgo(0), weekly_weight_delta_lbs: 0.7, compliance_rate: 0.88 },
  { id: 'c_3', display_name: 'Andre K.', phase: 'prep', weeks_out: 4, last_check_in_at: weeksAgo(0), weekly_weight_delta_lbs: -1.8, compliance_rate: 0.98 },
  { id: 'c_4', display_name: 'Jalen W.', phase: 'off_season', weeks_out: null, last_check_in_at: weeksAgo(1), weekly_weight_delta_lbs: 0.4, compliance_rate: 0.71 },
  { id: 'c_5', display_name: 'Tommy V.', phase: 'recovery', weeks_out: null, last_check_in_at: weeksAgo(0), weekly_weight_delta_lbs: 1.1, compliance_rate: 0.82 },
  { id: 'c_6', display_name: 'Sam O.', phase: 'peak_week', weeks_out: 1, last_check_in_at: weeksAgo(0), weekly_weight_delta_lbs: -0.9, compliance_rate: 1.0 },
];

export function mockReport(clientId: string): ClientReportResponse {
  const client = MOCK_CLIENTS.find((c) => c.id === clientId) ?? MOCK_CLIENTS[0];
  const cutting = client.phase === 'prep' || client.phase === 'peak_week';
  const weight = cutting ? 182.4 : 203.6;
  const weightDelta = client.weekly_weight_delta_lbs ?? 0;

  return {
    client_id: client.id,
    display_name: client.display_name,
    week_start: weeksAgo(0),
    phase: client.phase,
    weeks_out: client.weeks_out,
    deltas: [
      { metric: 'Avg Morning Weight', unit: 'lbs', current: weight, previous: weight - weightDelta, delta: weightDelta },
      { metric: 'Macro Adherence', unit: 'days', current: Math.round(client.compliance_rate * 7), previous: 6, delta: Math.round(client.compliance_rate * 7) - 6 },
      { metric: 'Training Sessions', unit: 'sessions', current: 6, previous: 5, delta: 1 },
      { metric: 'Avg Fatigue Score', unit: '/5', current: cutting ? 3.6 : 2.4, previous: cutting ? 3.2 : 2.5, delta: cutting ? 0.4 : -0.1 },
      { metric: 'Avg Sleep Quality', unit: '/5', current: 3.4, previous: 3.9, delta: -0.5 },
    ],
    coach_flags: cutting
      ? ['Fatigue trending up 2 consecutive weeks', 'Sleep quality declining — consider a refeed day']
      : [],
  };
}

function trend(
  weeks: number,
  start: number,
  perWeek: number,
  wobble: number,
): number[] {
  return Array.from({ length: weeks }, (_, i) => {
    const wave = Math.sin(i * 2.1) * wobble;
    return Math.round((start + perWeek * i + wave) * 10) / 10;
  });
}

export function mockProgression(clientId: string): ProgressionResponse {
  const client = MOCK_CLIENTS.find((c) => c.id === clientId) ?? MOCK_CLIENTS[0];
  const cutting = client.phase === 'prep' || client.phase === 'peak_week';
  const WEEKS = 10;

  const weights = cutting
    ? trend(WEEKS, 194, -1.3, 0.6)
    : trend(WEEKS, 198, 0.55, 0.5);

  const weight_trend: WeightPoint[] = weights.map((w, i) => ({
    week_start: weeksAgo(WEEKS - 1 - i),
    avg_weight_lbs: w,
  }));

  const bench = trend(WEEKS, 265, 3.2, 2);
  const squat = trend(WEEKS, 335, 4.1, 3);
  const strengthPoints = (tops: number[]): StrengthPoint[] =>
    tops.map((top, i) => ({
      week_start: weeksAgo(WEEKS - 1 - i),
      top_set_weight_lbs: top,
      // Epley at ~5 reps, precomputed by the backend in production
      est_one_rm_lbs: Math.round(top * (1 + 5 / 30)),
    }));

  return {
    client_id: client.id,
    weight_trend,
    strength_trends: [
      { exercise: 'Bench Press', points: strengthPoints(bench) },
      { exercise: 'Back Squat', points: strengthPoints(squat) },
    ],
  };
}

let mockIdCounter = 0;

export function mockCreated(): CreatedResponse {
  return { id: ++mockIdCounter };
}

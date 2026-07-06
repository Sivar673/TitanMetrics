// One typed fetcher per FastAPI endpoint. Query/mutation hooks call these;
// nothing else in the app touches Axios directly.

import { api, USE_MOCKS } from './client';
import { ENDPOINTS } from './endpoints';
import { MOCK_CLIENTS, delay, mockCreated, mockProgression, mockReport } from './mocks';
import type {
  CheckInPayload,
  ClientReportResponse,
  ClientSummaryResponse,
  CreatedResponse,
  LoginResponse,
  ProgressionResponse,
  WorkoutSessionPayload,
} from '@/types/api';
import type { ClientSummary } from '@/types/models';

// Wire format -> domain model. The only place snake_case leaks past the
// API layer is the payload/response types themselves.
function toClientSummary(res: ClientSummaryResponse): ClientSummary {
  return {
    id: res.id,
    displayName: res.display_name,
    phase: res.phase,
    weeksOut: res.weeks_out,
    lastCheckInAt: res.last_check_in_at,
    weeklyWeightDeltaLbs: res.weekly_weight_delta_lbs,
    complianceRate: res.compliance_rate,
  };
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  if (USE_MOCKS) {
    await delay();
    const role = email.toLowerCase().includes('coach') ? 'coach' : 'client';
    return {
      token: 'mock-token',
      user: {
        id: role === 'coach' ? 'coach_1' : 'c_1',
        email,
        display_name: email.split('@')[0],
        role,
      },
    };
  }
  const { data } = await api.post<LoginResponse>(ENDPOINTS.login, { email, password });
  return data;
}

export async function fetchClients(): Promise<ClientSummary[]> {
  if (USE_MOCKS) {
    await delay();
    return MOCK_CLIENTS.map(toClientSummary);
  }
  const { data } = await api.get<ClientSummaryResponse[]>(ENDPOINTS.coachClients);
  return data.map(toClientSummary);
}

export async function fetchClientReport(clientId: string): Promise<ClientReportResponse> {
  if (USE_MOCKS) {
    await delay();
    return mockReport(clientId);
  }
  const { data } = await api.get<ClientReportResponse>(ENDPOINTS.clientReport(clientId));
  return data;
}

export async function fetchProgression(clientId: string): Promise<ProgressionResponse> {
  if (USE_MOCKS) {
    await delay();
    return mockProgression(clientId);
  }
  const { data } = await api.get<ProgressionResponse>(ENDPOINTS.clientProgression(clientId));
  return data;
}

export async function submitCheckIn(payload: CheckInPayload): Promise<CreatedResponse> {
  if (USE_MOCKS) {
    await delay();
    console.log('[mock] POST /check-ins', JSON.stringify(payload));
    return mockCreated();
  }
  const { data } = await api.post<CreatedResponse>(ENDPOINTS.checkIns, payload);
  return data;
}

export async function logWorkout(payload: WorkoutSessionPayload): Promise<CreatedResponse> {
  if (USE_MOCKS) {
    await delay();
    console.log('[mock] POST /workouts', JSON.stringify(payload));
    return mockCreated();
  }
  const { data } = await api.post<CreatedResponse>(ENDPOINTS.workouts, payload);
  return data;
}

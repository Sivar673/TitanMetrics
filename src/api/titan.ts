// One typed fetcher per FastAPI endpoint. Query/mutation hooks call these;
// nothing else in the app touches Axios directly.

import { api, USE_MOCKS } from './client';
import { ENDPOINTS } from './endpoints';
import { MOCK_CLIENTS, delay, mockCreated, mockProgression, mockReport } from './mocks';
import { Platform } from 'react-native';
import type {
  CheckInPayload,
  ClientReportResponse,
  ClientSummaryResponse,
  CreatedResponse,
  LoginResponse,
  PhysiqueEvaluationResponse,
  PoseImage,
  PoseName,
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

export async function fetchMe(): Promise<LoginResponse['user']> {
  if (USE_MOCKS) {
    await delay();
    return { id: 'c_1', email: 'marcus@example.com', display_name: 'Marcus T.', role: 'client' };
  }
  const { data } = await api.get<LoginResponse['user']>(ENDPOINTS.me);
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

// On web, picker URIs are blob:/data: URLs that must be fetched into a Blob;
// on native, FormData takes a {uri, name, type} file descriptor.
async function appendPose(form: FormData, pose: PoseName, image: PoseImage): Promise<void> {
  if (Platform.OS === 'web') {
    const blob = await (await fetch(image.uri)).blob();
    form.append(pose, blob, image.fileName);
    return;
  }
  form.append(pose, {
    uri: image.uri,
    name: image.fileName,
    type: image.mimeType,
  } as unknown as Blob);
}

export async function evaluatePhysique(
  images: Record<PoseName, PoseImage>,
): Promise<PhysiqueEvaluationResponse> {
  if (USE_MOCKS) {
    await delay(2500); // vision models are slow; make the mock honest
    return {
      is_valid_submission: true,
      validity_notes: null,
      overall_score: 7,
      strengths: [
        'Strong shoulder-to-waist ratio with visible lat flare framing the taper',
        'Round side-delt caps that hold shape in the front pose',
      ],
      weaknesses: [
        'Rear delts and upper back lose separation in the back pose',
        'Slight front-to-back imbalance — chest development leads the back',
      ],
      training_adjustments: [
        'Add 3 weekly sets of reverse pec-deck or rear-delt fly to bring up the rear delts',
        'Move one back day to a chest-supported row focus, 4 sets of 8-10, to thicken the mid-back',
      ],
    };
  }

  const form = new FormData();
  await appendPose(form, 'front', images.front);
  await appendPose(form, 'side', images.side);
  await appendPose(form, 'back', images.back);

  const { data } = await api.post<PhysiqueEvaluationResponse>(
    ENDPOINTS.physiqueEvaluation,
    form,
    // Vision evaluation takes 15-60s — well past the client default timeout
    { timeout: 120_000 },
  );
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

import axios from 'axios';

// When no API URL is configured, the fetchers in titan.ts serve fixture
// data instead of hitting the network. Set EXPO_PUBLIC_API_URL in .env
// (see .env.example) once the FastAPI backend is running.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? null;
export const USE_MOCKS = API_URL === null;

// No default Content-Type: axios infers application/json for object
// payloads and multipart/form-data (with boundary) for FormData — a fixed
// default would clobber the multipart boundary on file uploads.
export const api = axios.create({
  baseURL: API_URL ?? 'http://localhost:8000',
  timeout: 10_000,
});

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

api.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
});

export class ApiError extends Error {
  readonly status: number | null;

  constructor(message: string, status: number | null) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? null;
      // FastAPI puts human-readable errors in `detail` — a string for
      // HTTPException, a list of {msg, loc} objects for 422 validation.
      const data = error.response?.data as { detail?: unknown } | undefined;
      let detail = error.message;
      if (typeof data?.detail === 'string') {
        detail = data.detail;
      } else if (Array.isArray(data?.detail)) {
        detail = data.detail
          .map((item) => (item as { msg?: string })?.msg)
          .filter(Boolean)
          .join('; ');
      }
      return Promise.reject(new ApiError(detail, status));
    }
    return Promise.reject(error);
  },
);

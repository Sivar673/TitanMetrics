import axios from 'axios';

// When no API URL is configured, the fetchers in titan.ts serve fixture
// data instead of hitting the network. Set EXPO_PUBLIC_API_URL in .env
// (see .env.example) once the FastAPI backend is running.
export const API_URL = process.env.EXPO_PUBLIC_API_URL ?? null;
export const USE_MOCKS = API_URL === null;

export const api = axios.create({
  baseURL: API_URL ?? 'http://localhost:8000',
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
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
      // FastAPI puts human-readable errors in `detail`
      const data = error.response?.data as { detail?: unknown } | undefined;
      const detail =
        typeof data?.detail === 'string' ? data.detail : error.message;
      return Promise.reject(new ApiError(detail, status));
    }
    return Promise.reject(error);
  },
);

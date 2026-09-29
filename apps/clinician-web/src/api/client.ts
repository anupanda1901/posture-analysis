import { clearToken, getToken } from "../auth/tokenStore";
import { BACKEND_API_URL } from "./config";
import type { EventRecord, ExposureSummary, SessionRecord } from "./types";

class UnauthorizedError extends Error {
  constructor() {
    super("Not logged in, or the session has expired - please log in again.");
  }
}

async function getJson<T>(path: string): Promise<T> {
  const token = getToken();
  const response = await fetch(`${BACKEND_API_URL}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  if (response.status === 401) {
    // The token is missing/expired/invalid - clear it so AuthContext's
    // subscribers (the route guard) send the user back to /login, rather
    // than the page silently showing an error forever.
    clearToken();
    throw new UnauthorizedError();
  }
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** POST /auth/login (services/backend-api/src/auth/auth.controller.ts) - the only unauthenticated call this client makes. */
export async function login(username: string, password: string): Promise<{ accessToken: string }> {
  const response = await fetch(`${BACKEND_API_URL}/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    throw new Error(response.status === 401 ? "Invalid username or password" : `Login failed: ${response.status}`);
  }
  return (await response.json()) as { accessToken: string };
}

/** GET /sessions - the review queue (services/backend-api/src/sessions/sessions.controller.ts). Clinician-only. */
export function listSessions(state?: string): Promise<SessionRecord[]> {
  const query = state ? `?state=${encodeURIComponent(state)}` : "";
  return getJson<SessionRecord[]>(`/sessions${query}`);
}

export function getSession(sessionId: string): Promise<SessionRecord> {
  return getJson<SessionRecord>(`/sessions/${sessionId}`);
}

/** GET /sessions/:id/events - the full append-only log, used for the timeline. */
export function listEvents(sessionId: string): Promise<EventRecord[]> {
  return getJson<EventRecord[]>(`/sessions/${sessionId}/events`);
}

export function getExposureSummary(sessionId: string): Promise<ExposureSummary> {
  return getJson<ExposureSummary>(`/sessions/${sessionId}/exposure/summary`);
}

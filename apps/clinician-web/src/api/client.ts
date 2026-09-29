import { BACKEND_API_URL } from "./config";
import type { EventRecord, ExposureSummary, SessionRecord } from "./types";

async function getJson<T>(path: string): Promise<T> {
  const response = await fetch(`${BACKEND_API_URL}${path}`);
  if (!response.ok) {
    throw new Error(`GET ${path} failed: ${response.status} ${response.statusText}`);
  }
  return (await response.json()) as T;
}

/** GET /sessions - the review queue (services/backend-api/src/sessions/sessions.controller.ts). */
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

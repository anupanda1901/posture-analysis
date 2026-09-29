# ADR-009: apps/clinician-web has no authentication/authorization this phase

## Status
Accepted (Phase 2/3 engineering scaffolding follow-on)

## Context
`apps/clinician-web` is a new read-only dashboard (session queue + session
detail: safety state, exposure summary, event timeline) built to fill the
previously-deferred "clinician dashboard UI" gap. It reads directly from
`services/backend-api`'s REST API and Socket.IO gateway.

**backend-api itself has no authentication or authorization anywhere in this
codebase** — every route (`sessions`, `consent-records`, `sensor-readings`,
the WebSocket gateway) is open to any caller who can reach the process. This
predates `clinician-web`; it was already true of the iOS client's API surface
in Phase 0/1. `clinician-web` does not introduce a new gap — it exposes an
existing one through a browser UI instead of only a REST client, which makes
it more discoverable and worth writing down explicitly rather than leaving
implicit.

## Decision
`clinician-web` ships with **no login, no session/JWT handling, and no
role check**, matching backend-api's current trust level exactly — it adds
no new exposure beyond what already exists, but it doesn't hide it either.
Every session's `subjectPseudoId`, safety state, symptom reports, and
exposure data are visible to anyone who can load the page and reach
backend-api's origin.

This is acceptable **only** for local development and for a trusted,
single-operator sandbox — never for anything touching real subject data. The
app's `README.md` states this plainly, and this ADR exists so the gap has a
name (`controlId`-style reference: this is a superset of `HZ-06`/`HZ-07`'s
"who can see this data" concern, though neither hazard as originally scoped
covered dashboard access control specifically).

## Rationale
Building a real auth system (identity provider integration, role-based
access control distinguishing clinician/administrator/researcher, audit
logging of who viewed what) is a substantial feature in its own right that
the TRD associates with deployment readiness (Phase 4+ territory), not
engineering scaffolding. Silently shipping a "looks production-ready"
dashboard without auth, with no comment anywhere, would be the kind of
undocumented gap this project's honesty pattern exists to prevent.

## Follow-up
Before any real subject data reaches this dashboard: add authentication
(session cookies or a bearer token) to backend-api first — every route, not
just the ones `clinician-web` calls — then add a role check so only
clinician/administrator roles can load session data, then add audit logging
of dashboard views (who looked at which subject's session, when). None of
this should be half-implemented (e.g. a login screen with no real backend
check) — that would be worse than the current explicit no-auth state, because
it would look secured without being secured.

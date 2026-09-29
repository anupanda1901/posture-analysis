# apps/clinician-web

A read-only clinician review dashboard for beAIve sessions: a session queue
(filterable by safety-FSM state) and a session detail view (safety state,
scale-calibration status, exposure summary, and the full event timeline),
with live updates over the same Socket.IO gateway `apps/ios-client` uses.

This fills a gap that was explicitly deferred in the Phase 2/3 plan: the
exposure/decision/symptom data services/backend-api already computes had no
UI, only a queryable REST API. This app is that UI - nothing more. It does
not write to a session; all mutating actions (clinician-approved resume,
escalation) remain API-only.

## Security - read before pointing this at anything real

**There is no authentication or authorization anywhere in this app or in the
backend-api it talks to.** Anyone who can load this page and reach
backend-api's origin can see every session's `subjectPseudoId`, safety state,
symptom reports, and exposure data. This is acceptable for local development
against synthetic/test data only. See
`docs/adr/009-clinician-web-trust-model.md` for the full rationale and the
required follow-up before this touches real subject data.

## Running locally

```sh
npm run web:dev   # from the repo root; proxies to backend-api at http://localhost:3000
```

Point at a different backend-api instance with a `.env` file:

```
VITE_BACKEND_API_URL=http://localhost:3000
```

## Structure

- `src/api/` - `client.ts` (REST calls), `socket.ts` (Socket.IO connection,
  same room convention as `apps/ios-client`'s `SessionWebSocketClient`),
  `types.ts` (hand-kept types mirroring `packages/schemas/src/*.schema.json`
  - see `docs/adr/004-ios-dtos-hand-kept.md` for why hand-keeping is the
  deliberate choice here too, not an oversight).
- `src/components/` - `SafetyStateBadge` (mirrors the safety FSM state
  verbatim - never a derived risk score, see `docs/claims-and-scope.md`),
  `EventTimeline` (renders the append-only event log; every description is
  derived directly from the stored payload).
- `src/pages/` - `SessionQueuePage` (the review queue), `SessionDetailPage`
  (per-session view with live updates).

## Testing

```sh
npm run web:test   # from the repo root (vitest)
npm run web:build  # from the repo root (tsc -b && vite build)
```

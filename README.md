# beAIve Spatial Posturology Platform

Clinician-supervised posture/movement assessment and exercise-feedback platform.
This repository is at **Phase 0 (claim/protocol/schema/governance scaffolding)** and the
**start of Phase 1 (instrumented baseline pipeline)** of the implementation plan in
`docs/`. Nothing in this repository is clinically validated. See
`docs/claims-and-scope.md` before writing any user-facing copy, protocol content, or
sample data.

## Architecture at a glance

- `apps/ios-client/` — native iOS (Swift/SwiftUI) capture + display front end. No AI
  inference runs on-device in this phase; it streams frames to the backend and renders
  results returned by the server. **Unverified** — no Swift toolchain in this repo's
  build environment; see `apps/ios-client/README.md`.
- `apps/clinician-web/` — read-only web dashboard for clinician review: session queue,
  safety state, exposure summary, and the full event timeline, with live updates. Has
  no authentication — see `docs/adr/009-clinician-web-trust-model.md` before pointing
  it at anything but local/synthetic data.
- `services/backend-api/` — NestJS service owning session lifecycle, the protocol/plan
  store, the append-only event log, the deterministic safety/policy engine (never
  gated by unvalidated ML output — `docs/adr/005-deterministic-policy-engine.md`), and
  the iOS/web-facing REST/WebSocket API.
- `services/ml-service/` — Python/FastAPI service running pose estimation (MediaPipe),
  geometry/kinematics, and quality gating. This is where "the AI" runs.
- `packages/schemas/` — single source of truth (JSON Schema) for every canonical
  record (pose frames, quality flags, decision events, sessions, protocols, ...),
  with generated TypeScript and Python bindings committed to the repo.
- `protocols/` — DATA files describing exercise protocols. All currently `"status":
  "draft"` / `"clinicallyValidated": false` pending real clinical-lead sign-off.
- `docs/` — governance and traceability documents: claims policy, hazard analysis,
  consent/retention design, coordinate-frame reference, intended-use matrix,
  traceability matrix, architecture decision records.
- `infra/docker-compose.yml` — local dev orchestration (Postgres + backend-api +
  ml-service + a placeholder Redis container, see `docs/adr/003-frame-transport.md`).

## Local development

```bash
# 1. Install JS workspace deps (root + packages/schemas + services/backend-api)
npm install

# 2. Generate schema bindings (TS + Python) from packages/schemas/src/*.schema.json
npm run schemas:generate

# 3. Install the Python ml-service in editable mode against the generated schema package
cd services/ml-service && pip install -e . && pip install -e ../../packages/schemas/generated/python && cd -

# 4. Bring up Postgres + backend-api + ml-service
docker compose -f infra/docker-compose.yml up --build

# 5. Run backend-api tests (includes the safety state machine spec)
npm run backend:test

# 6. Run ml-service tests (includes the quality-gate fixture smoke tests)
cd services/ml-service && pytest

# 7. Run the clinician dashboard against backend-api on :3000
npm run web:dev
```

The iOS client (`apps/ios-client/`) is a Swift Package / Xcode project scaffold; open
it in Xcode to build. It expects `services/backend-api` reachable at the URL configured
in its `Networking` layer (see `apps/ios-client/Sources/Networking`).

## Adding or changing a canonical record

1. Edit or add a schema file in `packages/schemas/src/*.schema.json`. Bump its
   `"version"` field per `packages/schemas/CHANGELOG.md` conventions.
2. Run `npm run schemas:generate` and commit the regenerated output under
   `packages/schemas/generated/{ts,python}`. CI (`npm run schemas:check`) fails if
   committed generated output doesn't match a fresh regeneration.
3. Update `docs/traceability-matrix.md` if the change affects a hazard control or
   model/protocol version mapping.

## Claims discipline

Before merging any change that touches UI copy, protocol data, sample output, or
documentation aimed at a non-engineering audience, read `docs/claims-and-scope.md`.
Run `npm run lint:claims` (a grep-based check) as a cheap first pass; it is not a
substitute for the manual review the doc describes.

## What is deliberately not here yet

Authentication/authorization on backend-api or `apps/clinician-web`
(`docs/adr/009-clinician-web-trust-model.md`); 3 of 4 TRD scale-calibration
methods (only `subject_specific` is implemented — `docs/adr/008`); a trained
ST-GCN/TCN checkpoint (the models run, but on random weights — never safety-
relevant, `docs/adr/005`); task-specific object/workstation classification;
real multi-device benchmarking; FHIR mapping; message-bus-backed frame
streaming; and any clinical trial or regulatory submission material. See the
"Explicitly deferred" sections of the implementation plans referenced in
`docs/` and each numbered ADR's own Follow-up section.

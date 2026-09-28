# Traceability matrix

Maps schema version × model/adapter version × protocol version × hazard-control-id.
Maintained manually in this phase (PRD/TRD-required traceability, TRD §2.2/§2.7);
automating this from `Event.payload.provenance` + `Event.type` is a named follow-up,
not attempted here.

## How to read this

Every emitted `PoseLandmarkFrame`, `CalibratedJointFrame`, `QualityGateFlag`, and
`DecisionEvent` carries a `provenance` block (or, for `DecisionEvent`, a `version`
field) identifying the schema/model/calibration versions that produced it. This
table is the human-readable index from "what's currently deployed" to "which
hazard controls does that satisfy."

| Schema | Schema version | Model/adapter version (this phase) | Hazard control(s) satisfied | Notes |
|---|---|---|---|---|
| `pose-landmark-frame` | v0 | `mediapipe-pose` (version pinned in `services/ml-service/pyproject.toml`) | HZ-01, HZ-03 | `observationState` enum is the HZ-03 control; `personTrackId` stability is the HZ-01 control. |
| `calibrated-joint-frame` | v0 | derived from `pose-landmark-frame` via `geometry/kinematics.py` | HZ-02 | `scaleValidated=false` until a real scale-check pipeline exists (deferred) — currently ALWAYS false in this phase's ml-service, by design, since no depth/stereo/reference-object check is implemented yet. |
| `quality-gate-flag` | v0 | `services/ml-service/app/quality/quality_gate.py` | HZ-01, HZ-02, HZ-03 | `unsupported` + non-empty `reasons` is schema-enforced (see `packages/schemas/codegen/contract.test.mjs`). |
| `decision-event` | v0 | `services/backend-api/src/safety/safety-state-machine.ts` | HZ-05 | `rule.ruleId` should reference a hazard-analysis `controlId` once the policy engine grows beyond this phase's stub. |
| `session` | v0 | n/a (record, not a model) | — | Carries `deploymentContext`, `calibrationRef`, current FSM `state`. |
| `symptom-report` | v0 | n/a | HZ-05 | Always accepted; drives `Pause`/`ClinicianReview` regardless of ML confidence. |
| `protocol-definition` | v0 | n/a | HZ-05, HZ-07 | `status: "draft"` protocols are schema-locked to `clinicallyValidated: false`. |

## Known gap in this phase

`calibrated-joint-frame.scaleValidated` is hard-coded `false` because no scale/
reprojection check (depth, known-size reference, stereo, subject calibration) is
implemented yet. This is intentional — reporting `true` without a real check would
violate `docs/coordinate-frames.md`'s core rule — but it means **no metric distance
or load claim is currently possible**, only normalized angles. Any consumer must
respect this flag rather than assume calibration exists.

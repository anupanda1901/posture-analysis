# Hazard analysis

Seeded verbatim from beAIve TRD §2.7 ("Requirements traceability and failure
controls"). Each hazard gets a `controlId` that a `QualityGateFlag` or
`DecisionEvent` instance can reference in its `rule.ruleId` or `evidence`, and that
`docs/traceability-matrix.md` maps to schema/model/protocol versions.

This is a design-time hazard analysis, not a completed ISO 14971 risk management
file. See `docs/study-charter-skeleton.md` and TRD §3.3 for what a real regulatory
submission additionally requires.

| controlId | Hazard or failure | Detection | Control and validation | Implemented where (this repo) |
|---|---|---|---|---|
| HZ-01 | Left/right swap, mirror, or identity switch | Orientation metadata, temporal consistency, subject check | Suppress side-specific cue; synthetic mirror and multi-person tests | `pose-landmark-frame.schema.json` (`personTrackId`); `ml-service/app/quality/quality_gate.py` (`identity_uncertain` reason) |
| HZ-02 | Monocular depth/scale error | Reprojection residual, depth coverage, known-size sanity check | Suppress distances/load claims; compare with motion capture/reference depth | `calibrated-joint-frame.schema.json` (`scaleValidated`, `calibrationRef`) |
| HZ-03 | Occluded joint during lifting | Visibility/uncertainty and required-joint mask | No precise score; request view; obstruction tests | `pose-landmark-frame.schema.json` (`observationState: occluded` forces `position: null`); `quality-gate-flag.schema.json` (`occlusion` reason) |
| HZ-04 | AR anchor drift | World/object transform movement and plane confidence | Freeze overlay and recalibrate; repeated-session tests | `camera-pose.schema.json` (`trackingState`, `anchorConfidence`); AR anchoring itself is deferred to a later phase, but the schema field exists now so the control has a home |
| HZ-05 | Unsafe exercise cue | Rule/plan incompatibility, reported symptom, contraindication | Hard pause and review; hazard analysis and clinician scenario testing | `services/backend-api/src/safety/safety-state-machine.ts`; `symptom-report.schema.json` |
| HZ-06 | Sensor artifact/disconnect | Signal quality, timestamp freshness | No physiology-dependent decision; bench tests | Out of scope this phase (no physiological sensor integration yet) — noted so the control isn't forgotten when one is added |
| HZ-07 | Risk score overclaim | Report schema and copy review | Label observational indicators; clinician review; claims audit | `docs/claims-and-scope.md`; `scripts/lint-claims.sh` |
| HZ-08 | Cohort performance gap | Stratified metrics by device, body shape, clothing, mobility, skin tone, lighting | Dataset expansion and release gate; prespecified subgroup analysis | Deferred — requires a real evaluation dataset (Phase 4+), not buildable in scaffolding |

## Notes for this phase

- HZ-01, HZ-02, HZ-03, HZ-05 are structurally enforced by schema constraints and/or
  the safety state machine built in this pass — not just documented.
- HZ-04, HZ-06, HZ-08 are named and given a `controlId` now so the eventual
  implementation (AR anchoring, sensor integration, cohort evaluation) has a fixed
  point to attach to, but no code exists for them yet in this phase.
- A `DecisionEvent.rule.ruleId` should reference the relevant `controlId` (e.g.
  `"HZ-05"`) when the safety policy engine (Phase 3+) is built out beyond this
  phase's stub.

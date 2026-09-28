# @beaive/schemas changelog

Each canonical record's `version` field (embedded in its own schema file) is the
authoritative version for that record type. This file is a human-readable log of
what changed and why; it is not machine-consumed.

## v0 - initial Phase 0 baseline

All ten canonical records introduced at `version: "v0"`:

- `camera-intrinsics` - K, distortion, resolution, orientation (TRD 2.1).
- `camera-pose` - T_WC(t): device localization in the local AR world frame.
- `pose-landmark-frame` - per-frame estimated landmarks with confidence and an
  explicit `observationState` (`observed` | `imputed` | `occluded`) so an occluded
  joint can never be presented as observed.
- `calibrated-joint-frame` - joint angles derived via the TRD 2.1 `theta = acos(...)`
  formula, gated by `scaleValidated`.
- `quality-gate-flag` - first-class `unsupported` state; `reasons` required non-empty
  whenever `state=unsupported`.
- `decision-event` - `evidence + rule + action + version + expiry`, the deterministic
  safety-gate output.
- `session` - subject pseudo-ID, protocol/version, consent ref, retention policy,
  current safety-FSM state.
- `symptom-report` - user-entered symptom report; always accepted, drives an
  immediate FSM transition.
- `consent-record` - consent scope taxonomy and grant/revocation timestamps.
- `protocol-definition` - clinician-authored exercise protocol as data; `status:
  "draft"` protocols are schema-constrained to `clinicallyValidated: false` and
  `reviewedBy: null`.

No breaking changes yet - this is the first cut.

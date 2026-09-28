// Proves the raw JSON Schema (single source of truth) still enforces the
// cross-field business rules that generate-ts.mjs strips for TypeScript's sake
// (see stripConditionalOnlyAllOf). Runtime validation is what actually matters
// for "never fabricate a measurement" / "cue requires a payload" - the generated
// TS type is a convenience, not the enforcement mechanism.
import { test } from "node:test";
import assert from "node:assert/strict";
import Ajv2020 from "ajv/dist/2020.js";
import addFormats from "ajv-formats";
import { loadAndDereferenceSchemas } from "./bundle.mjs";

const schemas = await loadAndDereferenceSchemas();
const byName = Object.fromEntries(schemas.map((s) => [s.name, s.schema]));

function validatorFor(name) {
  // Schemas declare $schema: draft 2020-12 - the plain Ajv export only ships the
  // draft-07 meta-schema, so this must use the 2020-12-aware build.
  const ajv = new Ajv2020({ allErrors: true, strict: false });
  addFormats(ajv);
  return ajv.compile(byName[name]);
}

test("quality-gate-flag: unsupported requires non-empty reasons", () => {
  const validate = validatorFor("quality-gate-flag");

  const bad = {
    flagId: "f1", sessionId: "s1", frameId: "fr1",
    evaluatedAt: "2026-01-01T00:00:00Z",
    state: "unsupported", reasons: [], affectedOutputs: [],
  };
  assert.equal(validate(bad), false, "unsupported with empty reasons must fail");

  const good = { ...bad, reasons: ["occlusion"], affectedOutputs: ["kneeFlexionAngle"] };
  assert.equal(validate(good), true, JSON.stringify(validate.errors));
});

test("decision-event: action=cue requires a non-null cuePayload", () => {
  const validate = validatorFor("decision-event");

  const base = {
    decisionEventId: "d1", sessionId: "s1",
    evaluatedAt: "2026-01-01T00:00:00Z",
    evidence: [{ type: "quality-gate-flag", refId: "f1" }],
    rule: { ruleId: "r1", ruleVersion: "v0", description: "test" },
    version: "policy-v0",
    expiry: "2026-01-01T00:05:00Z",
  };

  assert.equal(validate({ ...base, action: "cue", cuePayload: null }), false, "cue with null cuePayload must fail");
  assert.equal(
    validate({ ...base, action: "cue", cuePayload: { cueId: "c1", text: "straighten your back" } }),
    true,
    JSON.stringify(validate.errors)
  );
  assert.equal(validate({ ...base, action: "no_action", cuePayload: null }), true, JSON.stringify(validate.errors));
});

test("pose-landmark-frame: occluded landmark must have null position", () => {
  const validate = validatorFor("pose-landmark-frame");

  const frame = (position, observationState) => ({
    frameId: "fr1", sessionId: "s1", personTrackId: "p1",
    capturedAt: "2026-01-01T00:00:00Z", frame: "B",
    landmarks: [{ jointName: "leftKnee", position, confidence: 0.9, observationState }],
    provenance: {
      schemaVersion: "pose-landmark-frame/v0", modelVersion: "mediapipe-pose/0.10.9",
      calibrationVersion: "cal-1", producedAt: "2026-01-01T00:00:00Z",
    },
  });

  assert.equal(validate(frame([0.1, 0.2, 0.3], "occluded")), false, "occluded with a fabricated position must fail");
  assert.equal(validate(frame(null, "occluded")), true, JSON.stringify(validate.errors));
  assert.equal(validate(frame([0.1, 0.2, 0.3], "observed")), true, JSON.stringify(validate.errors));
});

test("protocol-definition: draft status forces clinicallyValidated=false and reviewedBy=null", () => {
  const validate = validatorFor("protocol-definition");

  const base = {
    protocolId: "sit-to-stand", version: "v0-draft", name: "Sit to stand",
    targetPopulation: "adult rehab, low fall risk", deploymentContext: ["clinic_supervised", "home_rehab"],
    exercises: [{ exerciseId: "e1", name: "Sit to stand", phase: "ascend", repRange: { min: 3, max: 8 }, toleranceDegrees: 10, restSeconds: 30 }],
    contraindications: ["acute hip fracture"], symptomStopRules: ["stop on dizziness"],
    createdAt: "2026-01-01T00:00:00Z",
  };

  assert.equal(
    validate({ ...base, status: "draft", clinicallyValidated: true, reviewedBy: null }),
    false,
    "draft protocol cannot claim clinicallyValidated=true"
  );
  assert.equal(
    validate({ ...base, status: "draft", clinicallyValidated: false, reviewedBy: null }),
    true,
    JSON.stringify(validate.errors)
  );
});

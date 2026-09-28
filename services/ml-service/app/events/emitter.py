"""Builds schema-valid PoseLandmarkFrame / QualityGateFlag / CalibratedJointFrame
records and validates them against the generated Pydantic models (beaive_schemas
- packages/schemas/generated/python, installed editable per root README) before
returning. Fails loudly (pydantic ValidationError) rather than emit a malformed
record - see docs/adr/002-schema-source-of-truth.md.
"""
from __future__ import annotations

from datetime import datetime, timezone

from beaive_schemas import CalibratedJointFrame, PoseLandmarkFrame, QualityGateFlag

from app.geometry.coordinate_frames import CoordinateFrame
from app.versioning import (
    CALIBRATION_VERSION,
    MODEL_VERSION,
    SCHEMA_VERSION_CALIBRATED_JOINT_FRAME,
    SCHEMA_VERSION_POSE_LANDMARK_FRAME,
)


def build_pose_landmark_frame(session_id: str, frame_id: str, person_track_id: str, landmarks: list[dict]) -> dict:
    now = datetime.now(timezone.utc).isoformat()
    record = {
        "frameId": frame_id,
        "sessionId": session_id,
        "personTrackId": person_track_id,
        "capturedAt": now,
        "frame": CoordinateFrame.BODY.value,
        "landmarks": landmarks,
        "provenance": {
            "schemaVersion": SCHEMA_VERSION_POSE_LANDMARK_FRAME,
            "modelVersion": MODEL_VERSION,
            "calibrationVersion": CALIBRATION_VERSION,
            "producedAt": now,
        },
    }
    validated = PoseLandmarkFrame.model_validate(record)
    return validated.model_dump(mode="json", exclude_unset=True)


def build_quality_gate_flag_validated(flag: dict) -> dict:
    validated = QualityGateFlag.model_validate(flag)
    return validated.model_dump(mode="json", exclude_unset=True)


def build_calibrated_joint_frame(
    session_id: str, frame_id: str, source_frame_id: str, calibration_ref: str, angles: list[dict]
) -> dict:
    from app.geometry.coordinate_frames import SCALE_VALIDATED_THIS_PHASE

    now = datetime.now(timezone.utc).isoformat()
    record = {
        "jointFrameId": frame_id,
        "sessionId": session_id,
        "sourceFrameId": source_frame_id,
        "capturedAt": now,
        "frame": CoordinateFrame.BODY.value,
        "scaleValidated": SCALE_VALIDATED_THIS_PHASE,
        "calibrationRef": calibration_ref,
        "angles": angles,
        "provenance": {
            "schemaVersion": SCHEMA_VERSION_CALIBRATED_JOINT_FRAME,
            "modelVersion": MODEL_VERSION,
            "calibrationVersion": CALIBRATION_VERSION,
            "producedAt": now,
        },
    }
    validated = CalibratedJointFrame.model_validate(record)
    return validated.model_dump(mode="json", exclude_unset=True)

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from app.events.emitter import build_pose_landmark_frame, build_quality_gate_flag_validated
from app.ingestion.rest_ingest import decode_base64_image
from app.pose.landmark_mapper import map_landmarks_to_frame
from app.pose.mediapipe_adapter import MediaPipePoseAdapter
from app.quality.quality_gate import evaluate_quality
from app.quality.unsupported_state import build_quality_gate_flag

router = APIRouter(prefix="/internal", tags=["internal"])

_adapter: MediaPipePoseAdapter | None = None


def get_adapter() -> MediaPipePoseAdapter:
    """Lazily constructs the (relatively expensive) PoseLandmarker once per process."""
    global _adapter
    if _adapter is None:
        _adapter = MediaPipePoseAdapter()
    return _adapter


class FrameSubmission(BaseModel):
    sessionId: str
    frameId: str
    capturedAt: str
    imageBase64: str


@router.get("/health")
def health() -> dict:
    return {"status": "ok"}


@router.post("/frames")
def submit_frame(body: FrameSubmission) -> dict:
    try:
        image = decode_base64_image(body.imageBase64)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc

    raw_landmarks = get_adapter().detect_on_image(image)
    landmarks = map_landmarks_to_frame(raw_landmarks)

    pose_frame = build_pose_landmark_frame(
        session_id=body.sessionId,
        frame_id=body.frameId,
        # Single-person tracking only in this phase (PRD P0 scope).
        person_track_id=f"{body.sessionId}:person-0",
        landmarks=landmarks,
    )

    assessment = evaluate_quality(landmarks)
    quality_flag = build_quality_gate_flag_validated(build_quality_gate_flag(body.sessionId, body.frameId, assessment))

    # CalibratedJointFrame (joint angles) is implemented and unit-tested
    # (app/geometry/kinematics.py) but not yet wired into this response - the
    # backend-api ml-integration consumer for this phase only handles
    # poseLandmarkFrame + qualityGateFlag (see docs/traceability-matrix.md
    # "Known gap in this phase"). Wiring it in is a Phase 1 follow-up once the
    # backend contract is extended to consume it.
    return {"poseLandmarkFrame": pose_frame, "qualityGateFlag": quality_flag}

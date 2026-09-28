"""TRD 2.1 coordinate frames - see docs/coordinate-frames.md for the full
reference. This module exists so code has a single named place to reference
the frame convention and the scale-validation gap, rather than each caller
re-deciding it.
"""
from __future__ import annotations

from enum import Enum


class CoordinateFrame(str, Enum):
    IMAGE = "I"
    CAMERA = "C"
    WORLD = "W"
    BODY = "B"
    OBJECT = "O"


# No scale/reprojection check is implemented in this phase (no calibrated depth,
# known-size reference, stereo, or subject-specific calibration pipeline) - so
# every CalibratedJointFrame this service emits MUST report scaleValidated=False.
# Do not flip this to True without actually implementing one of those checks;
# doing so would violate the core rule in docs/coordinate-frames.md.
SCALE_VALIDATED_THIS_PHASE = False

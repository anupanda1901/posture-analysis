"""Decodes an inbound frame submission's base64 image payload into an mp.Image."""
from __future__ import annotations

import base64

import cv2
import mediapipe as mp
import numpy as np


def decode_base64_image(image_base64: str) -> mp.Image:
    try:
        raw = base64.b64decode(image_base64, validate=True)
    except Exception as exc:  # binascii.Error and friends
        raise ValueError("imageBase64 is not valid base64") from exc

    arr = np.frombuffer(raw, dtype=np.uint8)
    bgr = cv2.imdecode(arr, cv2.IMREAD_COLOR)
    if bgr is None:
        raise ValueError("Could not decode image bytes - expected a JPEG/PNG-encoded image.")
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB)
    return mp.Image(image_format=mp.ImageFormat.SRGB, data=rgb)

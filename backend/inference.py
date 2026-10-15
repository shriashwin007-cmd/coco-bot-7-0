"""
COCO BOT 7.0 — real leaf-disease inference module.

Loads the trained ONNX classifier (backend/leaf_disease_model.onnx +
labels.txt) produced by train_model.py and runs genuine inference.

Preprocessing contract — must match training EXACTLY:
  RGB uint8 [0,255] -> bilinear resize to IMG x IMG -> (x / 127.5) - 1

Returns the top-1 label (real PlantVillage class name), its softmax
confidence, and healthy/diseased status derived from the label itself
(never invented — the label says 'healthy' or not).

If the model files are absent, callers should fall back to the
pixel-heuristic in analyse_pixels() rather than fake anything.
"""

from __future__ import annotations

import os
import threading
from io import BytesIO

import numpy as np
from PIL import Image

IMG = 192
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODEL_PATH = os.path.join(BASE_DIR, "leaf_disease_model.onnx")
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")

_lock = threading.Lock()
_session = None
_labels: list[str] | None = None


def model_available() -> bool:
    return os.path.exists(MODEL_PATH) and os.path.exists(LABELS_PATH)


def _load_once():
    """Lazy-load ONNX session + labels exactly once (thread-safe)."""
    global _session, _labels
    with _lock:
        if _session is not None:
            return _session, _labels
        if not model_available():
            raise FileNotFoundError(
                "Leaf-disease model files not found. Run train_model.py first, "
                "or use the pixel-heuristic fallback."
            )
        import onnxruntime as ort

        _session = ort.InferenceSession(
            MODEL_PATH, providers=["CPUExecutionProvider"]
        )
        with open(LABELS_PATH, encoding="utf-8") as f:
            _labels = [ln.strip() for ln in f if ln.strip()]
        if not _labels:
            raise ValueError("labels.txt is empty.")
        return _session, _labels


def preprocess(image: Image.Image) -> np.ndarray:
    """PIL RGB image -> float32 tensor [1, IMG, IMG, 3] in [-1, 1]."""
    img = image.convert("RGB").resize((IMG, IMG), Image.BILINEAR)
    arr = np.asarray(img).astype(np.float32)
    arr = (arr / 127.5) - 1.0
    return arr.reshape(1, IMG, IMG, 3)


def parse_label(label: str) -> tuple[str, str]:
    """Split a PlantVillage label into (crop, condition).

    Labels look like 'Apple — Apple scab' or 'Corn — healthy'.
    Falls back gracefully for unexpected formats.
    """
    if "___" in label:
        crop, cond = label.split("___", 1)
    elif "—" in label:
        crop, cond = label.split("—", 1)
    elif " - " in label:
        crop, cond = label.split(" - ", 1)
    else:
        return label.strip(), label.strip()
    return crop.strip(), cond.strip()


def is_healthy_label(label: str) -> bool:
    _, cond = parse_label(label)
    return "healthy" in cond.lower()


def crop_group(crop: str) -> str:
    """Rough crop family for guidance wording (not a diagnosis)."""
    c = crop.lower()
    if "apple" in c or "cherry" in c or "grape" in c or "strawberry" in c or "peach" in c or "blueberry" in c:
        return "fruit"
    if "corn" in c or "wheat" in c or "rice" in c or "sorghum" in c or "barley" in c:
        return "cereal"
    if "tomato" in c or "potato" in c or "pepper" in c or "eggplant" in c:
        return "nightshade"
    if "soybean" in c or "bean" in c or "pea" in c:
        return "legume"
    if "citrus" in c or "orange" in c or "lemon" in c:
        return "citrus"
    if "squash" in c or "cucumber" in c or "pumpkin" in c or "melon" in c:
        return "cucurbit"
    return "crop"


def guidance_for(label: str, healthy: bool) -> str:
    """Honest, label-derived next-step text. Suggestion, never a cure."""
    if healthy:
        return (
            "Continue routine care: consistent watering, good airflow, and weekly "
            "visual checks. Re-scan if new spots, yellowing, or wilting appear."
        )
    crop, cond = parse_label(label)
    group = crop_group(crop)
    return (
        f"The classifier read this {group} leaf as '{cond}'. Treat this as a "
        f"strong lead, not a confirmed diagnosis. Inspect the plant closely in "
        f"daylight, isolate it from healthy plants, check watering and drainage, "
        f"and consult a local agronomist or extension officer before applying "
        f"any treatment — the photo alone cannot rule out look-alike conditions "
        f"or mixed infections."
    )


def explain(label: str, confidence: float, healthy: bool, runner_up: str, runner_conf: float) -> str:
    crop, cond = parse_label(label)
    pct = f"{confidence:.0%}"
    margin = f"{confidence - runner_conf:.0%}"
    certainty = (
        "with a clear lead" if confidence - runner_conf > 0.25
        else "with a modest lead" if confidence - runner_conf > 0.10
        else "by a narrow margin"
    )
    base = (
        f"The trained MobileNetV2 classifier, which learned 38 PlantVillage classes, "
        f"read this photo as '{cond}' on {crop} {certainty} (confidence {pct}; "
        f"next-closest class '{runner_up}' at {runner_conf:.0%}, a margin of {margin})."
    )
    if healthy:
        return base + (
            " No disease pattern was detected. Remember the model only knows the "
            "conditions it was trained on — it cannot rule out a problem it never saw."
        )
    return base + (
        " Visible markings match this training class more strongly than any other. "
        " This is a visual match, not a laboratory diagnosis."
    )


def run_inference(image: Image.Image) -> dict:
    """Run the real model. Raises FileNotFoundError if not trained."""
    session, labels = _load_once()
    tensor = preprocess(image)
    input_name = session.get_inputs()[0].name
    outputs = session.run(None, {input_name: tensor})
    probs = np.asarray(outputs[0]).reshape(-1)
    if probs.shape[0] != len(labels):
        raise ValueError(
            f"Model output size {probs.shape[0]} does not match {len(labels)} labels."
        )
    top = int(np.argmax(probs))
    order = np.argsort(-probs)
    second = int(order[1]) if probs.shape[0] > 1 else top
    label = labels[top]
    confidence = float(probs[top])
    healthy = is_healthy_label(label)

    return {
        "predicted_label": label,
        "crop": parse_label(label)[0],
        "condition": parse_label(label)[1],
        "status": "healthy" if healthy else "needs_inspection",
        "confidence": confidence,
        "confidence_description": (
            "Softmax probability from the trained model — how strongly the photo matches "
            "this class relative to the other 37 classes it learned."
        ),
        "runner_up": {"label": labels[second], "confidence": float(probs[second])},
        "explanation": explain(label, confidence, healthy, labels[second], float(probs[second])),
        "recommended_next_step": guidance_for(label, healthy),
        "model": "MobileNetV2 (transfer-learned on PlantVillage)",
        "image_size": IMG,
    }

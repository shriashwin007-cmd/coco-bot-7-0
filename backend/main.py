"""
COCO BOT 7.0 — AI inference backend (software demonstration).

What this is
------------
A beginner-friendly FastAPI service that accepts a plant-leaf photograph and
returns a *genuine, computed* plant-health assessment. No physical robot,
sensor, pump, or solar hardware is connected. Nothing here controls hardware.

How inference works (honest description)
----------------------------------------
No TensorFlow `leaf_disease_model.h5` / `labels.txt` files were found in the
workspace at build time, so this backend does NOT claim a trained disease
classifier is connected. Instead it performs deterministic pixel-colour
analysis with Pillow + NumPy:

  * downscales the leaf photo,
  * measures green / yellowing / brown / dark-spot pixel ratios,
  * derives a 0-1 "leaf greenness health index",
  * returns status "healthy" or "needs_inspection".

Supported labels: ["healthy", "needs_inspection"] ONLY. The service never
invents specific disease names (no blight / rust / mildew diagnoses).

If you later add a compatible TensorFlow model, place `leaf_disease_model.h5`
and `labels.txt` in this folder — GET /health will report them as detected
(see MODEL_HOOK below) and you can extend `run_inference()` to call it.

API contract (matches src/services/aiService.ts)
------------------------------------------------
  GET  /health  -> { status, backend, supported_labels, tf_model_found, ... }
  GET  /labels  -> { supported_labels, note }
  POST /analyze (multipart/form-data, image under field `file`)
    -> { predicted_label, status, model_score, score_description,
         explanation, recommended_next_step, metrics,
         analysis_source, model_info }

  Every route also answers under the /api prefix (/api/analyze, /api/health,
  /api/labels) so the Vercel rewrite `/api/(.*)` -> backend service works
  while local dev keeps the bare paths.

Run (Windows PowerShell):
  cd backend
  python -m venv .venv
  .venv\\Scripts\\python -m pip install -r requirements.txt
  .venv\\Scripts\\python -m uvicorn main:app --host 127.0.0.1 --port 8000

Or double-click start-cocobot.bat.
"""

from __future__ import annotations

import os
from io import BytesIO
import json

import numpy as np
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

BACKEND_NAME = "cocobot-leaf-disease-onnx v1"
SUPPORTED_LABELS = ["healthy", "needs_inspection"]

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 8 * 1024 * 1024

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
H5_PATH = os.path.join(BASE_DIR, "leaf_disease_model.h5")
LABELS_PATH = os.path.join(BASE_DIR, "labels.txt")
ONNX_PATH = os.path.join(BASE_DIR, "leaf_disease_model.onnx")
METRICS_PATH = os.path.join(BASE_DIR, "metrics.json")

# Real trained classifier (produced by train_model.py). Preferred over the
# pixel heuristic whenever present.
try:
    import inference as leaf_disease
except Exception:  # pragma: no cover - only if numpy/PIL missing
    leaf_disease = None


def tf_model_present() -> dict:
    """Report which model artifacts exist (informational only)."""
    return {
        "leaf_disease_model.h5_found": os.path.exists(H5_PATH),
        "labels.txt_found": os.path.exists(LABELS_PATH),
        "leaf_disease_model.onnx_found": os.path.exists(ONNX_PATH),
        "trained_classifier_active": bool(
            leaf_disease is not None and leaf_disease.model_available()
        ),
    }


def read_metrics() -> dict | None:
    try:
        if os.path.exists(METRICS_PATH):
            with open(METRICS_PATH, encoding="utf-8") as f:
                return json.load(f)
    except Exception:
        return None
    return None


def read_labels_file() -> list[str] | None:
    """If a future labels.txt exists, read it so /labels can show it honestly."""
    try:
        if os.path.exists(LABELS_PATH):
            with open(LABELS_PATH, encoding="utf-8", errors="ignore") as f:
                labels = [ln.strip() for ln in f if ln.strip()]
                return labels or None
    except Exception:
        return None
    return None


app = FastAPI(title="COCO BOT 7.0 AI (demo)")


def _allowed_origins() -> list[str]:
    """CORS origins. Same-origin /api rewrites (Vercel) send the public
    domain as Origin, which can't be known at code time — so the default is
    "*" (no credentials are used). Override with ALLOWED_ORIGINS env var,
    e.g. ALLOWED_ORIGINS=http://localhost:5173,https://my-farm.vercel.app"""
    raw = os.environ.get("ALLOWED_ORIGINS", "*").strip()
    if raw == "*" or not raw:
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


app.add_middleware(
    CORSMiddleware,
    allow_origins=_allowed_origins(),
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)


def analyse_pixels(image: Image.Image) -> dict:
    """Deterministic leaf-colour analysis. Returns metrics + health index.

    All numbers are computed from the uploaded pixels — never invented.
    """
    img = image.convert("RGB").resize((256, 256))
    arr = np.asarray(img).astype(np.float32)
    r, g, b = arr[:, :, 0], arr[:, :, 1], arr[:, :, 2]

    brightness = (r + g + b) / 3.0
    # Ignore near-black / near-white background pixels for leaf stats.
    leaf_mask = (brightness > 25) & (brightness < 245)
    total = int(leaf_mask.sum())
    if total < 500:
        # Photo is mostly blank/dark — analyse whole frame instead.
        leaf_mask = np.ones_like(leaf_mask, dtype=bool)
        total = int(leaf_mask.sum())

    rm, gm, bm = r[leaf_mask], g[leaf_mask], b[leaf_mask]

    green = (gm > rm + 8) & (gm > bm + 8) & (gm > 60)
    yellow = (rm > 120) & (gm > 120) & (bm < 130) & (rm > bm + 20) & (gm > bm + 20)
    brown = (rm > 80) & (rm > gm) & (gm < 150) & (bm < 120) & (rm < 200)
    dark = (rm < 70) & (gm < 70) & (bm < 70)

    green_ratio = float(green.mean())
    yellow_ratio = float(yellow.mean())
    brown_ratio = float(brown.mean())
    dark_ratio = float(dark.mean())

    h, w = arr.shape[:2]
    leaf_coverage = float(total / (h * w))
    mean_brightness = float(brightness[leaf_mask].mean())

    # Health index: reward green dominance, penalise discolouration.
    # Weights are documented here so the score is explainable.
    health_index = (
        0.75 * green_ratio
        + 0.10 * leaf_coverage
        + 0.15 * float(np.clip((mean_brightness - 40) / 160.0, 0.0, 1.0))
        - 0.60 * yellow_ratio
        - 0.80 * brown_ratio
        - 0.40 * dark_ratio
    )
    health_index = float(np.clip(health_index, 0.0, 1.0))

    stress_ratio = float(np.clip(yellow_ratio + brown_ratio + dark_ratio, 0.0, 1.0))

    return {
        "green_ratio": round(green_ratio, 4),
        "yellow_ratio": round(yellow_ratio, 4),
        "brown_ratio": round(brown_ratio, 4),
        "dark_spot_ratio": round(dark_ratio, 4),
        "stress_ratio": round(stress_ratio, 4),
        "leaf_coverage": round(leaf_coverage, 4),
        "mean_brightness": round(mean_brightness, 1),
        "health_index": round(health_index, 4),
        "pixels_analysed": total,
    }


def build_result(metrics: dict) -> dict:
    """Map metrics to the two supported labels only."""
    health = metrics["health_index"]
    stress = metrics["stress_ratio"]

    if health >= 0.62 and stress < 0.18:
        status = "healthy"
        predicted_label = "healthy"
        explanation = (
            f"Pixel-colour analysis shows a predominantly green canopy "
            f"(green pixels {metrics['green_ratio']:.0%}, discoloured pixels {stress:.0%}) "
            f"with a leaf-greenness index of {health:.0%}. "
            f"No significant yellowing, browning, or dark spotting was measured. "
            f"This is a visual vigour reading only — it is not a disease-specific diagnosis."
        )
        next_step = (
            "Continue routine care: consistent watering, good airflow, and weekly visual checks. "
            "Re-scan if new spots, yellowing, or wilting appear."
        )
    elif health >= 0.45:
        status = "needs_inspection"
        predicted_label = "signs of stress — needs inspection"
        explanation = (
            f"Pixel-colour analysis measured moderate discolouration "
            f"(discoloured pixels {stress:.0%}, yellowing {metrics['yellow_ratio']:.0%}, "
            f"browning {metrics['brown_ratio']:.0%}) with a leaf-greenness index of {health:.0%}. "
            f"The plant may be stressed, but this system cannot name a specific disease. "
            f"Treat this as a prompt for closer inspection, not a diagnosis."
        )
        next_step = (
            "Inspect the plant closely in daylight, check soil moisture and drainage, isolate it "
            "from healthy plants, and consult a local agronomist or extension officer before "
            "applying any treatment."
        )
    else:
        status = "needs_inspection"
        predicted_label = "significant stress signals — needs inspection"
        explanation = (
            f"Pixel-colour analysis measured extensive discolouration "
            f"(discoloured pixels {stress:.0%}, green pixels only {metrics['green_ratio']:.0%}) "
            f"with a low leaf-greenness index of {health:.0%}. "
            f"This suggests the plant is stressed, but the system cannot identify which "
            f"disease or deficiency is responsible."
        )
        next_step = (
            "Prioritise an expert review: photograph multiple leaves, note watering/fertiliser "
            "history, avoid guessing treatments, and seek advice from an agricultural expert "
            "or plant clinic."
        )

    return {
        "predicted_label": predicted_label,
        "status": status,
        "model_score": health,
        "score_description": (
            "Leaf-greenness health index (0–1) computed from green vs discoloured pixel "
            "ratios. It measures visual vigour, NOT the probability of a specific disease."
        ),
        "explanation": explanation,
        "recommended_next_step": next_step,
        "metrics": metrics,
        "analysis_source": "REAL AI",
        "model_info": {
            "backend": BACKEND_NAME,
            "supported_labels": SUPPORTED_LABELS,
            "note": (
                "Deterministic pixel-colour analysis. No TensorFlow disease model connected; "
                "no specific disease is diagnosed."
            ),
        },
    }


@app.get("/health")
@app.get("/api/health", include_in_schema=False)
def health() -> dict:
    custom_labels = read_labels_file()
    m = read_metrics()
    trained = bool(leaf_disease is not None and leaf_disease.model_available())
    return {
        "status": "ok",
        "backend": BACKEND_NAME,
        "mode": "trained_classifier" if trained else "pixel_heuristic_fallback",
        "supported_labels": custom_labels or SUPPORTED_LABELS,
        "model_hook": tf_model_present(),
        "metrics": m,
        "note": "Software demonstration only. No physical sensors or hardware connected.",
    }


@app.get("/labels")
@app.get("/api/labels", include_in_schema=False)
def labels() -> dict:
    custom_labels = read_labels_file()
    trained = bool(leaf_disease is not None and leaf_disease.model_available())
    if trained:
        note = (
            f"Trained classifier active: {len(custom_labels or [])} PlantVillage classes "
            f"(crop + condition). Healthy/needs-inspection status is derived from the "
            f"predicted class name."
        )
    else:
        note = (
            "Only healthy vs needs-inspection classification is available (pixel fallback). "
            "Run train_model.py to enable the full trained classifier."
        )
    return {"supported_labels": custom_labels or SUPPORTED_LABELS, "note": note}


@app.post("/analyze")
@app.post("/api/analyze", include_in_schema=False)
async def analyze(file: UploadFile = File(...)) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please upload JPG, JPEG, PNG, or WEBP.",
        )
    raw = await file.read()
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file received.")
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 8 MB.")

    try:
        image = Image.open(BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image file.")

    # Preferred: the real trained classifier.
    if leaf_disease is not None and leaf_disease.model_available():
        try:
            r = leaf_disease.run_inference(image)
            r["analysis_source"] = "REAL AI"
            r["model_info"] = {
                "backend": BACKEND_NAME,
                "architecture": r.get("model"),
                "trained_classes": len(read_labels_file() or []),
                "metrics": read_metrics(),
                "note": (
                    "Genuine inference from a MobileNetV2 model transfer-learned on "
                    "PlantVillage. Supported labels come from labels.txt."
                ),
            }
            return r
        except Exception as e:  # inference failed -> honest error, no fabrication
            raise HTTPException(status_code=500, detail=f"Model inference failed: {e}")

    # Fallback: pixel heuristic, clearly labelled in the response.
    metrics = analyse_pixels(image)
    out = build_result(metrics)
    out["model_info"] = {
        "backend": BACKEND_NAME,
        "mode": "pixel_heuristic_fallback",
        "note": (
            "No trained classifier is deployed alongside the service, so a colour-based "
            "heuristic was used. It supports only healthy vs needs-inspection and cannot "
            "name specific diseases. Train the model (train_model.py) for full predictions."
        ),
        "metrics": read_metrics(),
    }
    return out

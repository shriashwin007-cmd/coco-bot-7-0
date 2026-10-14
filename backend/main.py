"""
TrashBots AI backend — real street-cleanliness analysis with OpenAI CLIP.

Zero-shot classification: the uploaded photo is compared against three
text descriptions (clean / moderately littered / heavily littered).
The best-matching description wins; its softmax probability is returned
as `confidence` — a genuine model output, never invented.

API contract (matches src/services/aiService.ts):
  POST /analyze  (multipart/form-data, image under field name `file`)
  -> { cleanliness, severity, explanation, waste_categories,
       confidence, recommended_action }

Run:
  .venv\\Scripts\\activate
  uvicorn main:app --host 127.0.0.1 --port 8000
"""

from io import BytesIO

import torch
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from transformers import CLIPModel, CLIPProcessor

MODEL_ID = "openai/clip-vit-base-patch32"

ALLOWED_TYPES = {"image/jpeg", "image/jpg", "image/png", "image/webp"}
MAX_BYTES = 5 * 1024 * 1024

# (cleanliness, severity, prompt, recommended action)
CLASSES = [
    (
        "clean",
        "low",
        "a clean street with no visible litter",
        "Routine monitoring. No immediate action required.",
    ),
    (
        "moderately_littered",
        "medium",
        "a street with some scattered litter and trash",
        "Schedule a routine cleanup within the next 24 hours.",
    ),
    (
        "heavily_littered",
        "high",
        "a heavily littered street covered in garbage and waste",
        "Prioritize immediate cleanup and dispatch a sanitation team.",
    ),
]

app = FastAPI(title="TrashBots AI")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_methods=["POST", "GET", "OPTIONS"],
    allow_headers=["*"],
)

_model: CLIPModel | None = None
_processor: CLIPProcessor | None = None


def get_model() -> tuple[CLIPModel, CLIPProcessor]:
    """Lazy-load CLIP once (downloads weights on first run)."""
    global _model, _processor
    if _model is None or _processor is None:
        _model = CLIPModel.from_pretrained(MODEL_ID)
        _processor = CLIPProcessor.from_pretrained(MODEL_ID)
        _model.eval()
    return _model, _processor


@app.get("/health")
def health() -> dict:
    return {"status": "ok", "model": MODEL_ID}


@app.post("/analyze")
async def analyze(file: UploadFile = File(...)) -> dict:
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type. Please use JPG, JPEG, PNG, or WEBP.",
        )

    raw = await file.read()
    if len(raw) > MAX_BYTES:
        raise HTTPException(status_code=400, detail="File too large. Maximum size is 5 MB.")
    if not raw:
        raise HTTPException(status_code=400, detail="Empty file received.")

    try:
        image = Image.open(BytesIO(raw)).convert("RGB")
    except Exception:
        raise HTTPException(status_code=400, detail="Could not read the image file.")

    model, processor = get_model()
    prompts = [c[2] for c in CLASSES]
    inputs = processor(text=prompts, images=image, return_tensors="pt", padding=True)

    with torch.no_grad():
        outputs = model(**inputs)
        probs = outputs.logits_per_image.softmax(dim=1)[0]

    scores = [(CLASSES[i][0], CLASSES[i][1], float(probs[i])) for i in range(len(CLASSES))]
    scores.sort(key=lambda s: s[2], reverse=True)
    (cleanliness, severity, top_prob), (_, _, second_prob) = scores[0], scores[1]

    recommended_action = next(c[3] for c in CLASSES if c[0] == cleanliness)
    margin = top_prob - second_prob
    certainty = (
        "with high certainty" if margin > 0.35 else "with moderate certainty" if margin > 0.12 else "but the scene is borderline"
    )
    pretty = {
        "clean": "clean",
        "moderately_littered": "moderately littered",
        "heavily_littered": "heavily littered",
    }[cleanliness]
    explanation = (
        f"CLIP vision analysis classifies this street scene as {pretty} {certainty} "
        f"(model confidence {top_prob:.0%}). "
        + (
            "No significant litter is visible on the road or sidewalk."
            if cleanliness == "clean"
            else (
                "Scattered litter items are visible along the street."
                if cleanliness == "moderately_littered"
                else "A significant accumulation of waste is visible across the scene."
            )
        )
    )

    return {
        "cleanliness": cleanliness,
        "severity": severity,
        "explanation": explanation,
        "waste_categories": [],  # CLIP classifies scenes; it cannot count items
        "confidence": round(top_prob, 4),
        "recommended_action": recommended_action,
    }

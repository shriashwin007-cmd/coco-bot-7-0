# TrashBots AI Backend (Step 2)

Real street-cleanliness analysis using **OpenAI CLIP ViT-B/32** (pretrained vision model)
via zero-shot classification. No demo data — every prediction comes from the model.

## Quick start (Windows)

1. Double-click **`start-ai.bat`** — it creates the virtual environment, installs
   libraries on first run, and starts the server at `http://localhost:8000`.
2. In a second terminal, start the website:
   ```bat
   npm run dev
   ```
3. Open the site, go to **AI Scanner**, upload a street photo, click **Analyze Image**.
   Results tagged **REAL AI** are genuine model predictions.

## Manual setup

```bat
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
.venv\Scripts\python -m pip install -r requirements.txt python-multipart
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

First analysis downloads CLIP weights once (~350 MB) and takes longer; later
analyses reuse the loaded model (typically 10–30 s on CPU).

## API

- `GET /health` → `{"status": "ok", "model": "openai/clip-vit-base-patch32"}`
- `POST /analyze` — multipart/form-data, image under field `file`
  (JPG/JPEG/PNG/WEBP, max 5 MB) →

```json
{
  "cleanliness": "clean | moderately_littered | heavily_littered",
  "severity": "low | medium | high",
  "explanation": "CLIP vision analysis ...",
  "waste_categories": [],
  "confidence": 0.6927,
  "recommended_action": "Prioritize immediate cleanup ..."
}
```

`confidence` is the model's real softmax probability. `waste_categories` is empty
because CLIP classifies whole scenes and cannot count individual items — the
frontend hides that section when empty. Item-level detection (YOLO/TACO) is a
possible future upgrade.

## Test images

`test-littered.jpg` / `test-clean.jpg` are real Wikimedia Commons photos used to
verify the backend (littered → heavily_littered 69%, clean → clean 52%).

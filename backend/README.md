# COCO BOT 7.0 AI Backend (software demonstration)

Real leaf-health analysis with **Pillow + NumPy pixel-colour analysis**.
No physical robot, sensor, pump, or solar hardware is connected.

## Model status (inspected at build time)

No `leaf_disease_model.h5` or `labels.txt` files were found in the workspace,
so no TensorFlow disease classifier is connected — and none is pretended.
The backend computes a genuine **leaf-greenness health index (0–1)** from the
uploaded pixels and supports exactly two labels:

- `healthy`
- `needs_inspection`

It never invents specific disease names (no blight / rust / mildew).

**Future hook:** if you later add a compatible TensorFlow model, place
`leaf_disease_model.h5` and `labels.txt` in this folder. `GET /health` already
reports their presence (`tf_model_hook`), and `GET /labels` will surface your
labels file. Extend `run_inference()` in `main.py` to call it.

## Quick start (Windows)

1. Double-click **`start-cocobot.bat`** — creates `.venv`, installs libraries
   on first run, starts the server at `http://localhost:8000`.
2. In a second terminal, start the website (requires Node.js 20+):
   ```bat
   npm install
   npm run dev
   ```
3. Open http://localhost:5173 → **AI Plant Doctor** → upload a leaf photo →
   **Analyze Plant**. Results tagged **REAL AI** are computed from your photo.

## Manual setup

```bat
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

## API

- `GET /health` → status, backend name, supported labels, TF hook report
- `GET /labels` → supported labels + honesty note
- `POST /analyze` — multipart/form-data, image under field `file`
  (JPG/JPEG/PNG/WEBP, max 8 MB) →

```json
{
  "predicted_label": "healthy",
  "status": "healthy | needs_inspection",
  "model_score": 0.78,
  "score_description": "Leaf-greenness health index (0–1) ...",
  "explanation": "Pixel-colour analysis shows ...",
  "recommended_next_step": "Continue routine care ...",
  "metrics": {
    "green_ratio": 0.71,
    "yellow_ratio": 0.04,
    "brown_ratio": 0.01,
    "dark_spot_ratio": 0.02,
    "stress_ratio": 0.07,
    "leaf_coverage": 0.93,
    "mean_brightness": 128.4,
    "health_index": 0.78,
    "pixels_analysed": 61234
  },
  "analysis_source": "REAL AI",
  "model_info": { "backend": "cocobot-pixel-analysis v1", "supported_labels": ["healthy", "needs_inspection"] }
}
```

`model_score` is the computed greenness index (visual vigour), **not** a
disease probability. Demo results from the frontend carry `model_score: null`
and source `DEMO` — never presented as real.

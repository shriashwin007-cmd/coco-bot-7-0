# TrashBots

AI-powered smart waste management demonstration platform.

## Prerequisites
- Node.js 20+ and npm 10+
- (Optional) A Python FastAPI AI service exposing POST /analyze

## Installation
```bash
npm install
```

## Development (website only, demo mode)
```bash
npm run dev
```
Opens the app at http://localhost:5173

## Real AI backend (Step 2)

The `backend/` folder contains a Python FastAPI server using the real pretrained
**CLIP ViT-B/32** vision model for street-cleanliness classification.

```bat
REM Terminal 1 — double-click or run:
backend\start-ai.bat
REM Terminal 2:
npm run dev
```

Then upload a street photo in the AI Scanner — results tagged **REAL AI** are
genuine model predictions with real confidence scores. See `backend/README.md`
for details. The website reads the backend URL from `.env`
(see `.env.example`); without it, the site runs in clearly labelled demo mode.

## Production build
```bash
npm run build
npm run preview
```

## Demo mode
- Click "Load demonstration data" on the Dashboard (or "Load demonstration data" in empty states).
- Click "Run Demo Scenario" to load sample scans, reports and hotspots.
- Use "Run Demonstration Analysis" on the AI Scanner page to create a clearly labelled DEMO result.
- "Clear demo data" removes only demonstration records.

## AI backend integration
Set `VITE_AI_API_URL` in `.env` (see `.env.example`):
```env
VITE_AI_API_URL=http://localhost:8000
```
The frontend sends `multipart/form-data` with field `file` to `{VITE_AI_API_URL}/analyze` and validates the JSON response. If unavailable, a clear message is shown and no fake result is substituted.

## Proposed API response
```json
{
  "cleanliness": "clean | moderately_littered | heavily_littered",
  "severity": "low | medium | high",
  "explanation": "Description of the visible waste and street condition",
  "waste_categories": [{ "name": "plastic bottle", "count": 2 }],
  "confidence": null,
  "recommended_action": "Suggested sanitation action"
}
```

## Environment variables
No API keys or secrets are stored in the frontend. Only `VITE_AI_API_URL`.
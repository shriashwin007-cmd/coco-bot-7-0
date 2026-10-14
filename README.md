# COCO BOT 7.0 — Smart Autonomous Crop Guardian (software demonstration)

AI-powered crop monitoring + plant disease screening demo. Upload a leaf photo,
get an honest **healthy / needs-inspection** reading with explanation, save
reports, and explore the farm dashboard, scan history, and a simulated field
robot. No physical hardware is connected.

## Prerequisites

- **Node.js 20+** and npm 10+ ([nodejs.org](https://nodejs.org)) — for the website
- **Python 3.10+** — for the AI backend (already on most Windows machines)

## 1 · Run the website (demo mode)

```bat
npm install
npm run dev
```

Open http://localhost:5173. Without the backend, use **Demo result** buttons —
every demo output is badged **DEMO** and carries no model score.

## 2 · Run the real AI backend

Double-click **`backend\start-cocobot.bat`**, or manually:

```bat
cd backend
python -m venv .venv
.venv\Scripts\python -m pip install -r requirements.txt
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
```

Keep that window open, then in a second terminal run `npm run dev`.
Upload a leaf photo in **AI Plant Doctor** → **Analyze Plant**.
Results tagged **REAL AI** show a genuine computed health index + pixel metrics.

The website reads the backend URL from `.env` (see `.env.example`):

```env
VITE_AI_API_URL=http://localhost:8000
```

## Production build

```bat
npm run build
npm run preview
```

## Honesty rules (important for your presentation)

- Supported labels: `healthy` and `needs_inspection` only — no specific diseases diagnosed.
- `model_score` = leaf-greenness health index (visual vigour), not a disease probability.
- Demo outputs are always badged DEMO with null score, kept separate from REAL AI.
- Virtual COCO BOT sensor/pump panels are all marked SIMULATED; the run-cycle button only updates the simulation.
- No `leaf_disease_model.h5` / `labels.txt` were present at build — see `backend/README.md` for the future-model hook.

## Deploy on Vercel (multi-service)

`vercel.json` defines two services in one project:

- `app` (Vite frontend, catch-all route) with a `BACKEND_URL` binding to `backend`
- `backend` (FastAPI, public under `/api/*`)

The browser calls same-origin `/api/...`, which Vercel rewrites to the backend
service — so **do not set `VITE_AI_API_URL` in the Vercel dashboard** (leave it
unset and the deployed site just works). Local dev keeps using `.env`
(`VITE_AI_API_URL=http://localhost:8000`), or remove it and rely on the Vite
dev proxy, which forwards `/api` to `http://127.0.0.1:8000`.

```bat
npm i -g vercel
vercel deploy
```

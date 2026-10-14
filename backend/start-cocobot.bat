@echo off
REM COCO BOT 7.0 — start the AI inference backend (Windows).
REM Double-click this file. No physical hardware is involved.
cd /d "%~dp0"
if not exist .venv (
  echo Creating virtual environment...
  python -m venv .venv
)
echo Installing libraries (first run takes a few minutes)...
.venv\Scripts\python -m pip install --upgrade pip
.venv\Scripts\python -m pip install -r requirements.txt
echo.
echo Starting COCO BOT 7.0 AI at http://localhost:8000 ...
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
pause

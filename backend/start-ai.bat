@echo off
REM TrashBots AI backend launcher (Windows, beginner-friendly).
REM Double-click this file to start the AI server at http://localhost:8000
cd /d "%~dp0"
if not exist ".venv\Scripts\python.exe" (
  echo Virtual environment not found. Creating it...
  python -m venv .venv
  echo Installing AI libraries (one-time, several minutes)...
  .venv\Scripts\python -m pip install torch --index-url https://download.pytorch.org/whl/cpu
  .venv\Scripts\python -m pip install -r requirements.txt python-multipart
)
echo Starting TrashBots AI server...
.venv\Scripts\python -m uvicorn main:app --host 127.0.0.1 --port 8000
pause

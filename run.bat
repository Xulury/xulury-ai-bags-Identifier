@echo off
echo Starting LuxeLens Backend and Frontend...

:: Start Backend
echo Starting FastAPI Backend...
cd backend
start "LuxeLens Backend" cmd /k "pip install -r requirements.txt && python -m uvicorn main:app --reload"

:: Go back to root
cd ..

:: Start Frontend
echo Starting Next.js Frontend...
start "LuxeLens Frontend" cmd /k "pnpm run dev || npm run dev"

echo Services are starting in new windows!

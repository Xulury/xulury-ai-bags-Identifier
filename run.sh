#!/bin/bash

echo "Starting LuxeLens Backend and Frontend..."

# Start Backend
cd backend
echo "Installing Python dependencies..."
pip install -r requirements.txt
echo "Starting FastAPI backend..."
python -m uvicorn main:app --reload &
BACKEND_PID=$!

# Go back to root
cd ..

# Start Frontend
echo "Starting Next.js frontend..."
# Try pnpm first, fallback to npm
if command -v pnpm &> /dev/null; then
    pnpm run dev &
else
    npm run dev &
fi
FRONTEND_PID=$!

echo "Both services are running! Press Ctrl+C to stop both."

# Trap Ctrl+C and kill both processes
trap "kill $BACKEND_PID $FRONTEND_PID; exit" SIGINT SIGTERM

wait $BACKEND_PID $FRONTEND_PID

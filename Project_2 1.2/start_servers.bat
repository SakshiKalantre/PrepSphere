@echo off
echo Starting PrepSphere servers...

echo Starting backend API server on port 8000...
start "Backend Server" cmd /k "cd backend && uvicorn main:app --reload --port 8000"

echo Starting frontend server on port 3000...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo Servers started successfully!
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause >nul

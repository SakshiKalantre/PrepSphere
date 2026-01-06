@echo off
echo Starting PrepSphere servers...

echo Starting backend API server on port 8000...
start "Backend Server" cmd /k "cd backend && python simple_server.py"

echo Starting frontend server on port 3001...
start "Frontend Server" cmd /k "cd frontend && python -m http.server 3001"

echo Servers started successfully!
echo.
echo Backend API: http://localhost:8000
echo Frontend: http://localhost:3001
echo.
echo Press any key to exit...
pause >nul
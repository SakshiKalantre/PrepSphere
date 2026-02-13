import subprocess
import os
import time
import sys

# Get the project root directory
project_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(project_root, "backend")
frontend_dir = os.path.join(project_root, "frontend")

print("Starting PrepSphere servers...")

# Start backend server
print("Starting backend API server on port 8000...")
# Use the same command that worked manually
backend_process = subprocess.Popen(
    [sys.executable, "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"],
    cwd=backend_dir,
    shell=True # Try shell=True to avoid path issues
)

# Wait a moment for the backend to start
time.sleep(5)

# Start frontend server
print("Starting frontend server on port 3000...")
# Use npm run dev
frontend_process = subprocess.Popen(
    ["npm", "run", "dev"],
    cwd=frontend_dir,
    shell=True
)

print("\nServers started successfully!")
print("Backend API: http://localhost:8000")
print("Frontend: http://localhost:3000")
print("\nPress Ctrl+C to stop servers...")

try:
    # Keep the script running
    while True:
        time.sleep(1)
        if backend_process.poll() is not None:
            print("Backend process ended unexpectedly")
            break
        if frontend_process.poll() is not None:
            print("Frontend process ended unexpectedly")
            break
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend_process.terminate()
    frontend_process.terminate()
    print("Servers stopped.")

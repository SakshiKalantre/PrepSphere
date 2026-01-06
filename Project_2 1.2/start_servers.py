import subprocess
import os
import time

# Get the project root directory
project_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(project_root, "backend")
frontend_dir = os.path.join(project_root, "frontend")

print("Starting PrepSphere servers...")

# Start backend server
print("Starting backend API server on port 8000...")
backend_process = subprocess.Popen(
    ["python", "simple_server.py"],
    cwd=backend_dir
)

# Wait a moment for the backend to start
time.sleep(2)

# Start frontend server
print("Starting frontend server on port 3001...")
frontend_process = subprocess.Popen(
    ["python", "-m", "http.server", "3001"],
    cwd=frontend_dir
)

print("\nServers started successfully!")
print("Backend API: http://localhost:8000")
print("Frontend: http://localhost:3001")
print("\nPress Ctrl+C to stop servers...")

try:
    # Keep the script running
    backend_process.wait()
    frontend_process.wait()
except KeyboardInterrupt:
    print("\nStopping servers...")
    backend_process.terminate()
    frontend_process.terminate()
    print("Servers stopped.")
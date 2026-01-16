ximport subprocess
import sys
import os

# Change to the backend directory
os.chdir(r"d:\Trea Ps\PrepShpere 1.2\Project_2 1.2\backend")

# Start the uvicorn server
try:
    result = subprocess.run([
        sys.executable, "-m", "uvicorn", 
        "main:app", 
        "--host", "127.0.0.1", 
        "--port", "8000", 
        "--reload"
    ], check=True)
except subprocess.CalledProcessError as e:
    print(f"Error starting server: {e}")
except KeyboardInterrupt:
    print("Server stopped by user")
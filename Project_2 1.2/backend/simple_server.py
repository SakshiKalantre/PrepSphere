import uvicorn
import os
import sys

# Add the current directory to the path so that app imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

if __name__ == "__main__":
    print("Starting PrepSphere Real Backend (FastAPI)...")
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

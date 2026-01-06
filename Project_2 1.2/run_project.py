#!/usr/bin/env python3
"""
Project Runner Script for PrepSphere
This script helps run both the frontend and backend applications.
"""

import subprocess
import sys
import os
import signal
from pathlib import Path

# Global variables to track processes
processes = []

def signal_handler(sig, frame):
    """Handle Ctrl+C gracefully"""
    print("\n\nStopping PrepSphere applications...")
    for process in processes:
        try:
            process.terminate()
        except:
            pass
    sys.exit(0)

def check_prerequisites():
    """Check if prerequisites are met"""
    prerequisites = [
        ("node", "Node.js"),
        ("npm", "npm"),
        ("python", "Python")
    ]
    
    for command, name in prerequisites:
        try:
            subprocess.run([command, "--version"], 
                          capture_output=True, text=True)
            print(f"✓ {name} is available")
        except FileNotFoundError:
            print(f"✗ {name} is not installed or not in PATH")
            return False
    
    # Check if directories exist
    if not Path("frontend").exists():
        print("✗ Frontend directory not found")
        return False
    
    if not Path("backend").exists():
        print("✗ Backend directory not found")
        return False
    
    print("✓ All prerequisites met")
    return True

def run_frontend():
    """Run the frontend application"""
    try:
        print("Starting frontend application...")
        process = subprocess.Popen(
            ["npm", "run", "dev"],
            cwd="frontend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        processes.append(process)
        print("✓ Frontend application started")
        print("  Access at: http://localhost:3000")
        return True
    except Exception as e:
        print(f"✗ Failed to start frontend: {e}")
        return False

def run_backend():
    """Run the backend application"""
    try:
        print("Starting backend application...")
        process = subprocess.Popen(
            ["uvicorn", "main:app", "--reload"],
            cwd="backend",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE
        )
        processes.append(process)
        print("✓ Backend application started")
        print("  API at: http://localhost:8000")
        print("  Docs at: http://localhost:8000/docs")
        return True
    except Exception as e:
        print(f"✗ Failed to start backend: {e}")
        return False

def main():
    print("PrepSphere Application Runner")
    print("=" * 40)
    
    # Set up signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    
    # Check prerequisites
    if not check_prerequisites():
        print("\n✗ Prerequisites not met. Please check the setup instructions.")
        sys.exit(1)
    
    # Start applications
    print("\nStarting PrepSphere applications...")
    
    backend_started = run_backend()
    frontend_started = run_frontend()
    
    if not backend_started or not frontend_started:
        print("\n✗ Failed to start one or more applications")
        signal_handler(None, None)
    
    print("\n" + "=" * 40)
    print("✓ PrepSphere is now running!")
    print("\nAccess the applications:")
    print("  Frontend: http://localhost:3000")
    print("  Backend API: http://localhost:8000")
    print("  Backend Docs: http://localhost:8000/docs")
    print("\nPress Ctrl+C to stop all applications")
    
    # Wait for processes
    try:
        while True:
            for process in processes:
                if process.poll() is not None:
                    print("✗ A process has terminated unexpectedly")
                    signal_handler(None, None)
            # Small delay to prevent busy waiting
            import time
            time.sleep(1)
    except KeyboardInterrupt:
        signal_handler(None, None)

if __name__ == "__main__":
    main()
#!/usr/bin/env python3
"""
Project Initialization Script for PrepSphere
This script helps initialize the PrepSphere project by creating necessary directories and files.
"""

import os
import sys
from pathlib import Path

def create_uploads_directory():
    """Create the uploads directory for file storage"""
    uploads_path = Path("backend/uploads")
    if not uploads_path.exists():
        uploads_path.mkdir(parents=True)
        print(f"✓ Created uploads directory: {uploads_path}")
    else:
        print(f"✓ Uploads directory already exists: {uploads_path}")

def create_env_files():
    """Create template .env files with instructions"""
    
    # Backend .env template
    backend_env_content = """# Database Configuration
DATABASE_URL=postgresql://prepsphere_user:your_password@localhost:5432/prepsphere

# Clerk API Keys
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE

# Application Settings
PROJECT_NAME=PrepSphere
BACKEND_CORS_ORIGINS=["http://localhost:3000"]

# File Upload Settings
UPLOAD_FOLDER=./uploads
MAX_FILE_SIZE=10485760

# Security Settings
SECRET_KEY=your-random-secret-key-change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
"""
    
    backend_env_path = Path("backend/.env")
    if not backend_env_path.exists():
        with open(backend_env_path, "w") as f:
            f.write(backend_env_content)
        print(f"✓ Created backend .env file: {backend_env_path}")
    else:
        print(f"✓ Backend .env file already exists: {backend_env_path}")
    
    # Frontend .env.local template
    frontend_env_content = """# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
CLERK_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
"""
    
    frontend_env_path = Path("frontend/.env.local")
    if not frontend_env_path.exists():
        with open(frontend_env_path, "w") as f:
            f.write(frontend_env_content)
        print(f"✓ Created frontend .env.local file: {frontend_env_path}")
    else:
        print(f"✓ Frontend .env.local file already exists: {frontend_env_path}")

def check_project_structure():
    """Verify the project structure exists"""
    required_paths = [
        "frontend",
        "backend",
        "frontend/app",
        "backend/app"
    ]
    
    for path in required_paths:
        if not Path(path).exists():
            print(f"✗ Required directory missing: {path}")
            return False
        else:
            print(f"✓ Found directory: {path}")
    
    return True

def main():
    print("PrepSphere Project Initialization")
    print("=" * 40)
    
    # Check project structure
    if not check_project_structure():
        print("\n✗ Project structure is incomplete. Please ensure you're in the correct directory.")
        sys.exit(1)
    
    # Create necessary directories
    print("\nCreating directories...")
    create_uploads_directory()
    
    # Create environment files
    print("\nCreating environment files...")
    create_env_files()
    
    print("\n" + "=" * 40)
    print("✓ Project initialization completed!")
    print("\nNext steps:")
    print("1. Update the .env files with your actual credentials")
    print("2. Set up your PostgreSQL database")
    print("3. Install dependencies:")
    print("   - Frontend: cd frontend && npm install")
    print("   - Backend: cd backend && pip install -r requirements.txt")
    print("4. Run the application")

if __name__ == "__main__":
    main()
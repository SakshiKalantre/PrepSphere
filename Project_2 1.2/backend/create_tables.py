#!/usr/bin/env python
"""
Quick database table creation script
Run this to create all tables
"""

import sys
import os

# Add backend to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.db.session import engine, Base
    from app.models import (
        User, Profile, UserRole,
        Resume, Certificate,
        Job, JobApplication, ApplicationStatus,
        Event, EventRegistration,
        FileUpload, Notification, NotificationType
    )
    
    print("Creating database tables...")
    print(f"Database: postgresql://user:Swapnil%402102@localhost:5432/Project_2")
    
    # Create all tables
    Base.metadata.create_all(bind=engine)
    
    print("\n✓ Success! Database tables created:")
    print("  1. users")
    print("  2. profiles")
    print("  3. resumes")
    print("  4. certificates")
    print("  5. jobs")
    print("  6. job_applications")
    print("  7. events")
    print("  8. event_registrations")
    print("  9. file_uploads")
    print(" 10. notifications")
    print("\nAll tables created successfully!")
    
except ImportError as e:
    print(f"❌ Import Error: {e}")
    print("Make sure all dependencies are installed:")
    print("  pip install -r requirements.txt")
    sys.exit(1)
except Exception as e:
    print(f"❌ Error creating tables: {e}")
    print(f"Error type: {type(e).__name__}")
    sys.exit(1)

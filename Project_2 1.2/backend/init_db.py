"""
Database initialization script
Run this to create all tables in the database
"""

from app.db.session import engine, Base
from app.models import *  # noqa: F401, F403

def init_db():
    """Create all tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created successfully!")
    print("\nCreated tables:")
    print("  - users")
    print("  - profiles")
    print("  - resumes")
    print("  - certificates")
    print("  - jobs")
    print("  - job_applications")
    print("  - events")
    print("  - event_registrations")
    print("  - file_uploads")
    print("  - notifications")

if __name__ == "__main__":
    init_db()

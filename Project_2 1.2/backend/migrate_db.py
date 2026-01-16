import os
import sys
from sqlalchemy import create_engine, text, inspect

# Add backend directory to path so we can import app modules if needed
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def migrate():
    print(f"Connecting to database...")
    engine = create_engine(settings.DATABASE_URL)
    
    with engine.connect() as conn:
        print("Connected. Checking schema...")
        
        # 1. Check file_uploads table
        print("Checking file_uploads table...")
        # Create table if not exists (basic version, rely on models for full schema later or here)
        # Actually server.js created it. We just need to ensure columns.
        
        # We use raw SQL to add columns if missing, similar to server.js
        queries = [
            # Profiles
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alternate_email VARCHAR(255);",
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS placement_status VARCHAR(50);",
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_status VARCHAR(50) DEFAULT 'Pending';",
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS approval_notes TEXT;",
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS company_name TEXT;",
            "ALTER TABLE profiles ADD COLUMN IF NOT EXISTS offer_letter_url TEXT;",
            
            # File Uploads
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;",
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS verified_by INTEGER;",
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS verification_notes TEXT;",
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS file_url VARCHAR(255);",
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Pending';",
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS file_hash TEXT;",
            "ALTER TABLE file_uploads ADD COLUMN IF NOT EXISTS file_type VARCHAR(50);", 
            
            # Jobs
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS location TEXT;",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS salary TEXT;",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS type TEXT;",
            "ALTER TABLE jobs ADD COLUMN IF NOT EXISTS job_type VARCHAR(50);",
            
            # Events
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS event_time TEXT;",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS form_url TEXT;",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS date DATE;",
            "ALTER TABLE events ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'Upcoming';",
            
            # Notifications
             "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS sent_by INTEGER;",
             "ALTER TABLE notifications ADD COLUMN IF NOT EXISTS notification_type VARCHAR(50) DEFAULT 'SYSTEM';"
        ]
        
        for q in queries:
            try:
                conn.execute(text(q))
                print(f"Executed: {q}")
            except Exception as e:
                print(f"Error executing {q}: {e}")
                
        conn.commit()
        print("Migration complete.")

if __name__ == "__main__":
    migrate()

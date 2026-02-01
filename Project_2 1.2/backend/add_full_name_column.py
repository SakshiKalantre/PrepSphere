import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def add_full_name_column():
    """Add full_name column to profiles table"""
    try:
        # Create database engine
        engine = create_engine(settings.DATABASE_URL)
        SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
        db = SessionLocal()
        
        # Check if column exists
        check_column_sql = """
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'full_name'
        """
        
        result = db.execute(text(check_column_sql))
        column_exists = result.fetchone()
        
        if column_exists:
            print("Column 'full_name' already exists in profiles table")
            return
        
        # Add the full_name column
        add_column_sql = """
        ALTER TABLE profiles 
        ADD COLUMN full_name VARCHAR(255)
        """
        
        db.execute(text(add_column_sql))
        db.commit()
        print("Successfully added 'full_name' column to profiles table")
        
        # Populate existing records with full names
        populate_sql = """
        UPDATE profiles 
        SET full_name = CONCAT(u.first_name, ' ', u.last_name)
        FROM users u
        WHERE profiles.user_id = u.id 
        AND profiles.full_name IS NULL
        AND (u.first_name IS NOT NULL OR u.last_name IS NOT NULL)
        """
        
        db.execute(text(populate_sql))
        db.commit()
        print("Successfully populated existing profiles with full names")
        
        db.close()
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")
        if 'db' in locals():
            db.rollback()
            db.close()

if __name__ == "__main__":
    add_full_name_column()
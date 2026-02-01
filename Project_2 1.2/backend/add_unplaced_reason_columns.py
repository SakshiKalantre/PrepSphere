import os
import sys
from sqlalchemy import create_engine, text

# Add the app directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings

def add_unplaced_reason_columns():
    """Add unplaced reason columns to profiles table"""
    try:
        # Create database engine
        engine = create_engine(settings.DATABASE_URL)
        
        with engine.connect() as conn:
            # Check if unplaced_reason column exists
            check_unplaced_reason_sql = """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'unplaced_reason'
            """
            
            result = conn.execute(text(check_unplaced_reason_sql))
            unplaced_reason_exists = result.fetchone()
            
            if not unplaced_reason_exists:
                # Add the unplaced_reason column
                add_unplaced_reason_sql = """
                ALTER TABLE profiles 
                ADD COLUMN unplaced_reason VARCHAR(50)
                """
                
                conn.execute(text(add_unplaced_reason_sql))
                conn.commit()
                print("Successfully added 'unplaced_reason' column to profiles table")
            else:
                print("Column 'unplaced_reason' already exists in profiles table")
            
            # Check if custom_reason_text column exists
            check_custom_reason_sql = """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'custom_reason_text'
            """
            
            result = conn.execute(text(check_custom_reason_sql))
            custom_reason_exists = result.fetchone()
            
            if not custom_reason_exists:
                # Add the custom_reason_text column
                add_custom_reason_sql = """
                ALTER TABLE profiles 
                ADD COLUMN custom_reason_text TEXT
                """
                
                conn.execute(text(add_custom_reason_sql))
                conn.commit()
                print("Successfully added 'custom_reason_text' column to profiles table")
            else:
                print("Column 'custom_reason_text' already exists in profiles table")
            
            # Check if has_uploaded_documents column exists
            check_docs_sql = """
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'profiles' AND column_name = 'has_uploaded_documents'
            """
            
            result = conn.execute(text(check_docs_sql))
            docs_exists = result.fetchone()
            
            if not docs_exists:
                # Add the has_uploaded_documents column
                add_docs_sql = """
                ALTER TABLE profiles 
                ADD COLUMN has_uploaded_documents BOOLEAN DEFAULT FALSE
                """
                
                conn.execute(text(add_docs_sql))
                conn.commit()
                print("Successfully added 'has_uploaded_documents' column to profiles table")
            else:
                print("Column 'has_uploaded_documents' already exists in profiles table")
        
        print("Migration completed successfully!")
        
    except Exception as e:
        print(f"Error during migration: {e}")

if __name__ == "__main__":
    add_unplaced_reason_columns()
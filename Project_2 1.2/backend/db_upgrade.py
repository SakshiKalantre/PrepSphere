
import os
from sqlalchemy import create_engine, text
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

def upgrade_db():
    engine = create_engine(DATABASE_URL)
    with engine.connect() as conn:
        print("Connected to database...")
        
        # Add category column
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN category VARCHAR"))
            print("Added 'category' column.")
        except Exception as e:
            print(f"Could not add 'category' column (might already exist): {e}")
            
        # Add event_type column
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN event_type VARCHAR"))
            print("Added 'event_type' column.")
        except Exception as e:
            print(f"Could not add 'event_type' column (might already exist): {e}")
            
        # Add capacity column
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN capacity INTEGER"))
            print("Added 'capacity' column.")
        except Exception as e:
            print(f"Could not add 'capacity' column (might already exist): {e}")

        # Add is_online column
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN is_online BOOLEAN DEFAULT FALSE"))
            print("Added 'is_online' column.")
        except Exception as e:
            print(f"Could not add 'is_online' column (might already exist): {e}")
            
        # Add meeting_link column
        try:
            conn.execute(text("ALTER TABLE events ADD COLUMN meeting_link VARCHAR"))
            print("Added 'meeting_link' column.")
        except Exception as e:
            print(f"Could not add 'meeting_link' column (might already exist): {e}")
            
        conn.commit()
        print("Database upgrade completed.")

if __name__ == "__main__":
    upgrade_db()

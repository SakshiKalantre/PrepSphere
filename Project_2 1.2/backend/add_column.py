from app.db.session import engine
from sqlalchemy import text

def add_hashed_password_column():
    try:
        with engine.connect() as conn:
            # Check if column exists
            result = conn.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='users' AND column_name='hashed_password'
            """)).fetchone()
            
            if not result:
                # Add the column if it doesn't exist
                conn.execute(text('ALTER TABLE users ADD COLUMN hashed_password VARCHAR'))
                conn.commit()
                print('hashed_password column added to users table')
            else:
                print('hashed_password column already exists')
                
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    add_hashed_password_column()
from app.db.session import engine
from sqlalchemy import text

def update_schema():
    with engine.connect() as connection:
        with connection.begin():
            # Check if column exists to avoid error
            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN is_verified BOOLEAN DEFAULT FALSE"))
                print("Added is_verified column")
            except Exception as e:
                print(f"is_verified column might already exist: {e}")

            try:
                connection.execute(text("ALTER TABLE users ADD COLUMN verification_token VARCHAR"))
                print("Added verification_token column")
            except Exception as e:
                print(f"verification_token column might already exist: {e}")

if __name__ == "__main__":
    update_schema()

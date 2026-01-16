from sqlalchemy import text
from app.db.session import engine

def check_job_status():
    with engine.connect() as conn:
        print("Checking job_applications status values...")
        result = conn.execute(text("SELECT id, status FROM job_applications"))
        rows = result.fetchall()
        for row in rows:
            print(f"ID: {row[0]}, Status: '{row[1]}'")

if __name__ == "__main__":
    check_job_status()

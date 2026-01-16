from sqlalchemy import text
from app.db.session import engine

def fix_job_status():
    with engine.connect() as conn:
        print("Updating job_applications status values to UPPERCASE...")
        
        # Check current values first
        result = conn.execute(text("SELECT DISTINCT status FROM job_applications"))
        values = [row[0] for row in result.fetchall()]
        print(f"Current values: {values}")
        
        # Update
        conn.execute(text("UPDATE job_applications SET status = UPPER(status)"))
        conn.commit()
        
        print("Done.")

if __name__ == "__main__":
    fix_job_status()

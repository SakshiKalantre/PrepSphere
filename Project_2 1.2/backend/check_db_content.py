from sqlalchemy.orm import Session
from app.db.session import SessionLocal
from app.models.user import User, Profile
from app.models.job import Job
from app.models.event import Event
from app.models.file import FileUpload

def check_db():
    db = SessionLocal()
    try:
        print("--- Users ---")
        users = db.query(User).all()
        for u in users:
            print(f"ID: {u.id}, Email: {u.email}, Role: {u.role}, Approved: {u.is_approved}")

        print("\n--- Jobs ---")
        jobs = db.query(Job).all()
        for j in jobs:
            status = "Active" if j.is_active else "Inactive"
            print(f"ID: {j.id}, Title: {j.title}, Status: {status}")

        print("\n--- Events ---")
        events = db.query(Event).all()
        for e in events:
            print(f"ID: {e.id}, Title: {e.title}, Date: {e.event_date}")

        print("\n--- Files ---")
        files = db.query(FileUpload).all()
        for f in files:
            print(f"ID: {f.id}, Name: {f.file_name}, Status: {f.status}, Type: {f.file_type}")

    finally:
        db.close()

if __name__ == "__main__":
    check_db()

import os
import sys
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.db.session import SessionLocal, engine
from app.models.user import User, UserRole, Profile
from app.models.job import Job
from app.models.event import Event

# Add the current directory to the path so that app imports work
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def init_db():
    db = SessionLocal()
    try:
        seed_data(db)
    finally:
        db.close()

def seed_data(db: Session):
    print("Seeding data...")
    
    # 1. Ensure TPO User exists
    tpo_email = "tpo@example.com"
    tpo_user = db.query(User).filter(User.email == tpo_email).first()
    if not tpo_user:
        print(f"Creating TPO user: {tpo_email}")
        tpo_user = User(
            clerk_user_id="user_tpo_123", # Dummy ID
            email=tpo_email,
            first_name="TPO",
            last_name="Officer",
            role=UserRole.TPO,
            is_active=True,
            is_approved=True,
            profile_complete=True
        )
        db.add(tpo_user)
        db.commit()
        db.refresh(tpo_user)
        
        # Create Profile for TPO
        tpo_profile = Profile(
            user_id=tpo_user.id,
            phone="1234567890",
            about="Head of Placement Cell"
        )
        db.add(tpo_profile)
        db.commit()
    else:
        print(f"TPO user already exists: {tpo_user.email}")

    # 2. Ensure Student User exists
    student_email = "student@example.com"
    student_user = db.query(User).filter(User.email == student_email).first()
    if not student_user:
        print(f"Creating Student user: {student_email}")
        student_user = User(
            clerk_user_id="user_student_456", # Dummy ID
            email=student_email,
            first_name="John",
            last_name="Doe",
            role=UserRole.STUDENT,
            is_active=True,
            is_approved=True,
            profile_complete=True
        )
        db.add(student_user)
        db.commit()
        db.refresh(student_user)
        
        # Create Profile for Student
        student_profile = Profile(
            user_id=student_user.id,
            phone="9876543210",
            degree="B.Tech",
            year="2025",
            skills="Python, React, SQL",
            about="Aspiring Software Engineer",
            placement_status="Not Placed"
        )
        db.add(student_profile)
        db.commit()
    else:
        print(f"Student user already exists: {student_user.email}")

    # 3. Create Jobs
    jobs_count = db.query(Job).count()
    if jobs_count == 0:
        print("Creating sample jobs...")
        jobs = [
            Job(
                title="Software Engineer Intern",
                company="TechCorp",
                location="Bangalore",
                description="Join our team as an intern...",
                requirements="Python, JavaScript",
                salary_range="20k-30k/month",
                salary="25000",
                job_type="Internship",
                type="Internship",
                created_by=tpo_user.id,
                application_deadline=datetime.now() + timedelta(days=30),
                is_active=True
            ),
            Job(
                title="Data Analyst",
                company="DataWiz",
                location="Remote",
                description="Analyze data trends...",
                requirements="SQL, Excel, Python",
                salary_range="6-8 LPA",
                salary="700000",
                job_type="Full-time",
                type="Full-time",
                created_by=tpo_user.id,
                application_deadline=datetime.now() + timedelta(days=15),
                is_active=True
            )
        ]
        db.add_all(jobs)
        db.commit()
        print(f"Created {len(jobs)} jobs.")
    else:
        print(f"Jobs already exist: {jobs_count}")

    # 4. Create Events
    events_count = db.query(Event).count()
    if events_count == 0:
        print("Creating sample events...")
        events = [
            Event(
                title="Resume Building Workshop",
                description="Learn how to craft a perfect resume.",
                location="Seminar Hall 1",
                event_date=datetime.now() + timedelta(days=5),
                event_time="10:00 AM",
                status="Upcoming",
                event_type="Workshop",
                created_by=tpo_user.id,
                is_active=True
            ),
            Event(
                title="Mock Interview Session",
                description="Practice with industry experts.",
                location="Online",
                event_date=datetime.now() - timedelta(days=2),
                event_time="2:00 PM",
                status="Completed",
                event_type="Interview",
                created_by=tpo_user.id,
                is_active=True
            )
        ]
        db.add_all(events)
        db.commit()
        print(f"Created {len(events)} events.")
    else:
        print(f"Events already exist: {events_count}")

    print("Data seeding complete.")

if __name__ == "__main__":
    init_db()

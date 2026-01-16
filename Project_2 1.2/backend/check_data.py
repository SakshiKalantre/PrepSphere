import os
import sys
from sqlalchemy import create_engine, text

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.core.config import settings

def check():
    engine = create_engine(settings.DATABASE_URL)
    with engine.connect() as conn:
        jobs_count = conn.execute(text("SELECT count(*) FROM jobs")).scalar()
        events_count = conn.execute(text("SELECT count(*) FROM events")).scalar()
        files_count = conn.execute(text("SELECT count(*) FROM file_uploads")).scalar()
        resumes_count = conn.execute(text("SELECT count(*) FROM resumes")).scalar()
        
        print(f"Jobs: {jobs_count}", flush=True)
        print(f"Events: {events_count}", flush=True)
        print(f"File Uploads: {files_count}", flush=True)
        print(f"Resumes Table: {resumes_count}", flush=True)
        
        if events_count == 0:
            print("Seeding events...")
            conn.execute(text("""
                INSERT INTO events (title, description, location, date, event_time, status) VALUES 
                ('Resume Writing Workshop', 'Learn how to craft a perfect resume.', 'Seminar Hall A', '2024-01-10', '10:00 AM', 'Completed'),
                ('Mock Interview Session', 'Practice your interview skills.', 'Career Center', '2024-01-15', '2:00 PM', 'Completed'),
                ('Industry Expert Talk', 'Insights from industry leaders.', 'Auditorium', '2024-01-20', '4:00 PM', 'Upcoming')
            """))
            conn.commit()
            print("Events seeded.")
            
        if jobs_count == 0:
            # Need a valid user ID for created_by. Let's find a TPO user or just use 1.
            # Assuming user 1 exists or we can find one.
            user_id = conn.execute(text("SELECT id FROM users LIMIT 1")).scalar()
            if user_id:
                print(f"Seeding jobs with creator {user_id}...")
                conn.execute(text(f"""
                    INSERT INTO jobs (title, company, location, description, requirements, salary, type, status, created_by, posted) VALUES 
                    ('Software Engineer', 'TechCorp', 'Bangalore', 'Develop web apps.', 'React, Node.js', '12 LPA', 'Full-time', 'Active', {user_id}, NOW()),
                    ('Data Analyst', 'DataInc', 'Mumbai', 'Analyze data.', 'Python, SQL', '8 LPA', 'Internship', 'Active', {user_id}, NOW())
                """))
                conn.commit()
                print("Jobs seeded.")
            else:
                print("No users found, cannot seed jobs.")
                
        # Check file_uploads
        files = conn.execute(text("SELECT id, file_name, file_type FROM file_uploads LIMIT 5")).mappings().all()
        print(f"File Uploads Sample: {files}")

if __name__ == "__main__":
    check()

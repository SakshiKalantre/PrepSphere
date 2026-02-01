
from app.db.session import SessionLocal
from app.models.user import User, Profile
from sqlalchemy import func

db = SessionLocal()

try:
    total_students = db.query(User).filter((User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT')).count()
    profiles_count = db.query(Profile).count()
    unplaced_students = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed'
    ).count()
    
    print(f"Total Students (User table): {total_students}")
    print(f"Total Profiles: {profiles_count}")
    print(f"Unplaced Students (with Profile): {unplaced_students}")

finally:
    db.close()

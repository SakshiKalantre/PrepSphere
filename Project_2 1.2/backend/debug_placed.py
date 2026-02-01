
from app.db.session import SessionLocal
from app.models.user import User, Profile
from sqlalchemy import func

db = SessionLocal()

try:
    placed_students = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Placed'
    ).count()
    
    students_without_profile = db.query(User).outerjoin(Profile, User.id == Profile.user_id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.id == None
    ).count()

    print(f"Placed Students: {placed_students}")
    print(f"Students without Profile: {students_without_profile}")

finally:
    db.close()

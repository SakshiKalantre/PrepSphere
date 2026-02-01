
from app.db.session import SessionLocal
from app.models.analytics import AnalyticsPercentages
from app.models.user import User, Profile
from sqlalchemy import func

db = SessionLocal()

try:
    # 1. Get the stored "snapshot" from the AnalyticsPercentages table
    stored_record = db.query(AnalyticsPercentages).order_by(AnalyticsPercentages.id.desc()).first()
    stored_count = stored_record.unplaced_students if stored_record else "No record found"
    
    # 2. Get the real-time "live" count from User/Profile tables
    live_count = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed'
    ).count()

    print(f"Stored Count in Analytics Table (Snapshot): {stored_count}")
    print(f"Live Count in Profile Table (Real-time): {live_count}")

finally:
    db.close()

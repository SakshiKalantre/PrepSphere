
from app.db.session import SessionLocal
from app.models.analytics import AnalyticsPercentages
from app.models.user import User, Profile
from sqlalchemy import func, text

db = SessionLocal()

try:
    print("--- LIVE COUNTS ---")
    # Live Unplaced Count
    unplaced_live = db.query(Profile).join(User, Profile.user_id == User.id).filter(
        (User.role == 'STUDENT') | (func.upper(User.role) == 'STUDENT'),
        Profile.placement_status == 'Not Placed'
    ).count()
    print(f"Live Unplaced Students: {unplaced_live}")

    print("\n--- ANALYTICS TABLE SNAPSHOT ---")
    # Table Record
    record = db.query(AnalyticsPercentages).order_by(AnalyticsPercentages.id.desc()).first()
    if record:
        print(f"Table Unplaced Students (Count stored): {record.unplaced_students}")
        print(f"Table Unplaced Percentage: {record.unplaced_percentage}")
    else:
        print("No record in AnalyticsPercentages table")

finally:
    db.close()


from app.db.session import SessionLocal
from app.models.analytics import AnalyticsPercentages
from sqlalchemy import text

db = SessionLocal()

try:
    # Check if table exists
    try:
        result = db.execute(text("SELECT * FROM analytics_percentages ORDER BY id DESC LIMIT 1"))
        row = result.fetchone()
        if row:
            print("Latest Analytics Record:")
            print(f"ID: {row.id}")
            print(f"Placed: {row.placed_percentage}%")
            print(f"Higher Studies: {row.higher_studies_percentage}%")
            print(f"Exploring: {row.exploring_percentage}%")
            print(f"Others: {row.others_percentage}%")
            print(f"Total Students: {row.total_students}")
        else:
            print("No records found in analytics_percentages table.")
    except Exception as e:
        print(f"Error querying table: {e}")

finally:
    db.close()

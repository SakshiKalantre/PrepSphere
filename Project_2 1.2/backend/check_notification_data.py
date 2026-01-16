import psycopg2
from app.core.config import settings
from urllib.parse import urlparse

# Parse DB URL
result = urlparse(settings.DATABASE_URL)
username = result.username
password = result.password
database = result.path[1:]
hostname = result.hostname
port = result.port

try:
    conn = psycopg2.connect(
        database=database,
        user=username,
        password=password,
        host=hostname,
        port=port
    )
    cur = conn.cursor()
    
    print("Checking Notification values:")
    cur.execute("SELECT id, notification_type FROM notifications")
    rows = cur.fetchall()
    for row in rows:
        print(f"ID: {row[0]}, Type: '{row[1]}'")
        
except Exception as e:
    print(e)
finally:
    if 'conn' in locals():
        conn.close()

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
    
    print("Updating Notification values to UPPERCASE...")
    
    # Update 'system' to 'SYSTEM'
    cur.execute("UPDATE notifications SET notification_type = 'SYSTEM' WHERE notification_type = 'system'")
    print(f"Updated {cur.rowcount} rows for SYSTEM")
    
    # Update others if needed (though others seemed fine or were already uppercase based on check_enums output, but let's be safe)
    cur.execute("UPDATE notifications SET notification_type = UPPER(notification_type)")
    print(f"Updated {cur.rowcount} rows to UPPERCASE")
    
    conn.commit()
    print("Done.")
        
except Exception as e:
    print(e)
finally:
    if 'conn' in locals():
        conn.close()

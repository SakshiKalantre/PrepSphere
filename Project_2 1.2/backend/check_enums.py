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
    
    print("Checking ENUM types:")
    cur.execute("""
        SELECT t.typname, e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        ORDER BY t.typname, e.enumsortorder;
    """)
    
    for row in cur.fetchall():
        print(row)
        
except Exception as e:
    print(e)
finally:
    if 'conn' in locals():
        conn.close()

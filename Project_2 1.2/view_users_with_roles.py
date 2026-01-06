import psycopg2
from psycopg2 import sql

# Database connection parameters
DB_HOST = "localhost"
DB_PORT = "5432"
DB_NAME = "prepsphere"
DB_USER = "postgres"
DB_PASSWORD = "Anishamanoj@123"

try:
    # Connect to PostgreSQL database
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD
    )
    
    # Create a cursor
    cur = conn.cursor()
    
    # Query all users with their roles
    cur.execute("""
        SELECT id, clerk_user_id, email, first_name, last_name, role, is_active, created_at
        FROM users
        ORDER BY created_at DESC;
    """)
    
    users = cur.fetchall()
    
    if users:
        print("Users in the database:")
        print("-" * 100)
        print(f"{'ID':<5} {'Email':<25} {'Name':<20} {'Role':<10} {'Active':<8} {'Created At':<20}")
        print("-" * 100)
        
        for user in users:
            user_id, clerk_id, email, first_name, last_name, role, is_active, created_at = user
            full_name = f"{first_name} {last_name}"
            active_status = "Yes" if is_active else "No"
            created_date = created_at.strftime("%Y-%m-%d %H:%M") if created_at else "N/A"
            
            print(f"{user_id:<5} {email:<25} {full_name:<20} {role:<10} {active_status:<8} {created_date:<20}")
    else:
        print("No users found in the database.")
        
except psycopg2.Error as e:
    print(f"Database error: {e}")
except Exception as e:
    print(f"Error: {e}")
finally:
    # Close connections
    if 'cur' in locals():
        cur.close()
    if 'conn' in locals():
        conn.close()
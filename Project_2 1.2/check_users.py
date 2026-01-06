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
    
    # Check if users table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_name = 'users'
        );
    """)
    
    table_exists = cur.fetchone()[0]
    
    if table_exists:
        print("Users table exists!")
        
        # Query all users
        cur.execute("SELECT * FROM users;")
        users = cur.fetchall()
        
        if users:
            print(f"\nFound {len(users)} users:")
            print("-" * 50)
            
            # Get column names
            colnames = [desc[0] for desc in cur.description]
            print(" | ".join(colnames))
            print("-" * 50)
            
            for user in users:
                print(" | ".join(str(field) for field in user))
        else:
            print("No users found in the table.")
    else:
        print("Users table does not exist yet.")
        
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
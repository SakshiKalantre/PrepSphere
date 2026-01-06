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
    
    # Check the structure of the users table
    cur.execute("""
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns
        WHERE table_name = 'users'
        ORDER BY ordinal_position;
    """)
    
    columns = cur.fetchall()
    
    print("Users Table Structure:")
    print("-" * 80)
    print(f"{'Column Name':<20} {'Data Type':<20} {'Nullable':<10} {'Default':<20}")
    print("-" * 80)
    
    for column in columns:
        print(f"{column[0]:<20} {column[1]:<20} {column[2]:<10} {str(column[3]):<20}")
    
    # Check if there's an enum type for user roles
    print("\n" + "=" * 80)
    print("Checking for ENUM types in the database:")
    print("=" * 80)
    
    cur.execute("""
        SELECT t.typname, e.enumlabel
        FROM pg_type t
        JOIN pg_enum e ON t.oid = e.enumtypid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.typnamespace
        WHERE n.nspname = 'public'
        ORDER BY t.typname, e.enumsortorder;
    """)
    
    enum_values = cur.fetchall()
    
    if enum_values:
        print("Found ENUM types:")
        for enum_type, enum_label in enum_values:
            print(f"  {enum_type}: {enum_label}")
    else:
        print("No ENUM types found in the public schema.")
        
    # Check the actual data type of the role column
    print("\n" + "=" * 80)
    print("Detailed column information for 'role':")
    print("=" * 80)
    
    cur.execute("""
        SELECT pg_catalog.format_type(a.atttypid, a.atttypmod) as data_type
        FROM pg_attribute a
        JOIN pg_class c ON a.attrelid = c.oid
        JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
        WHERE c.relname = 'users' AND a.attname = 'role' AND n.nspname = 'public';
    """)
    
    role_data_type = cur.fetchone()
    if role_data_type:
        print(f"Role column data type: {role_data_type[0]}")
    
    # Check the check constraints on the role column
    print("\n" + "=" * 80)
    print("Checking check constraints on the role column:")
    print("=" * 80)
    
    cur.execute("""
        SELECT conname, pg_get_constraintdef(c.oid)
        FROM pg_constraint c
        JOIN pg_class t ON c.conrelid = t.oid
        JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
        WHERE t.relname = 'users' AND n.nspname = 'public' AND c.contype = 'c';
    """)
    
    constraints = cur.fetchall()
    
    if constraints:
        print("Check constraints:")
        for constraint_name, constraint_def in constraints:
            print(f"  {constraint_name}: {constraint_def}")
    else:
        print("No check constraints found on the users table.")
        
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
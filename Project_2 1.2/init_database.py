#!/usr/bin/env python3
"""
Database Initialization Script for PrepSphere
This script helps set up the PostgreSQL database for PrepSphere.
"""

import psycopg2
import sys
import os
from pathlib import Path

def get_db_config():
    """Get database configuration from environment or use defaults"""
    return {
        'host': os.environ.get('DB_HOST', 'localhost'),
        'port': os.environ.get('DB_PORT', '5432'),
        'database': os.environ.get('DB_NAME', 'prepsphere'),
        'user': os.environ.get('DB_USER', 'prepsphere_user'),
        'password': os.environ.get('DB_PASSWORD', 'prepsphere_password')
    }

def test_db_connection(config):
    """Test database connection"""
    try:
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database='postgres',  # Connect to default database first
            user=config['user'],
            password=config['password']
        )
        conn.close()
        return True
    except Exception as e:
        print(f"✗ Database connection failed: {e}")
        return False

def create_database(config):
    """Create the PrepSphere database"""
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database='postgres',  # Connect to default database
            user=config['user'],
            password=config['password']
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if database exists
        cursor.execute("SELECT 1 FROM pg_catalog.pg_database WHERE datname = %s", (config['database'],))
        exists = cursor.fetchone()
        
        if not exists:
            # Create database
            cursor.execute(f"CREATE DATABASE {config['database']}")
            print(f"✓ Created database: {config['database']}")
        else:
            print(f"✓ Database already exists: {config['database']}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"✗ Failed to create database: {e}")
        return False

def create_user(config):
    """Create the database user"""
    try:
        # Connect to PostgreSQL server
        conn = psycopg2.connect(
            host=config['host'],
            port=config['port'],
            database='postgres',  # Connect to default database
            user=config['user'],
            password=config['password']
        )
        conn.autocommit = True
        cursor = conn.cursor()
        
        # Check if user exists
        cursor.execute("SELECT 1 FROM pg_roles WHERE rolname = %s", (config['user'],))
        exists = cursor.fetchone()
        
        if not exists:
            # Create user
            cursor.execute(f"CREATE USER {config['user']} WITH PASSWORD '{config['password']}'")
            print(f"✓ Created user: {config['user']}")
        else:
            print(f"✓ User already exists: {config['user']}")
        
        # Grant privileges
        cursor.execute(f"GRANT ALL PRIVILEGES ON DATABASE {config['database']} TO {config['user']}")
        print(f"✓ Granted privileges to user: {config['user']}")
        
        cursor.close()
        conn.close()
        return True
    except Exception as e:
        print(f"✗ Failed to create user: {e}")
        return False

def main():
    print("PrepSphere Database Initialization")
    print("=" * 40)
    
    # Get database configuration
    config = get_db_config()
    
    print(f"Database Configuration:")
    print(f"  Host: {config['host']}")
    print(f"  Port: {config['port']}")
    print(f"  Database: {config['database']}")
    print(f"  User: {config['user']}")
    print(f"  Password: {'*' * len(config['password'])}")
    print()
    
    # Test connection
    print("Testing database connection...")
    if not test_db_connection(config):
        print("\n✗ Cannot connect to PostgreSQL. Please ensure:")
        print("  1. PostgreSQL is installed and running")
        print("  2. Connection details are correct")
        print("  3. PostgreSQL user has CREATEDB privileges")
        sys.exit(1)
    
    print("✓ Database connection successful")
    
    # Create database
    print("\nCreating database...")
    if not create_database(config):
        print("\n✗ Failed to create database")
        sys.exit(1)
    
    # Create user
    print("\nSetting up user...")
    if not create_user(config):
        print("\n✗ Failed to create user")
        sys.exit(1)
    
    print("\n" + "=" * 40)
    print("✓ Database initialization completed!")
    print("\nNext steps:")
    print("1. Update your backend/.env file with the database URL:")
    print(f"   DATABASE_URL=postgresql://{config['user']}:{config['password']}@{config['host']}:{config['port']}/{config['database']}")
    print("2. Install backend dependencies:")
    print("   cd backend && pip install -r requirements.txt")
    print("3. Run the backend application")

if __name__ == "__main__":
    main()
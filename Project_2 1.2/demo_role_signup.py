#!/usr/bin/env python3
"""
Demo script to show how the role-based signup works
This script demonstrates the end-to-end flow of role selection during signup
"""

import psycopg2
from psycopg2 import sql
import requests
import json
import time

def show_users_table():
    """Display all users in the database with their roles"""
    try:
        # Database connection
        conn = psycopg2.connect(
            host="localhost",
            port="5432",
            database="prepsphere",
            user="postgres",
            password="Anishamanoj@123"
        )
        
        cur = conn.cursor()
        
        # Query all users
        cur.execute("""
            SELECT id, email, first_name, last_name, role, created_at
            FROM users
            ORDER BY created_at DESC
            LIMIT 10;
        """)
        
        users = cur.fetchall()
        
        print("Current Users in Database:")
        print("=" * 80)
        print(f"{'ID':<5} {'Email':<25} {'Name':<20} {'Role':<10} {'Created At':<15}")
        print("-" * 80)
        
        for user in users:
            user_id, email, first_name, last_name, role, created_at = user
            full_name = f"{first_name} {last_name}"
            created_date = created_at.strftime("%Y-%m-%d") if created_at else "N/A"
            
            print(f"{user_id:<5} {email:<25} {full_name:<20} {role:<10} {created_date:<15}")
            
        cur.close()
        conn.close()
        
    except Exception as e:
        print(f"Error querying database: {e}")

def simulate_signup_with_role(role):
    """Simulate a signup with a specific role using the webhook"""
    url = "http://localhost:8000/api/v1/clerk/webhook"
    
    # Generate unique user ID
    timestamp = int(time.time())
    user_id = f"demo_user_{role.lower()}_{timestamp}"
    email = f"demo.{role.lower()}.{timestamp}@example.com"
    
    # Webhook payload
    payload = {
        "type": "user.created",
        "data": {
            "id": user_id,
            "email_addresses": [
                {
                    "id": "email_id_1",
                    "email_address": email
                }
            ],
            "primary_email_address_id": "email_id_1",
            "first_name": "Demo",
            "last_name": role.capitalize(),
            "unsafe_metadata": {
                "role": role  # This is what gets selected from the dropdown
            }
        }
    }
    
    try:
        response = requests.post(url, json=payload)
        return response.status_code, response.json() if response.content else {}
    except Exception as e:
        return 0, {"error": str(e)}

def main():
    print("Role-Based Signup Demo")
    print("=" * 50)
    
    # Show current users
    print("\n1. Current database state:")
    show_users_table()
    
    # Simulate signups with different roles
    print("\n2. Simulating signups with different roles...")
    
    roles = ["STUDENT", "TPO", "ADMIN"]
    
    for role in roles:
        print(f"\n   Creating user with role: {role}")
        status_code, response = simulate_signup_with_role(role)
        print(f"   Status: {status_code}")
        print(f"   Response: {response}")
    
    # Show updated users
    print("\n3. Updated database state:")
    show_users_table()
    
    print("\n4. How it works:")
    print("   - User selects role from dropdown during signup")
    print("   - Role is sent to backend via Clerk webhook")
    print("   - Backend stores role in database using correct enum values")
    print("   - All enum values are uppercase to match database constraints")

if __name__ == "__main__":
    main()
#!/usr/bin/env python
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from sqlalchemy import text

def check_student_profiles():
    with engine.connect() as conn:
        # Count total students
        total_students = conn.execute(text("SELECT COUNT(*) FROM users WHERE role = 'STUDENT' OR UPPER(role) = 'STUDENT'")).fetchone()[0]
        print(f'Total students: {total_students}')
        
        # Count students with profiles
        students_with_profiles = conn.execute(text("SELECT COUNT(*) FROM users u INNER JOIN profiles p ON u.id = p.user_id WHERE u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT'")).fetchone()[0]
        print(f'Students with profiles: {students_with_profiles}')
        
        # Count placement status for students with profiles
        placed_count = conn.execute(text("SELECT COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT') AND p.placement_status = 'Placed'")).fetchone()[0]
        unplaced_count = conn.execute(text("SELECT COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT') AND p.placement_status = 'Not Placed'")).fetchone()[0]
        
        print(f'Students with Placed status: {placed_count}')
        print(f'Students with Not Placed status: {unplaced_count}')
        
        # Check for all placement statuses
        all_statuses = conn.execute(text("SELECT p.placement_status, COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT') GROUP BY p.placement_status"))
        
        print('\nAll placement statuses:')
        for status, count in all_statuses:
            print(f'{status}: {count}')
        
        # Find students without profiles
        result = conn.execute(text("""
            SELECT u.id, u.email, u.first_name, u.last_name, u.role
            FROM users u
            LEFT JOIN profiles p ON u.id = p.user_id
            WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT')
            AND p.user_id IS NULL
        """))
        
        print('\nStudents without profiles:')
        for row in result:
            print(f'ID: {row[0]}, Email: {row[1]}, Name: {row[2]} {row[3]}, Role: {row[4]}')

if __name__ == "__main__":
    check_student_profiles()
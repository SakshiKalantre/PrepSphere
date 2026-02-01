#!/usr/bin/env python
import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db.session import engine
from sqlalchemy import text

def check_tpo_analytics():
    with engine.connect() as conn:
        # Total students (as TPO dashboard does)
        total_students = conn.execute(text("SELECT COUNT(*) FROM users WHERE role = 'STUDENT' OR UPPER(role) = 'STUDENT'")).fetchone()[0]
        print(f'Total students (TPO calculation): {total_students}')
        
        # Placed students (as TPO dashboard does - ALL profiles with Placed status, not joined with students)
        total_placed_all = conn.execute(text("SELECT COUNT(*) FROM profiles WHERE placement_status = 'Placed'")).fetchone()[0]
        print(f'Placed (TPO calculation - all profiles): {total_placed_all}')
        
        # Placed students (as TPO dashboard does, but properly joined with students)
        total_placed_joined = conn.execute(text("SELECT COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT') AND p.placement_status = 'Placed'")).fetchone()[0]
        print(f'Placed (properly joined with students): {total_placed_joined}')
        
        # Unplaced students (properly joined with students)
        total_unplaced_joined = conn.execute(text("SELECT COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT') AND p.placement_status = 'Not Placed'")).fetchone()[0]
        print(f'Unplaced (properly joined with students): {total_unplaced_joined}')
        
        # All students with profiles and their placement status
        all_status_counts = conn.execute(text("SELECT p.placement_status, COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role = 'STUDENT' OR UPPER(u.role) = 'STUDENT') GROUP BY p.placement_status"))
        print('\nAll placement statuses for students:')
        for status, count in all_status_counts:
            print(f'  {status}: {count}')
            
        # Check if there are any non-student profiles that might be affecting the count
        non_student_placed = conn.execute(text("SELECT COUNT(*) FROM profiles p JOIN users u ON p.user_id = u.id WHERE (u.role != 'STUDENT' AND UPPER(u.role) != 'STUDENT') AND p.placement_status = 'Placed'")).fetchone()[0]
        print(f'\nNon-student profiles with Placed status: {non_student_placed}')

if __name__ == '__main__':
    check_tpo_analytics()
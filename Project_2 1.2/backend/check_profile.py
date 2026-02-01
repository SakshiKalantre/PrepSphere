import os
import sys
sys.path.append('.')

from app.db.session import SessionLocal
from app.models.user import User, Profile

db = SessionLocal()
user = db.query(User).filter(User.email == 'kalantre_riya@gmail.com').first()
print(f'User found: {user is not None}')
if user:
    print(f'User ID: {user.id}')
    print(f'First name: {user.first_name}')
    print(f'Last name: {user.last_name}')
    profile = db.query(Profile).filter(Profile.user_id == user.id).first()
    print(f'Profile found: {profile is not None}')
    if profile:
        print(f'Full name in DB: "{profile.full_name}"')
        print(f'Full name is None: {profile.full_name is None}')
        print(f'Full name is empty string: {profile.full_name == ""}')
        print(f'Full name length: {len(profile.full_name) if profile.full_name else 0}')
        print(f'Company name in DB: "{profile.company_name}"')
        print(f'Company name is None: {profile.company_name is None}')
        print(f'Company name is empty string: {profile.company_name == ""}')
        print(f'Company name length: {len(profile.company_name) if profile.company_name else 0}')
    else:
        print('No profile found for user')
else:
    print('User not found')
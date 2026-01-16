import requests
import json

print("Testing Admin Users API...")
try:
    response = requests.get('http://127.0.0.1:8000/api/v1/admin/users')
    if response.status_code == 200:
        users_data = response.json()
        print(f"Users API returned {len(users_data)} users")
        # Print first user to see the structure
        if users_data:
            print("Sample user data:")
            print(json.dumps(users_data[0], indent=2, default=str))
            
            # Check for students with offer letters
            students_with_offers = [u for u in users_data if u.get('role') in ['Student', 'STUDENT'] and u.get('has_verified_offer_letter')]
            print(f"\nStudents with offer letters: {len(students_with_offers)}")
            for student in students_with_offers[:3]:  # Show first 3
                print(f"- {student.get('name')} ({student.get('email')}) - Has offer letter: {student.get('has_verified_offer_letter')}")
    else:
        print(f"Users API Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Users API Exception: {e}")

print("\n" + "="*50 + "\n")

print("Testing Admin Analytics API...")
try:
    response = requests.get('http://127.0.0.1:8000/api/v1/admin/analytics')
    if response.status_code == 200:
        analytics_data = response.json()
        print("Analytics data:")
        print(json.dumps(analytics_data, indent=2))
    else:
        print(f"Analytics API Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Analytics API Exception: {e}")
import requests
import json

# Test the comprehensive analytics endpoint
print("Testing Comprehensive Analytics API (/api/v1/admin/analytics)...")
try:
    response = requests.get('http://127.0.0.1:8000/api/v1/admin/analytics')
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Full Response:")
        print(json.dumps(data, indent=2))
        
        # Check specific fields we need
        required_fields = ['placedStudents', 'unplacedStudents', 'activeUsers', 'inactiveUsers']
        print(f"\nChecking required fields:")
        for field in required_fields:
            if field in data:
                print(f"✓ {field}: {data[field]}")
            else:
                print(f"✗ {field}: MISSING")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except Exception as e:
    print(f"Exception: {e}")

print("\n" + "="*50 + "\n")

# Test users endpoint to verify has_verified_offer_letter field
print("Testing Users API to check offer letter data...")
try:
    response = requests.get('http://127.0.0.1:8000/api/v1/admin/users')
    if response.status_code == 200:
        users = response.json()
        print(f"Total users: {len(users)}")
        
        # Look for students with offer letters
        students_with_offers = [u for u in users if u.get('role') in ['Student', 'STUDENT'] and u.get('has_verified_offer_letter')]
        print(f"Students with offer letters: {len(students_with_offers)}")
        
        if students_with_offers:
            print("Sample students with offer letters:")
            for student in students_with_offers[:3]:
                print(f"  - {student.get('name')}: has_verified_offer_letter = {student.get('has_verified_offer_letter')}")
    else:
        print(f"Users API Error: {response.status_code}")
except Exception as e:
    print(f"Users API Exception: {e}")
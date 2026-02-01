import requests
import json

# Test if we can see backend debug logs by making a simple request
# and checking if the debug logs appear in the backend output

print("Making a test profile update request to trigger backend logs...")

user_id = 13
url = f"http://localhost:8000/api/v1/users/{user_id}/profile"

# Simple test data
update_data = {
    "company_name": "Debug Test Company"
}

try:
    response = requests.put(url, json=update_data)
    print(f"Request status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"Company name after test update: {data.get('company_name')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# Verify the update
print("\n--- Verifying update ---")
try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print(f"Current company name in DB: {data.get('company_name')}")
    else:
        print(f"Error fetching: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
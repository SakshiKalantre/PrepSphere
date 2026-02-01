import requests
import json

# Test updating the profile with company name
user_id = 13
url = f"http://localhost:8000/api/v1/users/{user_id}/profile"

# Test data with company name
update_data = {
    "phone": "8966536556",
    "full_name": "riya\t ravindra kalantre",
    "degree": "bca",
    "year": "2025",
    "skills": "data se",
    "about": "na",
    "company_name": "Test Company",
    "placement_status": "Placed"
}

print(f"Updating profile for user {user_id}")
print(f"URL: {url}")
print("Update data:")
print(json.dumps(update_data, indent=2))

try:
    response = requests.put(url, json=update_data)
    print(f"Update status code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Updated profile data:")
        print(json.dumps(data, indent=2))
        print(f"Company name after update: {data.get('company_name')}")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

# Now fetch the profile again to verify
print("\n--- Fetching profile after update ---")
try:
    response = requests.get(url)
    if response.status_code == 200:
        data = response.json()
        print(f"Company name after fetch: {data.get('company_name')}")
    else:
        print(f"Error fetching: {response.text}")
except Exception as e:
    print(f"Exception: {e}")
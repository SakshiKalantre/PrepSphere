import requests
import json

# Test the profile API directly
user_id = 13
url = f"http://localhost:8000/api/v1/users/{user_id}/profile"

print(f"Testing profile API for user {user_id}")
print(f"URL: {url}")

try:
    response = requests.get(url)
    print(f"Status code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Profile data received:")
        print(json.dumps(data, indent=2))
        
        # Check specifically for company_name
        if 'company_name' in data:
            print(f"Company name: {data['company_name']}")
            print(f"Company name type: {type(data['company_name'])}")
        else:
            print("Company name field NOT present in response")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Exception: {e}")

import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_endpoint(endpoint):
    url = f"{BASE_URL}{endpoint}"
    print(f"Testing {url}...")
    try:
        response = requests.get(url)
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            print("Response:", json.dumps(response.json(), indent=2))
        else:
            print("Response:", response.text)
    except Exception as e:
        print(f"Error: {e}")
    print("-" * 50)

# Test the new endpoint
test_endpoint("/stats/analytics-percentages")

# Test an existing endpoint in the same file
test_endpoint("/public/stats")

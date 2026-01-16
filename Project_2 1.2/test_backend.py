import requests
import time

# Wait a moment for the server to potentially start
time.sleep(3)

try:
    # Test the analytics endpoint
    response = requests.get('http://127.0.0.1:8000/api/v1/admin/analytics', timeout=10)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print("Analytics data received successfully!")
        print(f"Total Users: {data.get('totalUsers', 'N/A')}")
        print(f"Placed Students: {data.get('placedStudents', 'N/A')}")
        print(f"Unplaced Students: {data.get('unplacedStudents', 'N/A')}")
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
except requests.exceptions.ConnectionError:
    print("Connection Error: Backend server is not reachable at http://127.0.0.1:8000")
    print("The backend server may not be running properly.")
except requests.exceptions.Timeout:
    print("Timeout: Request timed out. Backend server may not be responding.")
except Exception as e:
    print(f"An error occurred: {e}")
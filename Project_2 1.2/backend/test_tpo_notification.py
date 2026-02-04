import requests
import json

def test_broadcast_notification():
    url = "http://localhost:8000/api/v1/tpo/notifications/broadcast"
    payload = {
        "title": "hi",
        "message": "report the documenst"
    }
    
    try:
        response = requests.post(url, json=payload)
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            print("SUCCESS: Notification broadcast endpoint works without filters.")
        else:
            print("FAILURE: Endpoint returned non-200 status code.")
            
    except Exception as e:
        print(f"Error sending request: {e}")

if __name__ == "__main__":
    test_broadcast_notification()

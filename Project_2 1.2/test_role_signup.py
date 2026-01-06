import requests
import json
import time

# Test the Clerk webhook endpoint for user creation with role
def test_role_based_signup():
    # Webhook endpoint
    url = "http://localhost:8000/api/v1/clerk/webhook"
    
    # Add a timestamp to make IDs unique
    timestamp = int(time.time())
    
    # Sample webhook payload for user creation with role
    payload = {
        "type": "user.created",
        "data": {
            "id": f"user_test_student_{timestamp}",
            "email_addresses": [
                {
                    "id": "email_id_1",
                    "email_address": "test.student@example.com"
                }
            ],
            "primary_email_address_id": "email_id_1",
            "first_name": "Test",
            "last_name": "Student",
            "unsafe_metadata": {
                "role": "STUDENT"
            }
        }
    }
    
    # Send POST request to webhook endpoint
    response = requests.post(url, json=payload)
    
    print("Student Status Code:", response.status_code)
    try:
        print("Student Response:", response.json())
    except:
        print("Student Response:", response.text)
    
    # Test with different role
    payload["data"]["id"] = f"user_test_tpo_{timestamp}"
    payload["data"]["email_addresses"][0]["email_address"] = "test.tpo@example.com"
    payload["data"]["first_name"] = "Test"
    payload["data"]["last_name"] = "TPO"
    payload["data"]["unsafe_metadata"]["role"] = "TPO"
    
    response = requests.post(url, json=payload)
    
    print("\nTPO User Status Code:", response.status_code)
    try:
        print("TPO User Response:", response.json())
    except:
        print("TPO User Response:", response.text)
    
    # Test with admin role
    payload["data"]["id"] = f"user_test_admin_{timestamp}"
    payload["data"]["email_addresses"][0]["email_address"] = "test.admin@example.com"
    payload["data"]["first_name"] = "Test"
    payload["data"]["last_name"] = "Admin"
    payload["data"]["unsafe_metadata"]["role"] = "ADMIN"
    
    response = requests.post(url, json=payload)
    
    print("\nAdmin User Status Code:", response.status_code)
    try:
        print("Admin User Response:", response.json())
    except:
        print("Admin User Response:", response.text)

if __name__ == "__main__":
    test_role_based_signup()
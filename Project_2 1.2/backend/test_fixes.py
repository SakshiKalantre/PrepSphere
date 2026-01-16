import requests
import json

BASE_URL = "http://localhost:8000/api/v1"
TEST_EMAIL = "sakshi0206k@gmail.com"

def test_full_flow():
    print(f"Testing flow for {TEST_EMAIL}...")
    
    # 1. Get User
    print("\n[1] Fetching User...")
    resp = requests.get(f"{BASE_URL}/users/by-email/{TEST_EMAIL}")
    if resp.status_code != 200:
        print("User not found, creating one...")
        # Create user if not exists (simulating Clerk webhook or first login)
        user_payload = {
            "clerk_user_id": "test_clerk_id_123",
            "email": TEST_EMAIL,
            "first_name": "Sakshi",
            "last_name": "Test",
            "role": "STUDENT"
        }
        resp = requests.post(f"{BASE_URL}/users/", json=user_payload)
        if resp.status_code != 200:
            print(f"Failed to create user: {resp.text}")
            return
    
    user_data = resp.json()
    user_id = user_data['id']
    print(f"User ID: {user_id}")

    # 2. Event Registration (Simulate Frontend Fallback - Email Only)
    print("\n[2] Testing Event Registration (Email Only)...")
    events_resp = requests.get(f"{BASE_URL}/events")
    events = events_resp.json()
    if events:
        event_id = events[0]['id']
        # Payload with ONLY email, NO user_id
        reg_payload = {"email": TEST_EMAIL}
        reg_resp = requests.post(f"{BASE_URL}/events/{event_id}/register", json=reg_payload)
        print(f"Registration Status: {reg_resp.status_code}")
        print(f"Response: {reg_resp.text}")
    else:
        print("No events found to test.")

    # 3. Profile Persistence (Upsert)
    print("\n[3] Testing Profile Save (Upsert)...")
    profile_payload = {
        "degree": "B.Tech",
        "year": "2025",
        "skills": "Python, React, FastAPI",
        "about": "Test profile persistence"
    }
    # First Save
    prof_resp = requests.post(f"{BASE_URL}/users/{user_id}/profile", json=profile_payload)
    print(f"Save 1 Status: {prof_resp.status_code}")
    
    # Second Save (Update)
    profile_payload['about'] = "Updated profile persistence"
    prof_resp_2 = requests.post(f"{BASE_URL}/users/{user_id}/profile", json=profile_payload)
    print(f"Save 2 (Update) Status: {prof_resp_2.status_code}")
    print(f"Response: {prof_resp_2.text}")

    # 4. Job Application
    print("\n[4] Testing Job Application...")
    jobs_resp = requests.get(f"{BASE_URL}/tpo/jobs?status=Active")
    jobs = jobs_resp.json()
    if jobs:
        job_id = jobs[0]['id']
        # Apply with user_id only (resume optional)
        apply_payload = {"user_id": user_id}
        apply_resp = requests.post(f"{BASE_URL}/jobs/{job_id}/apply", json=apply_payload)
        print(f"Apply Status: {apply_resp.status_code}")
        print(f"Response: {apply_resp.text}")
    else:
        print("No jobs found to test.")

if __name__ == "__main__":
    test_full_flow()

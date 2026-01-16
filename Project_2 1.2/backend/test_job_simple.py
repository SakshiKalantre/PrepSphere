import requests
import json

BASE_URL = "http://localhost:8000/api/v1"
USER_ID = 1

def test_job_apply():
    print("Testing Job Apply...")
    jobs_resp = requests.get(f"{BASE_URL}/tpo/jobs?status=Active")
    jobs = jobs_resp.json()
    if not jobs:
        print("No jobs.")
        return

    job_id = jobs[0]['id']
    print(f"Applying to job {job_id}...")
    
    # Apply with user_id only
    resp = requests.post(f"{BASE_URL}/jobs/{job_id}/apply", json={"user_id": USER_ID})
    print(f"Status: {resp.status_code}")
    print(f"Body: {resp.text}")

if __name__ == "__main__":
    test_job_apply()

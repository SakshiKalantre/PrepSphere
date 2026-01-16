import requests
import json

BASE_URL = "http://localhost:8000/api/v1"

def test_tpo_job_apps():
    print("Fetching TPO job applications...")
    # Assuming job 1 exists
    job_id = 1
    try:
        response = requests.get(f"{BASE_URL}/tpo/jobs/{job_id}/applications")
        if response.status_code != 200:
            print(f"Failed to fetch applications: {response.status_code} {response.text}")
            return

        apps = response.json()
        print(f"Found {len(apps)} applications for job {job_id}")
        for a in apps:
            print(f"App ID: {a['id']}, Applicant: {a['name']}, Status: {a['status']}")

    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    test_tpo_job_apps()

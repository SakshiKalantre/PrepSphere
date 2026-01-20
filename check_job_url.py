import requests

try:
    response = requests.get("http://localhost:8000/api/v1/tpo/jobs?status=Active")
    if response.status_code == 200:
        jobs = response.json()
        if jobs:
            print(f"First job keys: {jobs[0].keys()}")
            if 'job_url' in jobs[0]:
                print("job_url is present in response")
            else:
                print("job_url is MISSING")
        else:
            print("No jobs found")
    else:
        print(f"Failed to fetch jobs: {response.status_code}")
except Exception as e:
    print(f"Error: {e}")

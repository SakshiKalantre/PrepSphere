import urllib.request
import urllib.error

try:
    response = urllib.request.urlopen('http://127.0.0.1:8000/api/v1/admin/analytics/report', timeout=30)
    print(f"Status Code: {response.getcode()}")
    print("Success: PDF report generated")
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    print(f"Reason: {e.reason}")
    try:
        error_content = e.read().decode('utf-8')
        print(f"Error content: {error_content}")
    except:
        print("Could not read error content")
except urllib.error.URLError as e:
    print(f"URL Error: {e.reason}")
    print("The server might not be running or accessible")
except Exception as e:
    print(f"General Error: {e}")
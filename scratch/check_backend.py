import requests
try:
    r = requests.get("http://localhost:8000/health")
    print(f"Health: {r.status_code}, {r.json()}")
    r = requests.get("http://localhost:8000/dashboard/stats") # This should 401 without token, but verifies route exists
    print(f"Stats: {r.status_code}")
except Exception as e:
    print(f"Error: {e}")

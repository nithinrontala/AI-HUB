import requests
import json
import time

BASE_URL = "http://localhost:8000"

def test_flow():
    # 1. Register a new user
    print("\n1. Testing Signup...")
    signup_data = {
        "email": f"testuser_{int(time.time())}@example.com",
        "password": "password123",
        "name": "Test User",
        "role": "student",
        "preferences": {"theme": "dark", "notifications": True}
    }
    response = requests.post(f"{BASE_URL}/auth/signup", json=signup_data)
    print(f"Signup Status: {response.status_code}")
    if response.status_code != 201:
        print(response.json())
        return

    # 2. Login
    print("\n2. Testing Login...")
    login_data = {
        "email": signup_data["email"],
        "password": signup_data["password"]
    }
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    print(f"Login Status: {response.status_code}")
    token = response.json().get("access_token")
    headers = {"Authorization": f"Bearer {token}"}

    # 3. Get Me
    print("\n3. Testing Get Me...")
    response = requests.get(f"{BASE_URL}/auth/me", headers=headers)
    print(f"Get Me Status: {response.status_code}")
    user_id = response.json().get("id")
    print(f"User ID: {user_id}")

    # 4. Get Courses
    print("\n4. Testing Get Courses...")
    response = requests.get(f"{BASE_URL}/courses")
    print(f"Get Courses Status: {response.status_code}")
    courses = response.json()
    print(f"Found {len(courses)} courses")
    
    if courses:
        course_id = courses[0]["id"]
        
        # 5. Get Single Course
        print(f"\n5. Testing Get Course {course_id}...")
        response = requests.get(f"{BASE_URL}/courses/{course_id}")
        print(f"Get Course Status: {response.status_code}")
        
        # 6. Create Interaction
        print("\n6. Testing Create Interaction...")
        interaction_data = {
            "user_id": user_id,
            "course_id": course_id,
            "interaction_type": "video_view",
            "interaction_data": {"duration_seconds": 120, "completed": True}
        }
        response = requests.post(f"{BASE_URL}/interactions/", json=interaction_data, headers=headers)
        print(f"Create Interaction Status: {response.status_code}")

        # 7. Get Recommendations
        print("\n7. Testing Personalized Recommendations...")
        response = requests.get(f"{BASE_URL}/recommendations/personalized", headers=headers)
        print(f"Get Recommendations Status: {response.status_code}")
        recs = response.json()
        print(f"Got {len(recs)} recommended courses")

    # 8. Search Courses
    print("\n8. Testing Search...")
    response = requests.get(f"{BASE_URL}/courses/search/?q=Machine")
    print(f"Search Status: {response.status_code}")
    search_results = response.json()
    print(f"Found {len(search_results)} courses matching 'Machine'")

if __name__ == "__main__":
    try:
        # Check if server is up
        requests.get(BASE_URL)
        test_flow()
    except requests.exceptions.ConnectionError:
        print(f"Error: API server not running at {BASE_URL}. Please start it with 'uvicorn main:app --reload' in the backend directory.")

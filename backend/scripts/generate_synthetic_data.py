import asyncio
import random
import uuid
from datetime import datetime, timedelta
from faker import Faker
from motor.motor_asyncio import AsyncIOMotorClient
import bcrypt
import sys
import os

# Add the backend directory to sys.path to import models and core
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)

from core.config import settings

fake = Faker()

def get_password_hash(password):
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

async def generate_data():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    # Clear existing data
    await db["users"].delete_many({})
    await db["courses"].delete_many({})
    await db["interactions"].delete_many({})
    print("Cleared existing collections.")

    # Generate Instructors
    instructors = []
    for _ in range(5):
        name = fake.name()
        email = fake.unique.email()
        user = {
            "_id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "role": "instructor",
            "enrolled_courses": [],
            "preferences": {"theme": "dark", "notifications": True},
            "hashed_password": get_password_hash("password123"),
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(user)
        instructors.append(user)
    
    print(f"Generated {len(instructors)} instructors.")

    # Generate Students
    students = []
    for _ in range(15):
        name = fake.name()
        email = fake.unique.email()
        user = {
            "_id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "role": "student",
            "enrolled_courses": [],
            "preferences": {"theme": "light", "notifications": True},
            "hashed_password": get_password_hash("password123"),
            "created_at": datetime.utcnow()
        }
        await db["users"].insert_one(user)
        students.append(user)

    print(f"Generated {len(students)} students.")

    # Generate Courses
    courses = []
    ai_topics = [
        "Introduction to Machine Learning",
        "Deep Learning Fundamentals",
        "Natural Language Processing with Transformers",
        "Computer Vision Basics",
        "Reinforcement Learning Explained",
        "Generative AI and LLMs",
        "Data Science for Beginners",
        "Python for AI Engineering"
    ]

    for topic in ai_topics:
        instructor = random.choice(instructors)
        modules = []
        for i in range(3):
            lessons = []
            for j in range(2):
                lessons.append({
                    "title": f"Lesson {i+1}.{j+1}: {fake.sentence(nb_words=4)}",
                    "content_type": random.choice(["video", "text", "quiz"]),
                    "content_url": fake.url() if random.random() > 0.5 else None,
                    "text_content": fake.paragraph(nb_sentences=5) if random.random() > 0.3 else None
                })
            modules.append({
                "title": f"Module {i+1}: {fake.sentence(nb_words=3)}",
                "description": fake.paragraph(nb_sentences=2),
                "lessons": lessons
            })

        course = {
            "_id": str(uuid.uuid4()),
            "title": topic,
            "description": fake.paragraph(nb_sentences=4),
            "instructor_id": instructor["_id"],
            "modules": modules,
            "tags": ["AI", "Machine Learning", random.choice(["Beginner", "Intermediate", "Advanced"])],
            "is_published": True,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        await db["courses"].insert_one(course)
        courses.append(course)

    print(f"Generated {len(courses)} courses.")

    # Enroll students in courses
    for student in students:
        enrolled = random.sample(courses, k=random.randint(1, 3))
        course_ids = [c["_id"] for c in enrolled]
        await db["users"].update_one(
            {"_id": student["_id"]},
            {"$set": {"enrolled_courses": course_ids}}
        )
        student["enrolled_courses"] = course_ids

    # Generate Interactions
    interaction_types = ["video_view", "quiz_attempt", "ai_chat", "course_completion"]
    interactions_count = 0
    for student in students:
        for course_id in student["enrolled_courses"]:
            # Random interactions for each enrolled course
            for _ in range(random.randint(3, 8)):
                i_type = random.choice(interaction_types)
                data = {}
                if i_type == "video_view":
                    data = {"duration_seconds": random.randint(30, 600), "completed": random.choice([True, False])}
                elif i_type == "quiz_attempt":
                    data = {"score": random.randint(50, 100), "total_questions": 10}
                elif i_type == "ai_chat":
                    data = {"query": fake.sentence(), "response_length": random.randint(100, 500)}
                
                interaction = {
                    "user_id": student["_id"],
                    "course_id": course_id,
                    "interaction_type": i_type,
                    "interaction_data": data,
                    "timestamp": datetime.utcnow() - timedelta(days=random.randint(0, 30), minutes=random.randint(0, 1440))
                }
                await db["interactions"].insert_one(interaction)
                interactions_count += 1

    print(f"Generated {interactions_count} interactions.")

    # Validation
    print("\n--- Validating Dataset Quality ---")
    
    # 1. Check for orphaned courses (no instructor)
    orphaned_courses = await db["courses"].count_documents({"instructor_id": {"$exists": False}})
    print(f"Orphaned courses: {orphaned_courses}")

    # 2. Check for interactions without valid users
    total_users = await db["users"].count_documents({})
    total_courses = await db["courses"].count_documents({})
    total_interactions = await db["interactions"].count_documents({})
    
    print(f"Total Users: {total_users}")
    print(f"Total Courses: {total_courses}")
    print(f"Total Interactions: {total_interactions}")

    # 3. Specific quality check: Ensure all students have at least one enrollment
    students_with_no_enrollment = await db["users"].count_documents({"role": "student", "enrolled_courses": {"$size": 0}})
    print(f"Students with no enrollment: {students_with_no_enrollment}")

    if orphaned_courses == 0 and students_with_no_enrollment == 0:
        print("Dataset Quality Validation: PASSED")
    else:
        print("Dataset Quality Validation: WARNINGS FOUND")

    client.close()

if __name__ == "__main__":
    asyncio.run(generate_data())

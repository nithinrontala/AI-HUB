import asyncio
import sys
import os

# Add the backend directory to sys.path to import models and core
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)

from core.database import connect_to_mongo, get_database, close_mongo_connection
from services.recommender import recommender_service
from bson import ObjectId

async def test_recommendations():
    await connect_to_mongo()
    db = get_database()
    
    # Get a course to test with (e.g., "Natural Language Processing with Transformers")
    course = await db["courses"].find_one({"title": "Natural Language Processing with Transformers"})
    if not course:
        print("Course not found!")
        await close_mongo_connection()
        return

    print(f"Testing recommendations for: {course['title']}")
    target_embedding = course["embedding"]
    
    # Simple manual scan for top 3 recommendations
    cursor = db["courses"].find({"_id": {"$ne": course["_id"]}})
    recommendations = []
    
    async for doc in cursor:
        if doc.get("embedding"):
            similarity = recommender_service.calculate_similarity(target_embedding, doc["embedding"])
            recommendations.append((doc["title"], similarity))
    
    # Sort by similarity descending
    recommendations.sort(key=lambda x: x[1], reverse=True)
    
    print("\nTop Recommendations:")
    for title, score in recommendations[:3]:
        print(f"- {title} (Similarity: {score:.4f})")
        
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(test_recommendations())

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os
from datetime import datetime

# Add the backend directory to sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)

from core.config import settings
from services.recommender import recommender_service

async def refresh_embeddings():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    
    print("Refreshing embeddings for all courses...")
    cursor = db["courses"].find()
    updated_count = 0
    
    async for doc in cursor:
        course_text = recommender_service.prepare_course_text(doc)
        embedding = recommender_service.generate_embedding(course_text)
        
        await db["courses"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"embedding": embedding, "updated_at": datetime.utcnow()}}
        )
        updated_count += 1
        print(f"Updated course: {doc.get('title')}")
        
    print(f"\nSuccessfully updated embeddings for {updated_count} courses.")
    client.close()

if __name__ == "__main__":
    asyncio.run(refresh_embeddings())

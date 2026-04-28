import asyncio
import sys
import os

# Add the backend directory to sys.path to import models and core
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)

from core.database import connect_to_mongo, get_database, close_mongo_connection
from services.recommender import recommender_service
from datetime import datetime

async def populate_embeddings():
    print("Connecting to MongoDB...")
    await connect_to_mongo()
    db = get_database()
    
    print("Fetching courses...")
    cursor = db["courses"].find()
    updated_count = 0
    
    async for doc in cursor:
        print(f"Generating embedding for: {doc.get('title')}")
        course_text = recommender_service.prepare_course_text(doc)
        embedding = recommender_service.generate_embedding(course_text)
        
        await db["courses"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"embedding": embedding, "updated_at": datetime.utcnow()}}
        )
        updated_count += 1
        
    print(f"Successfully updated embeddings for {updated_count} courses.")
    await close_mongo_connection()

if __name__ == "__main__":
    asyncio.run(populate_embeddings())

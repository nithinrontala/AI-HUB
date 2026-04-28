import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_embeddings():
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    db = client["ai_learning_hub"]
    course = await db["courses"].find_one({"embedding": {"$exists": True}})
    if course:
        print(f"Embedding found for: {course['title']}")
        print(f"Embedding length: {len(course['embedding'])}")
    else:
        print("No embeddings found!")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_embeddings())

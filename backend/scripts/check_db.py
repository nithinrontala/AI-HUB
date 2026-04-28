import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os

async def check_db():
    client = AsyncIOMotorClient("mongodb://localhost:27017/")
    db = client["ai_learning_hub"]
    count = await db["courses"].count_documents({})
    print(f"Course count: {count}")
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())

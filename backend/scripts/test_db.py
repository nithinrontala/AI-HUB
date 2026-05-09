import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
import sys

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)
from core.config import settings

async def test():
    print(f"Connecting to {settings.MONGODB_URL}")
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]
    try:
        count = await db["courses"].count_documents({})
        print(f"Course count: {count}")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        client.close()

if __name__ == "__main__":
    asyncio.run(test())

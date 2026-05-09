"""
Index all course PDFs into the database for RAG.
"""
import asyncio
import os
import sys

backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.append(backend_path)

from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from services.rag_service import rag_service

async def main():
    client = AsyncIOMotorClient(settings.MONGODB_URL)
    db = client[settings.DATABASE_NAME]

    print("Starting PDF indexing for RAG...")
    count = await rag_service.index_course_pdfs(db)
    print(f"Successfully indexed {count} text chunks.")

    client.close()

if __name__ == "__main__":
    asyncio.run(main())

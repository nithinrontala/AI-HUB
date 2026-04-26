from motor.motor_asyncio import AsyncIOMotorClient
from core.config import settings
from pymongo import ASCENDING, IndexModel
import logging

logger = logging.getLogger(__name__)

class Database:
    client: AsyncIOMotorClient = None

db = Database()

async def connect_to_mongo():
    try:
        db.client = AsyncIOMotorClient(settings.MONGODB_URL)
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Could not connect to MongoDB: {e}")
        raise

async def close_mongo_connection():
    if db.client:
        db.client.close()
        logger.info("Closed MongoDB connection")

def get_database():
    return db.client[settings.DATABASE_NAME]

async def init_db():
    database = get_database()
    
    # Create indexes for users
    user_indexes = [
        IndexModel([("email", ASCENDING)], unique=True)
    ]
    await database["users"].create_indexes(user_indexes)
    
    # Create indexes for courses
    course_indexes = [
        IndexModel([("instructor_id", ASCENDING)]),
        IndexModel([("title", ASCENDING)])
    ]
    await database["courses"].create_indexes(course_indexes)

    # Create indexes for interactions
    interaction_indexes = [
        IndexModel([("user_id", ASCENDING)]),
        IndexModel([("course_id", ASCENDING)]),
        IndexModel([("interaction_type", ASCENDING)]),
        IndexModel([("timestamp", ASCENDING)])
    ]
    await database["interactions"].create_indexes(interaction_indexes)
    logger.info("Database initialized with indexes")

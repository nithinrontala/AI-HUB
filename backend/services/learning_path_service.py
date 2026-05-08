from typing import List, Dict, Any, Optional
from core.database import get_database
from models.learning_path import LearningPathInDB, LearningPathStep, LearningPathResponse
from services.recommender import recommender_service
from bson import ObjectId
from datetime import datetime

class LearningPathService:
    async def generate_path(self, user_id: str, target_skill: str) -> Dict[str, Any]:
        db = get_database()
        
        # 1. Search for courses related to the target skill
        all_courses_cursor = db["courses"].find({"is_published": True})
        all_courses = []
        async for course in all_courses_cursor:
            all_courses.append(course)
        
        if not all_courses:
            return {"error": "No courses found in database"}

        # Use semantic search to find relevant courses
        relevant_courses = recommender_service.semantic_search(target_skill, all_courses, limit=5)
        
        if not relevant_courses:
            return {"error": f"No relevant courses found for skill: {target_skill}"}

        # 2. Create steps from relevant courses
        # In a real scenario, we might want to order them by level (Beginner -> Intermediate -> Advanced)
        # For now, we'll use the similarity score order
        steps = []
        for course in relevant_courses:
            steps.append(LearningPathStep(
                course_id=str(course["id"]),
                title=course["title"],
                is_completed=False
            ))

        # 3. Save to database
        path_data = LearningPathInDB(
            user_id=user_id,
            title=f"Path to Master {target_skill}",
            description=f"A curated learning path to help you master {target_skill} through our best courses.",
            target_skill=target_skill,
            steps=steps
        )
        
        path_dict = path_data.model_dump()
        result = await db["learning_paths"].insert_one(path_dict)
        path_dict["id"] = str(result.inserted_id)
        
        return path_dict

    async def get_user_paths(self, user_id: str) -> List[Dict[str, Any]]:
        db = get_database()
        cursor = db["learning_paths"].find({"user_id": user_id})
        paths = []
        async for doc in cursor:
            doc["id"] = str(doc["_id"])
            paths.append(doc)
        return paths

    async def update_step_status(self, path_id: str, course_id: str, is_completed: bool) -> bool:
        db = get_database()
        result = await db["learning_paths"].update_one(
            {"_id": ObjectId(path_id), "steps.course_id": course_id},
            {"$set": {"steps.$.is_completed": is_completed, "updated_at": datetime.utcnow()}}
        )
        return result.modified_count > 0

learning_path_service = LearningPathService()

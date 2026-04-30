from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.course import CourseResponse
from core.database import get_database
from services.recommender import recommender_service
from core.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/personalized", response_model=List[CourseResponse])
async def get_personalized_recommendations(current_user: dict = Depends(get_current_user), limit: int = 5):
    db = get_database()
    
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")
    
    # 1. Fetch all interactions
    cursor = db["interactions"].find()
    interactions = []
    async for doc in cursor:
        interactions.append(doc)
    
    if not interactions:
        # If no interactions, maybe return popular courses or nothing
        return []
    
    # 2. Fetch all courses (needed for content-based scoring)
    course_cursor = db["courses"].find()
    all_courses = []
    async for doc in course_cursor:
        all_courses.append(doc)
    
    # 3. Generate hybrid recommendations
    # We can tune weights here, e.g., 0.4 for CF and 0.6 for CB
    recommended_tuples = recommender_service.get_hybrid_recommendations(
        str(user_id), interactions, all_courses, cf_weight=0.4, cb_weight=0.6, limit=limit
    )
    
    if not recommended_tuples:
        return []
    
    # 4. Fetch course details for recommended IDs and maintain order
    recommended_ids = [t[0] for t in recommended_tuples]
    recommended_courses = []
    
    # Create a map for quick lookup
    course_map = {str(c["_id"]): c for c in all_courses}
    
    for course_id in recommended_ids:
        course_doc = course_map.get(course_id)
        if course_doc:
            course_doc["id"] = str(course_doc["_id"])
            recommended_courses.append(course_doc)
            
    return recommended_courses


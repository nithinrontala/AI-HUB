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
        return []
    
    # 2. Build interaction matrix
    interaction_matrix = recommender_service.build_interaction_matrix(interactions)
    
    # 3. Generate CF recommendations
    recommended_ids = recommender_service.get_collaborative_recommendations(
        str(user_id), interaction_matrix, limit=limit
    )
    
    if not recommended_ids:
        # Fallback to some popular courses or empty list
        return []
    
    # 4. Fetch course details for recommended IDs
    recommended_courses = []
    for course_id in recommended_ids:
        # Check if course_id is ObjectId or string
        query = {"_id": course_id}
        course_doc = await db["courses"].find_one(query)
        
        if course_doc:
            course_doc["id"] = str(course_doc["_id"])
            recommended_courses.append(course_doc)
            
    return recommended_courses

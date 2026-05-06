from fastapi import APIRouter, Depends, HTTPException
from typing import List
from models.course import CourseResponse
from core.database import get_database
from services.recommender import recommender_service
from core.auth import get_current_user
from bson import ObjectId

router = APIRouter(prefix="/recommendations", tags=["recommendations"])

@router.get("/personalized", response_model=List[CourseResponse])
async def get_personalized_recommendations(
    rec_type: str = "hybrid", 
    current_user: dict = Depends(get_current_user), 
    limit: int = 6
):
    db = get_database()
    
    user_id = current_user.get("_id")
    if not user_id:
        raise HTTPException(status_code=400, detail="User ID not found in token")
    
    # 1. Fetch all interactions
    cursor = db["interactions"].find()
    interactions = []
    async for doc in cursor:
        interactions.append(doc)
    
    # 2. Fetch all courses
    course_cursor = db["courses"].find()
    all_courses = []
    async for doc in course_cursor:
        all_courses.append(doc)
    
    if not all_courses:
        return []

    # 3. Generate recommendations based on type
    interaction_matrix = recommender_service.build_interaction_matrix(interactions)
    
    recommended_scores = {} # {course_id: score}
    
    if rec_type == "content":
        recommended_scores = recommender_service.get_content_based_recommendations(
            str(user_id), interaction_matrix, all_courses
        )
    elif rec_type == "collaborative":
        recommended_scores = recommender_service.get_collaborative_recommendations(
            str(user_id), interaction_matrix
        )
    else: # Default to hybrid
        hybrid_tuples = recommender_service.get_hybrid_recommendations(
            str(user_id), interactions, all_courses, limit=limit
        )
        recommended_scores = {t[0]: t[1] for t in hybrid_tuples}

    if not recommended_scores:
        # Fallback: Popular courses if no interactions
        interaction_counts = interaction_matrix.sum(axis=0).sort_values(ascending=False)
        recommended_scores = {str(cid): float(score) for cid, score in interaction_counts.head(limit).items()}

    # 4. Sort and limit
    sorted_ids = sorted(recommended_scores.items(), key=lambda x: x[1], reverse=True)[:limit]
    
    # 5. Fetch course details and attach scores
    course_map = {str(c["_id"]): c for c in all_courses}
    recommended_courses = []
    
    for course_id, score in sorted_ids:
        course_doc = course_map.get(course_id)
        if course_doc:
            course_doc["id"] = str(course_doc["_id"])
            course_doc["score"] = score
            recommended_courses.append(course_doc)
            
    return recommended_courses


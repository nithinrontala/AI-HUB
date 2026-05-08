from fastapi import APIRouter, Depends
from core.auth import get_current_user
from core.database import get_database
from typing import Dict, Any, List
from datetime import datetime, timedelta
from bson import ObjectId

router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@router.get("/leaderboard")
async def get_leaderboard(limit: int = 5):
    db = get_database()
    
    # Define weights for points
    weights = {
        "video_view": 10,
        "quiz_attempt": 50,
        "ai_chat": 5,
        "course_completion": 500
    }
    
    # Aggregate points per user
    pipeline = [
        {
            "$group": {
                "_id": "$user_id",
                "total_points": {
                    "$sum": {
                        "$switch": {
                            "branches": [
                                {"case": {"$eq": ["$interaction_type", "video_view"]}, "then": weights["video_view"]},
                                {"case": {"$eq": ["$interaction_type", "quiz_attempt"]}, "then": weights["quiz_attempt"]},
                                {"case": {"$eq": ["$interaction_type", "ai_chat"]}, "then": weights["ai_chat"]},
                                {"case": {"$eq": ["$interaction_type", "course_completion"]}, "then": weights["course_completion"]}
                            ],
                            "default": 1
                        }
                    }
                }
            }
        },
        {"$sort": {"total_points": -1}},
        {"$limit": limit}
    ]
    
    leaderboard_data = []
    cursor = db["interactions"].aggregate(pipeline)
    async for entry in cursor:
        user_id = entry["_id"]
        user = await db["users"].find_one({"_id": ObjectId(user_id)})
        if user:
            leaderboard_data.append({
                "name": user.get("name", "Anonymous"),
                "points": entry["total_points"]
            })
            
    return leaderboard_data

@router.get("/stats")
async def get_dashboard_stats(current_user: dict = Depends(get_current_user)):
    db = get_database()
    user_id = str(current_user["_id"])
    
    # 1. Enrolled and Completed courses count
    enrolled_count = len(current_user.get("enrolled_courses", []))
    
    # Get completed courses from interactions
    completed_courses_cursor = db["interactions"].find({
        "user_id": user_id,
        "interaction_type": "course_completion"
    })
    completed_ids = set()
    async for interaction in completed_courses_cursor:
        completed_ids.add(interaction["course_id"])
    
    completed_count = len(completed_ids)
    
    # 2. Activity Data (last 7 days)
    seven_days_ago = datetime.utcnow() - timedelta(days=7)
    activity_cursor = db["interactions"].find({
        "user_id": user_id,
        "timestamp": {"$gte": seven_days_ago}
    })
    
    activity_by_day = {}
    for i in range(7):
        day = (datetime.utcnow() - timedelta(days=i)).strftime("%Y-%m-%d")
        activity_by_day[day] = 0
        
    async for interaction in activity_cursor:
        day = interaction["timestamp"].strftime("%Y-%m-%d")
        if day in activity_by_day:
            activity_by_day[day] += 1
            
    activity_list = [{"date": k, "count": v} for k, v in sorted(activity_by_day.items())]

    # 3. Skills Progress (based on tags of completed/enrolled courses)
    # We'll fetch the tags from courses the user interacted with
    course_ids = [ObjectId(cid) for cid in current_user.get("enrolled_courses", []) if ObjectId.is_valid(cid)]
    courses_cursor = db["courses"].find({"_id": {"$in": course_ids}})
    
    skill_progress = {}
    async for course in courses_cursor:
        is_done = str(course["_id"]) in completed_ids
        for tag in course.get("tags", []):
            if tag not in skill_progress:
                skill_progress[tag] = {"total": 0, "completed": 0}
            skill_progress[tag]["total"] += 1
            if is_done:
                skill_progress[tag]["completed"] += 1
                
    formatted_skills = [
        {
            "skill": k, 
            "progress": (v["completed"] / v["total"] * 100) if v["total"] > 0 else 0,
            "total_courses": v["total"]
        } 
        for k, v in skill_progress.items()
    ]

    # 4. Total Learning Points
    weights = {"video_view": 10, "quiz_attempt": 50, "ai_chat": 5, "course_completion": 500}
    total_points = 0
    all_interactions_cursor = db["interactions"].find({"user_id": user_id})
    async for interaction in all_interactions_cursor:
        total_points += weights.get(interaction["interaction_type"], 1)

    return {
        "enrolled_count": enrolled_count,
        "completed_count": completed_count,
        "total_points": total_points,
        "activity": activity_list,
        "skills": formatted_skills
    }

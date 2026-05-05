from fastapi import APIRouter, HTTPException, Depends, status
from typing import List, Optional
from models.course import CourseCreate, CourseResponse, CourseInDB
from core.database import get_database
from bson import ObjectId
from datetime import datetime
from services.recommender import recommender_service

router = APIRouter(prefix="/courses", tags=["courses"])

@router.post("/", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
async def create_course(course: CourseCreate):
    db = get_database()
    
    # Generate embedding for the new course
    course_text = recommender_service.prepare_course_text(course.model_dump())
    embedding = recommender_service.generate_embedding(course_text)
    
    course_dict = course.model_dump()
    course_in_db = CourseInDB(
        **course_dict,
        embedding=embedding,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )
    
    result = await db["courses"].insert_one(course_in_db.model_dump())
    
    return {**course_in_db.model_dump(), "id": str(result.inserted_id)}

@router.get("/", response_model=List[CourseResponse])
async def get_courses():
    db = get_database()
    cursor = db["courses"].find()
    courses = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        courses.append(doc)
    return courses

@router.get("/{course_id}", response_model=CourseResponse)
async def get_course(course_id: str):
    db = get_database()
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")
        
    doc = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not doc:
        raise HTTPException(status_code=404, detail="Course not found")
    
    doc["id"] = str(doc["_id"])
    return doc

@router.get("/{course_id}/recommendations", response_model=List[CourseResponse])
async def get_recommendations(course_id: str, limit: int = 5):
    db = get_database()
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")
        
    target_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not target_course or not target_course.get("embedding"):
        raise HTTPException(status_code=404, detail="Course or embedding not found")
    
    target_embedding = target_course["embedding"]
    
    # In a real production app, we would use a vector database like Pinecone, Milvus, or MongoDB Atlas Vector Search.
    # For this implementation, we'll do a simple scan and calculate similarity.
    
    cursor = db["courses"].find({"_id": {"$ne": ObjectId(course_id)}})
    recommendations = []
    
    async for doc in cursor:
        if doc.get("embedding"):
            similarity = recommender_service.calculate_similarity(target_embedding, doc["embedding"])
            doc["similarity"] = similarity
            doc["id"] = str(doc["_id"])
            recommendations.append(doc)
    
    # Sort by similarity descending
    recommendations.sort(key=lambda x: x["similarity"], reverse=True)
    
    return recommendations[:limit]

@router.put("/{course_id}", response_model=CourseResponse)
async def update_course(course_id: str, course_update: CourseCreate):
    db = get_database()
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")
        
    existing_course = await db["courses"].find_one({"_id": ObjectId(course_id)})
    if not existing_course:
        raise HTTPException(status_code=404, detail="Course not found")
    
    # Regenerate embedding if title or description changed
    course_dict = course_update.model_dump()
    if (course_dict.get("title") != existing_course.get("title") or 
        course_dict.get("description") != existing_course.get("description")):
        course_text = recommender_service.prepare_course_text(course_dict)
        course_dict["embedding"] = recommender_service.generate_embedding(course_text)
    
    course_dict["updated_at"] = datetime.utcnow()
    
    await db["courses"].update_one(
        {"_id": ObjectId(course_id)},
        {"$set": course_dict}
    )
    
    updated_doc = await db["courses"].find_one({"_id": ObjectId(course_id)})
    updated_doc["id"] = str(updated_doc["_id"])
    return updated_doc

@router.delete("/{course_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_course(course_id: str):
    db = get_database()
    if not ObjectId.is_valid(course_id):
        raise HTTPException(status_code=400, detail="Invalid course ID")
        
    result = await db["courses"].delete_one({"_id": ObjectId(course_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Course not found")
    return None

@router.get("/search/", response_model=List[CourseResponse])
async def search_courses(q: str):
    db = get_database()
    # Basic text search using regex (case-insensitive)
    cursor = db["courses"].find({
        "$or": [
            {"title": {"$regex": q, "$options": "i"}},
            {"description": {"$regex": q, "$options": "i"}},
            {"tags": {"$regex": q, "$options": "i"}}
        ]
    })
    courses = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        courses.append(doc)
    return courses

@router.post("/refresh-embeddings")
async def refresh_all_embeddings():
    """Admin utility to regenerate embeddings for all existing courses."""
    db = get_database()
    cursor = db["courses"].find()
    updated_count = 0
    
    async for doc in cursor:
        course_text = recommender_service.prepare_course_text(doc)
        embedding = recommender_service.generate_embedding(course_text)
        
        await db["courses"].update_one(
            {"_id": doc["_id"]},
            {"$set": {"embedding": embedding, "updated_at": datetime.utcnow()}}
        )
        updated_count += 1
        
    return {"message": f"Successfully updated embeddings for {updated_count} courses"}

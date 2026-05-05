from fastapi import APIRouter, Depends, HTTPException, status
from models.interaction import InteractionCreate, InteractionResponse, InteractionInDB
from core.database import get_database
from core.auth import get_current_user
from datetime import datetime
from bson import ObjectId

router = APIRouter(prefix="/interactions", tags=["interactions"])

@router.post("/", response_model=InteractionResponse, status_code=status.HTTP_201_CREATED)
async def create_interaction(interaction: InteractionCreate, current_user: dict = Depends(get_current_user)):
    db = get_database()
    
    # Ensure course exists if course_id is provided
    if interaction.course_id:
        if not ObjectId.is_valid(interaction.course_id):
            raise HTTPException(status_code=400, detail="Invalid course ID")
        course = await db["courses"].find_one({"_id": ObjectId(interaction.course_id)})
        if not course:
            raise HTTPException(status_code=404, detail="Course not found")
    
    interaction_in_db = InteractionInDB(
        **interaction.model_dump(),
        timestamp=datetime.utcnow()
    )
    
    # Override user_id with the current authenticated user's ID to ensure security
    interaction_dict = interaction_in_db.model_dump()
    interaction_dict["user_id"] = str(current_user["_id"])
    
    result = await db["interactions"].insert_one(interaction_dict)
    
    return {**interaction_dict, "id": str(result.inserted_id)}

@router.get("/me", response_model=list[InteractionResponse])
async def get_my_interactions(current_user: dict = Depends(get_current_user)):
    db = get_database()
    cursor = db["interactions"].find({"user_id": str(current_user["_id"])})
    interactions = []
    async for doc in cursor:
        doc["id"] = str(doc["_id"])
        interactions.append(doc)
    return interactions

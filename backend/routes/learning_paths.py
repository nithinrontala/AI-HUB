from fastapi import APIRouter, Depends, HTTPException, status
from core.auth import get_current_user
from services.learning_path_service import learning_path_service
from models.learning_path import LearningPathResponse
from typing import List

router = APIRouter(prefix="/learning-paths", tags=["learning-paths"])

@router.post("/generate", response_model=LearningPathResponse)
async def generate_path(target_skill: str, current_user: dict = Depends(get_current_user)):
    result = await learning_path_service.generate_path(str(current_user["_id"]), target_skill)
    if "error" in result:
        raise HTTPException(status_code=404, detail=result["error"])
    return result

@router.get("/me", response_model=List[LearningPathResponse])
async def get_my_paths(current_user: dict = Depends(get_current_user)):
    return await learning_path_service.get_user_paths(str(current_user["_id"]))

@router.put("/{path_id}/steps/{course_id}")
async def update_step(path_id: str, course_id: str, is_completed: bool, current_user: dict = Depends(get_current_user)):
    # Note: In a real app, verify user owns this path
    success = await learning_path_service.update_step_status(path_id, course_id, is_completed)
    if not success:
        raise HTTPException(status_code=404, detail="Path or step not found")
    return {"message": "Step updated successfully"}

from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class LearningPathStep(BaseModel):
    course_id: str
    title: str
    is_completed: bool = False

class LearningPathBase(BaseModel):
    title: str
    description: Optional[str] = None
    target_skill: str
    steps: List[LearningPathStep] = []

class LearningPathCreate(LearningPathBase):
    pass

class LearningPathInDB(LearningPathBase):
    user_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

class LearningPathResponse(LearningPathInDB):
    id: str

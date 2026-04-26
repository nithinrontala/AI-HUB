from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class InteractionType(str, Enum):
    video_view = "video_view"
    quiz_attempt = "quiz_attempt"
    ai_chat = "ai_chat"
    course_completion = "course_completion"

class InteractionBase(BaseModel):
    user_id: str
    course_id: Optional[str] = None
    interaction_type: InteractionType
    interaction_data: Dict[str, Any] = {}

class InteractionCreate(InteractionBase):
    pass

class InteractionInDB(InteractionBase):
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class InteractionResponse(InteractionInDB):
    id: str

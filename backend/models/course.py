from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime

class Lesson(BaseModel):
    title: str
    content_type: str  # e.g., "video", "text", "quiz"
    content_url: Optional[str] = None
    text_content: Optional[str] = None

class Module(BaseModel):
    title: str
    description: Optional[str] = None
    lessons: List[Lesson] = []

class CourseBase(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    description: str
    instructor_id: str
    modules: List[Module] = []
    tags: List[str] = []
    is_published: bool = False

class CourseCreate(CourseBase):
    pass

class CourseInDB(CourseBase):
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    embedding: Optional[List[float]] = None

class CourseResponse(CourseInDB):
    id: str
    score: Optional[float] = None

from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    name: str = Field(..., min_length=2, max_length=50)
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)

class UserInDB(UserBase):
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserResponse(UserBase):
    id: str
    created_at: datetime

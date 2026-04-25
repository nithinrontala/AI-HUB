from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel
from models.user import UserCreate, UserResponse, UserInDB
from core.security import get_password_hash, verify_password, create_access_token
from core.database import get_database

router = APIRouter(prefix="/auth", tags=["auth"])

class LoginRequest(BaseModel):
    email: str
    password: str

@router.post("/signup", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate):
    db = get_database()
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password and create user
    hashed_password = get_password_hash(user.password)
    new_user = UserInDB(**user.model_dump(exclude={"password"}), hashed_password=hashed_password)
    
    # Insert saving datetime dynamically
    result = await db.users.insert_one(new_user.model_dump())
    
    return UserResponse(
        id=str(result.inserted_id),
        name=user.name,
        email=user.email,
        created_at=new_user.created_at
    )

@router.post("/login")
async def login(credentials: LoginRequest):
    db = get_database()
    
    # Find user by email
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Verify password
    if not verify_password(credentials.password, user["hashed_password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
        )
    
    # Generate JWT Context
    access_token = create_access_token(data={"sub": user["email"]})
    return {"access_token": access_token, "token_type": "bearer"}

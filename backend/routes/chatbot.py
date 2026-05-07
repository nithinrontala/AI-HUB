from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.chatbot_service import chatbot_service
from core.auth import get_current_user

router = APIRouter(prefix="/chatbot", tags=["chatbot"])

class ChatRequest(BaseModel):
    message: str

class ChatResponse(BaseModel):
    response: str

@router.post("/", response_model=ChatResponse)
async def chat(request: ChatRequest, current_user: dict = Depends(get_current_user)):
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")
    
    # Use email as unique identifier for history
    user_id = current_user["email"]
    response_text = chatbot_service.get_response(request.message, user_id)
    return ChatResponse(response=response_text)

@router.post("/reset")
async def reset_chat(current_user: dict = Depends(get_current_user)):
    user_id = current_user["email"]
    chatbot_service.reset_chat(user_id)
    return {"message": "Chat history reset"}

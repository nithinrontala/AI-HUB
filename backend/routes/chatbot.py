import json
from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
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
    """Standard (non-streaming) chat endpoint with RAG."""
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_id = current_user["email"]
    response_text = await chatbot_service.get_response(request.message, user_id)
    return ChatResponse(response=response_text)


@router.post("/stream")
async def chat_stream(
    request: ChatRequest, current_user: dict = Depends(get_current_user)
):
    """
    Streaming chat endpoint using Server-Sent Events (SSE) with RAG.
    """
    if not request.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    user_id = current_user["email"]

    async def event_generator():
        async for token in chatbot_service.stream_response(request.message, user_id):
            # SSE format: data: <json>\n\n
            data = json.dumps({"token": token})
            yield f"data: {data}\n\n"
        # Send a final [DONE] event so the client knows the stream is finished
        yield "data: [DONE]\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.post("/reset")
async def reset_chat(current_user: dict = Depends(get_current_user)):
    user_id = current_user["email"]
    chatbot_service.reset_chat(user_id)
    return {"message": "Chat history reset"}
